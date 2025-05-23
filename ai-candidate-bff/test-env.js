// 测试环境变量加载
require('dotenv').config();

console.log('环境变量测试:');
console.log('-----------------');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `${process.env.OPENAI_API_KEY.substring(0, 10)}...${process.env.OPENAI_API_KEY.slice(-5)}` : 
  '未设置');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || '未设置');
console.log('NODE_ENV:', process.env.NODE_ENV || '未设置');
console.log('-----------------');

// 测试dotenv包是否正确读取.env文件
const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('\n.env文件内容检查:');
  console.log('-----------------');
  const lines = envContent.split('\n').filter(line => line.trim() !== '');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      console.log(`${key.trim()}: ${key.includes('API_KEY') ? 
        `${value.trim().substring(0, 10)}...${value.trim().slice(-5)}` : 
        value.trim()}`);
    }
  }
  console.log('-----------------');
} catch (error) {
  console.error('读取.env文件时出错:', error.message);
} 