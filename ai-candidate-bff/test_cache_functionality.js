// 加载环境变量
require('dotenv').config();

const GitHubMCPService = require('./src/services/githubMCPService');

async function testCacheFunctionality() {
  console.log('🧪 Testing GitHub API Cache Functionality...\n');
  
  const githubService = new GitHubMCPService();
  
  // 等待初始化完成
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (!(await githubService.isAvailable())) {
    console.log('❌ GitHub service not available. Please check your configuration.');
    return;
  }
  
  const testRepo = 'https://github.com/microsoft/TypeScript';
  
  console.log('📊 Initial cache stats:');
  console.log(JSON.stringify(githubService.cache.getStats(), null, 2));
  console.log();
  
  try {
    // 第一次调用 - 应该会触发API请求
    console.log('🔍 First call (should hit API):');
    const start1 = Date.now();
    const result1 = await githubService.getRepositoryInfo(testRepo);
    const duration1 = Date.now() - start1;
    console.log(`✅ First call completed in ${duration1}ms`);
    console.log(`Repository: ${result1.name} (${result1.stargazers_count} stars)`);
    console.log();
    
    // 第二次调用 - 应该从缓存获取
    console.log('🎯 Second call (should hit cache):');
    const start2 = Date.now();
    const result2 = await githubService.getRepositoryInfo(testRepo);
    const duration2 = Date.now() - start2;
    console.log(`✅ Second call completed in ${duration2}ms`);
    console.log(`Repository: ${result2.name} (${result2.stargazers_count} stars)`);
    console.log(`🚀 Speed improvement: ${(duration1 / duration2).toFixed(2)}x faster`);
    console.log();
    
    // 测试分析功能缓存
    console.log('🔬 Testing analysis caching:');
    const start3 = Date.now();
    const analysis1 = await githubService.analyzeRepository(testRepo);
    const duration3 = Date.now() - start3;
    console.log(`✅ First analysis completed in ${duration3}ms`);
    
    const start4 = Date.now();
    const analysis2 = await githubService.analyzeRepository(testRepo);
    const duration4 = Date.now() - start4;
    console.log(`✅ Second analysis completed in ${duration4}ms`);
    console.log(`🚀 Analysis speed improvement: ${(duration3 / duration4).toFixed(2)}x faster`);
    console.log();
    
    // 最终缓存统计
    console.log('📈 Final cache stats:');
    const finalStats = githubService.cache.getStats();
    console.log(JSON.stringify(finalStats, null, 2));
    
    // 测试结果验证
    console.log('\n🎯 Cache Test Results:');
    console.log(`✅ Cache hit rate: ${finalStats.hitRate}`);
    console.log(`✅ Memory cache size: ${finalStats.memorySize} entries`);
    console.log(`✅ Total requests: ${finalStats.totalRequests}`);
    console.log(`✅ Cache hits: ${finalStats.hits}`);
    console.log(`✅ Cache misses: ${finalStats.misses}`);
    
    if (parseFloat(finalStats.hitRate) > 40) {
      console.log('\n🎉 Cache functionality is working properly!');
    } else {
      console.log('\n⚠️ Cache hit rate is lower than expected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// 运行测试
testCacheFunctionality().catch(console.error); 