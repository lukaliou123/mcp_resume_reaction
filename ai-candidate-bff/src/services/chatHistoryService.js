/**
 * 对话历史服务
 * 支持内存和SQL两种存储方式的抽象接口
 */

class ChatHistoryService {
  constructor() {
    this.storageType = process.env.CHAT_HISTORY_STORAGE || 'memory';
    this.maxMessages = parseInt(process.env.CHAT_HISTORY_MAX_MESSAGES) || 20;
    this.sessionTimeout = parseInt(process.env.CHAT_HISTORY_SESSION_TIMEOUT) || 3600000; // 1小时
    
    // 根据配置选择存储实现
    if (this.storageType === 'sql') {
      this.storage = new SQLChatStorage();
    } else {
      this.storage = new MemoryChatStorage();
    }
    
    console.log(`🗂️ Chat History Service initialized with ${this.storageType} storage`);
    console.log(`📝 Max messages per session: ${this.maxMessages}`);
    console.log(`⏰ Session timeout: ${this.sessionTimeout}ms`);
  }

  /**
   * 获取会话历史
   * @param {string} sessionId - 会话ID
   * @returns {Array} 消息历史数组
   */
  async getHistory(sessionId) {
    try {
      const history = await this.storage.getHistory(sessionId);
      
      // 清理过期消息
      const now = Date.now();
      const validHistory = history.filter(msg => 
        now - msg.timestamp < this.sessionTimeout
      );
      
      // 限制消息数量
      if (validHistory.length > this.maxMessages) {
        const trimmedHistory = validHistory.slice(-this.maxMessages);
        await this.storage.setHistory(sessionId, trimmedHistory);
        return trimmedHistory;
      }
      
      return validHistory;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * 添加消息到历史
   * @param {string} sessionId - 会话ID
   * @param {string} role - 消息角色 ('user' | 'assistant')
   * @param {string} content - 消息内容
   * @param {Object} metadata - 额外元数据
   */
  async addMessage(sessionId, role, content, metadata = {}) {
    try {
      const message = {
        role,
        content,
        timestamp: Date.now(),
        metadata
      };
      
      await this.storage.addMessage(sessionId, message);
      
      // 检查并清理超出限制的消息
      const history = await this.storage.getHistory(sessionId);
      if (history.length > this.maxMessages) {
        const trimmedHistory = history.slice(-this.maxMessages);
        await this.storage.setHistory(sessionId, trimmedHistory);
      }
      
    } catch (error) {
      console.error('Error adding message to history:', error);
    }
  }

  /**
   * 清除会话历史
   * @param {string} sessionId - 会话ID
   */
  async clearHistory(sessionId) {
    try {
      await this.storage.clearHistory(sessionId);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  /**
   * 获取格式化的消息历史（用于LLM）
   * @param {string} sessionId - 会话ID
   * @returns {Array} 格式化的消息数组
   */
  async getFormattedHistory(sessionId) {
    const history = await this.getHistory(sessionId);
    return history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions() {
    try {
      await this.storage.cleanupExpiredSessions(this.sessionTimeout);
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}

/**
 * 内存存储实现
 */
class MemoryChatStorage {
  constructor() {
    this.sessions = new Map();
    
    // 定期清理过期会话（每30分钟）
    setInterval(() => {
      this.cleanupExpiredSessions(parseInt(process.env.CHAT_HISTORY_SESSION_TIMEOUT) || 3600000);
    }, 30 * 60 * 1000);
  }

  async getHistory(sessionId) {
    return this.sessions.get(sessionId) || [];
  }

  async setHistory(sessionId, history) {
    this.sessions.set(sessionId, history);
  }

  async addMessage(sessionId, message) {
    const history = this.sessions.get(sessionId) || [];
    history.push(message);
    this.sessions.set(sessionId, history);
  }

  async clearHistory(sessionId) {
    this.sessions.delete(sessionId);
  }

  async cleanupExpiredSessions(timeout) {
    const now = Date.now();
    for (const [sessionId, history] of this.sessions.entries()) {
      if (history.length === 0) continue;
      
      const lastMessage = history[history.length - 1];
      if (now - lastMessage.timestamp > timeout) {
        this.sessions.delete(sessionId);
        console.log(`🧹 Cleaned up expired session: ${sessionId}`);
      }
    }
  }

  // 获取统计信息
  getStats() {
    const totalSessions = this.sessions.size;
    const totalMessages = Array.from(this.sessions.values())
      .reduce((sum, history) => sum + history.length, 0);
    
    return {
      totalSessions,
      totalMessages,
      storageType: 'memory'
    };
  }
}

/**
 * SQL存储实现（预留接口）
 */
class SQLChatStorage {
  constructor() {
    console.log('⚠️ SQL storage not implemented yet, falling back to memory storage');
    this.fallback = new MemoryChatStorage();
  }

  async getHistory(sessionId) {
    // TODO: 实现SQL查询
    // SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC
    return this.fallback.getHistory(sessionId);
  }

  async setHistory(sessionId, history) {
    // TODO: 实现SQL批量更新
    return this.fallback.setHistory(sessionId, history);
  }

  async addMessage(sessionId, message) {
    // TODO: 实现SQL插入
    // INSERT INTO chat_messages (session_id, role, content, timestamp, metadata) VALUES (?, ?, ?, ?, ?)
    return this.fallback.addMessage(sessionId, message);
  }

  async clearHistory(sessionId) {
    // TODO: 实现SQL删除
    // DELETE FROM chat_messages WHERE session_id = ?
    return this.fallback.clearHistory(sessionId);
  }

  async cleanupExpiredSessions(timeout) {
    // TODO: 实现SQL清理
    // DELETE FROM chat_messages WHERE timestamp < ?
    return this.fallback.cleanupExpiredSessions(timeout);
  }
}

// 创建单例实例
const chatHistoryService = new ChatHistoryService();

module.exports = chatHistoryService; 