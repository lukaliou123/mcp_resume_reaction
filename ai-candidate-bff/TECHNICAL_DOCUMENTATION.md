# AI候选人BFF技术文档

## 项目概述

AI候选人BFF（Backend For Frontend）是一个基于Express.js的智能候选人信息服务，集成了MCP (Model Context Protocol) 服务器和LangFuse监控，为AI驱动的招聘助手提供后端支持。

## 架构设计

### 核心组件

*   **Express.js 服务器:** 主要的HTTP服务器，处理API请求和静态文件服务。
*   **集成MCP服务器:** 直接集成的MCP服务器，提供候选人的结构化信息（无外部依赖）。
*   **LLM服务:** 基于LangChain.js和OpenAI API的智能对话服务。
*   **LangFuse监控:** API调用追踪和性能监控。

### 技术栈

*   **后端框架:** Express.js
*   **AI/LLM:** OpenAI GPT, LangChain.js
*   **MCP协议:** 集成的Model Context Protocol服务器
*   **监控:** LangFuse
*   **部署:** 支持Vercel、Railway、Docker等多种方式

## 项目结构

```
ai-candidate-bff/
├── index.js                 # 主应用入口
├── llmService.js            # LLM服务（集成MCP工具）
├── src/
│   ├── mcp-server/          # 集成的MCP服务器源码
│   │   ├── server.js        # MCP服务器核心逻辑
│   │   ├── config.js        # 服务器配置
│   │   ├── index.js         # MCP服务器入口
│   │   ├── resources/       # 候选人资源
│   │   ├── tools/           # 候选人工具
│   │   └── prompts/         # 提示模板
│   └── services/
│       └── mcpService.js    # MCP服务封装
├── config/                  # 配置文件
│   ├── candidate.js         # 候选人基本信息
│   ├── resume-content.js    # 详细简历内容
│   └── server.js            # 服务器配置
├── public/                  # 静态文件
└── scripts/                 # 部署脚本
```

## 核心功能

### 1. 智能对话API

**端点:** `POST /chat`

**功能:** 接收用户的自然语言问题，通过LLM理解意图并调用相应的MCP工具获取候选人信息。

**流程:**
1. 接收用户消息
2. LLM分析用户意图
3. 调用集成的MCP工具获取信息
4. LLM生成自然语言回复
5. 返回结构化响应

### 2. 集成MCP服务器

**特点:**
- 无外部依赖，源码直接集成
- 支持候选人信息的结构化访问
- 提供多种工具和资源

**可用工具:**
- `get_resume_text`: 获取候选人简历文本
- `get_resume_url`: 获取候选人简历链接
- `get_linkedin_url`: 获取LinkedIn链接
- `get_github_url`: 获取GitHub主页
- `get_website_url`: 获取个人网站

### 3. LangFuse监控

**功能:**
- API调用统计
- Token使用追踪
- 错误日志记录
- 性能指标收集

**端点:** `GET /monitoring`

## 配置管理

### 候选人信息配置

候选人信息通过配置文件管理，支持热更新：

*   `config/candidate.js`: 候选人基本信息
*   `config/resume-content.js`: 详细简历内容

### 环境变量

```bash
# 必需配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-nano

# LangFuse监控（可选）
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key_here
LANGFUSE_SECRET_KEY=your_langfuse_secret_key_here
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# 应用配置
NODE_ENV=production
PORT=3000
```

## API端点

### 核心端点

*   `GET /` - 前端界面
*   `GET /health` - 健康检查
*   `GET /monitoring` - 监控状态
*   `POST /chat` - 智能对话API
*   `POST /mcp` - MCP协议端点

### 测试端点

*   `GET /test-mcp/resume-text` - 获取简历文本
*   `GET /test-mcp/linkedin-url` - 获取LinkedIn链接
*   `GET /test-mcp/github-url` - 获取GitHub链接

## 部署架构

### 集成模式优势

1. **无外部依赖:** 所有MCP功能直接集成，无需外部进程
2. **简化部署:** 单一应用，易于容器化和云部署
3. **性能优化:** 无进程间通信开销
4. **维护简单:** 统一的代码库和配置管理

### 支持的部署平台

1. **Vercel** - 自动部署、全球CDN
2. **Railway** - 容器化部署、数据库支持
3. **Docker** - 自建服务器部署
4. **传统VPS** - PM2进程管理

## 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.production .env
# 编辑.env文件设置API密钥

# 启动开发服务器
npm run dev
```

### 更新候选人信息

1. 编辑 `config/candidate.js` 和 `config/resume-content.js`
2. 重启应用
3. 验证更新是否生效

### 添加新的MCP工具

1. 在 `src/mcp-server/tools/` 中添加新工具
2. 在 `llmService.js` 中注册新工具
3. 更新系统提示词

## 监控和日志

### LangFuse监控

访问 [LangFuse Dashboard](https://cloud.langfuse.com) 查看：
- API调用统计
- Token使用情况
- 错误日志
- 性能指标

### 健康检查

```bash
# 检查应用状态
curl http://localhost:3000/health

# 检查监控状态
curl http://localhost:3000/monitoring
```

## 故障排除

### 常见问题

1. **应用无法启动**
   - 检查环境变量配置
   - 验证OpenAI API密钥
   - 查看应用日志

2. **MCP工具无法加载**
   - 确认配置文件格式正确
   - 检查候选人配置文件

3. **LangFuse监控不工作**
   - 验证LangFuse密钥
   - 检查网络连接

### 调试命令

```bash
# 本地调试
npm run dev

# 生产环境测试
npm run start:prod

# 健康检查
npm run health-check
``` 