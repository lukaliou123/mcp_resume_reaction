// 测试OpenAI API密钥加载
require('dotenv').config();
const { ChatOpenAI } = require('@langchain/openai');

// 输出环境变量
console.log('环境变量测试:');
console.log('-----------------');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `${process.env.OPENAI_API_KEY.substring(0, 10)}...${process.env.OPENAI_API_KEY.slice(-5)}` : 
  '未设置');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || '未设置');
console.log('-----------------\n');

// 创建ChatOpenAI实例
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: 0.2,
});

// 检查模型配置
console.log('ChatOpenAI模型配置:');
console.log('-----------------');
console.log('API密钥:', model.openAIApiKey ? 
  `${model.openAIApiKey.substring(0, 10)}...${model.openAIApiKey.slice(-5)}` : 
  '未设置');
console.log('模型名称:', model.modelName);
console.log('温度:', model.temperature);
console.log('-----------------\n');

// 尝试简单调用API
async function testCall() {
  try {
    console.log('正在测试API调用...');
    const response = await model.invoke("你好，请用一句话自我介绍");
    console.log('API调用成功!');
    console.log('回复:', response.content);
  } catch (error) {
    console.error('API调用失败:', error.message);
    console.error('详细错误信息:', error);
  }
}

testCall(); 