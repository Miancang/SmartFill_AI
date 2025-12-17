// 监听来自页面的消息
console.log('SmartFill AI Content Script loaded');

// 监听快捷键命令
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autoFill') {
        handleAutoFill();
    }
});

// 处理自动填充
async function handleAutoFill() {
    try {
        // 显示加载提示
        showNotification('正在分析表单... | Analyzing form...', 'info');

        // 获取页面上的所有表单字段
        const formFields = extractFormFields();

        if (formFields.length === 0) {
            showNotification('未找到可填充的表单字段 | No fillable form fields found', 'warning');
            return;
        }

        // 获取用户信息
        const { userInfo } = await chrome.storage.sync.get(['userInfo']);
        
        if (!userInfo) {
            showNotification('请先在插件设置中配置个人信息 | Please configure your information in extension settings first', 'error');
            return;
        }

        // 准备发送的数据（不包含element引用）
        const fieldsForAI = formFields.map(field => ({
            index: field.index,
            id: field.id,
            name: field.name,
            type: field.type,
            placeholder: field.placeholder,
            label: field.label,
            value: field.value,
            required: field.required,
            ariaLabel: field.ariaLabel
        }));

        // 发送到background进行AI处理
        const response = await chrome.runtime.sendMessage({
            action: 'fillForm',
            formFields: fieldsForAI,
            userInfo: userInfo
        });

        if (response.success) {
            // 使用原始formFields（包含element引用）进行填充
            fillFormWithData(response.fillData, formFields);
            showNotification('表单填充成功！ | Form filled successfully!', 'success');
        } else {
            throw new Error(response.error || '填充失败');
        }

    } catch (error) {
        console.error('AutoFill error:', error);
        showNotification(`错误 | Error: ${error.message}`, 'error');
    }
}

// 提取页面上的表单字段
function extractFormFields() {
    const fields = [];
    let fieldIndex = 0; // 用独立的计数器
    
    // 查找所有输入字段
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
        // 跳过隐藏字段、按钮、提交按钮等
        if (input.type === 'hidden' || 
            input.type === 'submit' || 
            input.type === 'button' ||
            input.type === 'image' ||
            input.type === 'reset' ||
            input.type === 'search') { // 跳过搜索框
            return;
        }

        // 检查字段是否真正可见（包括对话框中的字段）
        const isVisible = input.offsetWidth > 0 && input.offsetHeight > 0;
        if (!isVisible && input.style.display === 'none') {
            return;
        }

        const fieldInfo = {
            index: fieldIndex++, // 使用独立计数器
            id: input.id || '',
            name: input.name || '',
            type: input.type || input.tagName.toLowerCase(),
            placeholder: input.placeholder || '',
            label: getFieldLabel(input),
            value: input.value || '',
            required: input.required || false,
            ariaLabel: input.getAttribute('aria-label') || '',
            dataExport: input.getAttribute('data-export') || '', // UCLA表单使用这个属性
            element: input // 保存元素引用用于后续填充
        };

        fields.push(fieldInfo);
    });

    console.log(`SmartFill AI: 找到 ${fields.length} 个表单字段`);
    console.log('SmartFill AI: 字段详情:', fields.map(f => ({
        index: f.index,
        id: f.id,
        name: f.name,
        type: f.type,
        label: f.label
    })));
    return fields;
}

// 获取字段的标签文本
function getFieldLabel(input) {
    // 尝试通过for属性查找label
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            return label.textContent.trim();
        }
    }

    // 查找父级label
    const parentLabel = input.closest('label');
    if (parentLabel) {
        return parentLabel.textContent.replace(input.value, '').trim();
    }

    // 查找前面的label或文本
    const prevSibling = input.previousElementSibling;
    if (prevSibling) {
        if (prevSibling.tagName === 'LABEL') {
            return prevSibling.textContent.trim();
        }
        // 如果前面是包含文本的元素
        if (prevSibling.textContent && prevSibling.textContent.trim().length < 50) {
            return prevSibling.textContent.trim();
        }
    }

    return '';
}

// 使用AI返回的数据填充表单
function fillFormWithData(fillData, formFields) {
    fillData.forEach(item => {
        // 通过index从原始formFields中获取element
        const fieldData = formFields[item.index];
        if (!fieldData) return;
        
        const field = fieldData.element;
        const value = item.value;

        if (!field || !value) return;

        // 根据字段类型填充
        if (field.tagName === 'SELECT') {
            // 下拉框：尝试匹配选项
            const options = Array.from(field.options);
            const matchedOption = options.find(opt => 
                opt.value === value || 
                opt.text === value ||
                opt.text.includes(value) ||
                value.includes(opt.text)
            );
            if (matchedOption) {
                field.value = matchedOption.value;
            }
        } else if (field.type === 'checkbox') {
            // 复选框
            if (value === true || value === 'true' || value === '1' || value === 'yes') {
                field.checked = true;
            }
        } else if (field.type === 'radio') {
            // 单选框：查找匹配的选项
            const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
            radioGroup.forEach(radio => {
                if (radio.value === value || radio.value.includes(value)) {
                    radio.checked = true;
                }
            });
        } else {
            // 文本输入框
            field.value = value;
            
            // 触发多种事件确保网站能检测到变化
            try {
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('blur', { bubbles: true }));
                
                // 对于某些框架，需要触发focus
                field.dispatchEvent(new Event('focus', { bubbles: true }));
            } catch (e) {
                console.log('Event dispatch error:', e);
            }
        }

        // 高亮填充的字段
        highlightField(field);
    });
}

// 高亮字段
function highlightField(field) {
    const originalBorder = field.style.border;
    field.style.border = '2px solid #4CAF50';
    field.style.transition = 'border 0.3s ease';

    setTimeout(() => {
        field.style.border = originalBorder;
    }, 2000);
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除已存在的通知
    const existingNotification = document.getElementById('smartfill-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.id = 'smartfill-notification';
    notification.className = `smartfill-notification smartfill-${type}`;
    notification.textContent = message;

    // 样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        backgroundColor: type === 'success' ? '#4CAF50' : 
                         type === 'error' ? '#f44336' : 
                         type === 'warning' ? '#ff9800' : '#2196F3',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: '999999',
        animation: 'slideIn 0.3s ease-out'
    });

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
