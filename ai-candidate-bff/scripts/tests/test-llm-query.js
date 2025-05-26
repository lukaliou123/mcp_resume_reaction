// 测试LLMService的processQuery方法
require('dotenv').config();
const LLMService = require('./llmService');

console.log('环境变量测试:');
console.log('-----------------');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `${process.env.OPENAI_API_KEY.substring(0, 10)}...${process.env.OPENAI_API_KEY.slice(-5)}` : 
  '未设置');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || '未设置');
console.log('-----------------\n');

// 检查LLMService模块导出的内容
console.log('LLMService模块导出:');
console.log('-----------------');
console.log(typeof LLMService);
console.log('-----------------\n');

// 直接调用processQuery方法测试
async function testProcessQuery() {
  try {
    // 这里我们从llmService.js文件中获取导出的service实例
    if (typeof LLMService !== 'object') {
      console.log('创建新的LLMService实例...');
      const service = new LLMService();
      console.log('LLMService实例创建成功');
      
      // 等待agent初始化完成
      await new Promise(resolve => {
        const checkAgent = () => {
          if (service.agent) {
            console.log('Agent初始化完成');
            resolve();
          } else {
            console.log('等待Agent初始化...');
            setTimeout(checkAgent, 500);
          }
        };
        checkAgent();
      });
      
      console.log('\n正在测试processQuery方法...');
      console.log('请求: "介绍一下候选人的学历背景"');
      const response = await service.processQuery("介绍一下候选人的学历背景");
      console.log('查询处理成功!');
      console.log('回复:', response.text);
    } else {
      console.log('使用已有LLMService实例...');
      const response = await LLMService.processQuery("介绍一下候选人的学历背景");
      console.log('查询处理成功!');
      console.log('回复:', response.text);
    }
  } catch (error) {
    console.error('查询处理失败:', error.message);
    console.error('详细错误信息:', error);
  }
}

testProcessQuery(); 