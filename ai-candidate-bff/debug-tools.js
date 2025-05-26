// 加载环境变量
require('dotenv').config();

const mcpService = require('./src/services/mcpService');
const llmService = require('./llmService');

async function debugCurrentState() {
  console.log('🔍 调试当前服务器状态\n');

  try {
    // 1. 检查个人项目数据
    console.log('1. 检查个人项目数据:');
    const personalProjects = await mcpService.getPersonalProjects();
    console.log(`   项目数量: ${personalProjects.personal_projects.length}`);
    
    personalProjects.personal_projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (${project.period})`);
    });
    
    // 检查是否包含AI候选人BFF项目
    const bffProject = personalProjects.personal_projects.find(p => 
      p.name.includes('AI候选人BFF') || p.name.includes('BFF系统')
    );
    
    if (bffProject) {
      console.log('   ✅ 找到AI候选人BFF项目');
    } else {
      console.log('   ❌ 未找到AI候选人BFF项目');
    }
    console.log('');

    // 2. 检查LLM工具注册
    console.log('2. 检查LLM工具注册:');
    const tools = llmService.tools || [];
    console.log(`   注册的工具数量: ${tools.length}`);
    
    const refinedTools = tools.filter(tool => 
      tool.name.includes('get_personal_projects') || 
      tool.name.includes('get_education_background') ||
      tool.name.includes('get_work_experience')
    );
    
    console.log(`   细化工具数量: ${refinedTools.length}`);
    refinedTools.forEach(tool => {
      console.log(`   - ${tool.name}`);
    });
    console.log('');

    // 3. 测试一个简单的查询
    console.log('3. 测试项目查询:');
    const testQuery = "候选人做过哪些个人项目？";
    console.log(`   查询: "${testQuery}"`);
    
    const startTime = Date.now();
    const result = await llmService.processQuery(testQuery);
    const endTime = Date.now();
    
    console.log(`   响应时间: ${endTime - startTime}ms`);
    console.log(`   回答长度: ${result.text.length} 字符`);
    console.log(`   回答预览: ${result.text.substring(0, 200)}...`);
    
    // 检查回答中是否包含新项目
    if (result.text.includes('AI候选人BFF') || result.text.includes('BFF系统')) {
      console.log('   ✅ 回答中包含新项目信息');
    } else {
      console.log('   ❌ 回答中未包含新项目信息');
    }

  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  }
}

// 运行调试
debugCurrentState(); 