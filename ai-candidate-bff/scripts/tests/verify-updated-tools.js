// 加载环境变量
require('dotenv').config();

const mcpService = require('./src/services/mcpService');

async function verifyUpdatedTools() {
  console.log('🧪 验证更新后的MCP工具功能\n');

  try {
    // 1. 测试个人项目工具 - 应该包含新的AI候选人BFF项目
    console.log('1. 测试个人项目工具:');
    const personalProjects = await mcpService.getPersonalProjects();
    console.log('✅ 个人项目数量:', personalProjects.personal_projects.length);
    
    // 检查是否包含AI候选人BFF项目
    const bffProject = personalProjects.personal_projects.find(p => p.name.includes('AI候选人BFF'));
    if (bffProject) {
      console.log('✅ 找到AI候选人BFF项目:', bffProject.name);
      console.log('   技术栈:', bffProject.tech_stack.join(', '));
      console.log('   项目URL:', bffProject.url);
    } else {
      console.log('❌ 未找到AI候选人BFF项目');
    }
    console.log('');

    // 2. 测试工作项目工具 - 应该包含更详细的项目信息
    console.log('2. 测试工作项目工具:');
    const workProjects = await mcpService.getWorkProjects();
    console.log('✅ 工作项目数量:', workProjects.work_projects.length);
    
    workProjects.work_projects.forEach((project, index) => {
      console.log(`   项目${index + 1}: ${project.name} (${project.company})`);
    });
    console.log('');

    // 3. 测试技能工具
    console.log('3. 测试技能工具:');
    const skills = await mcpService.getSkills();
    console.log('✅ 技能数量:', skills.skills.length);
    console.log('   技能列表:');
    skills.skills.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.substring(0, 50)}...`);
    });
    console.log('');

    // 4. 测试教育背景工具
    console.log('4. 测试教育背景工具:');
    const education = await mcpService.getEducationBackground();
    console.log('✅ 教育经历数量:', education.education.length);
    education.education.forEach((edu, index) => {
      console.log(`   ${index + 1}. ${edu.school} - ${edu.degree} (${edu.period})`);
    });
    console.log('');

    // 5. 测试基本信息工具
    console.log('5. 测试基本信息工具:');
    const basicInfo = await mcpService.getBasicInfo();
    console.log('✅ 候选人姓名:', basicInfo.basic_info.name);
    console.log('   职位:', basicInfo.basic_info.position);
    console.log('   邮箱:', basicInfo.basic_info.contact.email);
    console.log('   LinkedIn:', basicInfo.basic_info.links.linkedin);
    console.log('   GitHub:', basicInfo.basic_info.links.github);
    console.log('');

    console.log('🎉 所有工具验证完成！新的项目信息已成功集成。');

  } catch (error) {
    console.error('❌ 验证失败:', error);
    console.error('错误详情:', error.stack);
  }
}

// 运行验证
verifyUpdatedTools(); 