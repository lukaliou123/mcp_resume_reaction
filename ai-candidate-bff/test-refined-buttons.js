// 加载环境变量
require('dotenv').config();

const llmService = require('./llmService');

async function testRefinedButtons() {
  console.log('🧪 测试细化预制按钮的工具调用\n');

  // 定义新的预制按钮对应的查询
  const buttonQueries = [
    {
      button: '个人项目',
      query: '个人项目',
      expectedTool: 'get_personal_projects'
    },
    {
      button: '工作项目', 
      query: '工作项目',
      expectedTool: 'get_work_projects'
    },
    {
      button: '非IT经验',
      query: '非IT经验',
      expectedTool: 'get_other_experience'
    },
    {
      button: '技术能力有哪些',
      query: '技术能力有哪些',
      expectedTool: 'get_skills'
    },
    {
      button: '工作经历',
      query: '工作经历', 
      expectedTool: 'get_work_experience'
    },
    {
      button: '教育背景',
      query: '教育背景',
      expectedTool: 'get_education_background'
    }
  ];

  for (const test of buttonQueries) {
    console.log(`\n📋 测试按钮: "${test.button}"`);
    console.log(`   查询: "${test.query}"`);
    console.log(`   期望工具: ${test.expectedTool}`);
    
    try {
      const startTime = Date.now();
      const response = await llmService.processMessage(test.query);
      const endTime = Date.now();
      
      console.log(`   ⏱️  响应时间: ${endTime - startTime}ms`);
      
      // 检查响应长度
      const responseLength = response.length;
      console.log(`   📏 响应长度: ${responseLength} 字符`);
      
      // 检查是否包含相关关键词
      const hasRelevantContent = checkRelevantContent(response, test.expectedTool);
      console.log(`   ✅ 内容相关性: ${hasRelevantContent ? '通过' : '需要检查'}`);
      
      // 显示响应摘要
      const summary = response.substring(0, 100) + (response.length > 100 ? '...' : '');
      console.log(`   📝 响应摘要: ${summary}`);
      
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 测试完成！');
}

function checkRelevantContent(response, expectedTool) {
  const toolKeywords = {
    'get_personal_projects': ['个人项目', '旅游助手', 'AI候选人BFF', '智能体', 'MCP协议'],
    'get_work_projects': ['工作项目', '手机号格式', '韩国', '系统', '平台'],
    'get_other_experience': ['其他经历', '非IT', '实习', '兼职'],
    'get_skills': ['技能', 'Golang', 'React', 'MySQL', 'Docker', 'Redis'],
    'get_work_experience': ['工作经历', '后端开发', '全栈开发', '公司'],
    'get_education_background': ['教育', '学历', '大学', '本科', '学位']
  };
  
  const keywords = toolKeywords[expectedTool] || [];
  return keywords.some(keyword => response.includes(keyword));
}

// 运行测试
testRefinedButtons().catch(console.error); 