console.log('🧪 Simple Test Starting...');

// 测试环境变量加载
require('dotenv').config();

console.log('GitHub Token exists:', !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN);
console.log('Feature enabled:', process.env.FEATURE_GITHUB_ANALYSIS_ENABLED);

// 测试类加载
try {
  const GitHubMCPService = require('./src/services/githubMCPService');
  console.log('GitHubMCPService type:', typeof GitHubMCPService);
  
  // 测试实例创建
  const service = new GitHubMCPService();
  console.log('Service created:', !!service);
  console.log('Has cache:', !!service.cache);
  
} catch (error) {
  console.error('Error:', error.message);
} 