const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { CallbackHandler } = require("langfuse-langchain");
const { DynamicTool } = require("@langchain/core/tools");
const mcpService = require('./src/services/mcpService');
const chatHistoryService = require('./src/services/chatHistoryService');

const SYSTEM_PROMPT = `你是一个专业的招聘助手，负责为用户介绍和解答关于候选人"陈嘉旭"的各类信息。你可以调用多种工具获取候选人的简历、教育背景、工作经历、项目经验、技能特长、社交媒体链接等结构化数据。
你的目标是：
- 充分理解用户的真实意图，判断需要调用哪些工具获取信息。
- 优先使用细化的工具获取特定信息，避免调用完整简历工具造成token浪费。
- 综合 MCP 工具返回的内容，用自然、友好、专业的语言回答用户问题。
- 回答要突出候选人的优势和亮点，避免机械地罗列信息。
- 如果信息不足，要坦诚说明，不要编造内容。
- 回答要简明扼要，结构清晰，适合在聊天界面展示。
请根据用户的问题和你获取到的候选人信息，生成最合适的回复。

【可用的候选人信息工具】：
细化工具（优先使用）：
- get_education_background：获取教育背景、学历信息
- get_work_experience：获取工作经历、职业经验
- get_personal_projects：获取个人项目经历
- get_work_projects：获取工作项目经历
- get_skills：获取技能特长、技术能力
- get_other_experience：获取其他经历、非IT经历
- get_basic_info：获取基本信息、联系方式

链接工具：
- get_resume_url：获取简历链接
- get_linkedin_url：获取LinkedIn链接
- get_github_url：获取GitHub主页
- get_website_url：获取个人网站

备用工具：
- get_resume_text：获取完整简历（仅在需要全面信息时使用）

【工具选择策略】：
⚠️ 重要：优先使用细化工具，避免使用get_resume_text！
- 用户问"教育背景"、"学历"时 → 必须使用 get_education_background
- 用户问"工作经历"、"职业经验"时 → 必须使用 get_work_experience  
- 用户问"个人项目"时 → 必须使用 get_personal_projects
- 用户问"工作项目"时 → 必须使用 get_work_projects
- 用户问"项目经验"时 → 必须使用 get_personal_projects 和 get_work_projects
- 用户问"技能"、"技术能力"时 → 必须使用 get_skills
- 用户问"基本信息"、"联系方式"时 → 必须使用 get_basic_info
- 用户问"其他经历"、"非IT经验"时 → 必须使用 get_other_experience
- 只有在用户明确要求"完整简历"时才使用 get_resume_text

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
      // 细化的简历信息工具
      new DynamicTool({
        name: "mcp__candidate__get_education_background",
        description: "获取候选人的教育背景、学历、教育经历信息 (Get candidate's education background, academic qualifications, educational experience)",
        func: async () => {
          const result = await mcpService.getEducationBackground();
          return JSON.stringify(result);
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_work_experience",
        description: "获取候选人的工作经历、职业经验信息 (Get candidate's work experience, professional background)",
        func: async () => {
          const result = await mcpService.getWorkExperience();
          return JSON.stringify(result);
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_personal_projects",
        description: "获取候选人的个人项目、业余项目经历 (Get candidate's personal projects, side projects)",
        func: async () => {
          const result = await mcpService.getPersonalProjects();
          return JSON.stringify(result);
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_work_projects",
        description: "获取候选人的工作项目、职业项目经历 (Get candidate's work projects, professional projects)",
        func: async () => {
          const result = await mcpService.getWorkProjects();
          return JSON.stringify(result);
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_skills",
        description: "获取候选人的技能特长、技术能力信息 (Get candidate's skills, technical abilities, competencies)",
        func: async () => {
          const result = await mcpService.getSkills();
          return JSON.stringify(result);
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_other_experience",
        description: "获取候选人的其他经历、非IT经历、额外经验 (Get candidate's other experience, non-IT background, additional experience)",
        func: async () => {
          const result = await mcpService.getOtherExperience();
          return JSON.stringify(result);
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_basic_info",
        description: "获取候选人的基本信息、联系方式、个人资料 (Get candidate's basic information, contact details, personal profile)",
        func: async () => {
          const result = await mcpService.getBasicInfo();
          return JSON.stringify(result);
        },
      }),
      // 保留原有的完整简历工具作为备用
      new DynamicTool({
        name: "mcp__candidate__get_resume_text",
        description: "获取候选人的完整简历文本信息 (Get the candidate's complete resume text with all detailed information)",
        func: async () => {
          const result = await mcpService.getResumeText();
          return JSON.stringify(result.text);
        },
      }),
      // 链接相关工具
      new DynamicTool({
        name: "mcp__candidate__get_resume_url",
        description: "获取候选人的简历链接 (Get the candidate's resume URL)",
        func: async () => {
          const result = await mcpService.getResumeUrl();
          return result.url;
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_linkedin_url",
        description: "获取候选人的LinkedIn链接 (Get the candidate's LinkedIn profile URL)",
        func: async () => {
          const result = await mcpService.getLinkedinUrl();
          return result.url;
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_github_url",
        description: "获取候选人的GitHub链接 (Get the candidate's GitHub profile URL)",
        func: async () => {
          const result = await mcpService.getGithubUrl();
          return result.url;
        },
      }),
      new DynamicTool({
        name: "mcp__candidate__get_website_url",
        description: "获取候选人的个人网站链接 (Get the candidate's personal website URL)",
        func: async () => {
          const result = await mcpService.getWebsiteUrl();
          return result.url;
        },
      }),
    ];
  }

  async processQuery(userMessage, sessionId = 'default') {
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
      // 获取对话历史
      const chatHistory = await chatHistoryService.getFormattedHistory(sessionId);
      
      // 构建完整的消息数组
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory,
        { role: "user", content: userMessage }
      ];

      console.log(`💬 Processing query with ${chatHistory.length} history messages for session: ${sessionId}`);

      // 保存用户消息到历史
      await chatHistoryService.addMessage(sessionId, 'user', userMessage);

      // 为每个查询创建一个新的 trace
      const result = await this.agent.invoke({
        messages: messages,
      }, {
        // 添加 LangFuse 回调配置
        callbacks: [this.langfuseHandler],
        metadata: {
          user_query: userMessage,
          session_id: sessionId,
          history_length: chatHistory.length,
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

      // 保存AI回复到历史
      await chatHistoryService.addMessage(sessionId, 'assistant', finalText);
    
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