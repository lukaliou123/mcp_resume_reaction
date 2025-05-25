const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { CallbackHandler } = require("langfuse-langchain");
const { DynamicTool } = require("@langchain/core/tools");
const mcpService = require('./src/services/mcpService');

const SYSTEM_PROMPT = `你是一个专业的招聘助手，负责为用户介绍和解答关于候选人"陈嘉旭"的各类信息。你可以调用多种工具获取候选人的简历、教育背景、工作经历、项目经验、技能特长、社交媒体链接等结构化数据。
你的目标是：
- 充分理解用户的真实意图，判断需要调用哪些工具获取信息。
- 综合 MCP 工具返回的内容，用自然、友好、专业的语言回答用户问题。
- 回答要突出候选人的优势和亮点，避免机械地罗列信息。
- 如果信息不足，要坦诚说明，不要编造内容。
- 回答要简明扼要，结构清晰，适合在聊天界面展示。
请根据用户的问题和你获取到的候选人信息，生成最合适的回复。
【候选人信息工具包括但不限于】：
- get_resume_text：获取候选人简历文本
- get_resume_url：获取候选人简历链接
- get_linkedin_url：获取LinkedIn链接
- get_github_url：获取GitHub主页
- get_website_url：获取个人网站
- 其他定制化工具
【示例】：
- 用户问"候选人有哪些技术能力？"时，你应调用相关工具，提炼技能亮点，结构化地回答。
- 用户问"能介绍一下候选人的背景吗？"时，你应综合简历、教育、工作经历等信息，简明扼要地介绍。
请始终以专业、友好、可信赖的语气作答。`;

class LLMService {
  constructor() {
    this.agent = null;
    this.langfuseHandler = null;
    this._initAgent();
  }

  async _initAgent() {
    // 初始化 LangFuse 回调处理器
    this.langfuseHandler = new CallbackHandler({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL,
    });

    console.log("🔧 LangFuse配置:", {
      publicKey: process.env.LANGFUSE_PUBLIC_KEY ? `${process.env.LANGFUSE_PUBLIC_KEY.substring(0, 10)}...` : 'Not set',
      secretKey: process.env.LANGFUSE_SECRET_KEY ? `${process.env.LANGFUSE_SECRET_KEY.substring(0, 10)}...` : 'Not set',
      baseUrl: process.env.LANGFUSE_BASE_URL || 'Not set'
    });

    // 创建集成的MCP工具
    this.tools = this._createIntegratedMCPTools();
    console.log("Loaded integrated MCP tools:", this.tools.map(t => t.name));
    
    // 根据区域配置选择AI提供商
    const aiConfig = this._getAIConfig();
    console.log("🤖 AI提供商配置:", {
      area: aiConfig.area,
      provider: aiConfig.provider,
      model: aiConfig.model,
      baseUrl: aiConfig.baseUrl
    });
    
    this.model = new ChatOpenAI({
      openAIApiKey: aiConfig.apiKey,
      modelName: aiConfig.model,
      temperature: 0.2,
      configuration: {
        baseURL: aiConfig.baseUrl,
      },
      // 添加 LangFuse 回调处理器
      callbacks: [this.langfuseHandler],
    });
    
    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
    });

    console.log(`✅ LLM Service initialized with ${aiConfig.provider} and LangFuse monitoring`);
  }

  // 根据区域配置获取AI提供商配置
  _getAIConfig() {
    const area = process.env.AI_PROVIDER_AREA || 'global';
    
    if (area === 'cn') {
      // 使用阿里云通义千问
      return {
        area: 'cn',
        provider: 'Alibaba Qwen',
        apiKey: process.env.DASHSCOPE_API_KEY,
        model: process.env.DASHSCOPE_MODEL || 'qwen-turbo-latest',
        baseUrl: process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      };
    } else {
      // 默认使用OpenAI (global)
      return {
        area: 'global',
        provider: 'OpenAI',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
      };
    }
  }

  // 创建集成的MCP工具
  _createIntegratedMCPTools() {
    return [
      new DynamicTool({
        name: "mcp__candidate__get_resume_text",
        description: "Get the candidate's resume text with detailed information",
        func: async () => {
          const result = await mcpService.getResumeText();
          return JSON.stringify(result.text);
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_resume_url",
        description: "Get the candidate's resume URL",
        func: async () => {
          const result = await mcpService.getResumeUrl();
          return result.url;
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_linkedin_url",
        description: "Get the candidate's LinkedIn profile URL",
        func: async () => {
          const result = await mcpService.getLinkedinUrl();
          return result.url;
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_github_url",
        description: "Get the candidate's GitHub profile URL",
        func: async () => {
          const result = await mcpService.getGithubUrl();
          return result.url;
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_website_url",
        description: "Get the candidate's personal website URL",
        func: async () => {
          const result = await mcpService.getWebsiteUrl();
          return result.url;
        },
      }),
    ];
  }

  async processQuery(userMessage) {
    if (!this.agent) {
      await new Promise(resolve => {
        const checkAgent = () => {
          if (this.agent) resolve();
          else setTimeout(checkAgent, 100);
        };
        checkAgent();
      });
    }

    try {
      // 为每个查询创建一个新的 trace
      const result = await this.agent.invoke({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
      }, {
        // 添加 LangFuse 回调配置
        callbacks: [this.langfuseHandler],
        metadata: {
          user_query: userMessage,
          timestamp: new Date().toISOString(),
          service: "ai-candidate-bff",
          mode: "integrated-mcp",
        },
      });

      console.log("Agent invoke result:", result);
    
      // 从 messages 数组中提取最后一个 AIMessage 的 content
      let finalText = "未获取到结果";
      if (result && Array.isArray(result.messages)) {
        // 找到最后一个 AIMessage
        const lastAI = [...result.messages].reverse().find(
          msg => msg.constructor.name === "AIMessage" && msg.content
        );
        if (lastAI && lastAI.content) {
          finalText = lastAI.content;
        }
      } else if (result.output || result.text) {
        finalText = result.output || result.text;
      }
    
      return { text: finalText };
    } catch (error) {
      console.error("Error in LLM processing:", error);
      
      // 记录错误到 LangFuse
      if (this.langfuseHandler) {
        this.langfuseHandler.handleLLMError(error, {
          user_query: userMessage,
          error_type: error.constructor.name,
          timestamp: new Date().toISOString(),
        });
      }
      
      throw error;
    }
  }
}

const llmService = new LLMService();
module.exports = llmService;