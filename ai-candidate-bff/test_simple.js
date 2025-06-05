// 简单测试URL解析功能
const GitHubMCPService = require('./src/services/githubMCPService');

const githubService = new GitHubMCPService();

console.log('🧪 Testing URL parsing...\n');

// 测试用例
const testCases = [
  'https://github.com/lukaliou123',           // 用户主页
  'https://github.com/microsoft/TypeScript',  // 仓库URL
  'lukaliou123',                             // 仅用户名
  'microsoft/TypeScript'                     // 仅 owner/repo
];

testCases.forEach(url => {
  console.log(`Testing: ${url}`);
  const result = githubService.parseGitHubUrlEnhanced(url);
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('---');
});

console.log('\n✅ URL parsing test completed!'); 