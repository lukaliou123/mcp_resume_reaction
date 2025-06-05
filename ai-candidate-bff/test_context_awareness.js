// 加载环境变量
require('dotenv').config();

const ConversationContextService = require('./src/services/conversationContextService');

async function testContextAwareness() {
  console.log('🧪 Testing Conversation Context Awareness...\n');
  
  const contextService = new ConversationContextService();
  const testSessionId = 'test_context_session';
  
  try {
    // 模拟GitHub分析结果
    const mockAnalysisResult = {
      url: 'https://github.com/microsoft/TypeScript',
      repository_info: {
        name: 'TypeScript',
        language: 'TypeScript',
        description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.'
      },
      tech_stack: {
        frontend_stack: ['React', 'Webpack'],
        backend_stack: ['Node.js'],
        is_fullstack: true
      },
      frameworks: ['React', 'Jest'],
      analysis_summary: {
        project_type: 'Full-stack Application',
        development_status: 'Active Development',
        key_highlights: ['Popular project with 104845 stars', 'Multi-language project']
      }
    };
    
    console.log('📦 Storing mock analysis result...');
    await contextService.storeGitHubAnalysisResult(
      testSessionId, 
      mockAnalysisResult.url, 
      mockAnalysisResult
    );
    
    // 测试上下文增强
    console.log('\n🧠 Testing context enhancement...');
    
    const testMessages = [
      'TypeScript项目的架构是怎样的？',
      'React在这个项目中是如何应用的？',
      '项目使用了什么测试框架？',
      '无关的问题：今天天气怎么样？'
    ];
    
    for (const message of testMessages) {
      console.log(`\n📝 Testing message: "${message}"`);
      const contextInfo = await contextService.enhanceWithGitHubContext(message, testSessionId);
      
      console.log('🔍 Context enhancement result:', {
        hasContext: contextInfo.hasContext,
        relevantProjects: contextInfo.relevantProjects?.length || 0,
        hasSpecificContext: contextInfo.relevantProjects && contextInfo.relevantProjects.length > 0
      });
      
      if (contextInfo.relevantProjects && contextInfo.relevantProjects.length > 0) {
        console.log('🎯 Relevant project found:', contextInfo.relevantProjects[0].projectName);
        console.log('📊 Relevance score:', contextInfo.relevantProjects[0].relevanceScore);
      }
    }
    
    // 测试上下文建议生成
    console.log('\n💡 Testing contextual suggestions...');
    const suggestions = contextService.generateContextualSuggestions(mockAnalysisResult);
    console.log('Generated suggestions:', suggestions);
    
    // 测试后续问题处理
    console.log('\n❓ Testing follow-up question handling...');
    const followUpResult = await contextService.handleFollowUpQuestion(
      'TypeScript的核心功能有哪些？', 
      testSessionId
    );
    console.log('Follow-up result:', {
      hasAnswer: followUpResult.hasAnswer,
      hasContextualInfo: !!followUpResult.contextualInfo,
      suggestionsCount: followUpResult.suggestions?.length || 0
    });
    
    // 获取统计信息
    console.log('\n📊 Context service stats:');
    const stats = contextService.getStats();
    console.log(JSON.stringify(stats, null, 2));
    
    console.log('\n🎉 Context awareness test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// 运行测试
testContextAwareness().catch(console.error); 