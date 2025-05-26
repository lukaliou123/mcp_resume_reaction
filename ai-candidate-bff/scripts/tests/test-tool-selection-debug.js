// 测试AI工具选择行为 - 验证是否正确调用细化工具
require('dotenv').config();

const mcpService = require('./src/services/mcpService');

async function testToolSelection() {
  console.log('🔍 测试AI工具选择行为\n');

  try {
    // 1. 直接测试MCP服务的个人项目方法
    console.log('1. 直接测试 getPersonalProjects():');
    const personalProjects = await mcpService.getPersonalProjects();
    console.log(`   项目数量: ${personalProjects.personal_projects.length}`);
    
    personalProjects.personal_projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name}`);
      console.log(`      时间: ${project.period}`);
      console.log(`      技术栈: ${project.tech_stack.slice(0, 3).join(', ')}...`);
    });

    // 2. 测试完整简历方法（对比）
    console.log('\n2. 对比 getResumeText():');
    const resumeText = await mcpService.getResumeText();
    const resumeData = JSON.parse(resumeText.text);
    console.log(`   完整简历中的个人项目数量: ${resumeData.personal_projects.length}`);
    
    resumeData.personal_projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name}`);
    });

    // 3. 检查AI候选人BFF项目是否存在
    console.log('\n3. 检查AI候选人BFF项目:');
    const bffProject = personalProjects.personal_projects.find(p => 
      p.name.includes('AI候选人BFF') || p.name.includes('BFF系统')
    );
    
    if (bffProject) {
      console.log('   ✅ AI候选人BFF项目已找到');
      console.log(`   项目名称: ${bffProject.name}`);
      console.log(`   项目时间: ${bffProject.period}`);
      console.log(`   技术栈: ${bffProject.tech_stack.join(', ')}`);
      console.log(`   详情数量: ${bffProject.details.length} 条`);
    } else {
      console.log('   ❌ AI候选人BFF项目未找到');
    }

    // 4. 模拟前端查询
    console.log('\n4. 模拟前端查询测试:');
    console.log('   如果前端只显示一个"eino"项目，可能的原因:');
    console.log('   - AI仍在使用 get_resume_text 而不是 get_personal_projects');
    console.log('   - 前端缓存了旧的响应');
    console.log('   - AI的工具选择策略需要优化');
    
    // 5. 检查旅游助手项目（eino项目）
    const einoProject = personalProjects.personal_projects.find(p => 
      p.name.includes('旅游助手') || p.name.includes('eino')
    );
    
    if (einoProject) {
      console.log(`   旅游助手项目: ${einoProject.name}`);
      console.log(`   这可能是前端显示的"eino"项目`);
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 运行测试
testToolSelection().catch(console.error); 