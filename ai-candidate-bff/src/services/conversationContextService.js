/**
 * 会话上下文感知服务
 * 负责管理GitHub分析结果的上下文，支持智能后续对话
 */
class ConversationContextService {
  constructor() {
    // GitHub分析结果存储 - sessionId -> analysisResults
    this.githubAnalysisResults = new Map();
    
    // 上下文感知配置
    this.config = {
      // 分析结果在内存中的保留时间 (1小时)
      analysisResultsTTL: 60 * 60 * 1000,
      // 最大保存的分析结果数量（每个会话）
      maxAnalysisResultsPerSession: 10,
      // 上下文相关性阈值
      contextRelevanceThreshold: 0.7
    };
    
    // 启动定期清理
    this._startCleanupTimer();
    
    console.log('🧠 Conversation Context Service initialized');
  }

  /**
   * 存储GitHub分析结果到会话上下文
   * @param {string} sessionId - 会话ID
   * @param {string} repoUrl - 仓库URL
   * @param {Object} analysisResult - 分析结果
   */
  async storeGitHubAnalysisResult(sessionId, repoUrl, analysisResult) {
    try {
      if (!this.githubAnalysisResults.has(sessionId)) {
        this.githubAnalysisResults.set(sessionId, new Map());
      }
      
      const sessionResults = this.githubAnalysisResults.get(sessionId);
      
      // 存储分析结果
      sessionResults.set(repoUrl, {
        analysisResult,
        timestamp: Date.now(),
        repoUrl,
        projectName: analysisResult.repository_info?.name || 'Unknown',
        techStack: analysisResult.tech_stack,
        language: analysisResult.repository_info?.language
      });
      
      // 限制每个会话的结果数量
      if (sessionResults.size > this.config.maxAnalysisResultsPerSession) {
        // 删除最旧的结果
        const oldestKey = sessionResults.keys().next().value;
        sessionResults.delete(oldestKey);
      }
      
      console.log(`🧠 Stored GitHub analysis result for session ${sessionId}:`, {
        repoUrl,
        projectName: analysisResult.repository_info?.name,
        totalResults: sessionResults.size
      });
      
    } catch (error) {
      console.error('Error storing GitHub analysis result:', error);
    }
  }

  /**
   * 获取会话中的GitHub分析结果
   * @param {string} sessionId - 会话ID
   * @param {string} repoUrl - 可选的仓库URL，用于获取特定项目
   * @returns {Object|Array} 分析结果
   */
  getGitHubAnalysisResults(sessionId, repoUrl = null) {
    const sessionResults = this.githubAnalysisResults.get(sessionId);
    if (!sessionResults) {
      return null;
    }
    
    if (repoUrl) {
      // 返回特定项目的分析结果
      return sessionResults.get(repoUrl) || null;
    } else {
      // 返回所有分析结果
      return Array.from(sessionResults.values());
    }
  }

  /**
   * 基于当前消息增强上下文
   * @param {string} message - 用户消息
   * @param {string} sessionId - 会话ID
   * @returns {Object} 增强后的上下文信息
   */
  async enhanceWithGitHubContext(message, sessionId) {
    try {
      const analysisResults = this.getGitHubAnalysisResults(sessionId);
      if (!analysisResults || analysisResults.length === 0) {
        return {
          hasContext: false,
          message: '暂无GitHub项目分析上下文'
        };
      }
      
      // 分析消息内容，判断是否与已分析的项目相关
      const relevantProjects = this._findRelevantProjects(message, analysisResults);
      
      if (relevantProjects.length === 0) {
        return {
          hasContext: true,
          relevantProjects: [],
          allProjects: analysisResults.map(r => ({
            name: r.projectName,
            url: r.repoUrl,
            language: r.language
          })),
          contextSummary: this._generateContextSummary(analysisResults)
        };
      }
      
      // 生成上下文相关的信息
      const contextInfo = {
        hasContext: true,
        relevantProjects: relevantProjects,
        contextDetails: this._generateContextDetails(relevantProjects),
        suggestions: this._generateContextualSuggestions(message, relevantProjects)
      };
      
      console.log(`🧠 Enhanced context for session ${sessionId}:`, {
        relevantProjects: relevantProjects.length,
        hasSpecificContext: relevantProjects.length > 0
      });
      
      return contextInfo;
      
    } catch (error) {
      console.error('Error enhancing context:', error);
      return { hasContext: false, error: error.message };
    }
  }

  /**
   * 生成基于分析结果的上下文建议
   * @param {Object} analysisResult - 分析结果
   * @returns {Array} 建议列表
   */
  generateContextualSuggestions(analysisResult) {
    const suggestions = [];
    
    if (!analysisResult) return suggestions;
    
    const { repository_info, tech_stack, frameworks, analysis_summary } = analysisResult;
    
    // 基于项目类型的建议
    if (analysis_summary?.project_type === 'Full-stack Application') {
      suggestions.push('这个项目的前端和后端架构是如何设计的？');
      suggestions.push('项目中使用了哪些主要的技术栈？');
    }
    
    // 基于编程语言的建议
    if (repository_info?.language) {
      suggestions.push(`这个${repository_info.language}项目有什么特色功能？`);
    }
    
    // 基于框架的建议
    if (frameworks && frameworks.length > 0) {
      const mainFramework = frameworks[0];
      suggestions.push(`${mainFramework}在这个项目中是如何应用的？`);
    }
    
    // 基于项目状态的建议
    if (analysis_summary?.development_status === 'Active Development') {
      suggestions.push('这个项目目前在开发什么新功能？');
    }
    
    // 通用深度分析建议
    suggestions.push('能详细解释一下项目的核心实现吗？');
    suggestions.push('这个项目解决了什么具体问题？');
    suggestions.push('项目中有哪些技术亮点值得关注？');
    
    return suggestions.slice(0, 5); // 限制建议数量
  }

  /**
   * 处理基于上下文的后续问题
   * @param {string} question - 用户问题
   * @param {string} sessionId - 会话ID
   * @returns {Object} 处理结果
   */
  async handleFollowUpQuestion(question, sessionId) {
    try {
      const contextInfo = await this.enhanceWithGitHubContext(question, sessionId);
      
      if (!contextInfo.hasContext) {
        return {
          hasAnswer: false,
          message: '请先分析一个GitHub项目，然后我可以回答相关的详细问题。'
        };
      }
      
      // 如果有相关项目，提供上下文相关的答案
      if (contextInfo.relevantProjects && contextInfo.relevantProjects.length > 0) {
        return {
          hasAnswer: true,
          contextualInfo: contextInfo.contextDetails,
          relevantProjects: contextInfo.relevantProjects,
          suggestions: contextInfo.suggestions
        };
      }
      
      return {
        hasAnswer: true,
        availableProjects: contextInfo.allProjects,
        contextSummary: contextInfo.contextSummary,
        message: '我可以帮你分析已经查看过的这些项目的详细信息'
      };
      
    } catch (error) {
      console.error('Error handling follow-up question:', error);
      return {
        hasAnswer: false,
        error: error.message
      };
    }
  }

  /**
   * 清理过期的分析结果
   */
  cleanupExpiredResults() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, sessionResults] of this.githubAnalysisResults) {
      for (const [repoUrl, result] of sessionResults) {
        if (now - result.timestamp > this.config.analysisResultsTTL) {
          sessionResults.delete(repoUrl);
          cleanedCount++;
        }
      }
      
      // 如果会话没有任何结果了，删除整个会话
      if (sessionResults.size === 0) {
        this.githubAnalysisResults.delete(sessionId);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired analysis results`);
    }
  }

  /**
   * 获取服务统计信息
   */
  getStats() {
    const totalSessions = this.githubAnalysisResults.size;
    let totalResults = 0;
    
    for (const sessionResults of this.githubAnalysisResults.values()) {
      totalResults += sessionResults.size;
    }
    
    return {
      totalSessions,
      totalResults,
      averageResultsPerSession: totalSessions > 0 ? (totalResults / totalSessions).toFixed(2) : 0,
      memoryUsage: `${totalResults} analysis results`,
      lastCleanup: new Date().toISOString()
    };
  }

  // ============ 私有方法 ============

  /**
   * 查找与消息相关的项目
   */
  _findRelevantProjects(message, analysisResults) {
    const messageLower = message.toLowerCase();
    const relevantProjects = [];
    
    for (const result of analysisResults) {
      let relevanceScore = 0;
      
      // 检查项目名称匹配
      if (messageLower.includes(result.projectName.toLowerCase())) {
        relevanceScore += 0.8;
      }
      
      // 检查编程语言匹配
      if (result.language && messageLower.includes(result.language.toLowerCase())) {
        relevanceScore += 0.6;
      }
      
      // 检查技术栈匹配
      if (result.techStack) {
        const frameworks = result.techStack.frontend_stack?.concat(result.techStack.backend_stack || []) || [];
        for (const framework of frameworks) {
          if (messageLower.includes(framework.toLowerCase())) {
            relevanceScore += 0.4;
          }
        }
      }
      
      if (relevanceScore >= this.config.contextRelevanceThreshold) {
        relevantProjects.push({
          ...result,
          relevanceScore
        });
      }
    }
    
    // 按相关性得分排序
    return relevantProjects.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * 生成上下文摘要
   */
  _generateContextSummary(analysisResults) {
    if (!analysisResults || analysisResults.length === 0) {
      return '暂无项目分析历史';
    }
    
    const projectNames = analysisResults.map(r => r.projectName).join('、');
    const languages = [...new Set(analysisResults.map(r => r.language).filter(Boolean))];
    
    return `已分析项目：${projectNames}。涉及技术：${languages.join('、')}`;
  }

  /**
   * 生成上下文详细信息
   */
  _generateContextDetails(relevantProjects) {
    return relevantProjects.map(project => ({
      projectName: project.projectName,
      repoUrl: project.repoUrl,
      language: project.language,
      techStack: project.techStack,
      keyInfo: {
        type: project.analysisResult.analysis_summary?.project_type,
        status: project.analysisResult.analysis_summary?.development_status,
        highlights: project.analysisResult.analysis_summary?.key_highlights
      }
    }));
  }

  /**
   * 生成上下文相关建议
   */
  _generateContextualSuggestions(message, relevantProjects) {
    const suggestions = [];
    
    for (const project of relevantProjects.slice(0, 2)) { // 最多2个项目
      suggestions.push(...this.generateContextualSuggestions(project.analysisResult));
    }
    
    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * 启动定期清理定时器
   */
  _startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredResults();
    }, 10 * 60 * 1000); // 每10分钟清理一次
  }
}

module.exports = ConversationContextService; 