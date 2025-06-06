/**
 * 工具调用监控服务
 * 实时监控和分析AI的工具选择策略
 */
class ToolCallMonitorService {
  constructor() {
    // 工具调用历史记录
    this.callHistory = [];
    
    // 工具调用统计
    this.callStats = {
      totalCalls: 0,
      toolUsageCount: {},
      sessionStats: {},
      performanceMetrics: {
        avgResponseTime: 0,
        totalResponseTime: 0
      }
    };
    
    // 配置
    this.config = {
      // 历史记录保留时间 (24小时)
      historyRetentionTime: 24 * 60 * 60 * 1000,
      // 最大历史记录数量
      maxHistorySize: 10000,
      // 性能监控阈值
      performanceThresholds: {
        slowResponseTime: 10000, // 10秒
        verySlowResponseTime: 30000 // 30秒
      }
    };
    
    // 启动定期清理
    this._startCleanupTimer();
    
    console.log('🔍 Tool Call Monitor Service initialized');
  }

  /**
   * 记录工具调用
   * @param {string} sessionId - 会话ID
   * @param {string} userQuery - 用户查询
   * @param {Array} toolsCalled - 调用的工具列表
   * @param {number} responseTime - 响应时间(ms)
   * @param {Object} context - 上下文信息
   */
  recordToolCall(sessionId, userQuery, toolsCalled, responseTime, context = {}) {
    const callRecord = {
      id: this._generateId(),
      sessionId,
      userQuery,
      toolsCalled: [...toolsCalled],
      responseTime,
      context,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    // 添加到历史记录
    this.callHistory.push(callRecord);
    
    // 更新统计信息
    this._updateStats(callRecord);
    
    // 限制历史记录大小
    if (this.callHistory.length > this.config.maxHistorySize) {
      this.callHistory = this.callHistory.slice(-this.config.maxHistorySize);
    }
    
    console.log(`🔍 Recorded tool call for session ${sessionId}:`, {
      tools: toolsCalled,
      responseTime: `${responseTime}ms`,
      query: userQuery.substring(0, 50) + (userQuery.length > 50 ? '...' : '')
    });
    
    return callRecord.id;
  }

  /**
   * 分析工具调用模式
   * @param {string} sessionId - 可选的会话ID过滤
   * @param {number} timeRange - 时间范围(ms)，默认1小时
   */
  analyzeCallPatterns(sessionId = null, timeRange = 60 * 60 * 1000) {
    const now = Date.now();
    const cutoffTime = now - timeRange;
    
    // 过滤记录
    let records = this.callHistory.filter(record => record.timestamp >= cutoffTime);
    if (sessionId) {
      records = records.filter(record => record.sessionId === sessionId);
    }
    
    if (records.length === 0) {
      return {
        summary: 'No tool calls in the specified time range',
        totalCalls: 0
      };
    }
    
    // 工具使用频率分析
    const toolFrequency = {};
    const queryTypes = {};
    const sessionAnalysis = {};
    
    records.forEach(record => {
      // 工具使用统计
      record.toolsCalled.forEach(tool => {
        toolFrequency[tool] = (toolFrequency[tool] || 0) + 1;
      });
      
      // 查询类型分析
      const queryType = this._classifyQuery(record.userQuery);
      queryTypes[queryType] = (queryTypes[queryType] || 0) + 1;
      
      // 会话级分析
      if (!sessionAnalysis[record.sessionId]) {
        sessionAnalysis[record.sessionId] = {
          callCount: 0,
          toolsUsed: new Set(),
          avgResponseTime: 0,
          totalResponseTime: 0
        };
      }
      const session = sessionAnalysis[record.sessionId];
      session.callCount++;
      record.toolsCalled.forEach(tool => session.toolsUsed.add(tool));
      session.totalResponseTime += record.responseTime;
      session.avgResponseTime = session.totalResponseTime / session.callCount;
    });
    
    // 转换Set为数组
    Object.values(sessionAnalysis).forEach(session => {
      session.toolsUsed = Array.from(session.toolsUsed);
    });
    
    // 性能分析
    const responseTimes = records.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const slowCalls = records.filter(r => r.responseTime > this.config.performanceThresholds.slowResponseTime);
    
    return {
      summary: `Analysis of ${records.length} tool calls in the last ${timeRange / 1000 / 60} minutes`,
      totalCalls: records.length,
      timeRange: {
        start: new Date(cutoffTime).toISOString(),
        end: new Date(now).toISOString()
      },
      toolFrequency: this._sortByValue(toolFrequency),
      queryTypes: this._sortByValue(queryTypes),
      performance: {
        avgResponseTime: Math.round(avgResponseTime),
        slowCalls: slowCalls.length,
        slowCallPercentage: ((slowCalls.length / records.length) * 100).toFixed(1),
        fastestCall: Math.min(...responseTimes),
        slowestCall: Math.max(...responseTimes)
      },
      sessionAnalysis,
      topQueries: this._getTopQueries(records, 5)
    };
  }

  /**
   * 检测异常工具调用模式
   */
  detectAnomalies() {
    const recentRecords = this.callHistory.filter(
      record => Date.now() - record.timestamp < 30 * 60 * 1000 // 最近30分钟
    );
    
    if (recentRecords.length < 5) {
      return { anomalies: [], message: 'Insufficient data for anomaly detection' };
    }
    
    const anomalies = [];
    
    // 检测异常响应时间
    const responseTimes = recentRecords.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const threshold = avgResponseTime * 3; // 3倍平均时间为异常
    
    recentRecords.forEach(record => {
      if (record.responseTime > threshold) {
        anomalies.push({
          type: 'slow_response',
          severity: 'medium',
          record,
          message: `Response time ${record.responseTime}ms is ${(record.responseTime / avgResponseTime).toFixed(1)}x above average`
        });
      }
    });
    
    // 检测工具调用失败模式
    const failedCalls = recentRecords.filter(record => 
      record.context && record.context.error
    );
    
    if (failedCalls.length > recentRecords.length * 0.2) { // 超过20%失败率
      anomalies.push({
        type: 'high_failure_rate',
        severity: 'high',
        message: `High failure rate detected: ${failedCalls.length}/${recentRecords.length} calls failed`,
        failedCalls: failedCalls.length
      });
    }
    
    // 检测重复无效工具调用
    const noToolCalls = recentRecords.filter(record => record.toolsCalled.length === 0);
    if (noToolCalls.length > recentRecords.length * 0.5) { // 超过50%无工具调用
      anomalies.push({
        type: 'excessive_no_tool_calls',
        severity: 'medium',
        message: `Too many queries without tool calls: ${noToolCalls.length}/${recentRecords.length}`,
        noToolCalls: noToolCalls.length
      });
    }
    
    return {
      anomalies,
      totalRecords: recentRecords.length,
      timeRange: '30 minutes',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 生成工具选择策略建议
   */
  generateStrategyRecommendations() {
    const analysis = this.analyzeCallPatterns();
    const anomalies = this.detectAnomalies();
    const recommendations = [];
    
    // 基于工具使用频率的建议
    const toolUsage = analysis.toolFrequency;
    const topTools = Object.keys(toolUsage).slice(0, 5);
    const leastUsedTools = Object.keys(toolUsage).slice(-5);
    
    if (topTools.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize frequently used tools',
        description: `Tools ${topTools.join(', ')} are heavily used. Consider caching their results.`,
        impact: 'performance'
      });
    }
    
    if (leastUsedTools.length > 0) {
      recommendations.push({
        type: 'review',
        priority: 'low',
        title: 'Review underutilized tools',
        description: `Tools ${leastUsedTools.join(', ')} are rarely used. Review their necessity or improve their discoverability.`,
        impact: 'efficiency'
      });
    }
    
    // 基于性能的建议
    if (analysis.performance.slowCallPercentage > 20) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Address slow response times',
        description: `${analysis.performance.slowCallPercentage}% of calls are slow. Consider implementing timeouts or optimizing tool performance.`,
        impact: 'user_experience'
      });
    }
    
    // 基于异常的建议
    anomalies.anomalies.forEach(anomaly => {
      if (anomaly.type === 'high_failure_rate') {
        recommendations.push({
          type: 'reliability',
          priority: 'high',
          title: 'Improve tool reliability',
          description: 'High failure rate detected. Review error handling and tool robustness.',
          impact: 'reliability'
        });
      }
    });
    
    return {
      recommendations,
      analysisTimestamp: new Date().toISOString(),
      basedOnCalls: analysis.totalCalls
    };
  }

  /**
   * 获取实时统计信息
   */
  getStats() {
    const recentActivity = this.analyzeCallPatterns(null, 60 * 60 * 1000); // 最近1小时
    const anomalies = this.detectAnomalies();
    
    return {
      overall: {
        totalCalls: this.callStats.totalCalls,
        avgResponseTime: Math.round(this.callStats.performanceMetrics.avgResponseTime),
        activeSessions: Object.keys(this.callStats.sessionStats).length,
        historySize: this.callHistory.length
      },
      recent: {
        callsLastHour: recentActivity.totalCalls,
        avgResponseTimeLastHour: recentActivity.performance.avgResponseTime,
        slowCallsLastHour: recentActivity.performance.slowCalls
      },
      health: {
        anomalyCount: anomalies.anomalies.length,
        status: anomalies.anomalies.length === 0 ? 'healthy' : 
                anomalies.anomalies.some(a => a.severity === 'high') ? 'warning' : 'caution'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 清理过期数据
   */
  cleanup() {
    const cutoffTime = Date.now() - this.config.historyRetentionTime;
    const initialSize = this.callHistory.length;
    
    this.callHistory = this.callHistory.filter(record => record.timestamp >= cutoffTime);
    
    const cleanedCount = initialSize - this.callHistory.length;
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired tool call records`);
    }
    
    return cleanedCount;
  }

  // ============ 私有方法 ============

  /**
   * 更新统计信息
   */
  _updateStats(record) {
    this.callStats.totalCalls++;
    
    // 更新工具使用统计
    record.toolsCalled.forEach(tool => {
      this.callStats.toolUsageCount[tool] = (this.callStats.toolUsageCount[tool] || 0) + 1;
    });
    
    // 更新会话统计
    if (!this.callStats.sessionStats[record.sessionId]) {
      this.callStats.sessionStats[record.sessionId] = {
        callCount: 0,
        totalResponseTime: 0
      };
    }
    const session = this.callStats.sessionStats[record.sessionId];
    session.callCount++;
    session.totalResponseTime += record.responseTime;
    
    // 更新性能指标
    this.callStats.performanceMetrics.totalResponseTime += record.responseTime;
    this.callStats.performanceMetrics.avgResponseTime = 
      this.callStats.performanceMetrics.totalResponseTime / this.callStats.totalCalls;
  }

  /**
   * 查询分类
   */
  _classifyQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('github') || lowerQuery.includes('仓库') || lowerQuery.includes('项目分析')) {
      return 'github_analysis';
    }
    if (lowerQuery.includes('教育') || lowerQuery.includes('学历')) {
      return 'education';
    }
    if (lowerQuery.includes('工作') || lowerQuery.includes('经验') || lowerQuery.includes('职业')) {
      return 'work_experience';
    }
    if (lowerQuery.includes('技能') || lowerQuery.includes('能力')) {
      return 'skills';
    }
    if (lowerQuery.includes('项目')) {
      return 'projects';
    }
    return 'general';
  }

  /**
   * 按值排序对象
   */
  _sortByValue(obj) {
    return Object.entries(obj)
      .sort(([,a], [,b]) => b - a)
      .reduce((result, [key, value]) => {
        result[key] = value;
        return result;
      }, {});
  }

  /**
   * 获取热门查询
   */
  _getTopQueries(records, limit = 5) {
    const queryCount = {};
    records.forEach(record => {
      const shortQuery = record.userQuery.substring(0, 50);
      queryCount[shortQuery] = (queryCount[shortQuery] || 0) + 1;
    });
    
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * 生成唯一ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 启动定期清理定时器
   */
  _startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, 30 * 60 * 1000); // 每30分钟清理一次
  }
}

module.exports = ToolCallMonitorService; 