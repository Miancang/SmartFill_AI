// Background Service Worker for SmartFill AI

console.log('SmartFill AI Background Service Worker started');

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
    if (command === 'auto-fill') {
        // 向当前活动标签页发送消息
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'autoFill' });
            }
        });
    }
});

// 监听来自content script和popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        handleFillForm(request.formFields, request.userInfo, request.activeRecommender)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // 保持消息通道开启
    } else if (request.action === 'testConnection') {
        testAIConnection(request.apiProvider, request.apiKey, request.apiUrl)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

// 处理表单填充
async function handleFillForm(formFields, userInfo, activeRecommender) {
    try {
        // 获取API配置
        const { apiProvider, apiKey, apiUrl } = await chrome.storage.local.get(['apiProvider', 'apiKey', 'apiUrl']);

        if (!apiKey) {
            throw new Error('请先在设置中配置API密钥');
        }

        // 准备发送给AI的数据
        const prompt = buildPrompt(formFields, userInfo, activeRecommender);

        // 调用AI API
        const aiResponse = await callAIAPI(apiProvider, apiKey, apiUrl, prompt);

        // 解析AI响应并匹配字段
        const fillData = parseAIResponse(aiResponse, formFields);

        return { success: true, fillData: fillData };
    } catch (error) {
        console.error('Fill form error:', error);
        return { success: false, error: error.message };
    }
}

// 构建发送给AI的提示词
function buildPrompt(formFields, userInfo, activeRecommender) {
    // 根据activeRecommender选择要使用的信息
    let activeInfo = null;
    let activeType = '';
    
    if (activeRecommender === 'inst1') {
        activeInfo = userInfo.institution1;
        activeType = 'institution';
    } else if (activeRecommender === 'inst2') {
        activeInfo = userInfo.institution2;
        activeType = 'institution';
    } else if (activeRecommender && activeRecommender > 0 && activeRecommender <= 3) {
        const recommenderKey = `recommender${activeRecommender}`;
        activeInfo = userInfo[recommenderKey];
        activeType = 'recommender';
    }

    // 合并所有用户信息
    const allUserInfo = {
        ...userInfo,
        ...userInfo.customFields,
        // 如果选择了推荐人，将其作为当前推荐人
        ...(activeType === 'recommender' && activeInfo && { currentRecommender: activeInfo }),
        // 如果选择了学校，将其作为当前学校
        ...(activeType === 'institution' && activeInfo && { currentInstitution: activeInfo })
    };

    // 构建用户信息描述
    let userInfoText = JSON.stringify(allUserInfo, null, 2);
    if (userInfo.naturalLanguage) {
        userInfoText = `自然语言描述：
${userInfo.naturalLanguage}

结构化信息：
${userInfoText}`;
    }

    // 添加当前选择信息的提示
    if (activeType === 'recommender' && activeInfo) {
        userInfoText = `当前选择的推荐人（推荐人${activeRecommender}）：
${JSON.stringify(activeInfo, null, 2)}

${userInfoText}`;
    } else if (activeType === 'institution' && activeInfo) {
        const instNum = activeRecommender === 'inst1' ? '1' : '2';
        userInfoText = `当前选择的学校（学校${instNum}）：
${JSON.stringify(activeInfo, null, 2)}

${userInfoText}`;
    } else if (activeRecommender === '0' || activeRecommender === 0) {
        userInfoText = `当前填写申请人信息：
申请人基本信息优先使用

${userInfoText}`;
    }

    const prompt = `你是一个智能表单填充助手。请根据用户的个人信息，为以下表单字段匹配合适的填充值。

用户信息：
${userInfoText}

表单字段：
${JSON.stringify(formFields, null, 2)}

请分析每个字段的标签(label)、占位符(placeholder)、名称(name)、id、类型(type)、dataExport等属性，判断该字段应该填写什么内容。

字段识别规则：
- 优先使用dataExport属性进行精确匹配（特别是UCLA等学校的表单）
- 其次使用label、placeholder、name、id等属性进行语义匹配
- dataExport属性格式如"sys:app:gd_math_course_number1"表示数学课程1的课程编号

特别说明：
- 如果存在currentRecommender（当前选择的推荐人），优先使用其信息填充推荐人表单：
  * prefix/Prefix -> currentRecommender.prefix (如Dr., Prof., Mr., Ms.)
  * first/First Name/firstName -> currentRecommender.firstName
  * last/Last Name/lastName -> currentRecommender.lastName
  * company/Organization -> currentRecommender.organization
  * title/Position/Title -> currentRecommender.position
  * phone/Telephone -> currentRecommender.telephone
  * email/Email -> currentRecommender.email
  * relation/Relation -> currentRecommender.relation

- 如果存在currentInstitution（当前选择的学校），优先使用其信息填充学校/学历表单：
  * dataExport包含"school"或label包含"Institution/School/University/College" -> currentInstitution.name
  * dataExport包含"country"或label为"Country" -> currentInstitution.country
  * dataExport包含"city"或label为"City" -> currentInstitution.city
  * dataExport包含"from_date/date_from/start"或label为"From/Start Date" -> currentInstitution.dateFrom
  * dataExport包含"to_date/date_to/end"或label为"To/End Date" -> currentInstitution.dateTo
  * dataExport包含"level"或label为"Level of Study" -> currentInstitution.levelOfStudy
  * dataExport包含"degree"或label为"Degree" -> currentInstitution.degree
  * dataExport包含"degree_date"或label为"Degree Date/Graduation Date" -> currentInstitution.degreeDate
  * dataExport包含"gpa"或label为"GPA" -> currentInstitution.gpa
  * dataExport包含"gpa_scale/scale"或label为"GPA Scale" -> currentInstitution.gpaScale

- 对于学校/学历信息表单（无currentInstitution时），从institution1和institution2中提取：
  * dataExport包含"school"或label包含"Institution/School/University/College"：学校名称如institution1.name或institution2.name
  * dataExport包含"country"或label为"Country"：国家如institution1.country
  * dataExport包含"city"或label为"City"：城市如institution1.city
  * dataExport包含"from_date/date_from/start"或label为"From/Start Date/Dates Attended"：入学时间如institution1.dateFrom
  * dataExport包含"to_date/date_to/end"或label为"To/End Date"：结束时间如institution1.dateTo
  * dataExport包含"level"或label为"Level of Study"：学习级别如institution1.levelOfStudy (Undergraduate/Graduate)
  * dataExport包含"degree"或label为"Degree"：学位如institution1.degree
  * dataExport包含"degree_date"或label为"Degree Date/Graduation Date"：学位取得时间如institution1.degreeDate
  * dataExport包含"gpa"或label为"GPA"：绩点如institution1.gpa
  * dataExport包含"gpa_scale/scale"或label为"GPA Scale"：绩点满分如institution1.gpaScale
  * 按dataExport中的数字后缀（如1,2）从institution1或institution2中选择
  * 如果表单只有一组学校字段，优先使用institution1；如果有多组，按顺序使用institution1和institution2

- 对于数学课程相关字段，从用户的mathCourses中提取对应信息：
  * dataExport包含"course_type"或label为"Type": 课程级别，根据课程编号判断（通常1000-2999是Lower/Upper Division，3000+或研究生院的是Graduate）
  * dataExport包含"course_number"或label为"Course Number": 课程编号如"MATH1403"、"MATH 741"
  * dataExport包含"course_title"或label为"Title": 课程名称如"Elementary Number Theory"、"Abstract Algebra"
  * dataExport包含"course_grade"或label为"Grade": 成绩如"A"、"A-"、"B+"、"B"、"(In Progress)"
  * dataExport包含"course_year"或label为"Year and Term": 学期如"Summer 2022"、"Fall 2024"、"Spring 2025"
  * dataExport包含"course_subj"或label为"Subject Matter": 学科领域如"Number Theory"、"Algebra"、"Topology"
  * dataExport包含"course_school"或label为"School": 学校名称如"Shanghai Jiao Tong University"、"University of Wisconsin-Madison"
  * 按dataExport中的数字后缀（如1,2,3,4,5）从用户的mathCourses列表中按顺序选择对应的课程信息

要求：
1. 仔细匹配字段含义与用户信息
2. 支持中英文字段识别
3. 优先识别推荐人信息表单，使用recommender1/2/3数据
4. 从用户提供的课程列表中按顺序提取信息填充到相应的课程字段组
5. **对于select下拉框字段（type="select"），返回的value必须与options中的某个选项文本完全匹配或高度相似**
   - 如果字段有options属性，请从optionsText中选择最合适的选项
   - 例如：如果options包含["China", "United States", "Japan"]，返回其中一个完整的选项文本
   - 对于国家/城市字段，优先查看是否有匹配的选项
6. 如果某个字段无法从用户信息中找到对应值，则不填充
7. 返回JSON数组格式，每项包含：index（字段索引）和value（填充值）

返回格式示例：
[
  {"index": 5, "value": "MATH1403"},
  {"index": 6, "value": "Elementary Number Theory"},
  {"index": 7, "value": "A-"},
  {"index": 8, "value": "Summer 2022"},
  {"index": 9, "value": "Number Theory"},
  {"index": 10, "value": "Shanghai Jiao Tong University"}
]

请直接返回JSON数组，不要包含其他说明文字。`;

    return prompt;
}

// 调用AI API
async function callAIAPI(provider, apiKey, apiUrl, prompt) {
    let endpoint, headers, body;

    switch (provider) {
        case 'openai':
            endpoint = 'https://api.openai.com/v1/chat/completions';
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            body = {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: '你是一个智能表单填充助手。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            };
            break;

        case 'claude':
            endpoint = 'https://api.anthropic.com/v1/messages';
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            };
            body = {
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1024,
                messages: [
                    { role: 'user', content: prompt }
                ]
            };
            break;

        case 'deepseek':
            endpoint = 'https://api.deepseek.com/v1/chat/completions';
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            body = {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: '你是一个智能表单填充助手。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            };
            break;

        case 'custom':
            endpoint = apiUrl;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            body = {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: prompt }
                ]
            };
            break;

        default:
            throw new Error('不支持的API提供商');
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API调用失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // 解析不同提供商的响应格式
    let content;
    if (provider === 'openai' || provider === 'deepseek' || provider === 'custom') {
        content = data.choices[0].message.content;
    } else if (provider === 'claude') {
        content = data.content[0].text;
    }

    return content;
}

// 解析AI响应
function parseAIResponse(aiResponse, formFields) {
    try {
        // 清理响应文本，提取JSON
        let jsonText = aiResponse.trim();
        
        // 尝试提取JSON数组
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        const fillInstructions = JSON.parse(jsonText);

        // 只返回index和value，不包含element引用
        const fillData = fillInstructions.map(instruction => ({
            index: instruction.index,
            value: instruction.value
        })).filter(item => item.index !== undefined && item.value); // 过滤掉无效的指令

        return fillData;
    } catch (error) {
        console.error('Parse AI response error:', error);
        throw new Error('无法解析AI响应，请检查API配置');
    }
}

// 测试AI连接
async function testAIConnection(provider, apiKey, apiUrl) {
    try {
        const testPrompt = '请回复"连接成功"';
        const response = await callAIAPI(provider, apiKey, apiUrl, testPrompt);
        
        if (response) {
            return { success: true, message: '连接成功' };
        } else {
            throw new Error('未收到响应');
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
