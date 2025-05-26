// 加载环境变量
require('dotenv').config();

// 检查环境变量
function checkEnvironment() {
  console.log('🔧 检查环境变量配置...');
  
  const area = process.env.AI_PROVIDER_AREA || 'global';
  console.log('AI_PROVIDER_AREA:', area);
  
  if (area === 'cn') {
    if (!process.env.DASHSCOPE_API_KEY) {
      console.error('❌ DASHSCOPE_API_KEY 未设置');
      process.exit(1);
    }
    console.log('✅ 使用阿里云千问，API Key已配置');
  } else {
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY 未设置');
      process.exit(1);
    }
    console.log('✅ 使用OpenAI，API Key已配置');
  }
  console.log('');
}

// 检查环境变量
checkEnvironment();

const llmService = require('./llmService');

async function testNewProjectQueries() {
  console.log('🧪 测试新项目相关的LLM查询功能\n');

  const testQueries = [
    "候选人做过哪些个人项目？",
    "介绍一下AI候选人BFF系统项目",
    "候选人有MCP协议相关的经验吗？",
    "候选人用过LangChain吗？",
    "候选人的项目中用到了哪些AI技术？"
  ];

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n${i + 1}. 测试查询: "${query}"`);
    console.log('=' .repeat(60));
    
    try {
      const startTime = Date.now();
      const result = await llmService.processQuery(query);
      const endTime = Date.now();
      
      console.log('✅ 回答:', result.text);
      console.log(`⏱️  响应时间: ${endTime - startTime}ms`);
    } catch (error) {
      console.error('❌ 错误:', error.message);
      console.error('错误详情:', error.stack);
      
      // 如果是API密钥问题，提供更详细的帮助
      if (error.message.includes('OPENAI_API_KEY')) {
        console.error('\n💡 解决方案:');
        console.error('1. 检查 .env 文件中的 OPENAI_API_KEY 是否正确设置');
        console.error('2. 确保 .env 文件在正确的目录中');
        console.error('3. 尝试重新启动脚本');
      }
    }
    
    console.log('\n' + '-'.repeat(60));
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 所有查询测试完成！');
}

// 运行测试
testNewProjectQueries().catch(error => {
  console.error('❌ 测试脚本执行失败:', error);
  process.exit(1);
}); 