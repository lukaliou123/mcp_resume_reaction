// 加载环境变量
require('dotenv').config();

const mcpService = require('./src/services/mcpService');

async function testMCPToolsStepByStep() {
  console.log('🧪 逐步测试MCP工具功能\n');
  console.log('=' .repeat(60));

  try {
    // 测试1: 个人项目工具
    console.log('\n📋 测试1: 个人项目工具');
    console.log('-' .repeat(30));
    const personalProjects = await mcpService.getPersonalProjects();
    console.log(`项目数量: ${personalProjects.personal_projects.length}`);
    
    personalProjects.personal_projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   时间: ${project.period}`);
      if (project.url) {
        console.log(`   链接: ${project.url}`);
      }
      console.log(`   技术栈: ${project.tech_stack ? project.tech_stack.slice(0, 3).join(', ') + '...' : '未知'}`);
      console.log('');
    });

    // 检查AI候选人BFF项目
    const bffProject = personalProjects.personal_projects.find(p => 
      p.name.includes('AI候选人BFF') || p.name.includes('BFF系统')
    );
    
    if (bffProject) {
      console.log('✅ 找到AI候选人BFF项目!');
      console.log(`   完整名称: ${bffProject.name}`);
      console.log(`   技术栈: ${bffProject.tech_stack.join(', ')}`);
    } else {
      console.log('❌ 未找到AI候选人BFF项目');
    }

    // 测试2: 工作经历工具
    console.log('\n💼 测试2: 工作经历工具');
    console.log('-' .repeat(30));
    const workExperience = await mcpService.getWorkExperience();
    console.log(`工作经历数量: ${workExperience.work_experience.length}`);
    
    workExperience.work_experience.forEach((work, index) => {
      console.log(`${index + 1}. ${work.company} - ${work.title}`);
      console.log(`   时间: ${work.period}`);
    });

    // 测试3: 技能工具
    console.log('\n🛠️ 测试3: 技能工具');
    console.log('-' .repeat(30));
    const skills = await mcpService.getSkills();
    console.log(`技能数量: ${skills.skills.length}`);
    
    skills.skills.slice(0, 3).forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.substring(0, 60)}...`);
    });

    // 测试4: 教育背景工具
    console.log('\n🎓 测试4: 教育背景工具');
    console.log('-' .repeat(30));
    const education = await mcpService.getEducationBackground();
    console.log(`教育经历数量: ${education.education.length}`);
    
    education.education.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.school}`);
      console.log(`   学位: ${edu.degree}`);
      console.log(`   时间: ${edu.period}`);
    });

    // 测试5: 基本信息工具
    console.log('\n👤 测试5: 基本信息工具');
    console.log('-' .repeat(30));
    const basicInfo = await mcpService.getBasicInfo();
    console.log(`姓名: ${basicInfo.basic_info.name}`);
    console.log(`职位: ${basicInfo.basic_info.position}`);
    console.log(`邮箱: ${basicInfo.basic_info.contact.email}`);
    console.log(`GitHub: ${basicInfo.basic_info.links.github}`);

    // 测试6: 工作项目工具
    console.log('\n🏢 测试6: 工作项目工具');
    console.log('-' .repeat(30));
    const workProjects = await mcpService.getWorkProjects();
    console.log(`工作项目数量: ${workProjects.work_projects.length}`);
    
    workProjects.work_projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   公司: ${project.company || '未知'}`);
    });

    // 测试7: 其他经历工具
    console.log('\n📝 测试7: 其他经历工具');
    console.log('-' .repeat(30));
    const otherExperience = await mcpService.getOtherExperience();
    console.log(`其他经历数量: ${otherExperience.other_experience.length}`);
    
    otherExperience.other_experience.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.company} - ${exp.title}`);
      console.log(`   时间: ${exp.period}`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 所有MCP工具测试完成！');
    
    // 总结
    console.log('\n📊 测试总结:');
    console.log(`- 个人项目: ${personalProjects.personal_projects.length} 个`);
    console.log(`- 工作经历: ${workExperience.work_experience.length} 个`);
    console.log(`- 工作项目: ${workProjects.work_projects.length} 个`);
    console.log(`- 技能: ${skills.skills.length} 个`);
    console.log(`- 教育经历: ${education.education.length} 个`);
    console.log(`- 其他经历: ${otherExperience.other_experience.length} 个`);
    console.log(`- AI候选人BFF项目: ${bffProject ? '✅ 已找到' : '❌ 未找到'}`);

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    console.error('错误详情:', error.stack);
  }
}

// 运行测试
testMCPToolsStepByStep(); 