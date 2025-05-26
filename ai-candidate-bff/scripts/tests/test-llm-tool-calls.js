// 加载环境变量
require('dotenv').config();

const llmService = require('./llmService');

async function testLLMToolCalls() {
  console.log('🤖 测试LLM工具调用功能\n');
  console.log('=' .repeat(60));

  // 检查工具注册情况
  console.log('📋 检查已注册的工具:');
  console.log('-' .repeat(30));
  
  if (llmService.tools && llmService.tools.length > 0) {
    console.log(`总工具数量: ${llmService.tools.length}`);
    
    // 列出所有工具
    llmService.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
    });
    
    // 检查细化工具
    const refinedTools = llmService.tools.filter(tool => 
      tool.name.includes('get_personal_projects') || 
      tool.name.includes('get_education_background') ||
      tool.name.includes('get_work_experience') ||
      tool.name.includes('get_skills') ||
      tool.name.includes('get_basic_info') ||
      tool.name.includes('get_work_projects') ||
      tool.name.includes('get_other_experience')
    );
    
    console.log(`\n细化工具数量: ${refinedTools.length}`);
    refinedTools.forEach(tool => {
      console.log(`- ${tool.name}`);
    });
  } else {
    console.log('❌ 未找到任何工具');
  }

  // 测试查询
  const testQueries = [
    {
      query: "候选人做过哪些个人项目？",
      expectedTool: "get_personal_projects",
      description: "测试个人项目查询"
    },
    {
      query: "候选人的教育背景是什么？",
      expectedTool: "get_education_background", 
      description: "测试教育背景查询"
    },
    {
      query: "候选人有哪些技能？",
      expectedTool: "get_skills",
      description: "测试技能查询"
    },
    {
      query: "介绍一下AI候选人BFF系统项目",
      expectedTool: "get_personal_projects",
      description: "测试特定项目查询"
    }
  ];

  console.log('\n🧪 开始测试查询:');
  console.log('=' .repeat(60));

  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    console.log(`\n${i + 1}. ${test.description}`);
    console.log(`查询: "${test.query}"`);
    console.log(`期望工具: ${test.expectedTool}`);
    console.log('-' .repeat(40));
    
    try {
      const startTime = Date.now();
      const result = await llmService.processQuery(test.query);
      const endTime = Date.now();
      
      console.log(`✅ 查询成功`);
      console.log(`响应时间: ${endTime - startTime}ms`);
      console.log(`回答长度: ${result.text.length} 字符`);
      
      // 检查回答内容
      if (test.query.includes('AI候选人BFF') || test.query.includes('个人项目')) {
        if (result.text.includes('AI候选人BFF') || result.text.includes('BFF系统')) {
          console.log('✅ 回答包含新项目信息');
        } else {
          console.log('❌ 回答未包含新项目信息');
        }
      }
      
      // 显示回答预览
      const preview = result.text.length > 150 ? 
        result.text.substring(0, 150) + '...' : 
        result.text;
      console.log(`回答预览: ${preview}`);
      
    } catch (error) {
      console.error(`❌ 查询失败: ${error.message}`);
      
      // 提供错误诊断
      if (error.message.includes('API')) {
        console.error('💡 可能是API配置问题');
      } else if (error.message.includes('tool')) {
        console.error('💡 可能是工具调用问题');
      }
    }
    
    console.log('');
    
    // 添加延迟避免API限制
    if (i < testQueries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('=' .repeat(60));
  console.log('🎉 LLM工具调用测试完成！');
}

// 运行测试
testLLMToolCalls().catch(error => {
  console.error('❌ 测试脚本执行失败:', error);
  process.exit(1);
}); 