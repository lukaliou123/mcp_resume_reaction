// 测试mcpService的方法
require('dotenv').config();
const mcpService = require('./mcpService');

// 测试获取简历文本
async function testGetResumeText() {
  try {
    console.log('正在测试获取简历文本...');
    const result = await mcpService.getGithubUrl();
    console.log('获取简历文本成功!');
    if (result && result.result && result.result.contents && result.result.contents.length > 0) {
      console.log('内容摘要:', result.result.contents[0].text.substring(0, 100) + '...');
    } else {
      console.log('返回结果结构:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('获取简历文本失败:', error.message);
  }
}

// 测试工具函数调用顺序
async function runTests() {
  // 启动MCP服务
  console.log('启动MCP服务...');
  await mcpService.start();
  console.log('MCP服务启动成功');
  
  // 等待MCP服务就绪
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试获取简历文本
  await testGetResumeText();
  
  // 结束MCP服务
  console.log('停止MCP服务...');
  mcpService.stop();
  console.log('MCP服务已停止');
}

runTests(); 