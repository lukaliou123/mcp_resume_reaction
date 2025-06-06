# AI候选人智能助手 - 技术文档

## 📋 项目概述

本项目是一个基于AI的候选人信息交互系统，提供PC Web界面让用户通过自然语言与AI助手对话，获取候选人的详细信息。系统集成了先进的GitHub项目分析功能、智能上下文感知和实时监控能力。

## 🚀 核心功能

### 💬 智能对话交互
- 自然语言理解用户问题
- 智能调用相应工具获取信息
- 生成友好的对话式回复
- 支持多轮对话和上下文记忆

### 🔍 GitHub深度分析
- **智能项目分析**: 深度分析GitHub仓库架构、技术栈、代码质量
- **智能URL处理**: 自动识别用户主页和仓库URL，提供相应分析
- **技术栈识别**: 自动检测编程语言、框架、构建工具
- **项目评估**: 生成复杂度评分和改进建议
- **缓存优化**: 智能缓存分析结果，提升查询性能

### 🧠 智能上下文感知
- **会话记忆**: 记住之前分析的GitHub项目
- **智能建议**: 基于上下文自动生成相关问题
- **项目关联**: 将用户问题与已分析项目智能关联

### 📊 实时监控与分析
- **LangFuse集成**: 全面的API调用追踪和性能监控
- **工具调用监控**: 智能分析工具使用模式
- **异常检测**: 自动识别异常调用行为
- **策略建议**: 基于使用数据提供优化建议

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│   PC Web UI     │───▶│  AI-Candidate-BFF   │───▶│   LLM Service    │
│ (Vue/React/JS)  │    │   (Express.js)      │    │ (OpenAI/Qwen)    │
└─────────────────┘    └─────────────────────┘    └──────────────────┘
                                │                           │
                                ▼                           ▼
                       ┌─────────────────┐         ┌──────────────────┐
                       │ 集成MCP服务器    │         │   LangChain.js   │
                       │ (Process-内)    │         │  (Agent, Tools)  │
                       └─────────────────┘         └──────────────────┘
                                │                           │
                                ▼                           ▼
                    ┌─────────────────────────┐    ┌──────────────────┐
                    │     GitHub API          │    │   LangFuse       │
                    │   + 缓存服务             │    │    监控服务       │
                    └─────────────────────────┘    └──────────────────┘
```

### 架构特点
- **🎯 集成模式**: MCP服务器完全集成，无子进程开销
- **⚡ 高性能**: 进程内通信，零序列化开销
- **🔧 易部署**: 单一应用，支持多种云平台
- **📊 可监控**: 全链路追踪和性能分析

## 🛠️ 技术栈

### 后端核心
- **应用框架**: Express.js 5.1.0
- **AI/LLM**: 
  - OpenAI GPT (gpt-4o-mini)
  - 阿里云通义千问 (qwen-turbo-latest)
- **AI框架**: LangChain.js + LangGraph
- **MCP协议**: @modelcontextprotocol/sdk (完全集成)

### 集成服务
- **GitHub分析**: @octokit/rest + 智能缓存
- **监控服务**: LangFuse (langfuse-langchain)
- **邮件服务**: Nodemailer + Mailgun
- **数据校验**: Zod

### 部署支持
- **云平台**: Vercel, Railway, Docker
- **进程管理**: PM2
- **环境管理**: dotenv

## 📁 项目结构

```
ai-candidate-bff/
├── index.js                    # 🚀 主应用入口
├── llmService.js              # 🧠 LLM服务 (集成MCP工具)
├── src/
│   ├── mcp-server/            # 📦 集成MCP服务器源码
│   │   ├── server.js          # 核心MCP服务逻辑
│   │   ├── config.js          # MCP配置管理
│   │   ├── resources/         # 候选人资源定义
│   │   ├── tools/             # 候选人工具定义
│   │   └── prompts/           # 智能提示模板
│   └── services/              # 🔧 核心服务层
│       ├── mcpService.js      # MCP服务封装
│       ├── githubMCPService.js # GitHub分析服务
│       ├── chatHistoryService.js # 会话历史管理
│       ├── conversationContextService.js # 上下文感知
│       ├── toolCallMonitorService.js # 工具调用监控
│       └── githubCacheService.js # GitHub缓存服务
├── config/                    # ⚙️ 配置文件
│   ├── candidate.js           # 候选人基本信息
│   ├── resume-content.js      # 详细简历内容
│   └── server.js              # 服务器配置
├── public/                    # 🌐 静态前端文件
├── cache/                     # 💾 GitHub分析缓存
└── scripts/                   # 📜 部署和测试脚本
```

## 🔧 核心功能详解

### 1. 智能对话API
**端点**: `POST /chat`

**特性**:
- 🧠 智能意图理解
- 🔄 多轮对话支持  
- 💡 智能建议生成
- 📝 会话历史管理
- 🎯 上下文感知回复

**请求格式**:
```json
{
  "message": "能分析一下AI候选人BFF系统的Github库里的内容吗？",
  "sessionId": "session_123"
}
```

**响应格式**:
```json
{
  "text": "AI助手的详细回复...",
  "suggestions": [
    "这个项目的架构设计如何？",
    "使用了哪些核心技术？",
    "项目的代码质量怎么样？"
  ],
  "sessionId": "session_123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. GitHub深度分析

**支持的GitHub工具**:
- `mcp__github__handle_url`: 🎯 智能URL处理 (用户主页/仓库自动识别)
- `mcp__github__analyze_repository`: 🔍 深度仓库分析
- `mcp__github__get_repository_info`: 📊 基本仓库信息
- `mcp__github__get_file_content`: 📄 文件内容获取
- `mcp__github__get_user_repositories`: 📋 用户仓库列表

**分析维度**:
- **技术栈识别**: 编程语言、框架、构建工具
- **项目评估**: 复杂度评分、开发状态
- **架构分析**: 目录结构、设计模式
- **代码质量**: 最佳实践、改进建议

### 3. 智能监控系统

**LangFuse监控**: `GET /monitoring`
- 📈 API调用统计
- 🪙 Token使用追踪  
- ❌ 错误日志记录
- ⚡ 性能指标分析

**工具调用监控**: `GET /tools/monitor/stats`
- 🔧 工具使用模式分析
- 🚨 异常调用检测
- 💡 策略优化建议
- 📊 实时统计数据

## 🚦 API端点总览

### 核心服务
- `GET /` - 🏠 前端界面
- `GET /health` - ❤️ 健康检查  
- `POST /chat` - 💬 智能对话
- `POST /mcp` - 🔌 MCP协议端点

### 监控管理
- `GET /monitoring` - 📊 LangFuse监控状态
- `GET /tools/monitor/stats` - 🔧 工具调用统计
- `GET /tools/monitor/analysis` - 📈 调用模式分析
- `GET /tools/monitor/anomalies` - 🚨 异常检测
- `GET /tools/monitor/recommendations` - 💡 策略建议

### 数据管理
- `GET /chat/history/:sessionId` - 📝 会话历史
- `DELETE /chat/history/:sessionId` - 🗑️ 清除历史
- `GET /chat/stats` - 📊 对话统计
- `GET /github/cache/stats` - 💾 GitHub缓存统计
- `GET /context/stats` - 🧠 上下文统计

### 测试端点
- `GET /test-mcp/resume-text` - 📄 简历文本测试
- `GET /test-mcp/github-url` - 🐙 GitHub链接测试
- `GET /test-mcp/linkedin-url` - 💼 LinkedIn链接测试

## ⚙️ 环境配置

### 必需配置
```bash
# AI服务配置
AI_PROVIDER_AREA=global              # global/cn (选择AI提供商区域)
OPENAI_API_KEY=your_openai_key       # OpenAI API密钥
OPENAI_MODEL=gpt-4o-mini             # OpenAI模型

# 阿里云通义千问 (AI_PROVIDER_AREA=cn时使用)
DASHSCOPE_API_KEY=your_dashscope_key
DASHSCOPE_MODEL=qwen-turbo-latest
```

### 可选配置  
```bash
# LangFuse监控
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_SECRET_KEY=sk-lf-xxx  
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# GitHub分析功能
FEATURE_GITHUB_ANALYSIS_ENABLED=true
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_xxx

# 应用配置
NODE_ENV=production
PORT=3000
CHAT_HISTORY_MAX_MESSAGES=20
CHAT_HISTORY_SESSION_TIMEOUT=3600000
```

## 🚀 快速开始

### 本地开发
```bash
# 1. 克隆项目
git clone <repository-url>
cd ai-candidate-bff

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.production .env
# 编辑.env文件，设置必需的API密钥

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
open http://localhost:3000
```

### 生产部署

**Vercel部署** (推荐):
```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 部署到Vercel
vercel --prod

# 3. 配置环境变量
vercel env add OPENAI_API_KEY
vercel env add LANGFUSE_PUBLIC_KEY
vercel env add LANGFUSE_SECRET_KEY
```

**Docker部署**:
```bash
# 1. 构建镜像
docker build -t ai-candidate-bff .

# 2. 运行容器
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -e LANGFUSE_PUBLIC_KEY=your_key \
  ai-candidate-bff
```

## 📊 使用示例

### 基本对话
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "介绍一下候选人的技术能力",
    "sessionId": "demo_session"
  }'
```

### GitHub项目分析
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "分析一下这个GitHub项目：https://github.com/user/repo",
    "sessionId": "demo_session"
  }'
```

### 监控数据查看
```bash
# 查看LangFuse监控状态
curl http://localhost:3000/monitoring

# 查看工具调用统计
curl http://localhost:3000/tools/monitor/stats

# 查看异常检测结果
curl http://localhost:3000/tools/monitor/anomalies
```

## 🎯 项目优势

### 🏗️ 架构优势
- **🎯 集成模式**: 无子进程开销，单一应用部署
- **⚡ 高性能**: 进程内通信，零延迟调用
- **🔧 易维护**: 统一代码库，简化架构
- **📦 易部署**: 支持多种云平台，容器化友好

### 🤖 AI能力
- **🧠 智能理解**: 精准识别用户意图
- **🔄 上下文感知**: 多轮对话记忆能力
- **💡 智能建议**: 基于上下文生成相关问题
- **🎯 工具选择**: 智能选择最适合的工具

### 📊 监控能力
- **🔍 全链路追踪**: LangFuse完整监控
- **📈 性能分析**: 实时性能指标
- **🚨 异常检测**: 自动识别异常模式
- **💡 智能建议**: 基于数据的优化建议

### 🔧 扩展性
- **🔌 模块化设计**: 松耦合的服务架构
- **🛠️ 易于扩展**: 新功能快速集成
- **⚙️ 配置灵活**: 运行时配置切换
- **🌐 多提供商**: 支持多种AI服务商

## 🤝 贡献指南

### 开发流程
1. Fork项目并创建功能分支
2. 编写代码并添加测试
3. 确保所有测试通过
4. 提交Pull Request

### 代码规范
- 使用ESLint和Prettier保证代码质量
- 遵循语义化提交信息规范
- 为新功能编写相应文档

---

**🎉 项目特色**: 这是一个集成了最新AI技术、GitHub深度分析、智能监控的现代化候选人信息系统，采用先进的集成架构，为HR和技术面试官提供强大的AI助手能力！ 