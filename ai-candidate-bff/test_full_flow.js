const mcpService = require('./src/services/mcpService');
const GitHubMCPService = require('./src/services/githubMCPService');

async function testFullProjectAnalysisFlow() {
  console.log('🧪 Testing complete project analysis flow...\n');
  
  try {
    // 步骤1: 获取个人项目列表
    console.log('📋 Step 1: Getting personal projects...');
    const projects = await mcpService.getPersonalProjects();
    console.log('✅ Personal projects retrieved:', projects.projects?.length || 0, 'projects');
    
    // 找到AI候选人BFF系统项目
    const bffProject = projects.projects?.find(p => 
      p.name?.includes('AI候选人BFF') || p.name?.includes('BFF系统')
    );
    
    if (!bffProject) {
      console.log('❌ AI候选人BFF系统项目未找到');
      return;
    }
    
    console.log('🎯 Found BFF project:', bffProject.name);
    console.log('🔗 GitHub URL:', bffProject.url);
    
    // 步骤2: 测试GitHub URL解析
    console.log('\n🔍 Step 2: Testing GitHub URL parsing...');
    const githubService = new GitHubMCPService();
    
    if (bffProject.url) {
      const parseResult = githubService.parseGitHubUrlEnhanced(bffProject.url);
      console.log('✅ URL parse result:', parseResult);
      
      // 步骤3: 测试智能URL处理
      if (await githubService.isAvailable()) {
        console.log('\n🚀 Step 3: Testing smart GitHub URL handling...');
        try {
          const handleResult = await githubService.handleGitHubUrl(bffProject.url);
          console.log('✅ Smart handling result:', handleResult.type);
          
          if (handleResult.type === 'repository') {
            console.log('📁 Repository name:', handleResult.data.name);
            console.log('📝 Description:', handleResult.data.description || 'No description');
            console.log('🏷️ Language:', handleResult.data.language);
            console.log('⭐ Stars:', handleResult.data.stargazers_count);
          }
          
          // 步骤4: 测试深度分析（如果有GitHub Token）
          console.log('\n🔬 Step 4: Testing repository analysis...');
          const analysisResult = await githubService.analyzeRepository(bffProject.url);
          console.log('✅ Analysis completed successfully');
          console.log('📊 Tech stack summary:', analysisResult.tech_stack?.summary);
          console.log('🎯 Project type:', analysisResult.analysis?.project_type);
          
        } catch (error) {
          console.log('⚠️ GitHub API call failed:', error.message);
        }
      } else {
        console.log('⚠️ GitHub MCP Service not available (no token configured)');
      }
    }
    
    console.log('\n✅ Full flow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// 测试用户主页URL处理
async function testUserPageHandling() {
  console.log('\n🧪 Testing user page URL handling...\n');
  
  const githubService = new GitHubMCPService();
  const userPageURL = 'https://github.com/lukaliou123';
  
  console.log('🔍 Testing user page URL:', userPageURL);
  
  try {
    const parseResult = githubService.parseGitHubUrlEnhanced(userPageURL);
    console.log('✅ Parse result:', parseResult);
    
    if (await githubService.isAvailable()) {
      const handleResult = await githubService.handleGitHubUrl(userPageURL);
      console.log('✅ Handle result type:', handleResult.type);
      
      if (handleResult.type === 'user_repositories') {
        console.log(`📦 Found ${handleResult.data.length} repositories for user ${handleResult.username}`);
        handleResult.data.slice(0, 5).forEach((repo, index) => {
          console.log(`  ${index + 1}. ${repo.name} (${repo.language || 'Unknown'}) ⭐${repo.stargazers_count}`);
        });
      }
    } else {
      console.log('⚠️ GitHub service not available');
    }
    
  } catch (error) {
    console.log('❌ User page test failed:', error.message);
  }
}

// 运行测试
testFullProjectAnalysisFlow()
  .then(() => testUserPageHandling())
  .catch(console.error); 