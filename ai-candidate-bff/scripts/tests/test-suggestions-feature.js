#!/usr/bin/env node

/**
 * 测试对话建议功能
 * 验证双LLM调用方案的实现效果
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试用例
const testCases = [
  {
    name: "项目相关问题",
    message: "个人项目",
    expectedSuggestionTypes: ["技术", "架构", "挑战", "团队"]
  },
  {
    name: "技能相关问题", 
    message: "技能特长",
    expectedSuggestionTypes: ["应用", "经验", "项目"]
  },
  {
    name: "工作经历问题",
    message: "工作经历",
    expectedSuggestionTypes: ["职责", "成就", "团队"]
  },
  {
    name: "教育背景问题",
    message: "教育背景",
    expectedSuggestionTypes: ["专业", "课程", "实习"]
  },
  {
    name: "具体项目详情",
    message: "Ideas Collection项目详情",
    expectedSuggestionTypes: ["技术栈", "架构", "功能"]
  }
];

async function testSuggestionsFeature() {
  console.log('🧪 开始测试对话建议功能...\n');

  // 检查服务器状态
  try {
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 服务器状态:', healthResponse.data.status);
  } catch (error) {
    console.error('❌ 服务器未启动，请先运行 npm start');
    process.exit(1);
  }

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`\n📝 测试: ${testCase.name}`);
    console.log(`   问题: "${testCase.message}"`);

    try {
      const startTime = Date.now();
      
      // 发送聊天请求
      const response = await axios.post(`${BASE_URL}/chat`, {
        message: testCase.message,
        sessionId: `test_${Date.now()}`
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 验证响应结构
      if (!response.data.text) {
        console.log('   ❌ 缺少AI回复文本');
        continue;
      }

      if (!response.data.suggestions) {
        console.log('   ❌ 缺少建议数组');
        continue;
      }

      const suggestions = response.data.suggestions;
      console.log(`   ✅ AI回复长度: ${response.data.text.length} 字符`);
      console.log(`   ✅ 生成建议数量: ${suggestions.length}`);
      console.log(`   ✅ 响应时间: ${responseTime}ms`);

      // 显示建议内容
      if (suggestions.length > 0) {
        console.log('   💡 生成的建议:');
        suggestions.forEach((suggestion, index) => {
          console.log(`      ${index + 1}. "${suggestion}"`);
        });

        // 验证建议质量
        let qualityScore = 0;
        suggestions.forEach(suggestion => {
          // 检查长度
          if (suggestion.length <= 15) qualityScore += 1;
          // 检查是否包含相关关键词
          const hasRelevantKeywords = testCase.expectedSuggestionTypes.some(type => 
            suggestion.includes(type) || suggestion.includes('如何') || suggestion.includes('什么')
          );
          if (hasRelevantKeywords) qualityScore += 1;
        });

        const qualityPercentage = (qualityScore / (suggestions.length * 2)) * 100;
        console.log(`   📊 建议质量评分: ${qualityPercentage.toFixed(1)}%`);

        if (qualityPercentage >= 60) {
          console.log('   ✅ 测试通过');
          passedTests++;
        } else {
          console.log('   ⚠️  建议质量需要改进');
        }
      } else {
        console.log('   ⚠️  未生成任何建议');
      }

    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}`);
      if (error.response) {
        console.log(`   错误详情: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }

  // 测试总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试总结');
  console.log('='.repeat(50));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！对话建议功能工作正常。');
  } else {
    console.log('\n⚠️  部分测试失败，建议检查实现。');
  }

  // 性能建议
  console.log('\n💡 优化建议:');
  console.log('- 如果响应时间 > 3000ms，考虑并行处理或缓存');
  console.log('- 如果建议质量 < 80%，优化建议生成的Prompt');
  console.log('- 监控LangFuse中的token使用情况');
}

// 运行测试
if (require.main === module) {
  testSuggestionsFeature().catch(console.error);
}

module.exports = { testSuggestionsFeature }; 