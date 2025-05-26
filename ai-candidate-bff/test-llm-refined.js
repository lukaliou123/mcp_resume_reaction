const llmService = require('./llmService');

async function testRefinedLLMTools() {
  console.log('🧪 测试LLM服务中的细化工具功能\n');

  const testQueries = [
    "候选人的教育背景是什么？",
    "介绍一下候选人的工作经历",
    "候选人有哪些技能？",
    "候选人做过什么项目？",
    "候选人的基本信息"
  ];

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n${i + 1}. 测试查询: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      const result = await llmService.processQuery(query);
      console.log('✅ 回答:', result.text);
    } catch (error) {
      console.error('❌ 错误:', error.message);
    }
    
    console.log('\n' + '-'.repeat(50));
  }
}

// 运行测试
testRefinedLLMTools().catch(console.error); 