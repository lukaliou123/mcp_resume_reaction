// 加载环境变量
require('dotenv').config();

const llmService = require('./llmService');

/**
 * AI工具调用策略测试套件
 * 验证AI在不同场景下是否选择正确的工具
 */
class AIToolStrategyTester {
  constructor() {
    this.testResults = [];
    this.testSessionId = 'ai_tool_strategy_test';
  }

  /**
   * 运行所有测试场景
   */
  async runAllTests() {
    console.log('🧪 Starting AI Tool Calling Strategy Tests...\n');
    
    const testScenarios = [
      // 1. 基础候选人信息查询测试
      {
        category: '基础信息查询',
        tests: [
          {
            input: '告诉我候选人的教育背景',
            expectedTools: ['mcp__candidate__get_education_background'],
            description: '教育背景查询'
          },
          {
            input: '候选人有什么工作经验？',
            expectedTools: ['mcp__candidate__get_work_experience'],
            description: '工作经验查询'
          },
          {
            input: '他会什么技能？',
            expectedTools: ['mcp__candidate__get_skills'],
            description: '技能查询'
          },
          {
            input: '有哪些个人项目？',
            expectedTools: ['mcp__candidate__get_personal_projects'],
            description: '个人项目查询'
          }
        ]
      },
      
      // 2. GitHub分析测试
      {
        category: 'GitHub分析',
        tests: [
          {
            input: '分析这个GitHub仓库: https://github.com/microsoft/TypeScript',
            expectedTools: ['mcp__github__analyze_repository'],
            description: '直接仓库分析'
          },
          {
            input: '看看这个用户的GitHub: https://github.com/torvalds',
            expectedTools: ['mcp__github__handle_url'],
            description: '用户主页智能处理'
          },
          {
            input: '获取TypeScript项目的README文件',
            expectedTools: ['mcp__github__get_file_content'],
            description: '文件内容获取'
          }
        ]
      },
      
      // 3. 复合查询测试
      {
        category: '复合查询',
        tests: [
          {
            input: '告诉我候选人的项目经验，包括个人项目和工作项目',
            expectedTools: ['mcp__candidate__get_personal_projects', 'mcp__candidate__get_work_projects'],
            description: '多工具组合查询'
          },
          {
            input: '候选人的基本信息和联系方式',
            expectedTools: ['mcp__candidate__get_basic_info'],
            description: '基本信息查询'
          }
        ]
      },
      
      // 4. 智能意图识别测试
      {
        category: '智能意图识别',
        tests: [
          {
            input: '详细了解AI候选人BFF系统',
            expectedTools: ['mcp__candidate__get_personal_projects', 'mcp__github__analyze_repository'],
            description: '项目深度分析意图'
          },
          {
            input: '这个候选人适合我们的前端开发岗位吗？',
            expectedTools: ['mcp__candidate__get_skills', 'mcp__candidate__get_work_experience'],
            description: '岗位匹配评估'
          }
        ]
      },
      
      // 5. 边界情况测试
      {
        category: '边界情况',
        tests: [
          {
            input: '今天天气怎么样？',
            expectedTools: [],
            description: '无关查询（不应调用工具）'
          },
          {
            input: '你好',
            expectedTools: [],
            description: '简单问候（不应调用工具）'
          }
        ]
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n📋 Testing Category: ${scenario.category}`);
      console.log('━'.repeat(50));
      
      for (const test of scenario.tests) {
        await this.runSingleTest(test);
      }
    }
    
    // 生成测试报告
    this.generateReport();
  }

  /**
   * 运行单个测试用例
   */
  async runSingleTest(test) {
    console.log(`\n🔍 Test: ${test.description}`);
    console.log(`📝 Input: "${test.input}"`);
    console.log(`🎯 Expected Tools: [${test.expectedTools.join(', ')}]`);
    
    try {
      const startTime = Date.now();
      
      // 使用自定义的工具监控版本
      const result = await this.monitoredLLMCall(test.input);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 分析工具调用结果
      const analysis = this.analyzeToolUsage(result.toolsCalled, test.expectedTools);
      
      const testResult = {
        ...test,
        toolsCalled: result.toolsCalled,
        analysis,
        duration,
        success: analysis.accuracy >= 0.8, // 80%准确率为通过
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(testResult);
      
      // 输出结果
      console.log(`🔧 Tools Called: [${result.toolsCalled.join(', ')}]`);
      console.log(`📊 Accuracy: ${(analysis.accuracy * 100).toFixed(1)}%`);
      console.log(`⏱️ Duration: ${duration}ms`);
      console.log(`${testResult.success ? '✅' : '❌'} Result: ${testResult.success ? 'PASS' : 'FAIL'}`);
      
      if (!testResult.success) {
        console.log(`❓ Issues: ${analysis.issues.join(', ')}`);
      }
      
    } catch (error) {
      console.error(`❌ Test Failed: ${error.message}`);
      this.testResults.push({
        ...test,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 监控LLM调用并追踪工具使用
   */
  async monitoredLLMCall(input) {
    const toolsCalled = [];
    
    // 创建工具调用监控器
    const originalTools = llmService.tools;
    const monitoredTools = originalTools.map(tool => {
      const originalFunc = tool.func;
      return {
        ...tool,
        func: async (...args) => {
          console.log(`🔧 Tool Called: ${tool.name}`);
          toolsCalled.push(tool.name);
          return await originalFunc(...args);
        }
      };
    });
    
    // 临时替换工具以进行监控
    llmService.tools = monitoredTools;
    
    try {
      const result = await llmService.processQuery(input, this.testSessionId);
      return { result, toolsCalled };
    } finally {
      // 恢复原始工具
      llmService.tools = originalTools;
    }
  }

  /**
   * 分析工具使用的准确性
   */
  analyzeToolUsage(actualTools, expectedTools) {
    const issues = [];
    let correctCalls = 0;
    let totalExpected = expectedTools.length;
    let totalActual = actualTools.length;
    
    // 检查预期工具是否被调用
    for (const expectedTool of expectedTools) {
      if (actualTools.includes(expectedTool)) {
        correctCalls++;
      } else {
        issues.push(`Missing: ${expectedTool}`);
      }
    }
    
    // 检查是否有不必要的工具调用
    for (const actualTool of actualTools) {
      if (!expectedTools.includes(actualTool)) {
        issues.push(`Unexpected: ${actualTool}`);
      }
    }
    
    // 计算准确率
    let accuracy = 0;
    if (totalExpected === 0) {
      // 如果不期望调用任何工具
      accuracy = totalActual === 0 ? 1.0 : 0.0;
    } else {
      // 基于召回率和精确率计算
      const recall = correctCalls / totalExpected;
      const precision = totalActual > 0 ? correctCalls / totalActual : 0;
      accuracy = totalActual === 0 ? 0 : (2 * recall * precision) / (recall + precision) || 0;
    }
    
    return {
      accuracy,
      correctCalls,
      totalExpected,
      totalActual,
      issues
    };
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AI TOOL CALLING STRATEGY TEST REPORT');
    console.log('='.repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`\n📈 Overall Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${successRate}%`);
    
    // 按类别统计
    const categoryStats = {};
    this.testResults.forEach(result => {
      if (!categoryStats[result.category]) {
        categoryStats[result.category] = { total: 0, passed: 0 };
      }
      categoryStats[result.category].total++;
      if (result.success) categoryStats[result.category].passed++;
    });
    
    console.log(`\n📋 Category Breakdown:`);
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const rate = (stats.passed / stats.total * 100).toFixed(1);
      console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
    });
    
    // 平均准确率
    const avgAccuracy = this.testResults
      .filter(r => r.analysis)
      .reduce((sum, r) => sum + r.analysis.accuracy, 0) / 
      this.testResults.filter(r => r.analysis).length;
    
    console.log(`\n🎯 Average Tool Selection Accuracy: ${(avgAccuracy * 100).toFixed(1)}%`);
    
    // 性能统计
    const avgDuration = this.testResults
      .filter(r => r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / 
      this.testResults.filter(r => r.duration).length;
    
    console.log(`⏱️ Average Response Time: ${avgDuration.toFixed(0)}ms`);
    
    // 失败案例分析
    const failedCases = this.testResults.filter(r => !r.success);
    if (failedCases.length > 0) {
      console.log(`\n❌ Failed Cases Analysis:`);
      failedCases.forEach((testCase, index) => {
        console.log(`  ${index + 1}. ${testCase.description}`);
        console.log(`     Input: "${testCase.input}"`);
        if (testCase.analysis && testCase.analysis.issues.length > 0) {
          console.log(`     Issues: ${testCase.analysis.issues.join(', ')}`);
        }
      });
    }
    
    // 改进建议
    this.generateRecommendations();
  }

  /**
   * 生成改进建议
   */
  generateRecommendations() {
    console.log(`\n💡 Improvement Recommendations:`);
    
    const successRate = this.testResults.filter(r => r.success).length / this.testResults.length;
    
    if (successRate < 0.8) {
      console.log(`  🔧 System prompt needs optimization (current success rate: ${(successRate * 100).toFixed(1)}%)`);
    }
    
    // 分析常见问题
    const allIssues = this.testResults
      .filter(r => r.analysis && r.analysis.issues)
      .flatMap(r => r.analysis.issues);
    
    const issueCounts = {};
    allIssues.forEach(issue => {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });
    
    const sortedIssues = Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (sortedIssues.length > 0) {
      console.log(`  📋 Most Common Issues:`);
      sortedIssues.forEach(([issue, count]) => {
        console.log(`    - ${issue} (${count} times)`);
      });
    }
    
    console.log(`\n🎯 Next Steps:`);
    console.log(`  1. Optimize system prompt based on failed cases`);
    console.log(`  2. Enhance tool selection logic`);
    console.log(`  3. Improve intent recognition accuracy`);
    console.log(`  4. Add more specific tool selection guidelines`);
  }
}

// 运行测试
async function runTests() {
  const tester = new AIToolStrategyTester();
  await tester.runAllTests();
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = AIToolStrategyTester; 