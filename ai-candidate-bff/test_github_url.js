const GitHubMCPService = require('./src/services/githubMCPService');

async function testGitHubURLParsing() {
  console.log('🧪 Testing GitHub URL parsing functionality...\n');
  
  const githubService = new GitHubMCPService();
  
  // 测试用例
  const testCases = [
    'https://github.com/lukaliou123',  // 用户主页
    'https://github.com/lukaliou123/',  // 用户主页带斜杠
    'https://github.com/microsoft/TypeScript',  // 仓库URL
    'lukaliou123',  // 仅用户名
    'microsoft/TypeScript'  // 仅 owner/repo
  ];
  
  for (const url of testCases) {
    console.log(`\n🔍 Testing: ${url}`);
    try {
      const result = githubService.parseGitHubUrlEnhanced(url);
      console.log('✅ Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  // 测试智能URL处理功能
  console.log('\n\n🚀 Testing smart URL handling...\n');
  
  if (await githubService.isAvailable()) {
    const smartTestCases = [
      'https://github.com/microsoft/TypeScript',
      'https://github.com/lukaliou123'
    ];
    
    for (const url of smartTestCases) {
      console.log(`\n🔍 Smart handling: ${url}`);
      try {
        const result = await githubService.handleGitHubUrl(url);
        console.log('✅ Result type:', result.type);
        if (result.type === 'user_repositories') {
          console.log(`📦 Found ${result.data.length} repositories for user ${result.username}`);
          result.data.slice(0, 3).forEach(repo => {
            console.log(`  - ${repo.name} (${repo.language || 'Unknown'}) ⭐${repo.stargazers_count}`);
          });
        } else if (result.type === 'repository') {
          console.log(`📁 Repository: ${result.data.name}`);
          console.log(`📝 Description: ${result.data.description || 'No description'}`);
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }
  } else {
    console.log('⚠️ GitHub MCP Service not available (no token configured)');
  }
}

testGitHubURLParsing().catch(console.error); 