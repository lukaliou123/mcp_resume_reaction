// 加载环境变量
require('dotenv').config();

const candidateConfig = require('./config/candidate');

console.log('Testing candidate config...');
console.log('Name:', candidateConfig.name);
console.log('Resume text length:', candidateConfig.resumeText.length);

try {
  const resumeData = JSON.parse(candidateConfig.resumeText);
  console.log('✅ Resume JSON is valid');
  console.log('Education entries:', resumeData.education?.length || 0);
  console.log('Personal projects entries:', resumeData.personal_projects?.length || 0);
  console.log('Work experience entries:', resumeData.work_experience?.length || 0);
  console.log('Skills entries:', resumeData.skills?.length || 0);
} catch (error) {
  console.error('❌ Resume JSON is invalid:', error.message);
} 