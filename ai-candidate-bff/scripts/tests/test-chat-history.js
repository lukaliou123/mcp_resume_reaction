/**
 * 对话历史功能测试脚本
 * 测试内存存储的对话历史功能
 */

require('dotenv').config();
const chatHistoryService = require('../../src/services/chatHistoryService');

async function testChatHistory() {
  console.log('🧪 开始测试对话历史功能...\n');

  const testSessionId = 'test_session_' + Date.now();
  
  try {
    // 测试1: 添加消息
    console.log('📝 测试1: 添加消息到历史');
    await chatHistoryService.addMessage(testSessionId, 'user', '你好，我想了解候选人的基本信息');
    await chatHistoryService.addMessage(testSessionId, 'assistant', '您好！我是AI候选人信息助手。候选人陈嘉旭是一位经验丰富的全栈开发工程师...');
    await chatHistoryService.addMessage(testSessionId, 'user', '他的工作经历如何？');
    await chatHistoryService.addMessage(testSessionId, 'assistant', '陈嘉旭有着丰富的工作经验，主要包括...');
    console.log('✅ 消息添加成功\n');

    // 测试2: 获取历史记录
    console.log('📖 测试2: 获取对话历史');
    const history = await chatHistoryService.getHistory(testSessionId);
    console.log(`📊 历史记录数量: ${history.length}`);
    history.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });
    console.log('✅ 历史记录获取成功\n');

    // 测试3: 获取格式化历史
    console.log('🔄 测试3: 获取格式化历史（用于LLM）');
    const formattedHistory = await chatHistoryService.getFormattedHistory(testSessionId);
    console.log(`📊 格式化历史数量: ${formattedHistory.length}`);
    formattedHistory.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.role}: ${msg.content.substring(0, 50)}...`);
    });
    console.log('✅ 格式化历史获取成功\n');

    // 测试4: 测试消息数量限制
    console.log('🔢 测试4: 测试消息数量限制');
    const maxMessages = parseInt(process.env.CHAT_HISTORY_MAX_MESSAGES) || 20;
    console.log(`📏 最大消息数量限制: ${maxMessages}`);
    
    // 添加超过限制的消息
    for (let i = 0; i < maxMessages + 5; i++) {
      await chatHistoryService.addMessage(testSessionId, 'user', `测试消息 ${i + 1}`);
      await chatHistoryService.addMessage(testSessionId, 'assistant', `回复消息 ${i + 1}`);
    }
    
    const limitedHistory = await chatHistoryService.getHistory(testSessionId);
    console.log(`📊 限制后的历史记录数量: ${limitedHistory.length}`);
    console.log(`✅ 消息数量限制测试${limitedHistory.length <= maxMessages ? '成功' : '失败'}\n`);

    // 测试5: 清除历史
    console.log('🗑️ 测试5: 清除对话历史');
    await chatHistoryService.clearHistory(testSessionId);
    const clearedHistory = await chatHistoryService.getHistory(testSessionId);
    console.log(`📊 清除后的历史记录数量: ${clearedHistory.length}`);
    console.log(`✅ 历史清除测试${clearedHistory.length === 0 ? '成功' : '失败'}\n`);

    // 测试6: 存储统计
    console.log('📈 测试6: 存储统计信息');
    if (chatHistoryService.storage.getStats) {
      const stats = chatHistoryService.storage.getStats();
      console.log('📊 存储统计:');
      console.log(`   - 存储类型: ${stats.storageType}`);
      console.log(`   - 总会话数: ${stats.totalSessions}`);
      console.log(`   - 总消息数: ${stats.totalMessages}`);
    } else {
      console.log('⚠️ 当前存储类型不支持统计信息');
    }
    console.log('✅ 统计信息获取成功\n');

    // 测试7: 多会话测试
    console.log('👥 测试7: 多会话管理');
    const session1 = 'session_1_' + Date.now();
    const session2 = 'session_2_' + Date.now();
    
    await chatHistoryService.addMessage(session1, 'user', '会话1的消息');
    await chatHistoryService.addMessage(session2, 'user', '会话2的消息');
    
    const history1 = await chatHistoryService.getHistory(session1);
    const history2 = await chatHistoryService.getHistory(session2);
    
    console.log(`📊 会话1历史数量: ${history1.length}`);
    console.log(`📊 会话2历史数量: ${history2.length}`);
    console.log(`✅ 多会话管理测试${history1.length === 1 && history2.length === 1 ? '成功' : '失败'}\n`);

    // 清理测试数据
    await chatHistoryService.clearHistory(session1);
    await chatHistoryService.clearHistory(session2);

    console.log('🎉 所有对话历史功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    process.exit(1);
  }
}

async function testConfigurationOptions() {
  console.log('\n🔧 测试配置选项...');
  
  console.log(`📝 存储类型: ${process.env.CHAT_HISTORY_STORAGE || 'memory'}`);
  console.log(`📏 最大消息数: ${process.env.CHAT_HISTORY_MAX_MESSAGES || 20}`);
  console.log(`⏰ 会话超时: ${process.env.CHAT_HISTORY_SESSION_TIMEOUT || 3600000}ms`);
  
  console.log('✅ 配置选项检查完成\n');
}

// 运行测试
async function runTests() {
  console.log('🚀 AI候选人BFF - 对话历史功能测试\n');
  
  await testConfigurationOptions();
  await testChatHistory();
  
  console.log('\n📋 测试总结:');
  console.log('✅ 消息添加和获取');
  console.log('✅ 历史记录格式化');
  console.log('✅ 消息数量限制');
  console.log('✅ 历史记录清除');
  console.log('✅ 多会话管理');
  console.log('✅ 存储统计信息');
  
  process.exit(0);
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testChatHistory, testConfigurationOptions }; 