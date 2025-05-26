// 实时测试查询 - 模拟前端请求并监控响应
require('dotenv').config();

const llmService = require('./llmService');

async function testLiveQuery() {
  console.log('🔍 实时测试查询 - 模拟前端请求\n');

  const testQueries = [
    '个人项目',
    '工作项目',
    '项目经验'
  ];

  for (const query of testQueries) {
    console.log(`\n📋 测试查询: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      const startTime = Date.now();
      console.log('🚀 发送请求...');
      
      const response = await llmService.processMessage(query);
      const endTime = Date.now();
      
      console.log(`⏱️  响应时间: ${endTime - startTime}ms`);
      console.log(`📏 响应长度: ${response.length} 字符`);
      
      // 检查响应中是否包含AI候选人BFF项目
      const hasBFFProject = response.includes('AI候选人BFF') || response.includes('BFF系统');
      console.log(`🎯 包含BFF项目: ${hasBFFProject ? '✅ 是' : '❌ 否'}`);
      
      // 检查响应中包含的项目数量
      const projectMatches = response.match(/项目名称|项目：|项目\s*[:：]/g) || [];
      console.log(`📊 检测到项目数量: ${projectMatches.length}`);
      
      // 显示响应的前200字符
      const preview = response.substring(0, 200) + (response.length > 200 ? '...' : '');
      console.log(`📝 响应预览:\n${preview}`);
      
      // 检查是否提到了旅游助手（eino项目）
      const hasEinoProject = response.includes('旅游助手') || response.includes('eino');
      console.log(`🧳 包含旅游助手: ${hasEinoProject ? '✅ 是' : '❌ 否'}`);
      
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
    }
    
    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎯 测试完成！');
  console.log('\n💡 如果仍然只显示一个项目，建议：');
  console.log('1. 清除浏览器缓存');
  console.log('2. 重启服务器');
  console.log('3. 检查AI工具选择日志');
}

// 运行测试
testLiveQuery().catch(console.error); 