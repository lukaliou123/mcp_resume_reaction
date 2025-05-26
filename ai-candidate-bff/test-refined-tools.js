const mcpService = require('./src/services/mcpService');

async function testRefinedTools() {
  console.log('🧪 测试细化的MCP工具功能\n');

  try {
    // 测试教育背景
    console.log('1. 测试教育背景工具:');
    const education = await mcpService.getEducationBackground();
    console.log('✅ 教育背景:', JSON.stringify(education, null, 2));
    console.log('');

    // 测试工作经历
    console.log('2. 测试工作经历工具:');
    const workExp = await mcpService.getWorkExperience();
    console.log('✅ 工作经历:', JSON.stringify(workExp, null, 2));
    console.log('');

    // 测试个人项目
    console.log('3. 测试个人项目工具:');
    const personalProjects = await mcpService.getPersonalProjects();
    console.log('✅ 个人项目:', JSON.stringify(personalProjects, null, 2));
    console.log('');

    // 测试工作项目
    console.log('4. 测试工作项目工具:');
    const workProjects = await mcpService.getWorkProjects();
    console.log('✅ 工作项目:', JSON.stringify(workProjects, null, 2));
    console.log('');

    // 测试技能特长
    console.log('5. 测试技能特长工具:');
    const skills = await mcpService.getSkills();
    console.log('✅ 技能特长:', JSON.stringify(skills, null, 2));
    console.log('');

    // 测试其他经历
    console.log('6. 测试其他经历工具:');
    const otherExp = await mcpService.getOtherExperience();
    console.log('✅ 其他经历:', JSON.stringify(otherExp, null, 2));
    console.log('');

    // 测试基本信息
    console.log('7. 测试基本信息工具:');
    const basicInfo = await mcpService.getBasicInfo();
    console.log('✅ 基本信息:', JSON.stringify(basicInfo, null, 2));
    console.log('');

    console.log('🎉 所有细化工具测试通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testRefinedTools(); 