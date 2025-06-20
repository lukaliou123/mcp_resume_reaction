require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mcpService = require('./src/services/mcpService');
const llmService = require('./llmService');
const chatHistoryService = require('./src/services/chatHistoryService');
const { getTexts } = require('./config/i18n');

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

// 国际化文本API
app.get('/api/i18n', (req, res) => {
  try {
    const texts = getTexts();
    res.status(200).json({
      status: 'success',
      data: texts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting i18n texts:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get internationalization texts',
      error: error.message 
    });
  }
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
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // 生成或使用提供的会话ID
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 使用LLM服务处理查询
    console.log(`接收到聊天请求: ${message} (Session: ${currentSessionId})`);
    const response = await llmService.processQuery(message, currentSessionId);
    
    // 返回响应、建议和会话ID
    res.status(200).json({
      text: response.text,
      suggestions: response.suggestions || [],
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// 流式聊天API端点 - 使用ReadableStream
app.post('/chat/stream', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // 生成或使用提供的会话ID
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`接收到流式聊天请求: ${message} (Session: ${currentSessionId})`);
    
    // 设置响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Accel-Buffering': 'no' // 禁用nginx缓冲
    });
    
    // 发送会话ID
    res.write(`data: ${JSON.stringify({
      type: 'session',
      sessionId: currentSessionId
    })}\n\n`);
    
    // 处理客户端断开连接
    req.on('close', () => {
      console.log('Client disconnected from stream');
    });
    
    req.on('aborted', () => {
      console.log('Client aborted stream');
    });
    
    // 调用流式处理
    await llmService.processQueryStream(message, currentSessionId, res);
    
  } catch (error) {
    console.error('Stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream processing failed', message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: error.message
      })}\n\n`);
      res.end();
    }
  }
});

// 对话历史管理API
app.get('/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await chatHistoryService.getHistory(sessionId);
    
    res.status(200).json({
      sessionId,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history', message: error.message });
  }
});

app.delete('/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await chatHistoryService.clearHistory(sessionId);
    
    res.status(200).json({
      message: 'Chat history cleared successfully',
      sessionId
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history', message: error.message });
  }
});

// 对话历史统计API
app.get('/chat/stats', async (req, res) => {
  try {
    const stats = chatHistoryService.storage.getStats ? 
      chatHistoryService.storage.getStats() : 
      { message: 'Stats not available for current storage type' };
    
    res.status(200).json({
      ...stats,
      storageType: chatHistoryService.storageType,
      maxMessages: chatHistoryService.maxMessages,
      sessionTimeout: chatHistoryService.sessionTimeout
    });
  } catch (error) {
    console.error('Error getting chat stats:', error);
    res.status(500).json({ error: 'Failed to get chat stats', message: error.message });
  }
});

// GitHub缓存统计API
app.get('/github/cache/stats', async (req, res) => {
  try {
    const GitHubMCPService = require('./src/services/githubMCPService');
    const githubService = new GitHubMCPService();
    
    if (githubService && githubService.cache) {
      const cacheStats = githubService.cache.getStats();
      res.status(200).json({
        cacheStats,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } else {
      res.status(503).json({ 
        error: 'GitHub cache service not available',
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Error getting GitHub cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats', message: error.message });
  }
});

// 上下文感知统计API
app.get('/context/stats', async (req, res) => {
  try {
    const llmService = require('./llmService');
    
    if (llmService && llmService.contextService) {
      const contextStats = llmService.contextService.getStats();
      res.status(200).json({
        contextStats,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } else {
      res.status(503).json({ 
        error: 'Context service not available',
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Error getting context stats:', error);
    res.status(500).json({ error: 'Failed to get context stats', message: error.message });
  }
});

// 工具调用监控统计API
app.get('/tools/monitor/stats', async (req, res) => {
  try {
    const llmService = require('./llmService');
    
    if (llmService && llmService.monitorService) {
      const monitorStats = llmService.monitorService.getStats();
      res.status(200).json({
        monitorStats,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } else {
      res.status(503).json({ 
        error: 'Monitor service not available',
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Error getting monitor stats:', error);
    res.status(500).json({ error: 'Failed to get monitor stats', message: error.message });
  }
});

// 工具调用模式分析API
app.get('/tools/monitor/analysis', async (req, res) => {
  try {
    const llmService = require('./llmService');
    const { sessionId, timeRange } = req.query;
    
    if (llmService && llmService.monitorService) {
      const timeRangeMs = timeRange ? parseInt(timeRange) * 60 * 1000 : 60 * 60 * 1000; // 默认1小时
      const analysis = llmService.monitorService.analyzeCallPatterns(sessionId, timeRangeMs);
      res.status(200).json({
        analysis,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } else {
      res.status(503).json({ 
        error: 'Monitor service not available',
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Error getting tool analysis:', error);
    res.status(500).json({ error: 'Failed to get tool analysis', message: error.message });
  }
});

// 异常检测API
app.get('/tools/monitor/anomalies', async (req, res) => {
  try {
    const llmService = require('./llmService');
    
    if (llmService && llmService.monitorService) {
      const anomalies = llmService.monitorService.detectAnomalies();
      res.status(200).json({
        anomalies,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } else {
      res.status(503).json({ 
        error: 'Monitor service not available',
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({ error: 'Failed to detect anomalies', message: error.message });
  }
});

// 策略建议API
app.get('/tools/monitor/recommendations', async (req, res) => {
  try {
    const llmService = require('./llmService');
    
    if (llmService && llmService.monitorService) {
      const recommendations = llmService.monitorService.generateStrategyRecommendations();
      res.status(200).json({
        recommendations,
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } else {
      res.status(503).json({ 
        error: 'Monitor service not available',
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations', message: error.message });
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