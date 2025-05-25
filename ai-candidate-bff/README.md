# AI候选人BFF (Backend For Frontend)

一个基于Express.js的智能候选人信息服务，集成了MCP (Model Context Protocol) 服务器和LangFuse监控，为AI驱动的招聘助手提供后端支持。

## ✨ 特性

- 🤖 **集成MCP服务器**: 直接集成候选人信息MCP服务器，无外部依赖
- 📊 **LangFuse监控**: 完整的API调用追踪和性能监控
- 🔧 **配置化管理**: 候选人信息通过配置文件管理，易于更新
- 🚀 **多平台部署**: 支持Vercel、Railway、Docker等多种部署方式
- 💬 **智能对话**: 基于OpenAI GPT模型的智能候选人信息问答
- 🛡️ **生产就绪**: 包含健康检查、错误处理、安全配置

## 🏗️ 架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端界面      │────│  AI候选人BFF     │────│   OpenAI API    │
│   (Web UI)      │    │  (Express.js)    │    │   (GPT模型)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ├── 集成MCP服务器
                              ├── LangFuse监控
                              └── 候选人配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- OpenAI API密钥
- LangFuse账户（可选，用于监控）

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ai-candidate-bff
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.production .env
   # 编辑.env文件，设置你的API密钥
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   - 应用: http://localhost:3000
   - 健康检查: http://localhost:3000/health
   - 监控状态: http://localhost:3000/monitoring

## 📋 API端点

### 核心端点

- `GET /` - 前端界面
- `GET /health` - 健康检查
- `GET /monitoring` - 监控状态
- `POST /chat` - 智能对话API
- `POST /mcp` - MCP协议端点

### 测试端点

- `GET /test-mcp/resume-text` - 获取简历文本
- `GET /test-mcp/linkedin-url` - 获取LinkedIn链接
- `GET /test-mcp/github-url` - 获取GitHub链接

## 🔧 配置

### 候选人信息配置

候选人信息通过配置文件管理，位于 `config/` 目录：

- `config/candidate.js` - 候选人基本信息
- `config/resume-content.js` - 详细简历内容
- `config/server.js` - 服务器配置

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

## 🚀 部署

项目支持多种部署方式，详见 [DEPLOYMENT.md](./DEPLOYMENT.md)：

### 推荐部署平台

1. **Vercel** (推荐) - 自动部署、全球CDN、免费额度
2. **Railway** - 简单容器化部署、支持数据库
3. **Docker** - 适合自建服务器
4. **传统VPS** - 使用PM2进程管理

### 快速部署到Vercel

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 自动部署完成

## 📊 监控

### LangFuse监控

集成了LangFuse监控，可以追踪：
- API调用统计
- Token使用情况
- 错误日志
- 性能指标

访问 [LangFuse Dashboard](https://cloud.langfuse.com) 查看详细监控数据。

### 健康检查

```bash
# 检查应用状态
curl http://localhost:3000/health

# 检查监控状态
curl http://localhost:3000/monitoring
```

## 🛠️ 开发

### 项目结构

```
ai-candidate-bff/
├── index.js                 # 主应用入口
├── llmService.js            # LLM服务
├── src/
│   ├── mcp-server/          # 集成的MCP服务器
│   └── services/            # 服务层
├── config/                  # 配置文件
├── public/                  # 静态文件
├── scripts/                 # 部署脚本
└── docs/                    # 文档
```

### 可用脚本

```bash
npm run dev          # 开发模式
npm run start        # 生产模式启动
npm run start:prod   # 生产环境启动
npm run health-check # 健康检查
```

### 更新候选人信息

1. 编辑 `config/candidate.js` 和 `config/resume-content.js`
2. 重启应用或重新部署
3. 验证更新是否生效

## 🔒 安全

- 环境变量安全存储
- CORS配置
- 非root用户运行（Docker）
- API密钥验证（可选）

## 🤝 贡献

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

ISC License

## 🆘 支持

如果遇到问题：

1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 部署指南
2. 检查 [故障排除](./DEPLOYMENT.md#故障排除) 部分
3. 查看应用日志
4. 提交Issue

---

**注意**: 这是一个重构后的版本，采用了源码集成的MCP服务器架构，无外部npm依赖，更适合生产环境部署。
```

生产模式：
```bash
npm start
```

## API端点

- `GET /health`: 健康检查，返回服务状态
- `POST /chat`: 聊天接口
  - 请求体: `{ "message": "用户问题" }`
  - 响应: `{ "text": "AI回复" }`

## 下一步开发计划

1. 实现与MCP Server的子进程通信
2. 集成LangChain.js和OpenAI API
3. 实现工具调用逻辑
4. 实现基于工具结果的回复生成 