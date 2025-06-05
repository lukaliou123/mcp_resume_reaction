const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * GitHub API缓存服务
 * 实现双层缓存：内存缓存(快速访问) + 文件缓存(持久化)
 */
class GitHubCacheService {
  constructor() {
    // 内存缓存
    this.memoryCache = new Map();
    
    // 缓存配置
    this.config = {
      // 仓库信息缓存时间 (24小时)
      repositoryInfoTTL: 24 * 60 * 60 * 1000,
      // 分析结果缓存时间 (7天) 
      analysisResultTTL: 7 * 24 * 60 * 60 * 1000,
      // 用户仓库列表缓存时间 (6小时)
      userRepositoriesTTL: 6 * 60 * 60 * 1000,
      // 文件缓存目录
      cacheDir: path.join(__dirname, '../../cache/github'),
      // 最大内存缓存条目数
      maxMemoryCacheSize: 1000,
      // 缓存清理间隔 (1小时)
      cleanupInterval: 60 * 60 * 1000
    };
    
    // 缓存统计
    this.stats = {
      hits: 0,
      misses: 0,
      memoryHits: 0,
      fileHits: 0,
      totalRequests: 0
    };
    
    // 初始化
    this._init();
  }

  async _init() {
    try {
      // 确保缓存目录存在
      await fs.mkdir(this.config.cacheDir, { recursive: true });
      
      // 启动定期清理
      this._startCleanupTimer();
      
      console.log('🗃️ GitHub Cache Service initialized:', {
        cacheDir: this.config.cacheDir,
        maxMemorySize: this.config.maxMemoryCacheSize
      });
    } catch (error) {
      console.error('Failed to initialize GitHub cache service:', error);
    }
  }

  /**
   * 生成缓存key
   * @param {string} type - 缓存类型 (repository_info, analysis_result, user_repositories)
   * @param {string} identifier - 标识符 (URL或用户名)
   * @returns {string} 缓存key
   */
  _generateCacheKey(type, identifier) {
    const hash = crypto.createHash('md5').update(identifier).digest('hex');
    return `${type}_${hash}`;
  }

  /**
   * 获取TTL
   * @param {string} type - 缓存类型
   * @returns {number} TTL(毫秒)
   */
  _getTTL(type) {
    switch (type) {
      case 'repository_info':
        return this.config.repositoryInfoTTL;
      case 'analysis_result':
        return this.config.analysisResultTTL;
      case 'user_repositories':
        return this.config.userRepositoriesTTL;
      default:
        return this.config.repositoryInfoTTL;
    }
  }

  /**
   * 缓存数据
   * @param {string} type - 缓存类型
   * @param {string} identifier - 标识符
   * @param {any} data - 要缓存的数据
   */
  async set(type, identifier, data) {
    const key = this._generateCacheKey(type, identifier);
    const ttl = this._getTTL(type);
    const expiresAt = Date.now() + ttl;
    
    const cacheEntry = {
      data,
      expiresAt,
      type,
      identifier,
      createdAt: Date.now()
    };

    try {
      // 内存缓存
      this._setMemoryCache(key, cacheEntry);
      
      // 文件缓存
      await this._setFileCache(key, cacheEntry);
      
      console.log(`📦 Cached ${type}:`, {
        key: key.substring(0, 16) + '...',
        identifier,
        size: JSON.stringify(data).length,
        expiresAt: new Date(expiresAt).toISOString()
      });
    } catch (error) {
      console.error(`Failed to cache ${type}:`, error);
    }
  }

  /**
   * 获取缓存数据
   * @param {string} type - 缓存类型
   * @param {string} identifier - 标识符
   * @returns {any|null} 缓存的数据或null
   */
  async get(type, identifier) {
    const key = this._generateCacheKey(type, identifier);
    this.stats.totalRequests++;
    
    try {
      // 先查内存缓存
      let cacheEntry = this._getMemoryCache(key);
      if (cacheEntry) {
        if (this._isExpired(cacheEntry)) {
          this._removeMemoryCache(key);
        } else {
          this.stats.hits++;
          this.stats.memoryHits++;
          console.log(`🎯 Memory cache hit for ${type}:`, identifier);
          return cacheEntry.data;
        }
      }
      
      // 再查文件缓存
      cacheEntry = await this._getFileCache(key);
      if (cacheEntry) {
        if (this._isExpired(cacheEntry)) {
          await this._removeFileCache(key);
        } else {
          // 重新放入内存缓存
          this._setMemoryCache(key, cacheEntry);
          this.stats.hits++;
          this.stats.fileHits++;
          console.log(`💾 File cache hit for ${type}:`, identifier);
          return cacheEntry.data;
        }
      }
      
      // 缓存未命中
      this.stats.misses++;
      console.log(`❌ Cache miss for ${type}:`, identifier);
      return null;
      
    } catch (error) {
      console.error(`Failed to get cache for ${type}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0 
      ? ((this.stats.hits / this.stats.totalRequests) * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memorySize: this.memoryCache.size
    };
  }

  // ============ 私有方法 ============

  /**
   * 设置内存缓存
   */
  _setMemoryCache(key, entry) {
    // 如果超过最大大小，删除最旧的条目
    if (this.memoryCache.size >= this.config.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(key, entry);
  }

  /**
   * 获取内存缓存
   */
  _getMemoryCache(key) {
    return this.memoryCache.get(key);
  }

  /**
   * 删除内存缓存
   */
  _removeMemoryCache(key) {
    this.memoryCache.delete(key);
  }

  /**
   * 设置文件缓存
   */
  async _setFileCache(key, entry) {
    const filePath = path.join(this.config.cacheDir, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
  }

  /**
   * 获取文件缓存
   */
  async _getFileCache(key) {
    try {
      const filePath = path.join(this.config.cacheDir, `${key}.json`);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error reading file cache:', error);
      }
      return null;
    }
  }

  /**
   * 删除文件缓存
   */
  async _removeFileCache(key) {
    try {
      const filePath = path.join(this.config.cacheDir, `${key}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error removing file cache:', error);
      }
    }
  }

  /**
   * 检查缓存条目是否过期
   */
  _isExpired(entry) {
    return Date.now() > entry.expiresAt;
  }

  /**
   * 启动定期清理定时器
   */
  _startCleanupTimer() {
    setInterval(() => {
      // 简化版定期清理
      for (const [key, entry] of this.memoryCache) {
        if (this._isExpired(entry)) {
          this.memoryCache.delete(key);
        }
      }
    }, this.config.cleanupInterval);
  }
}

module.exports = GitHubCacheService; 