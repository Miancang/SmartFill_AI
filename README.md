# SmartFill AI - 智能表单填充助手

<div align="center">

![SmartFill AI](icons/icon128.svg)

一个基于AI的智能浏览器扩展，帮助您快速、准确地填写网页表单。

An AI-powered browser extension that helps you fill out web forms quickly and accurately.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange)](https://www.google.com/chrome/)
[![Edge Extension](https://img.shields.io/badge/Edge-Extension-blue)](https://www.microsoft.com/edge)

[English](#english) | [中文](#中文)

</div>

---

## 中文

## ✨ 功能特性

- 🤖 **AI智能识别** - 自动分析表单字段，智能匹配用户信息
- 🌐 **多语言支持** - 支持中英文表单字段识别
- 🔒 **隐私安全** - 所有数据存储在本地，不上传到服务器
- 🎯 **精准匹配** - 支持姓名、邮箱、电话、地址等常见字段
- 📝 **推荐人信息** - 支持保存最多3位推荐人的完整信息
- 🔌 **多API支持** - 支持OpenAI、Claude、DeepSeek等多个AI服务提供商

## 📦 安装步骤

### 1. 加载扩展到Edge浏览器

1. 打开 Microsoft Edge 浏览器
2. 访问 `edge://extensions/`
3. 开启右上角的 **"开发人员模式"**
4. 点击 **"加载解压缩的扩展"**
5. 选择本项目文件夹 `SmartFill_AI`
6. 扩展加载成功！

## 🚀 使用方法

### 第一步：配置API密钥

1. 点击浏览器工具栏中的 SmartFill AI 图标
2. 在 **AI API设置** 区域：
   - 选择API提供商（OpenAI、Claude或自定义）
   - 输入您的API密钥
3. 点击 **"测试连接"** 确保配置正确

### 第二步：填写申请人和推荐人信息

在扩展设置中填写信息：

**申请人信息库：**
- Full Name（全名）
- Email（邮箱）
- Phone（电话）
- Permanent Address（永久地址）
- Mailing Address（邮寄地址）
- Math Courses（数学课程，自然语言描述）
- Additional Information（补充信息）
- 结构化字段（JSON格式，可选）

**推荐人信息库（最多3位）：**
- Prefix（称谓：Dr., Prof., Mr., Ms.等）
- First Name（名）
- Last Name（姓）
- Organization（机构）
- Position/Title（职位/头衔）
- Relation（关系：导师、课程教师等）
- Telephone（电话）
- Email（邮箱）

示例数学课程描述：
```
我在上海交通大学修读了初等数论(MATH1403)获得A-，在威斯康星大学麦迪逊分校修读了抽象代数(MATH 741)获得A，拓扑学(MATH 751)获得A-...
```

### 第三步：使用智能填充

1. 打开任何包含表单的网页
2. 按下快捷键（默认为 **Ctrl+Shift+X**，可在 edge://extensions/shortcuts 中自定义）
3. AI将自动分析表单并填充您的信息
4. 填充的字段会短暂高亮显示绿色边框

## 🎯 支持的表单字段类型

- ✅ 文本输入框 (text)
- ✅ 邮箱输入框 (email)
- ✅ 电话输入框 (tel)
- ✅ 文本域 (textarea)
- ✅ 下拉选择框 (select)
- ✅ 单选按钮 (radio)
- ✅ 复选框 (checkbox)

## 🔧 API提供商配置

### DeepSeek (推荐)

1. 访问 https://platform.deepseek.com/
2. 注册并创建API密钥
3. 在扩展设置中选择 "DeepSeek" 并粘贴密钥

### OpenAI

1. 访问 https://platform.openai.com/api-keys
2. 创建API密钥
3. 在扩展设置中选择 "OpenAI" 并粘贴密钥

### Claude (Anthropic)

1. 访问 https://console.anthropic.com/
2. 获取API密钥
3. 在扩展设置中选择 "Claude" 并粘贴密钥

### 自定义API

如果您使用其他兼容OpenAI格式的API服务：

1. 选择 "自定义"
2. 输入API地址（如：`https://api.example.com/v1/chat/completions`）
3. 输入API密钥

## 📁 项目结构

```
SmartFill_AI/
├── manifest.json        # 扩展配置文件
├── background.js        # 后台服务脚本（处理API调用）
├── content.js          # 内容脚本（页面交互）
├── popup.html          # 设置界面HTML
├── popup.js            # 设置界面逻辑
├── popup.css           # 设置界面样式
├── icons/              # 图标文件夹
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # 说明文档
```

## 🔐 隐私与安全

- ✅ 所有个人信息存储在浏览器本地存储中
- ✅ 不会向任何服务器上传您的个人信息
- ✅ API密钥仅用于与您选择的AI服务通信
- ✅ 开源代码，可自行审查安全性
- ✅ 符合 Chrome/Edge 扩展安全标准（Manifest V3）

**重要提示**：
- 表单数据会发送到您选择的 AI 服务提供商（OpenAI、Claude 等）进行分析
- 请确保您信任所使用的 AI 服务提供商
- 不建议在处理高度敏感信息的表单上使用
- 详见[安全政策](SECURITY.md)

## ⚙️ 工作原理

1. **字段识别**：content.js扫描页面上的所有表单字段
2. **信息提取**：提取字段的标签、占位符、名称等属性
3. **AI分析**：background.js将字段信息发送给AI进行智能匹配
4. **智能填充**：根据AI返回的结果填充对应字段
5. **视觉反馈**：高亮显示已填充的字段

## 🛠️ 开发说明

### 技术栈

- Manifest V3（最新Chrome扩展标准）
- Vanilla JavaScript（无框架依赖）
- Chrome Extension APIs
- OpenAI / Claude API

### 本地调试

1. 修改代码后，在 `edge://extensions/` 页面点击 **"重新加载"**
2. 打开浏览器控制台查看日志
3. 使用 `chrome.storage` API查看存储数据

### API调用限制

- 建议使用付费API密钥以获得更好的体验
- 免费API可能有速率限制
- 可以在background.js中添加请求缓存优化

## ⌨️ 自定义快捷键

扩展默认快捷键为 **Ctrl+Shift+X**，您可以自定义：

1. 访问 `edge://extensions/shortcuts`
2. 找到 "SmartFill AI"
3. 点击快捷键输入框
4. 按下您想要的快捷键组合
5. 快捷键会自动保存

## 📝 常见问题

### Q: 快捷键不生效？
A: 检查是否有其他扩展占用了快捷键，可以在 `edge://extensions/shortcuts` 中自定义您喜欢的快捷键。

### Q: API调用失败？
A: 
1. 检查API密钥是否正确
2. 确认网络连接正常
3. 查看API服务商是否有余额

### Q: 某些字段没有填充？
A: AI可能无法准确识别某些特殊字段，可以在个人信息的自定义字段中添加更多信息。

### Q: 如何添加新的AI提供商？
A: 编辑 `background.js` 中的 `callAIAPI` 函数，添加新的case分支。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证 | License

### MIT License

```
MIT License

Copyright (c) 2025 SmartFill AI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 免责声明 | Disclaimer

**中文：**

本软件按"原样"提供，不提供任何明示或暗示的保证。使用本软件的风险由您自行承担。

- ⚠️ 本扩展使用第三方 AI API，数据处理受各 AI 服务提供商的隐私政策约束
- ⚠️ 开发者不对因使用本软件而产生的任何数据泄露、损失或损害负责
- ⚠️ 请在使用前仔细阅读您所选择的 AI 服务商的服务条款和隐私政策
- ⚠️ 建议在非敏感表单上使用，避免填写涉及金融、医疗等敏感信息的表单

**English:**

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. USE AT YOUR OWN RISK.

- ⚠️ This extension uses third-party AI APIs; data processing is subject to the privacy policies of the respective AI service providers
- ⚠️ The developers are not responsible for any data breaches, losses, or damages resulting from the use of this software
- ⚠️ Please read the terms of service and privacy policies of your chosen AI service provider before use
- ⚠️ It is recommended to use this on non-sensitive forms only; avoid forms involving financial, medical, or other sensitive information

### AI 使用声明 | AI Usage Declaration

**中文：**

🤖 本项目的代码主要由 AI 助手（Claude by Anthropic）协助开发完成。

- 核心功能逻辑由 AI 生成并经过人工审查和测试
- UI/UX 设计和用户体验优化得到 AI 的建议和实现
- 文档和注释由 AI 协助撰写
- 项目维护者负责最终的代码审查、决策和质量控制

这是一个展示 AI 辅助开发能力的开源项目，欢迎社区贡献和改进。

**English:**

🤖 The code in this project was primarily developed with the assistance of an AI assistant (Claude by Anthropic).

- Core functionality and logic were generated by AI and reviewed/tested by humans
- UI/UX design and user experience optimization were advised and implemented with AI assistance
- Documentation and comments were written with AI assistance
- Project maintainers are responsible for final code review, decision-making, and quality control

This is an open-source project showcasing AI-assisted development capabilities. Community contributions and improvements are welcome.

### 第三方服务 | Third-Party Services

本项目集成了以下第三方服务的 API | This project integrates APIs from the following third-party services:

- **OpenAI API** - [Terms](https://openai.com/policies/terms-of-use) | [Privacy](https://openai.com/policies/privacy-policy)
- **Claude API (Anthropic)** - [Terms](https://www.anthropic.com/legal/consumer-terms) | [Privacy](https://www.anthropic.com/legal/privacy)
- **DeepSeek API** - [Terms](https://www.deepseek.com/terms) | [Privacy](https://www.deepseek.com/privacy)

使用本扩展即表示您同意遵守上述第三方服务的条款。

By using this extension, you agree to comply with the terms of the above third-party services.

## 🙏 致谢 | Acknowledgments

**中文：**
- 感谢 Anthropic 的 Claude AI 在项目开发中提供的强大支持
- 感谢 OpenAI、Anthropic 和 DeepSeek 提供强大的 AI 能力
- 感谢所有贡献者的支持

**English:**
- Thanks to Anthropic's Claude AI for powerful support in project development
- Thanks to OpenAI, Anthropic, and DeepSeek for providing powerful AI capabilities
- Thanks to all contributors for their support

## 📧 联系方式 | Contact

**中文：**
如有问题或建议，欢迎通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件（请在 Issue 中联系）

**English:**
For questions or suggestions, please contact us through:
- Submit a GitHub Issue
- Send an email (please contact via Issue)

---

<div align="center">

Made with ❤️ and 🤖 AI by SmartFill AI Team

**注：本项目采用 AI 辅助开发 | Note: This project was developed with AI assistance**

</div>

---

## English

## ✨ Features

- 🤖 **AI-Powered Recognition** - Automatically analyzes form fields and intelligently matches user information
- 🌐 **Multi-Language Support** - Supports both Chinese and English form field recognition
- 🔒 **Privacy & Security** - All data stored locally, not uploaded to any server
- 🎯 **Precise Matching** - Supports common fields like name, email, phone, address, etc.
- 📝 **Recommender Information** - Supports saving complete information for up to 3 recommenders
- 🔌 **Multiple API Support** - Supports OpenAI, Claude, DeepSeek, and other AI service providers

## 📦 Installation

### 1. Load Extension in Edge Browser

1. Open Microsoft Edge browser
2. Navigate to `edge://extensions/`
3. Enable **"Developer mode"** in the top right corner
4. Click **"Load unpacked"**
5. Select the `SmartFill_AI` project folder
6. Extension loaded successfully!

## 🚀 Usage

### Step 1: Configure API Key

1. Click the SmartFill AI icon in the browser toolbar
2. In the **AI API Settings** section:
   - Select API provider (OpenAI, Claude, or Custom)
   - Enter your API key
3. Click **"Test Connection"** to ensure configuration is correct

### Step 2: Fill in Applicant and Recommender Information

Fill in information in the extension settings:

**Applicant Information:**
- Full Name
- Email
- Phone
- Permanent Address
- Mailing Address
- Math Courses (natural language description)
- Additional Information
- Custom Fields (JSON format, optional)

**Recommender Information (up to 3):**
- Prefix (e.g., Dr., Prof., Mr., Ms.)
- First Name
- Last Name
- Organization
- Position/Title
- Relation (e.g., advisor, course instructor)
- Telephone
- Email

Example Math Courses Description:
```
I took Elementary Number Theory (MATH1403) at Shanghai Jiao Tong University with grade A-, Abstract Algebra (MATH 741) at University of Wisconsin-Madison with grade A, Topology (MATH 751) with grade A-...
```

### Step 3: Use Smart Fill

1. Open any webpage containing a form
2. Press the shortcut key (default **Ctrl+Shift+X**, customizable at edge://extensions/shortcuts)
3. AI will automatically analyze the form and fill in your information
4. Filled fields will briefly highlight with a green border

## 🎯 Supported Form Field Types

- ✅ Text input (text)
- ✅ Email input (email)
- ✅ Phone input (tel)
- ✅ Text area (textarea)
- ✅ Dropdown select (select)
- ✅ Radio buttons (radio)
- ✅ Checkboxes (checkbox)

## 🔧 API Provider Configuration

### DeepSeek (Recommended)

1. Visit https://platform.deepseek.com/
2. Register and create an API key
3. Select "DeepSeek" in extension settings and paste the key

### OpenAI

1. Visit https://platform.openai.com/api-keys
2. Create an API key
3. Select "OpenAI" in extension settings and paste the key

### Claude (Anthropic)

1. Visit https://console.anthropic.com/
2. Get an API key
3. Select "Claude" in extension settings and paste the key

### Custom API

If you use other OpenAI-compatible API services:

1. Select "Custom"
2. Enter API address (e.g., `https://api.example.com/v1/chat/completions`)
3. Enter API key

## 📁 Project Structure

```
SmartFill_AI/
├── manifest.json        # Extension configuration file
├── background.js        # Background service script (handles API calls)
├── content.js          # Content script (page interaction)
├── popup.html          # Settings UI HTML
├── popup.js            # Settings UI logic
├── popup.css           # Settings UI styles
├── icons/              # Icon folder
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # Documentation
```

## 🔐 Privacy & Security

- ✅ All personal information stored in local browser storage
- ✅ No personal information uploaded to any server
- ✅ API keys only used to communicate with your chosen AI service
- ✅ Open-source code, can be audited for security
- ✅ Complies with Chrome/Edge extension security standards (Manifest V3)

**Important Notice:**
- Form data will be sent to your chosen AI service provider (OpenAI, Claude, etc.) for analysis
- Please ensure you trust the AI service provider you use
- Not recommended for forms with highly sensitive information

## ⚙️ How It Works

1. **Field Recognition**: content.js scans all form fields on the page
2. **Information Extraction**: Extracts field labels, placeholders, names, and other attributes
3. **AI Analysis**: background.js sends field information to AI for intelligent matching
4. **Smart Fill**: Fills corresponding fields based on AI response
5. **Visual Feedback**: Highlights filled fields

## 🛠️ Development

### Tech Stack

- Manifest V3 (latest Chrome extension standard)
- Vanilla JavaScript (no framework dependencies)
- Chrome Extension APIs
- OpenAI / Claude API

### Local Debugging

1. After modifying code, click **"Reload"** on the `edge://extensions/` page
2. Open browser console to view logs
3. Use `chrome.storage` API to view stored data

### API Call Limitations

- Recommend using paid API keys for better experience
- Free APIs may have rate limits
- Can add request caching in background.js for optimization

## ⌨️ Custom Shortcuts

Default shortcut is **Ctrl+Shift+X**, you can customize:

1. Visit `edge://extensions/shortcuts`
2. Find "SmartFill AI"
3. Click on the shortcut input box
4. Press your desired key combination
5. Shortcut will be saved automatically

## 📝 FAQ

### Q: Shortcut not working?
A: Check if other extensions are using the same shortcut. You can customize it at `edge://extensions/shortcuts`.

### Q: API call failed?
A: 
1. Check if API key is correct
2. Confirm network connection is normal
3. Check if API service has sufficient balance

### Q: Some fields not filled?
A: AI may not accurately recognize some special fields. You can add more information in custom fields.

### Q: How to add new AI providers?
A: Edit the `callAIAPI` function in `background.js` and add a new case branch.

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
