const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

class MCPService {
  constructor() {
    this.mcpProcess = null;
    this.mcpServerPath = process.env.MCP_SERVER_PATH || '../node-candidate-mcp-server/examples/stdio.ts';
    this.isReady = false;
    this.responseHandlers = new Map();
    this.nextRequestId = 1;
  }

  // 启动MCP Server子进程
  start() {
    try {
      // 使用ts-node运行MCP Server脚本
      const absolutePath = path.resolve(process.cwd(), this.mcpServerPath);
      console.log(`Starting MCP Server from: ${absolutePath}`);
      
      // 使用ts-node运行TypeScript文件
      this.mcpProcess = spawn('npx', ['ts-node', absolutePath], {
        cwd: path.dirname(absolutePath),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // 设置子进程输出数据处理
      this.mcpProcess.stdout.on('data', (data) => {
        const responseStr = data.toString().trim();
        console.log(`MCP Server Response: ${responseStr}`);
        
        try {
          const response = JSON.parse(responseStr);
          // 如果响应包含id，使用它来找到对应的请求处理器
          if (response.id && this.responseHandlers.has(response.id)) {
            const handler = this.responseHandlers.get(response.id);
            this.responseHandlers.delete(response.id);
            handler.resolve(response);
          }
        } catch (error) {
          console.error('Error parsing MCP Server response:', error);
        }
      });

      // 处理子进程的错误输出
      this.mcpProcess.stderr.on('data', (data) => {
        console.error(`MCP Server Error: ${data.toString()}`);
      });

      // 处理子进程退出事件
      this.mcpProcess.on('close', (code) => {
        console.log(`MCP Server process exited with code ${code}`);
        this.isReady = false;
        this.mcpProcess = null;
      });

      // 处理子进程错误事件
      this.mcpProcess.on('error', (error) => {
        console.error('Failed to start MCP Server:', error);
        this.isReady = false;
        this.mcpProcess = null;
      });

      this.isReady = true;
      console.log('MCP Server started successfully');
      return true;
    } catch (error) {
      console.error('Error starting MCP Server:', error);
      return false;
    }
  }

  // 停止MCP Server子进程
  stop() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.isReady = false;
      console.log('MCP Server stopped');
    }
  }

  // 发送请求给MCP Server并等待响应
  async sendRequest(method, params) {
    if (!this.mcpProcess || !this.isReady) {
      if (!this.start()) {
        throw new Error('Failed to start MCP Server');
      }
    }

    const requestId = this.nextRequestId++;
    const request = {
      jsonrpc: '2.0',
      id: requestId,
      method,
      params
    };

    const requestStr = JSON.stringify(request);
    console.log(`Sending request to MCP Server: ${requestStr}`);

    return new Promise((resolve, reject) => {
      // 设置超时处理
      const timeoutId = setTimeout(() => {
        if (this.responseHandlers.has(requestId)) {
          this.responseHandlers.delete(requestId);
          reject(new Error('MCP Server request timed out'));
        }
      }, 30000); // 30秒超时

      // 存储请求处理器
      this.responseHandlers.set(requestId, {
        resolve: (response) => {
          clearTimeout(timeoutId);
          resolve(response);
        },
        reject
      });

      // 写入请求到子进程的标准输入
      this.mcpProcess.stdin.write(requestStr + '\n');
    });
  }

  // 读取候选人资源
  async readResource(uri) {
    return this.sendRequest('resources/read', { uri });
  }

  // 调用工具
  async callTool(toolName, args = {}) {
    return this.sendRequest('tools/call', { name: toolName, args });
  }

  // 获取简历文本
  async getResumeText() {
    return this.readResource('candidate-info://resume-text');
  }

  // 获取简历URL
  async getResumeUrl() {
    return this.readResource('candidate-info://resume-url');
  }

  // 获取LinkedIn URL
  async getLinkedinUrl() {
    return this.readResource('candidate-info://linkedin-url');
  }

  // 获取GitHub URL
  async getGithubUrl() {
    return this.readResource('candidate-info://github-url');
  }

  // 获取个人网站URL
  async getWebsiteUrl() {
    return this.readResource('candidate-info://website-url');
  }
}

// 创建一个单例实例
const mcpService = new MCPService();

module.exports = mcpService; 