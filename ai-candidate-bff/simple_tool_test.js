console.log('🧪 Starting simple AI tool strategy test...');

try {
  // 测试监控服务加载
  const ToolCallMonitorService = require('./src/services/toolCallMonitorService');
  console.log('✅ ToolCallMonitorService loaded successfully');
  
  const monitorService = new ToolCallMonitorService();
  console.log('✅ Monitor service initialized');
  
  // 模拟工具调用记录
  monitorService.recordToolCall(
    'test_session',
    'test query',
    ['mcp__candidate__get_education_background'],
    1500,
    { hasContext: false }
  );
  
  const stats = monitorService.getStats();
  console.log('✅ Stats retrieved:', {
    totalCalls: stats.overall.totalCalls,
    avgResponseTime: stats.overall.avgResponseTime,
    status: stats.health.status
  });
  
  // 测试分析功能
  const analysis = monitorService.analyzeCallPatterns();
  console.log('✅ Analysis completed:', {
    totalCalls: analysis.totalCalls,
    summary: analysis.summary
  });
  
  console.log('🎉 Simple tool strategy test passed!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
} 