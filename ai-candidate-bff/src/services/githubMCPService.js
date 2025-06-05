/**
 * GitHub MCP服务
 * 负责与GitHub API交互，分析代码仓库结构和内容
 */

const GitHubCacheService = require('./githubCacheService');

class GitHubMCPService {
  constructor() {
    this.octokit = null;
    this.Octokit = null;  // 存储Octokit类
    this.isEnabled = process.env.FEATURE_GITHUB_ANALYSIS_ENABLED === 'true';
    this.timeout = parseInt(process.env.GITHUB_MCP_TIMEOUT) || 30000;
    this.maxConcurrentRequests = parseInt(process.env.GITHUB_MCP_MAX_CONCURRENT_REQUESTS) || 5;
    this.initPromise = null; // 用于确保只初始化一次
    
    // 初始化缓存服务
    this.cache = new GitHubCacheService();
    
    if (this.isEnabled) {
      this.initPromise = this._initGitHubClient();
    }
    
    console.log(`🐙 GitHub MCP Service initialized`, {
      enabled: this.isEnabled,
      timeout: this.timeout,
      maxConcurrentRequests: this.maxConcurrentRequests
    });
  }

  /**
   * 初始化GitHub客户端 (使用动态导入)
   */
  async _initGitHubClient() {
    try {
      const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
      
      console.log('🔑 GitHub token check:', {
        tokenExists: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
      });
      
      if (!token || token === 'your_github_token_here') {
        console.warn('⚠️ GitHub Personal Access Token not configured');
        this.isEnabled = false;
        return;
      }

      // 动态导入@octokit/rest
      const { Octokit } = await import('@octokit/rest');
      this.Octokit = Octokit;

      this.octokit = new Octokit({
        auth: token,
        request: {
          timeout: this.timeout,
        },
      });
      
      console.log('✅ GitHub client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize GitHub client:', error);
      this.isEnabled = false;
      this.octokit = null;
    }
  }

  /**
   * 确保GitHub客户端已初始化
   */
  async _ensureInitialized() {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * 检查服务是否可用
   */
  async isAvailable() {
    await this._ensureInitialized();
    return this.isEnabled && this.octokit !== null;
  }

  /**
   * 解析GitHub URL，提取owner和repo信息
   * @param {string} githubUrl - GitHub仓库URL
   * @returns {Object} {owner, repo} 或 null
   */
  parseGitHubUrl(githubUrl) {
    try {
      // 支持多种GitHub URL格式
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
        /^([^\/]+)\/([^\/]+)$/  // 简化格式 owner/repo
      ];

      for (const pattern of patterns) {
        const match = githubUrl.match(pattern);
        if (match) {
          return {
            owner: match[1],
            repo: match[2]
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  }

  /**
   * 解析GitHub URL，支持用户主页和仓库URL
   * @param {string} githubUrl - GitHub URL
   * @returns {Object} 解析结果
   */
  parseGitHubUrlEnhanced(githubUrl) {
    try {
      // 仓库URL模式
      const repoPatterns = [
        /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
        /^([^\/]+)\/([^\/]+)$/  // 简化格式 owner/repo
      ];

      // 用户主页URL模式
      const userPatterns = [
        /github\.com\/([^\/]+)\/?$/,
        /^([^\/]+)$/  // 仅用户名
      ];

      // 先尝试匹配仓库URL
      for (const pattern of repoPatterns) {
        const match = githubUrl.match(pattern);
        if (match) {
          return {
            type: 'repository',
            owner: match[1],
            repo: match[2]
          };
        }
      }

      // 再尝试匹配用户主页URL
      for (const pattern of userPatterns) {
        const match = githubUrl.match(pattern);
        if (match) {
          return {
            type: 'user',
            owner: match[1]
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  }

  /**
   * 获取仓库基本信息
   * @param {string} githubUrl - GitHub仓库URL
   * @returns {Object} 仓库信息
   */
  async getRepositoryInfo(githubUrl) {
    if (!(await this.isAvailable())) {
      throw new Error('GitHub MCP Service is not available');
    }

    // 先尝试从缓存获取
    const cached = await this.cache.get('repository_info', githubUrl);
    if (cached) {
      return cached;
    }

    const parsed = this.parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub URL format');
    }

    try {
      const { data: repo } = await this.octokit.rest.repos.get({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      const repoInfo = {
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        languages_url: repo.languages_url,
        size: repo.size,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
        license: repo.license?.name,
        default_branch: repo.default_branch,
        html_url: repo.html_url
      };

      // 缓存结果
      await this.cache.set('repository_info', githubUrl, repoInfo);
      
      return repoInfo;
    } catch (error) {
      console.error('Error fetching repository info:', error);
      throw new Error(`Failed to fetch repository information: ${error.message}`);
    }
  }

  /**
   * 获取仓库目录结构
   * @param {string} githubUrl - GitHub仓库URL
   * @param {string} path - 路径（默认为根目录）
   * @returns {Array} 文件和目录列表
   */
  async getRepositoryStructure(githubUrl, path = '') {
    if (!(await this.isAvailable())) {
      throw new Error('GitHub MCP Service is not available');
    }

    const parsed = this.parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub URL format');
    }

    try {
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner: parsed.owner,
        repo: parsed.repo,
        path: path,
      });

      // 处理单个文件的情况
      if (!Array.isArray(contents)) {
        return [{
          name: contents.name,
          path: contents.path,
          type: contents.type,
          size: contents.size,
          download_url: contents.download_url
        }];
      }

      // 处理目录内容
      return contents.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,  // 'file' or 'dir'
        size: item.size,
        download_url: item.download_url
      }));
    } catch (error) {
      console.error('Error fetching repository structure:', error);
      throw new Error(`Failed to fetch repository structure: ${error.message}`);
    }
  }

  /**
   * 获取文件内容
   * @param {string} githubUrl - GitHub仓库URL
   * @param {string} filePath - 文件路径
   * @returns {string} 文件内容
   */
  async getFileContent(githubUrl, filePath) {
    if (!(await this.isAvailable())) {
      throw new Error('GitHub MCP Service is not available');
    }

    const parsed = this.parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub URL format');
    }

    try {
      const { data: file } = await this.octokit.rest.repos.getContent({
        owner: parsed.owner,
        repo: parsed.repo,
        path: filePath,
      });

      if (file.type !== 'file') {
        throw new Error('Path is not a file');
      }

      // 解码Base64内容
      const content = Buffer.from(file.content, 'base64').toString('utf-8');
      
      return {
        path: file.path,
        size: file.size,
        content: content,
        encoding: file.encoding,
        sha: file.sha
      };
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw new Error(`Failed to fetch file content: ${error.message}`);
    }
  }

  /**
   * 获取仓库使用的编程语言统计
   * @param {string} githubUrl - GitHub仓库URL
   * @returns {Object} 语言统计
   */
  async getLanguagesStats(githubUrl) {
    if (!(await this.isAvailable())) {
      throw new Error('GitHub MCP Service is not available');
    }

    const parsed = this.parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub URL format');
    }

    try {
      const { data: languages } = await this.octokit.rest.repos.listLanguages({
        owner: parsed.owner,
        repo: parsed.repo,
      });

      // 计算语言比例
      const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
      const languagesWithPercentage = Object.entries(languages).map(([language, bytes]) => ({
        language,
        bytes,
        percentage: ((bytes / total) * 100).toFixed(2)
      })).sort((a, b) => b.bytes - a.bytes);

      return {
        languages: languagesWithPercentage,
        total_bytes: total,
        primary_language: languagesWithPercentage[0]?.language || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching languages stats:', error);
      throw new Error(`Failed to fetch languages statistics: ${error.message}`);
    }
  }

  /**
   * 分析仓库技术栈
   * @param {string} githubUrl - GitHub仓库URL
   * @returns {Object} 技术栈分析结果
   */
  async analyzeTechStack(githubUrl) {
    try {
      const [repoInfo, languages, structure] = await Promise.all([
        this.getRepositoryInfo(githubUrl),
        this.getLanguagesStats(githubUrl),
        this.getRepositoryStructure(githubUrl)
      ]);

      // 分析配置文件和依赖管理
      const configFiles = structure.filter(item => 
        item.type === 'file' && this._isConfigFile(item.name)
      );

      const frameworks = await this._detectFrameworks(githubUrl, structure);
      const buildTools = this._detectBuildTools(configFiles);
      
      return {
        repository: repoInfo,
        languages: languages,
        frameworks: frameworks,
        build_tools: buildTools,
        config_files: configFiles,
        tech_stack_summary: this._generateTechStackSummary(languages, frameworks, buildTools)
      };
    } catch (error) {
      console.error('Error analyzing tech stack:', error);
      throw new Error(`Failed to analyze tech stack: ${error.message}`);
    }
  }

  /**
   * 判断是否为配置文件
   * @param {string} filename - 文件名
   * @returns {boolean}
   */
  _isConfigFile(filename) {
    const configPatterns = [
      'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
      'requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile',
      'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
      '.env', '.env.example', '.env.local',
      'tsconfig.json', 'webpack.config.js', 'vite.config.js',
      'Makefile', 'CMakeLists.txt', 'build.gradle', 'pom.xml',
      '.gitignore', 'README.md', 'LICENSE'
    ];
    
    return configPatterns.some(pattern => 
      filename.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * 检测框架和库
   * @param {string} githubUrl - GitHub仓库URL
   * @param {Array} structure - 仓库结构
   * @returns {Array} 检测到的框架列表
   */
  async _detectFrameworks(githubUrl, structure) {
    const frameworks = [];
    
    // 检查package.json
    const packageJson = structure.find(item => item.name === 'package.json');
    if (packageJson) {
      try {
        const content = await this.getFileContent(githubUrl, 'package.json');
        const pkg = JSON.parse(content.content);
        
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };
        
        // 检测前端框架
        if (allDeps.react) frameworks.push({ name: 'React', type: 'Frontend Framework' });
        if (allDeps.vue) frameworks.push({ name: 'Vue.js', type: 'Frontend Framework' });
        if (allDeps.angular) frameworks.push({ name: 'Angular', type: 'Frontend Framework' });
        if (allDeps.svelte) frameworks.push({ name: 'Svelte', type: 'Frontend Framework' });
        
        // 检测后端框架
        if (allDeps.express) frameworks.push({ name: 'Express.js', type: 'Backend Framework' });
        if (allDeps.koa) frameworks.push({ name: 'Koa.js', type: 'Backend Framework' });
        if (allDeps.fastify) frameworks.push({ name: 'Fastify', type: 'Backend Framework' });
        if (allDeps.next) frameworks.push({ name: 'Next.js', type: 'Full-stack Framework' });
        if (allDeps.nuxt) frameworks.push({ name: 'Nuxt.js', type: 'Full-stack Framework' });
        
        // 检测构建工具
        if (allDeps.webpack) frameworks.push({ name: 'Webpack', type: 'Build Tool' });
        if (allDeps.vite) frameworks.push({ name: 'Vite', type: 'Build Tool' });
        if (allDeps.rollup) frameworks.push({ name: 'Rollup', type: 'Build Tool' });
        
      } catch (error) {
        console.warn('Could not parse package.json:', error.message);
      }
    }
    
    return frameworks;
  }

  /**
   * 检测构建工具
   * @param {Array} configFiles - 配置文件列表
   * @returns {Array} 构建工具列表
   */
  _detectBuildTools(configFiles) {
    const buildTools = [];
    
    configFiles.forEach(file => {
      const filename = file.name.toLowerCase();
      
      if (filename.includes('docker')) {
        buildTools.push({ name: 'Docker', type: 'Containerization' });
      }
      if (filename.includes('makefile')) {
        buildTools.push({ name: 'Make', type: 'Build System' });
      }
      if (filename.includes('webpack')) {
        buildTools.push({ name: 'Webpack', type: 'Module Bundler' });
      }
      if (filename.includes('vite')) {
        buildTools.push({ name: 'Vite', type: 'Build Tool' });
      }
    });
    
    return buildTools;
  }

  /**
   * 生成技术栈总结
   * @param {Object} languages - 语言统计
   * @param {Array} frameworks - 框架列表
   * @param {Array} buildTools - 构建工具列表
   * @returns {Object} 技术栈总结
   */
  _generateTechStackSummary(languages, frameworks, buildTools) {
    return {
      primary_language: languages.primary_language,
      frontend_stack: frameworks.filter(f => f.type.includes('Frontend')),
      backend_stack: frameworks.filter(f => f.type.includes('Backend')),
      build_tools: buildTools,
      is_fullstack: frameworks.some(f => f.type.includes('Full-stack')),
      complexity_score: this._calculateComplexityScore(languages, frameworks, buildTools)
    };
  }

  /**
   * 计算项目复杂度分数
   * @param {Object} languages - 语言统计
   * @param {Array} frameworks - 框架列表
   * @param {Array} buildTools - 构建工具列表
   * @returns {string} 复杂度评级
   */
  _calculateComplexityScore(languages, frameworks, buildTools) {
    let score = 0;
    
    // 语言多样性
    score += languages.languages.length;
    
    // 框架数量
    score += frameworks.length;
    
    // 构建工具数量
    score += buildTools.length;
    
    if (score <= 3) return 'Simple';
    if (score <= 6) return 'Moderate';
    if (score <= 10) return 'Complex';
    return 'Very Complex';
  }

  /**
   * 综合分析仓库
   * @param {string} githubUrl - GitHub仓库URL
   * @returns {Object} 完整的仓库分析结果
   */
  async analyzeRepository(githubUrl) {
    // 先尝试从缓存获取
    const cached = await this.cache.get('analysis_result', githubUrl);
    if (cached) {
      console.log(`🎯 Using cached analysis for: ${githubUrl}`);
      return cached;
    }

    try {
      console.log(`🔍 Starting comprehensive analysis for: ${githubUrl}`);
      
      const techStack = await this.analyzeTechStack(githubUrl);
      
      // 获取README内容
      let readme = null;
      try {
        const readmeFile = await this.getFileContent(githubUrl, 'README.md');
        readme = {
          content: readmeFile.content,
          size: readmeFile.size
        };
      } catch (error) {
        console.warn('README.md not found or not accessible');
      }

      const analysis = {
        url: githubUrl,
        timestamp: new Date().toISOString(),
        repository_info: techStack.repository,
        tech_stack: techStack.tech_stack_summary,
        languages: techStack.languages,
        frameworks: techStack.frameworks,
        build_tools: techStack.build_tools,
        config_files: techStack.config_files,
        readme: readme,
        analysis_summary: this._generateAnalysisSummary(techStack, readme)
      };

      // 缓存分析结果
      await this.cache.set('analysis_result', githubUrl, analysis);

      console.log(`✅ Analysis completed for: ${techStack.repository.name}`);
      return analysis;
      
    } catch (error) {
      console.error('Error in comprehensive repository analysis:', error);
      throw new Error(`Repository analysis failed: ${error.message}`);
    }
  }

  /**
   * 生成分析总结
   * @param {Object} techStack - 技术栈分析
   * @param {Object} readme - README内容
   * @returns {Object} 分析总结
   */
  _generateAnalysisSummary(techStack, readme) {
    const repo = techStack.repository;
    const summary = techStack.tech_stack_summary;
    
    return {
      project_type: this._inferProjectType(summary),
      development_status: this._inferDevelopmentStatus(repo),
      key_highlights: this._extractKeyHighlights(techStack, readme),
      recommendations: this._generateRecommendations(summary)
    };
  }

  /**
   * 推断项目类型
   */
  _inferProjectType(summary) {
    if (summary.frontend_stack.length > 0 && summary.backend_stack.length > 0) {
      return 'Full-stack Application';
    }
    if (summary.frontend_stack.length > 0) {
      return 'Frontend Application';
    }
    if (summary.backend_stack.length > 0) {
      return 'Backend Service';
    }
    return 'Library/Tool';
  }

  /**
   * 推断开发状态
   */
  _inferDevelopmentStatus(repo) {
    const daysSinceUpdate = Math.floor(
      (new Date() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpdate < 7) return 'Active Development';
    if (daysSinceUpdate < 30) return 'Recently Updated';
    if (daysSinceUpdate < 365) return 'Maintained';
    return 'Legacy/Inactive';
  }

  /**
   * 提取关键亮点
   */
  _extractKeyHighlights(techStack, readme) {
    const highlights = [];
    const repo = techStack.repository;
    
    if (repo.stargazers_count > 100) {
      highlights.push(`Popular project with ${repo.stargazers_count} stars`);
    }
    
    if (techStack.tech_stack_summary.is_fullstack) {
      highlights.push('Full-stack application with modern architecture');
    }
    
    if (techStack.languages.languages.length > 3) {
      highlights.push('Multi-language project showcasing versatility');
    }
    
    return highlights;
  }

  /**
   * 生成改进建议
   */
  _generateRecommendations(summary) {
    const recommendations = [];
    
    if (summary.complexity_score === 'Very Complex') {
      recommendations.push('Consider simplifying the tech stack for better maintainability');
    }
    
    if (summary.build_tools.length === 0) {
      recommendations.push('Consider adding automated build tools for better development workflow');
    }
    
    return recommendations;
  }

  /**
   * 获取用户的公开仓库列表
   * @param {string} username - GitHub用户名
   * @returns {Array} 仓库列表
   */
  async getUserRepositories(username) {
    if (!(await this.isAvailable())) {
      throw new Error('GitHub MCP Service is not available');
    }

    // 先尝试从缓存获取
    const cached = await this.cache.get('user_repositories', username);
    if (cached) {
      return cached;
    }

    try {
      const { data: repos } = await this.octokit.rest.repos.listForUser({
        username: username,
        type: 'public',
        sort: 'updated',
        per_page: 30
      });

      const repoList = repos.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
        topics: repo.topics || []
      })).sort((a, b) => b.stargazers_count - a.stargazers_count);

      // 缓存结果
      await this.cache.set('user_repositories', username, repoList);
      
      return repoList;
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw new Error(`Failed to fetch user repositories: ${error.message}`);
    }
  }

  /**
   * 智能处理GitHub URL - 支持用户主页和仓库URL
   * @param {string} githubUrl - GitHub URL
   * @returns {Object} 处理结果
   */
  async handleGitHubUrl(githubUrl) {
    const parsed = this.parseGitHubUrlEnhanced(githubUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub URL format');
    }

    if (parsed.type === 'repository') {
      // 为了兼容现有的getRepositoryInfo方法，构造标准的仓库URL
      const repoUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
      return {
        type: 'repository',
        data: await this.getRepositoryInfo(repoUrl)
      };
    } else if (parsed.type === 'user') {
      // 返回用户的仓库列表
      const repos = await this.getUserRepositories(parsed.owner);
      return {
        type: 'user_repositories',
        username: parsed.owner,
        data: repos
      };
    }
  }
}

module.exports = GitHubMCPService; 