// 调试工具选择 - 检查AI在查询"个人项目"时选择了哪个工具
require('dotenv').config();

const llmService = require('./llmService');

async function debugToolSelection() {
  console.log('🔍 调试工具选择过程\n');

  // 测试查询
  const testQueries = [
    '个人项目',
    '工作项目', 
    '项目经验',
    '介绍一下个人项目'
  ];

  for (const query of testQueries) {
    console.log(`\n📋 测试查询: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      // 这里我们需要一个方法来监控工具调用
      // 由于LangGraph的限制，我们先直接测试MCP服务
      
      console.log('🔧 直接测试MCP服务:');
      const mcpService = require('./src/services/mcpService');
      
      // 测试个人项目工具
      const personalProjects = await mcpService.getPersonalProjects();
      console.log(`   个人项目数量: ${personalProjects.personal_projects.length}`);
      
      personalProjects.personal_projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name} (${project.period})`);
      });
      
      // 测试完整简历工具（对比）
      console.log('\n🔧 对比完整简历工具:');
      const resumeText = await mcpService.getResumeText();
      const resumeContent = resumeText.text;
      
      // 检查简历中包含的项目
      const projectMatches = resumeContent.match(/项目名称[：:]\s*([^\n]+)/g) || [];
      console.log(`   简历中找到的项目: ${projectMatches.length}`);
      projectMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
      
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
    }
  }
  
  console.log('\n🎯 调试完成！');
}

// 运行调试
debugToolSelection().catch(console.error); 