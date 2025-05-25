# AI候选人BFF项目重构计划

## 项目概述

本项目包含两个核心组件：
- `node-candidate-mcp-server`: MCP服务器库，提供候选人信息的资源和工具
- `ai-candidate-bff`: Express.js应用，作为前端的BFF（Backend For Frontend）

## 重构目标

### 主要问题
1. **本地文件依赖**：当前使用 `"file:../node-candidate-mcp-server"` 无法部署到生产环境
2. **子进程通信复杂性**：通过 `spawn` 启动 TypeScript 文件，增加资源消耗和维护难度
3. **数据更新困难**：候选人信息硬编码，更新需要重新部署整个 MCP 服务器

### 重构目标
- ✅ 采用官方推荐的 **express-mcp-handler** 模式
- ✅ 实现候选人数据的 **配置文件管理**
- ✅ 支持 **单候选人深度定制**
- ✅ 实现 **实时更新**（修改配置后重启生效）
- ✅ 简化部署流程，支持生产环境部署

## npm包依赖策略

### 问题分析
当前使用的 `@jhgaylor/candidate-mcp-server` 存在以下风险：
- ❌ **依赖他人维护**：包的更新和维护不受我们控制
- ❌ **定制受限**：深度定制需要fork或请求原作者
- ❌ **长期风险**：如果原作者停止维护，项目可能受影响

### 解决方案：源码集成（推荐）

**选择理由：**
- 🎯 **完全控制**：可以随时修改和定制MCP服务器
- 🚀 **部署简单**：无外部npm依赖，减少依赖风险
- 🔧 **深度集成**：可以与配置系统完美结合
- 📦 **单一仓库**：所有代码在一个项目中，便于维护

**实施方案：**
1. 将 `node-candidate-mcp-server/src` 的核心代码集成到 `ai-candidate-bff/src/mcp-server/`
2. 移除对外部npm包的依赖
3. 直接在项目中维护MCP服务器代码

### 替代方案
如果未来需要发布为独立包：
- **方案A**：使用自己的npm作用域 `@your-username/candidate-mcp-server`
- **方案B**：使用独特包名 `jaydon-candidate-mcp-server`

## 技术方案

### 架构选择：express-mcp-handler 模式

**选择理由：**
- 🏆 **官方推荐**：MCP 开发者推荐的集成方式
- ⚡ **性能优势**：无子进程开销，直接在同一进程中运行
- 🚀 **部署简单**：单一应用，无需管理多个进程
- 🔧 **数据定制化**：可以轻松从配置文件动态加载候选人信息
- 🛡️ **错误处理**：更好的错误传播和处理
- 🔥 **开发体验**：热重载、调试更方便

### 数据管理策略：配置文件

**选择理由：**
- 📝 **易于编辑**：直接修改 JavaScript 文件
- 🔄 **支持动态内容**：可以使用函数、模板等
- 📦 **版本控制友好**：可以追踪配置变更历史
- 🚀 **实时生效**：修改后重启应用即可
- 👤 **单用户场景**：符合当前只有一个候选人的需求

## 项目结构设计

### 重构后的目录结构

```
ai-candidate-bff/
├── index.js                    # 主应用入口
├── src/
│   ├── mcp-server/             # 集成的MCP服务器源码
│   │   ├── server.js           # MCP服务器核心
│   │   ├── resources/          # 资源定义
│   │   ├── tools/              # 工具定义
│   │   └── config.js           # MCP服务器配置
│   └── services/
│       ├── mcpService.js       # MCP服务封装
│       └── llmService.js       # LLM服务（保持不变）
├── config/
│   ├── candidate.js            # 候选人主配置文件
│   ├── resume-content.js       # 详细简历内容（分离大段文本）
│   └── server.js               # 应用服务器配置
├── public/                     # 前端静态文件
├── package.json                # 生产环境依赖（无外部MCP依赖）
├── .env                        # 环境变量
├── Dockerfile                  # Docker部署配置
└── vercel.json                 # Vercel部署配置
```

### 配置文件设计

#### config/candidate.js
```javascript
module.exports = {
  // 基本信息
  name: "陈嘉旭",
  email: "708980731@qq.com",
  
  // 链接信息
  resumeUrl: "",
  websiteUrl: "",
  linkedinUrl: "https://www.linkedin.com/in/jiaxu-chen-731896237/",
  githubUrl: "https://github.com/lukaliou123",
  
  // 详细简历内容
  resumeText: require('./resume-content.js'),
  
  // 网站内容（如果有）
  websiteText: "",
  
  // 元数据
  lastUpdated: new Date().toISOString(),
  version: "1.0.0"
};
```

#### config/resume-content.js
```javascript
// 分离大段简历内容，便于维护
module.exports = `{
  "name": "陈嘉旭",
  "position": "AI应用开发/Golang后端开发",
  // ... 完整的JSON格式简历内容
}`;
```

## 实施计划

### 阶段1：准备工作 ✅ 已完成
- [x] 备份当前工作代码
- [x] 创建 `refactor` 分支
- [x] **解决npm包依赖问题**（采用源码集成方案）

### 阶段2：核心重构 ✅ 已完成
- [x] 创建新的项目结构
- [x] **集成MCP服务器源码**到 `src/mcp-server/`
- [x] 创建配置文件系统
- [x] 重写 MCP 服务集成（直接使用集成的源码）
- [x] 更新主应用入口文件
- [x] 更新 package.json 依赖（移除外部MCP依赖）

### 阶段3：功能验证 ✅ 已完成
- [x] 测试 MCP 端点功能
- [x] 测试聊天 API 功能
- [x] 测试前端界面
- [x] 验证配置文件热更新
- [x] **LangFuse监控集成**：成功集成API使用流量监控

### 阶段4：部署准备
- [ ] 创建生产环境配置
- [ ] 更新部署文档
- [ ] 测试 Docker 构建
- [ ] 准备云平台部署配置

### 阶段5：部署验证
- [ ] 部署到测试环境
- [ ] 验证所有功能正常
- [ ] 部署到生产环境
- [ ] 性能和稳定性验证

## 关键实现细节

### MCP 服务集成
```javascript
// 使用集成的MCP服务器源码
const { createServer } = require('./src/mcp-server/server');
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamablehttp.js");

// 工厂函数，每次请求创建新实例
const createMCPServer = () => {
  const candidateConfig = require('./config/candidate');
  const serverConfig = require('./config/server');
  return createServer(serverConfig, candidateConfig);
};

// 手动实现无状态处理器（类似express-mcp-handler）
const mcpHandler = async (req, res) => {
  try {
    const server = createMCPServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    
    res.on('close', () => {
      transport.close();
      server.close();
    });
    
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
};

// 集成到 Express 应用
app.post('/mcp', mcpHandler);
```

### 配置更新流程

#### 开发环境
```bash
# 1. 修改配置文件
vim config/candidate.js

# 2. 重启开发服务器（nodemon 自动重启）
npm run dev
```

#### 生产环境
```bash
# 1. 更新配置文件并提交
git add config/candidate.js
git commit -m "Update candidate info"
git push

# 2. 重新部署
# Vercel/Railway: 自动部署
# VPS: pm2 restart ai-candidate-bff
```

## 部署策略

### 推荐部署平台
1. **Vercel**（推荐）：自动部署，适合前端+API项目
2. **Railway**：简单配置，支持环境变量管理
3. **Docker**：容器化部署，适合自建服务器
4. **传统VPS**：使用 PM2 进程管理

### 环境变量配置
```bash
OPENAI_API_KEY=your_openai_api_key
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
PORT=3000
NODE_ENV=production
```

## 优势总结

### 开发体验改进
- 🎯 **专注业务逻辑**：无需管理复杂的进程通信
- 🔧 **统一调试环境**：所有代码在同一进程中运行
- 📝 **配置集中管理**：候选人信息清晰可见
- 🔥 **热重载支持**：开发时修改立即生效

### 部署优势
- 📦 **单一应用部署**：只需部署一个 Node.js 服务
- 🚀 **快速启动**：无子进程启动开销
- 💰 **资源节省**：更少的内存和 CPU 使用
- 🌐 **多平台支持**：支持各种云平台部署

### 维护优势
- 📊 **版本控制**：配置变更可追踪和回滚
- 🔄 **快速更新**：修改配置文件即可更新信息
- 🛡️ **类型安全**：JavaScript 配置支持 IDE 智能提示
- 📚 **文档化**：配置文件本身就是文档

## 风险评估与缓解

### 潜在风险
- ⚠️ **配置语法错误**：JavaScript 语法错误会导致应用崩溃
- 🔄 **重启依赖**：配置更新需要重启应用才能生效

### 缓解措施
- ✅ **配置验证**：应用启动时验证配置文件格式和必需字段
- ✅ **优雅错误处理**：配置加载失败时提供清晰的错误信息
- ✅ **备份机制**：Git 版本控制保留配置文件历史
- ✅ **测试覆盖**：为配置加载和验证添加单元测试

## 后续扩展计划

### 短期扩展（可选）
- 🔧 **配置验证器**：添加配置文件格式验证
- 📊 **配置版本管理**：支持配置文件版本控制
- 🎨 **配置编辑界面**：Web界面编辑配置（如需要）

### 长期扩展（未来考虑）
- 👥 **多候选人支持**：如果需要支持多个候选人
- 🗄️ **数据库集成**：如果数据量增大需要数据库
- 🔄 **实时更新**：WebSocket 推送配置更新

---

**注意：本文档将作为重构工作的指导文件，所有开发工作应严格按照此计划执行。** 

## 当前进度总结 (2025-05-25)

### ✅ 已完成阶段
- **阶段1**: 准备工作 - 备份代码，创建refactor分支，解决npm包依赖
- **阶段2**: 核心重构 - MCP服务器源码集成，配置文件系统创建
- **阶段3**: 功能验证 - 所有功能测试通过，LangFuse监控成功集成

### 🎯 重要成果
1. **MCP服务器完全集成**: 移除外部依赖，源码直接集成到项目中
2. **配置文件系统**: 候选人"陈嘉旭"的完整信息配置
3. **LangFuse监控**: API调用追踪、token使用监控、性能指标收集
4. **架构优化**: 单进程运行，无子进程开销，部署更简单

### 🔧 技术细节
- **MCP工具**: 5个工具正确加载 (resume_text, linkedin_url, github_url, interview_questions, role_fit)
- **模型配置**: 保持用户偏好的 `gpt-4.1-nano` 模型
- **监控状态**: LangFuse配置正确，监控端点 `/monitoring` 正常工作
- **环境变量**: 修复dotenv加载顺序问题，所有配置正确读取

### 📋 下一步计划
- **阶段4**: 部署准备 - 创建生产环境配置，更新部署文档，测试Docker构建
- **阶段5**: 部署验证 - 测试环境部署，功能验证，生产环境部署

### 🚀 部署就绪状态
项目已基本具备部署条件：
- ✅ 单一应用，无外部MCP依赖
- ✅ 环境变量配置完整
- ✅ 所有功能验证通过
- ✅ 监控系统集成完成
- 🔄 待完成：生产环境配置优化 