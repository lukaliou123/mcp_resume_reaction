const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { CallbackHandler } = require("langfuse-langchain");
const { DynamicTool } = require("@langchain/core/tools");
const mcpService = require('./src/services/mcpService');
const chatHistoryService = require('./src/services/chatHistoryService');
const githubMCPService = require('./src/services/githubMCPService');

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

GitHub项目分析工具：
- mcp__github__analyze_repository：深度分析GitHub仓库架构、技术栈、代码质量
- mcp__github__get_repository_info：获取GitHub仓库基本信息
- mcp__github__get_file_content：获取仓库中特定文件内容

【工具选择策略】：
⚠️ 重要：优先使用细化工具，避免使用get_resume_text！

基础信息查询：
- 用户问"教育背景"、"学历"时 → 必须使用 get_education_background
- 用户问"工作经历"、"职业经验"时 → 必须使用 get_work_experience  
- 用户问"个人项目"时 → 必须使用 get_personal_projects
- 用户问"工作项目"时 → 必须使用 get_work_projects
- 用户问"项目经验"时 → 必须使用 get_personal_projects 和 get_work_projects
- 用户问"技能"、"技术能力"时 → 必须使用 get_skills
- 用户问"基本信息"、"联系方式"时 → 必须使用 get_basic_info
- 用户问"其他经历"、"非IT经验"时 → 必须使用 get_other_experience
- 只有在用户明确要求"完整简历"时才使用 get_resume_text

GitHub项目深度分析：
- 用户询问"详细了解某个项目"、"项目架构"、"技术实现"时 → 首先使用 get_personal_projects 获取项目列表，然后使用 mcp__github__analyze_repository 分析具体GitHub仓库
- 用户问"项目代码"、"仓库分析"、"技术栈详情"时 → 使用 mcp__github__analyze_repository
- 用户问"README"、"文档"、"具体文件"时 → 使用 mcp__github__get_file_content
- 用户问"项目基本信息"、"仓库状态"时 → 使用 mcp__github__get_repository_info

🔄 智能分析流程：
当用户表达想要"深入了解某个项目"时，按以下步骤执行：
1. 使用 get_personal_projects 获取项目列表和GitHub链接
2. 使用 mcp__github__analyze_repository 深度分析目标仓库
3. 基于分析结果，生成详细的项目报告和建议后续问题

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
      
      // GitHub项目分析工具
      new DynamicTool({
        name: "mcp__github__analyze_repository",
        description: "深度分析GitHub仓库的架构、技术栈、代码质量等。需要提供GitHub仓库URL。(Analyze GitHub repository architecture, tech stack, and code quality. Requires GitHub repository URL)",
        func: async (githubUrl) => {
          if (!(await githubMCPService.isAvailable())) {
            return JSON.stringify({
              error: "GitHub分析功能未启用或未配置GitHub Token",
              message: "请联系管理员配置GitHub Personal Access Token"
            });
          }
          
          try {
            const analysis = await githubMCPService.analyzeRepository(githubUrl);
            return JSON.stringify(analysis);
          } catch (error) {
            return JSON.stringify({
              error: "GitHub仓库分析失败",
              message: error.message,
              url: githubUrl
            });
          }
        },
      }),
      
      new DynamicTool({
        name: "mcp__github__get_repository_info",
        description: "获取GitHub仓库的基本信息，包括描述、语言、星数、更新时间等。(Get basic GitHub repository information including description, language, stars, update time)",
        func: async (githubUrl) => {
          if (!(await githubMCPService.isAvailable())) {
            return JSON.stringify({
              error: "GitHub功能未启用",
              message: "请联系管理员配置GitHub功能"
            });
          }
          
          try {
            const repoInfo = await githubMCPService.getRepositoryInfo(githubUrl);
            return JSON.stringify(repoInfo);
          } catch (error) {
            return JSON.stringify({
              error: "获取仓库信息失败",
              message: error.message,
              url: githubUrl
            });
          }
        },
      }),
      
      new DynamicTool({
        name: "mcp__github__get_file_content",
        description: "获取GitHub仓库中特定文件的内容，如README.md、package.json等。需要提供仓库URL和文件路径。(Get specific file content from GitHub repository like README.md, package.json. Requires repo URL and file path)",
        func: async (githubUrl, filePath = 'README.md') => {
          if (!(await githubMCPService.isAvailable())) {
            return JSON.stringify({
              error: "GitHub功能未启用",
              message: "请联系管理员配置GitHub功能"
            });
          }
          
          try {
            // 解析参数：如果githubUrl包含逗号，则分割为URL和文件路径
            let actualUrl = githubUrl;
            let actualPath = filePath;
            
            if (githubUrl.includes(',')) {
              const parts = githubUrl.split(',');
              actualUrl = parts[0].trim();
              actualPath = parts[1]?.trim() || 'README.md';
            }
            
            const fileContent = await githubMCPService.getFileContent(actualUrl, actualPath);
            return JSON.stringify(fileContent);
          } catch (error) {
            return JSON.stringify({
              error: "获取文件内容失败",
              message: error.message,
              url: githubUrl,
              path: filePath
            });
          }
        },
      }),
    ];
  }

  // 生成对话建议的方法
  async generateSuggestions(conversationContext, aiResponse, userMessage) {
    try {
      const suggestionPrompt = `
基于以下对话信息，生成2-3个相关的后续问题建议：

用户问题：${userMessage}
AI完整回复：${aiResponse}
对话上下文：${JSON.stringify(conversationContext.slice(-2))}

核心要求：
1. 仔细分析AI回复中提到的具体内容（项目名称、技术栈、公司名、具体经历等）
2. 基于这些具体实体生成针对性的深入问题，引导用户探索细节
3. 避免生成宽泛的通用问题，要针对具体内容提问
4. 问题长度控制在15字以内，自然口语化
5. 优先级：具体项目详情 > 技术实现细节 > 工作经历 > 通用问题
6. 避免重复已讨论的问题

生成策略：
- 如果提到具体项目名称，问项目的技术架构、难点、成果等
- 如果提到技术栈，问具体的使用场景、优化经验等  
- 如果提到工作经历，问具体职责、团队规模、业务成果等
- 如果提到教育背景，问专业课程、实践项目等

返回JSON格式：
{"suggestions": ["问题1", "问题2", "问题3"]}

示例分析：
如果AI回复提到"AI候选人BFF系统"、"MCP协议"、"OpenAI"，应该生成：
- "MCP协议有什么优势？"
- "系统架构是怎样的？"  
- "支持哪些AI提供商？"

而不是生成通用问题如"遇到什么挑战？"、"技术栈是什么？"
`;

      const result = await this.model.invoke([
        { role: "system", content: "你是一个专业的HR助手，擅长生成有价值的面试问题。请严格按照JSON格式返回结果。" },
        { role: "user", content: suggestionPrompt }
      ], {
        callbacks: [this.langfuseHandler],
        metadata: {
          type: "suggestion_generation",
          user_query: userMessage,
          timestamp: new Date().toISOString(),
        },
      });
      
      console.log("🤖 Suggestion generation result:", result.content);
      
      // 尝试解析JSON
      const cleanContent = result.content.trim();
      let parsedResult;
      
      // 处理可能的markdown代码块包装
      if (cleanContent.startsWith('```json')) {
        const jsonMatch = cleanContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[1]);
        }
      } else if (cleanContent.startsWith('```')) {
        const jsonMatch = cleanContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[1]);
        }
      } else {
        parsedResult = JSON.parse(cleanContent);
      }
      
      // 验证结果格式
      if (parsedResult && Array.isArray(parsedResult.suggestions)) {
        console.log("✅ Generated suggestions:", parsedResult.suggestions);
        return parsedResult;
      } else {
        console.warn("⚠️ Invalid suggestion format:", parsedResult);
        return { suggestions: [] };
      }
      
    } catch (error) {
      console.error('❌ Failed to generate suggestions:', error);
      
      // 记录错误到 LangFuse
      if (this.langfuseHandler) {
        this.langfuseHandler.handleLLMError(error, {
          type: "suggestion_generation_error",
          user_query: userMessage,
          error_type: error.constructor.name,
          timestamp: new Date().toISOString(),
        });
      }
      
      // 返回默认建议
      return { 
        suggestions: [
          "能详细说说吗？",
          "还有其他的吗？",
          "技术栈是什么？"
        ]
      };
    }
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

      // 生成对话建议（并行处理以提高性能）
      console.log("🎯 Generating conversation suggestions...");
      const suggestions = await this.generateSuggestions(
        chatHistory,
        finalText,
        userMessage
      );
    
      return { 
        text: finalText,
        suggestions: suggestions.suggestions || []
      };
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