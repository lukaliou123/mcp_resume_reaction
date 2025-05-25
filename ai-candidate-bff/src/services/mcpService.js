const { createServer } = require('../mcp-server');
const { StreamableHTTPServerTransport } = require("../../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/streamableHttp.js");
const candidateConfig = require('../../config/candidate');
const serverConfig = require('../../config/server');

class MCPService {
  constructor() {
    this.serverConfig = serverConfig;
    this.candidateConfig = candidateConfig;
  }

  // 创建MCP服务器实例
  createServerInstance() {
    return createServer(this.serverConfig, this.candidateConfig);
  }

  // 处理MCP HTTP请求的中间件
  async handleMCPRequest(req, res) {
    try {
      const server = this.createServerInstance();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      
      res.on('close', () => {
        console.log('MCP request closed');
        transport.close();
        server.close();
      });
      
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  }

  // 直接调用MCP功能的方法（用于测试和内部调用）
  async getResumeText() {
    return { 
      text: this.candidateConfig.resumeText,
      source: 'integrated-mcp-server'
    };
  }

  async getResumeUrl() {
    return { 
      url: this.candidateConfig.resumeUrl || "Resume URL not available",
      source: 'integrated-mcp-server'
    };
  }

  async getLinkedinUrl() {
    return { 
      url: this.candidateConfig.linkedinUrl || "LinkedIn URL not available",
      source: 'integrated-mcp-server'
    };
  }

  async getGithubUrl() {
    return { 
      url: this.candidateConfig.githubUrl || "GitHub URL not available",
      source: 'integrated-mcp-server'
    };
  }

  async getWebsiteUrl() {
    return { 
      url: this.candidateConfig.websiteUrl || "Website URL not available",
      source: 'integrated-mcp-server'
    };
  }

  async getWebsiteText() {
    return { 
      text: this.candidateConfig.websiteText || "Website text not available",
      source: 'integrated-mcp-server'
    };
  }

  // 停止服务（兼容性方法，新架构下不需要）
  stop() {
    console.log('MCP Service: No processes to stop (integrated mode)');
  }
}

// 创建单例实例
const mcpService = new MCPService();

module.exports = mcpService; 