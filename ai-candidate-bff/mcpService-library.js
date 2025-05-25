const { createServer } = require('@jhgaylor/candidate-mcp-server');
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamablehttp.js");
require('dotenv').config();

class MCPLibraryService {
  constructor() {
    this.serverConfig = {
      name: "ai-candidate-bff-mcp",
      version: "1.0.0",
      mailgunApiKey: process.env.MAILGUN_API_KEY,
      mailgunDomain: process.env.MAILGUN_DOMAIN,
    };
    
    this.candidateConfig = {
      name: "陈嘉旭",
      email: "708980731@qq.com",
      resumeUrl: "",
      websiteUrl: "",
      linkedinUrl: "https://www.linkedin.com/in/jiaxu-chen-731896237/",
      githubUrl: "https://github.com/lukaliou123",
      resumeText: `{
        "name": "陈嘉旭",
        "position": "AI应用开发/Golang后端开发",
        // ... 其他简历内容
      }`
    };
  }

  // 创建服务器实例
  createServerInstance() {
    return createServer(this.serverConfig, this.candidateConfig);
  }

  // 处理MCP请求的Express中间件
  async handleMCPRequest(req, res) {
    try {
      const server = this.createServerInstance();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      
      res.on('close', () => {
        console.log('Request closed');
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

  // 直接调用MCP功能的方法
  async getResumeText() {
    const server = this.createServerInstance();
    // 这里需要实现直接调用服务器资源的逻辑
    // 或者通过内部HTTP请求
    return { text: this.candidateConfig.resumeText };
  }

  async getResumeUrl() {
    return { url: this.candidateConfig.resumeUrl };
  }

  async getLinkedinUrl() {
    return { url: this.candidateConfig.linkedinUrl };
  }

  async getGithubUrl() {
    return { url: this.candidateConfig.githubUrl };
  }

  async getWebsiteUrl() {
    return { url: this.candidateConfig.websiteUrl };
  }
}

module.exports = new MCPLibraryService(); 