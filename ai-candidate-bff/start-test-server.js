// 加载环境变量
require('dotenv').config();

const express = require('express');
const llmService = require('./llmService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 简单的测试接口
app.post('/test-query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`\n🔍 收到查询: "${query}"`);
    const startTime = Date.now();
    
    const result = await llmService.processQuery(query);
    const endTime = Date.now();
    
    console.log(`✅ 回答生成完成，耗时: ${endTime - startTime}ms`);
    
    res.json({
      query,
      answer: result.text,
      responseTime: endTime - startTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 处理查询时出错:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'AI候选人BFF测试服务器运行正常'
  });
});

// 获取工具列表接口
app.get('/tools', (req, res) => {
  const tools = [
    'get_education_background - 获取教育背景',
    'get_work_experience - 获取工作经历',
    'get_personal_projects - 获取个人项目',
    'get_work_projects - 获取工作项目',
    'get_skills - 获取技能特长',
    'get_other_experience - 获取其他经历',
    'get_basic_info - 获取基本信息',
    'get_resume_text - 获取完整简历',
    'get_linkedin_url - 获取LinkedIn链接',
    'get_github_url - 获取GitHub链接'
  ];
  
  res.json({
    availableTools: tools,
    totalCount: tools.length,
    message: '可用的MCP工具列表'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI候选人BFF测试服务器启动成功！`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🔍 测试查询: POST /test-query`);
  console.log(`❤️  健康检查: GET /health`);
  console.log(`🛠️  工具列表: GET /tools`);
  console.log(`\n示例测试命令:`);
  console.log(`curl -X POST http://localhost:${PORT}/test-query \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"query": "候选人做过哪些个人项目？"}'`);
  console.log(`\n按 Ctrl+C 停止服务器`);
}); 