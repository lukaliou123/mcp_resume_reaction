require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mcpService = require('./src/services/mcpService');
const llmService = require('./llmService');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 简单的健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Service is running',
    mcpMode: 'integrated',
    timestamp: new Date().toISOString()
  });
});

// LangFuse 监控状态端点
app.get('/monitoring', (req, res) => {
  const langfuseConfig = {
    enabled: !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY),
    baseUrl: process.env.LANGFUSE_BASE_URL || 'Not configured',
    publicKey: process.env.LANGFUSE_PUBLIC_KEY ? 
      `${process.env.LANGFUSE_PUBLIC_KEY.substring(0, 10)}...` : 'Not configured'
  };

  res.status(200).json({
    status: 'ok',
    monitoring: {
      langfuse: langfuseConfig,
      features: [
        'API call tracking',
        'Token usage monitoring', 
        'Error logging',
        'Performance metrics'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// MCP HTTP端点 - 标准MCP协议接口
app.post('/mcp', async (req, res) => {
  console.log('Received MCP request:', req.body?.method || 'unknown');
  await mcpService.handleMCPRequest(req, res);
});

// MCP Server测试接口
app.get('/test-mcp/:resource', async (req, res) => {
  try {
    const resource = req.params.resource;
    let result;

    switch (resource) {
      case 'resume-text':
        result = await mcpService.getResumeText();
        break;
      case 'resume-url':
        result = await mcpService.getResumeUrl();
        break;
      case 'linkedin-url':
        result = await mcpService.getLinkedinUrl();
        break;
      case 'github-url':
        result = await mcpService.getGithubUrl();
        break;
      case 'website-url':
        result = await mcpService.getWebsiteUrl();
        break;
      case 'website-text':
        result = await mcpService.getWebsiteText();
        break;
      default:
        return res.status(400).json({ error: `Unknown resource: ${resource}` });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(`Error in MCP test endpoint: ${error.message}`);
    res.status(500).json({ error: 'Failed to communicate with MCP Server', message: error.message });
  }
});

// 聊天API端点 - 使用LLM服务
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // 使用LLM服务处理查询
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

// 优雅关闭
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  mcpService.stop();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  mcpService.stop();
  process.exit();
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI Candidate BFF Server is running on port ${PORT}`);
  console.log(`📱 Visit http://localhost:${PORT} to interact with the AI assistant`);
  console.log(`🔧 MCP endpoint available at http://localhost:${PORT}/mcp`);
  console.log(`🧪 Test endpoints available at http://localhost:${PORT}/test-mcp/{resource}`);
  console.log(`💬 Chat endpoint available at http://localhost:${PORT}/chat`);
}); 