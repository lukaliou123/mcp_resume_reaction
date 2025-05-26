// 加载环境变量
require('dotenv').config();

const llmService = require('./llmService');

async function testNewProjectQueries() {
  console.log('🧪 测试新项目相关的LLM查询功能\n');

  const testQueries = [
    "候选人做过哪些个人项目？",
    "介绍一下AI候选人BFF系统项目",
    "候选人有MCP协议相关的经验吗？",
    "候选人用过LangChain吗？",
    "候选人的项目中用到了哪些AI技术？",
    "候选人有Docker部署经验吗？",
    "候选人做过浏览器插件开发吗？",
    "候选人的GitHub地址是什么？"
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
    }
    
    console.log('\n' + '-'.repeat(60));
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 所有查询测试完成！');
}

// 运行测试
testNewProjectQueries().catch(console.error); 