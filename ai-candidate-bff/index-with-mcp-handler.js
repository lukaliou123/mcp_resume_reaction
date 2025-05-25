const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { statelessHandler } = require('express-mcp-handler');
const { createServer } = require('@jhgaylor/candidate-mcp-server');
const llmService = require('./llmService');
require('dotenv').config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 创建MCP服务器工厂函数
const createServerWithConfig = () => {
  const serverConfig = {
    name: "ai-candidate-bff-mcp",
    version: "1.0.0",
    mailgunApiKey: process.env.MAILGUN_API_KEY,
    mailgunDomain: process.env.MAILGUN_DOMAIN,
  };
  
  const candidateConfig = {
    name: "陈嘉旭",
    email: "708980731@qq.com",
    resumeUrl: "",
    websiteUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/jiaxu-chen-731896237/",
    githubUrl: "https://github.com/lukaliou123",
    resumeText: `{
      "name": "陈嘉旭",
      "position": "AI应用开发/Golang后端开发",
      "contact": {
        "phone": "18976581578",
        "email": "708980731@qq.com"
      },
      // ... 完整的简历内容
    }`
  };
  
  return createServer(serverConfig, candidateConfig);
};

// 配置MCP处理器
const mcpHandler = statelessHandler(createServerWithConfig);

// 简单的健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service is running' });
});

// MCP端点 - 使用express-mcp-handler
app.post('/mcp', mcpHandler);

// 聊天API端点 - 使用LLM服务
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`接收到聊天请求: ${message}`);
    const response = await llmService.processQuery(message);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// 根路径重定向到index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to interact with the AI assistant`);
  console.log(`MCP endpoint available at http://localhost:${PORT}/mcp`);
}); 