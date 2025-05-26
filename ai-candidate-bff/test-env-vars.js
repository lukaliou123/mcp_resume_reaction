// 加载环境变量
require('dotenv').config();

console.log('🔧 环境变量测试');
console.log('================');

console.log('AI_PROVIDER_AREA:', process.env.AI_PROVIDER_AREA);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL);
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? `${process.env.DASHSCOPE_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('LANGFUSE_PUBLIC_KEY:', process.env.LANGFUSE_PUBLIC_KEY ? `${process.env.LANGFUSE_PUBLIC_KEY.substring(0, 10)}...` : 'NOT SET');

console.log('\n✅ 环境变量加载测试完成');

// 测试AI配置选择逻辑
const area = process.env.AI_PROVIDER_AREA || 'global';
console.log('\n🤖 AI提供商配置:');
if (area === 'cn') {
  console.log('- 使用阿里云千问');
  console.log('- API Key:', process.env.DASHSCOPE_API_KEY ? '已配置' : '未配置');
  console.log('- 模型:', process.env.DASHSCOPE_MODEL || 'qwen-turbo-latest');
} else {
  console.log('- 使用OpenAI');
  console.log('- API Key:', process.env.OPENAI_API_KEY ? '已配置' : '未配置');
  console.log('- 模型:', process.env.OPENAI_MODEL || 'gpt-4o-mini');
} 