# AI 候选人信息 BFF 服务

这是一个Backend For Frontend (BFF) 服务，用于处理AI候选人信息交互页面的后端逻辑。它接收用户的自然语言问题，利用LangChain.js和OpenAI API来理解问题并调用适当的MCP Server工具获取候选人信息，然后生成自然语言回复。

## 项目结构

```
ai-candidate-bff/
├── index.js          # 主入口文件，Express.js服务器
├── package.json      # 项目配置和依赖
├── .env              # 环境变量配置
└── .gitignore        # Git忽略文件
```

## 环境变量

在运行项目前，请确保在`.env`文件中配置以下环境变量：

- `PORT`: 服务器监听端口（默认3000）
- `MCP_SERVER_PATH`: MCP Server脚本路径
- `OPENAI_API_KEY`: OpenAI API密钥（后续会使用）

## 安装

```bash
npm install
```

## 运行

开发模式（带热重载）：
```bash
npm run dev
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