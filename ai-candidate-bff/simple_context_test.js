console.log('🧪 Starting simple context test...');

try {
  const ConversationContextService = require('./src/services/conversationContextService');
  console.log('✅ ConversationContextService loaded successfully');
  
  const contextService = new ConversationContextService();
  console.log('✅ Context service initialized');
  
  const stats = contextService.getStats();
  console.log('✅ Stats retrieved:', stats);
  
  console.log('🎉 Simple context test passed!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
} 