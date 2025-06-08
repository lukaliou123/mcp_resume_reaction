const llmService = require('./llmService');

async function testToolCall() {
  try {
    console.log("🔧 Testing tool call fix...");
    
    // 等待LLM服务初始化
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试一个简单的工具调用
    const result = await llmService.processQuery("告诉我候选人的技能", "quick_test");
    
    console.log("✅ Tool call test result:");
    console.log("Response:", result.text);
    console.log("Suggestions:", result.suggestions);
    
  } catch (error) {
    console.error("❌ Tool call test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

// 运行测试
testToolCall(); 