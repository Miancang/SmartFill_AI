// Popup UI Logic for SmartFill AI

document.addEventListener('DOMContentLoaded', () => {
    // 加载已保存的设置
    loadSettings();

    // 当前填写表单选择器变化时保存
    document.getElementById('activeRecommender').addEventListener('change', async (e) => {
        const activeRecommender = e.target.value;
        await chrome.storage.local.set({ activeRecommender });
        
        // 显示提示
        const option = e.target.options[e.target.selectedIndex].text;
        showStatus(`已切换到：${option} | Switched to: ${option}`, 'info');
    });

    // 标签切换功能
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 移除所有active类
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加active类到当前标签
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });

    // API提供商切换
    document.getElementById('apiProvider').addEventListener('change', (e) => {
        const customUrlGroup = document.getElementById('customUrlGroup');
        if (e.target.value === 'custom') {
            customUrlGroup.style.display = 'block';
        } else {
            customUrlGroup.style.display = 'none';
        }
    });

    // 保存按钮
    document.getElementById('saveBtn').addEventListener('click', saveSettings);

    // 测试连接按钮
    document.getElementById('testBtn').addEventListener('click', testConnection);
});

// 加载设置
async function loadSettings() {
    const data = await chrome.storage.local.get([
        'apiProvider',
        'apiKey',
        'apiUrl',
        'userInfo',
        'activeRecommender'
    ]);

    // 加载当前推荐人选择
    if (data.activeRecommender !== undefined) {
        document.getElementById('activeRecommender').value = data.activeRecommender;
    }

    if (data.apiProvider) {
        document.getElementById('apiProvider').value = data.apiProvider;
        // 触发change事件以显示/隐藏自定义URL字段
        document.getElementById('apiProvider').dispatchEvent(new Event('change'));
    }

    if (data.apiKey) {
        document.getElementById('apiKey').value = data.apiKey;
    }

    if (data.apiUrl) {
        document.getElementById('apiUrl').value = data.apiUrl;
    }

    if (data.userInfo) {
        const info = data.userInfo;
        document.getElementById('fullName').value = info.fullName || '';
        document.getElementById('email').value = info.email || '';
        document.getElementById('phone').value = info.phone || '';
        document.getElementById('permanentAddress').value = info.permanentAddress || '';
        document.getElementById('mailingAddress').value = info.mailingAddress || '';
        document.getElementById('mathCourses').value = info.mathCourses || '';
        document.getElementById('awards').value = info.awards || '';
        document.getElementById('publications').value = info.publications || '';
        document.getElementById('additionalInfo').value = info.additionalInfo || '';
        
        if (info.customFields) {
            document.getElementById('customFields').value = JSON.stringify(info.customFields, null, 2);
        }

        // 加载推荐人1信息
        if (info.recommender1) {
            const rec1 = info.recommender1;
            document.getElementById('rec1Prefix').value = rec1.prefix || '';
            document.getElementById('rec1FirstName').value = rec1.firstName || '';
            document.getElementById('rec1LastName').value = rec1.lastName || '';
            document.getElementById('rec1Organization').value = rec1.organization || '';
            document.getElementById('rec1Position').value = rec1.position || '';
            document.getElementById('rec1Relation').value = rec1.relation || '';
            document.getElementById('rec1Telephone').value = rec1.telephone || '';
            document.getElementById('rec1Email').value = rec1.email || '';
        }

        // 加载推荐人2信息
        if (info.recommender2) {
            const rec2 = info.recommender2;
            document.getElementById('rec2Prefix').value = rec2.prefix || '';
            document.getElementById('rec2FirstName').value = rec2.firstName || '';
            document.getElementById('rec2LastName').value = rec2.lastName || '';
            document.getElementById('rec2Organization').value = rec2.organization || '';
            document.getElementById('rec2Position').value = rec2.position || '';
            document.getElementById('rec2Relation').value = rec2.relation || '';
            document.getElementById('rec2Telephone').value = rec2.telephone || '';
            document.getElementById('rec2Email').value = rec2.email || '';
        }

        // 加载推荐人3信息
        if (info.recommender3) {
            const rec3 = info.recommender3;
            document.getElementById('rec3Prefix').value = rec3.prefix || '';
            document.getElementById('rec3FirstName').value = rec3.firstName || '';
            document.getElementById('rec3LastName').value = rec3.lastName || '';
            document.getElementById('rec3Organization').value = rec3.organization || '';
            document.getElementById('rec3Position').value = rec3.position || '';
            document.getElementById('rec3Relation').value = rec3.relation || '';
            document.getElementById('rec3Telephone').value = rec3.telephone || '';
            document.getElementById('rec3Email').value = rec3.email || '';
        }

        // 加载学校1信息
        if (info.institution1) {
            const inst1 = info.institution1;
            document.getElementById('inst1Country').value = inst1.country || '';
            document.getElementById('inst1City').value = inst1.city || '';
            document.getElementById('inst1Name').value = inst1.name || '';
            document.getElementById('inst1DateFrom').value = inst1.dateFrom || '';
            document.getElementById('inst1DateTo').value = inst1.dateTo || '';
            document.getElementById('inst1LevelOfStudy').value = inst1.levelOfStudy || '';
            document.getElementById('inst1Degree').value = inst1.degree || '';
            document.getElementById('inst1DegreeDate').value = inst1.degreeDate || '';
            document.getElementById('inst1GPA').value = inst1.gpa || '';
            document.getElementById('inst1GPAScale').value = inst1.gpaScale || '';
        }

        // 加载学校2信息
        if (info.institution2) {
            const inst2 = info.institution2;
            document.getElementById('inst2Country').value = inst2.country || '';
            document.getElementById('inst2City').value = inst2.city || '';
            document.getElementById('inst2Name').value = inst2.name || '';
            document.getElementById('inst2DateFrom').value = inst2.dateFrom || '';
            document.getElementById('inst2DateTo').value = inst2.dateTo || '';
            document.getElementById('inst2LevelOfStudy').value = inst2.levelOfStudy || '';
            document.getElementById('inst2Degree').value = inst2.degree || '';
            document.getElementById('inst2DegreeDate').value = inst2.degreeDate || '';
            document.getElementById('inst2GPA').value = inst2.gpa || '';
            document.getElementById('inst2GPAScale').value = inst2.gpaScale || '';
        }
    }
}

// 保存设置
async function saveSettings() {
    try {
        const apiProvider = document.getElementById('apiProvider').value;
        const apiKey = document.getElementById('apiKey').value;
        const apiUrl = document.getElementById('apiUrl').value;

        // 验证API设置（如果提供了API密钥）
        let hasApiConfig = false;
        if (apiKey) {
            hasApiConfig = true;
            if (apiProvider === 'custom' && !apiUrl) {
                showStatus('使用自定义API时需要提供API地址 | API URL required for custom API', 'error');
                return;
            }
        }

        // 解析自定义字段JSON
        let customFields = {};
        const customFieldsText = document.getElementById('customFields').value.trim();
        if (customFieldsText) {
            try {
                customFields = JSON.parse(customFieldsText);
            } catch (e) {
                showStatus('自定义字段JSON格式错误 | Invalid JSON format for custom fields', 'error');
                return;
            }
        }

        // 收集申请人信息
        const userInfo = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            permanentAddress: document.getElementById('permanentAddress').value,
            mailingAddress: document.getElementById('mailingAddress').value,
            mathCourses: document.getElementById('mathCourses').value,
            awards: document.getElementById('awards').value,
            publications: document.getElementById('publications').value,
            additionalInfo: document.getElementById('additionalInfo').value,
            customFields: customFields,
            naturalLanguage: document.getElementById('mathCourses').value,
            // 推荐人1信息
            recommender1: {
                prefix: document.getElementById('rec1Prefix').value,
                firstName: document.getElementById('rec1FirstName').value,
                lastName: document.getElementById('rec1LastName').value,
                organization: document.getElementById('rec1Organization').value,
                position: document.getElementById('rec1Position').value,
                relation: document.getElementById('rec1Relation').value,
                telephone: document.getElementById('rec1Telephone').value,
                email: document.getElementById('rec1Email').value
            },
            // 推荐人2信息
            recommender2: {
                prefix: document.getElementById('rec2Prefix').value,
                firstName: document.getElementById('rec2FirstName').value,
                lastName: document.getElementById('rec2LastName').value,
                organization: document.getElementById('rec2Organization').value,
                position: document.getElementById('rec2Position').value,
                relation: document.getElementById('rec2Relation').value,
                telephone: document.getElementById('rec2Telephone').value,
                email: document.getElementById('rec2Email').value
            },
            // 推荐人3信息
            recommender3: {
                prefix: document.getElementById('rec3Prefix').value,
                firstName: document.getElementById('rec3FirstName').value,
                lastName: document.getElementById('rec3LastName').value,
                organization: document.getElementById('rec3Organization').value,
                position: document.getElementById('rec3Position').value,
                relation: document.getElementById('rec3Relation').value,
                telephone: document.getElementById('rec3Telephone').value,
                email: document.getElementById('rec3Email').value
            },
            // 学校1信息
            institution1: {
                country: document.getElementById('inst1Country').value,
                city: document.getElementById('inst1City').value,
                name: document.getElementById('inst1Name').value,
                dateFrom: document.getElementById('inst1DateFrom').value,
                dateTo: document.getElementById('inst1DateTo').value,
                levelOfStudy: document.getElementById('inst1LevelOfStudy').value,
                degree: document.getElementById('inst1Degree').value,
                degreeDate: document.getElementById('inst1DegreeDate').value,
                gpa: document.getElementById('inst1GPA').value,
                gpaScale: document.getElementById('inst1GPAScale').value
            },
            // 学校2信息
            institution2: {
                country: document.getElementById('inst2Country').value,
                city: document.getElementById('inst2City').value,
                name: document.getElementById('inst2Name').value,
                dateFrom: document.getElementById('inst2DateFrom').value,
                dateTo: document.getElementById('inst2DateTo').value,
                levelOfStudy: document.getElementById('inst2LevelOfStudy').value,
                degree: document.getElementById('inst2Degree').value,
                degreeDate: document.getElementById('inst2DegreeDate').value,
                gpa: document.getElementById('inst2GPA').value,
                gpaScale: document.getElementById('inst2GPAScale').value
            }
        };

        // 分别保存不同的设置
        const saveData = {
            userInfo
        };

        // 只有在提供了API密钥时才保存API设置
        if (hasApiConfig) {
            saveData.apiProvider = apiProvider;
            saveData.apiKey = apiKey;
            saveData.apiUrl = apiUrl;
        }

        // 保存到Chrome storage
        await chrome.storage.local.set(saveData);

        // 显示适当的成功消息
        if (hasApiConfig) {
            showStatus('设置已保存！ | Settings saved!', 'success');
        } else {
            showStatus('申请人信息已保存！ | Applicant info saved!', 'success');
        }
    } catch (error) {
        showStatus('保存失败 | Save failed: ' + error.message, 'error');
    }
}

// 测试API连接
async function testConnection() {
    try {
        const apiProvider = document.getElementById('apiProvider').value;
        const apiKey = document.getElementById('apiKey').value;
        const apiUrl = document.getElementById('apiUrl').value;

        if (!apiKey) {
            showStatus('请先输入API密钥 | Please enter API key first', 'error');
            return;
        }

        if (apiProvider === 'custom' && !apiUrl) {
            showStatus('使用自定义API时需要提供API地址 | API URL required for custom API', 'error');
            return;
        }

        showStatus('正在测试连接... | Testing connection...', 'info');

        // 发送测试请求到background script
        const response = await chrome.runtime.sendMessage({
            action: 'testConnection',
            apiProvider,
            apiKey,
            apiUrl
        });

        if (response.success) {
            showStatus('连接成功！ | Connection successful!', 'success');
        } else {
            showStatus('连接失败 | Connection failed: ' + response.error, 'error');
        }
    } catch (error) {
        showStatus('测试失败 | Test failed: ' + error.message, 'error');
    }
}

// 显示状态消息
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    statusDiv.style.display = 'block';

    // 3秒后自动隐藏
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}
