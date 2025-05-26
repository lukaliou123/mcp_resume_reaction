// 加载环境变量
require('dotenv').config();

const mcpService = require('./src/services/mcpService');

async function quickStatusCheck() {
  console.log('🔍 快速状态检查\n');

  try {
    // 1. 检查AI候选人BFF项目是否存在
    console.log('1. 检查AI候选人BFF项目:');
    const personalProjects = await mcpService.getPersonalProjects();
    const bffProject = personalProjects.personal_projects.find(p => 
      p.name.includes('AI候选人BFF') || p.name.includes('BFF系统')
    );
    
    if (bffProject) {
      console.log('   ✅ AI候选人BFF项目已找到');
      console.log(`   项目名称: ${bffProject.name}`);
      console.log(`   项目时间: ${bffProject.period}`);
      console.log(`   技术栈数量: ${bffProject.tech_stack.length}`);
      console.log(`   主要技术: ${bffProject.tech_stack.slice(0, 5).join(', ')}`);
    } else {
      console.log('   ❌ AI候选人BFF项目未找到');
      console.log('   现有项目:');
      personalProjects.personal_projects.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name}`);
      });
    }

    // 2. 检查项目总数
    console.log(`\n2. 项目统计:`);
    console.log(`   个人项目总数: ${personalProjects.personal_projects.length}`);
    
    const workProjects = await mcpService.getWorkProjects();
    console.log(`   工作项目总数: ${workProjects.work_projects.length}`);

    // 3. 检查关键技术栈
    console.log(`\n3. 关键技术检查:`);
    const allProjects = [...personalProjects.personal_projects, ...workProjects.work_projects];
    const techStacks = allProjects.flatMap(p => p.tech_stack || []);
    
    const keyTechs = ['MCP协议', 'LangChain', 'Node.js', 'Express.js', 'OpenAI', 'Docker'];
    keyTechs.forEach(tech => {
      const found = techStacks.some(stack => 
        stack.includes(tech) || stack.includes(tech.replace('.js', ''))
      );
      console.log(`   ${tech}: ${found ? '✅' : '❌'}`);
    });

    // 4. 数据完整性检查
    console.log(`\n4. 数据完整性:`);
    const education = await mcpService.getEducationBackground();
    const skills = await mcpService.getSkills();
    const basicInfo = await mcpService.getBasicInfo();
    
    console.log(`   教育背景: ${education.education.length} 条`);
    console.log(`   技能列表: ${skills.skills.length} 条`);
    console.log(`   基本信息: ${basicInfo.basic_info.name ? '✅' : '❌'}`);

    // 5. 总体评估
    console.log(`\n📊 总体评估:`);
    const hasNewProject = !!bffProject;
    const hasEnoughProjects = personalProjects.personal_projects.length >= 4;
    const hasKeyTechs = techStacks.some(t => t.includes('MCP') || t.includes('LangChain'));
    
    console.log(`   新项目集成: ${hasNewProject ? '✅' : '❌'}`);
    console.log(`   项目数量充足: ${hasEnoughProjects ? '✅' : '❌'}`);
    console.log(`   关键技术覆盖: ${hasKeyTechs ? '✅' : '❌'}`);
    
    const overallStatus = hasNewProject && hasEnoughProjects && hasKeyTechs;
    console.log(`   整体状态: ${overallStatus ? '✅ 符合需求' : '❌ 需要修复'}`);

  } catch (error) {
    console.error('❌ 检查过程中出错:', error.message);
  }
}

// 运行检查
quickStatusCheck(); 