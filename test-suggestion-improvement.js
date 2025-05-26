const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试用例
const testCases = [
  {
    name: "个人项目询问",
    message: "个人项目",
    sessionId: "test_projects"
  },
  {
    name: "技能询问", 
    message: "技能特长",
    sessionId: "test_skills"
  },
  {
    name: "工作经历询问",
    message: "工作经历",
    sessionId: "test_work"
  }
];

async function testSuggestionQuality() {
  console.log("🧪 测试建议生成功能改进效果\n");
  
  for (const testCase of testCases) {
    console.log(`📋 测试: ${testCase.name}`);
    console.log(`❓ 问题: ${testCase.message}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/chat`, {
        message: testCase.message,
        sessionId: testCase.sessionId
      });
      
      const { text, suggestions } = response.data;
      
      console.log(`✅ AI回复长度: ${text.length}字符`);
      console.log(`💡 生成的建议:`);
      suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
      
      // 分析建议质量
      const hasSpecificTerms = suggestions.some(s => 
        s.includes('MCP') || s.includes('BFF') || s.includes('Browser CoT') || 
        s.includes('旅游助手') || s.includes('Ideas Collection') ||
        s.includes('架构') || s.includes('API') || s.includes('插件')
      );
      
      const hasGenericTerms = suggestions.some(s =>
        s.includes('挑战') || s.includes('技术栈') || s.includes('难题') ||
        s.includes('经验') || s.includes('团队')
      );
      
      console.log(`🎯 质量评估:`);
      console.log(`   - 包含具体术语: ${hasSpecificTerms ? '✅' : '❌'}`);
      console.log(`   - 包含通用术语: ${hasGenericTerms ? '⚠️' : '✅'}`);
      
      if (hasSpecificTerms && !hasGenericTerms) {
        console.log(`   - 总体评价: 🌟 优秀 (具体且针对性强)`);
      } else if (hasSpecificTerms) {
        console.log(`   - 总体评价: 👍 良好 (有具体内容但仍有通用问题)`);
      } else {
        console.log(`   - 总体评价: ⚠️ 需改进 (主要是通用问题)`);
      }
      
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
    
    // 等待1秒避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n🎉 测试完成！");
  console.log("\n📊 改进效果总结:");
  console.log("✅ 使用完整AI回复内容（不再截断到500字符）");
  console.log("✅ 明确要求基于具体实体生成建议");
  console.log("✅ 提供了详细的生成策略和示例");
  console.log("✅ 设置了优先级：具体项目 > 技术细节 > 工作经历 > 通用问题");
}

// 运行测试
testSuggestionQuality().catch(console.error); 