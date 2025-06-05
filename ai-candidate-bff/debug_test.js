console.log('🐛 Debug Test Starting...');

try {
  // 加载环境变量
  require('dotenv').config();
  
  console.log('📋 Environment variables:');
  console.log('FEATURE_GITHUB_ANALYSIS_ENABLED:', process.env.FEATURE_GITHUB_ANALYSIS_ENABLED);
  console.log('GITHUB_PERSONAL_ACCESS_TOKEN exists:', !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN);
  console.log('Token length:', process.env.GITHUB_PERSONAL_ACCESS_TOKEN ? process.env.GITHUB_PERSONAL_ACCESS_TOKEN.length : 0);
  
  // 尝试加载GitHubMCPService
  console.log('\n🔧 Loading GitHubMCPService...');
  const GitHubMCPService = require('./src/services/githubMCPService');
  console.log('✅ GitHubMCPService loaded successfully');
  console.log('Type:', typeof GitHubMCPService);
  
  // 尝试创建实例
  console.log('\n🏗️ Creating GitHubMCPService instance...');
  const githubService = new GitHubMCPService();
  console.log('✅ Instance created successfully');
  
  // 等待初始化
  console.log('\n⏰ Waiting for initialization...');
  setTimeout(async () => {
    try {
      const isAvailable = await githubService.isAvailable();
      console.log('📊 Service status:', {
        isEnabled: githubService.isEnabled,
        isAvailable: isAvailable,
        hasOctokit: !!githubService.octokit,
        hasCache: !!githubService.cache
      });
      
      if (githubService.cache) {
        console.log('📈 Cache stats:', githubService.cache.getStats());
      }
      
    } catch (error) {
      console.error('❌ Error checking service status:', error);
    }
  }, 3000);
  
} catch (error) {
  console.error('❌ Debug test failed:', error);
} 