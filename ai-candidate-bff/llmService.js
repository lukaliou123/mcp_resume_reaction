const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { CallbackHandler } = require("langfuse-langchain");
const { DynamicTool } = require("@langchain/core/tools");
const mcpService = require('./src/services/mcpService');
const chatHistoryService = require('./src/services/chatHistoryService');
const GitHubMCPService = require('./src/services/githubMCPService');
const ConversationContextService = require('./src/services/conversationContextService');
const ToolCallMonitorService = require('./src/services/toolCallMonitorService');

const { getTexts } = require('./config/i18n');

// 动态获取系统提示词
function getSystemPrompt() {
  const texts = getTexts();
  return texts.systemPrompt + `你可以调用多种工具获取候选人的简历、教育背景、工作经历、项目经验、技能特长、社交媒体链接等结构化数据。
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
- mcp__github__handle_url：智能处理GitHub URL，支持用户主页和仓库URL
- mcp__github__get_user_repositories：获取GitHub用户的公开仓库列表

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

🔗 个人项目展示策略：
当回答个人项目相关问题时，**必须遵循以下格式**：
1. 项目介绍后，主动显示GitHub链接：📋 **GitHub仓库**: [项目名称](GitHub链接)
2. 在回答末尾添加友好提示：💡 **想深入了解项目代码和架构？** 您可以直接发送GitHub链接给我，我可以帮您分析项目的技术实现、代码结构和架构设计！

GitHub项目深度分析：
⚠️ 重要：对于任何GitHub URL，优先使用智能处理工具！

🎯 GitHub URL处理优先级：
1. 【优先】遇到任何GitHub URL时 → 首先使用 mcp__github__handle_url 智能处理
   - 此工具能自动识别URL类型（用户主页/仓库）并返回相应内容
   - 用户主页会返回仓库列表，仓库URL会返回仓库信息
2. 【次选】如果需要深度分析特定仓库 → 使用 mcp__github__analyze_repository
3. 【特殊】如果需要特定文件内容 → 使用 mcp__github__get_file_content

具体策略：
- 用户询问"详细了解某个项目"、"项目架构"、"技术实现"时：
  1. 使用 get_personal_projects 获取项目列表
  2. 从项目信息中提取GitHub URL
  3. 使用 mcp__github__analyze_repository 深度分析该仓库
- 用户直接提供GitHub URL时 → 【必须】使用 mcp__github__handle_url 智能处理
- 用户问"项目代码"、"仓库分析"、"技术栈详情"时 → 使用 mcp__github__analyze_repository
- 用户问"README"、"文档"、"具体文件"时 → 使用 mcp__github__get_file_content

🔄 智能分析流程：
当用户表达想要"深入了解某个项目"时，按以下步骤执行：
1. 使用 get_personal_projects 获取项目列表和GitHub链接
2. 使用 mcp__github__analyze_repository 深度分析目标仓库
3. 基于分析结果，生成详细的项目报告和建议后续问题

请始终以专业、友好、可信赖的语气作答。`;
}

class LLMService {
  constructor() {
    this.agent = null;
    this.langfuseHandler = null;
    this.contextService = new ConversationContextService();
    this.monitorService = new ToolCallMonitorService();
    this.githubMCPService = new GitHubMCPService();
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

    // 创建基础的MCP工具（不包含sessionId）
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
      streaming: true, // 🔧 启用流式处理
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
  _createIntegratedMCPTools(sessionId = null) {
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
          if (!(await this.githubMCPService.isAvailable())) {
            return JSON.stringify({
              error: "GitHub分析功能未启用或未配置GitHub Token",
              message: "请联系管理员配置GitHub Personal Access Token"
            });
          }
          
          try {
            const analysis = await this.githubMCPService.analyzeRepository(githubUrl);
            
            // 🧠 自动存储分析结果到上下文中
            if (sessionId && this.contextService) {
              await this.contextService.storeGitHubAnalysisResult(sessionId, githubUrl, analysis);
              console.log(`🧠 Stored analysis result for ${analysis.repository_info?.name} in session ${sessionId}`);
            }
            
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
          if (!(await this.githubMCPService.isAvailable())) {
            return JSON.stringify({
              error: "GitHub功能未启用",
              message: "请联系管理员配置GitHub功能"
            });
          }
          
          try {
            const repoInfo = await this.githubMCPService.getRepositoryInfo(githubUrl);
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
          if (!(await this.githubMCPService.isAvailable())) {
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
            
            const fileContent = await this.githubMCPService.getFileContent(actualUrl, actualPath);
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
      
      // 新增：智能GitHub URL处理工具 (支持用户主页)
      new DynamicTool({
        name: "mcp__github__handle_url",
        description: "智能处理GitHub URL，支持用户主页和仓库URL。用户主页将返回仓库列表，仓库URL将返回仓库信息。(Intelligently handle GitHub URLs, supporting both user profiles and repository URLs)",
        func: async (githubUrl) => {
          if (!(await this.githubMCPService.isAvailable())) {
            return JSON.stringify({
              error: "GitHub功能未启用",
              message: "请联系管理员配置GitHub功能"
            });
          }
          
          try {
            const result = await this.githubMCPService.handleGitHubUrl(githubUrl);
            return JSON.stringify(result);
          } catch (error) {
            return JSON.stringify({
              error: "处理GitHub URL失败",
              message: error.message,
              url: githubUrl
            });
          }
        },
      }),
      
      // 新增：获取用户仓库列表工具
      new DynamicTool({
        name: "mcp__github__get_user_repositories",
        description: "获取GitHub用户的公开仓库列表，按星数排序。需要提供用户名。(Get GitHub user's public repositories sorted by stars. Requires username)",
        func: async (username) => {
          if (!(await this.githubMCPService.isAvailable())) {
            return JSON.stringify({
              error: "GitHub功能未启用",
              message: "请联系管理员配置GitHub功能"
            });
          }
          
          try {
            const repos = await this.githubMCPService.getUserRepositories(username);
            return JSON.stringify({
              username: username,
              repositories: repos,
              total_count: repos.length
            });
          } catch (error) {
            return JSON.stringify({
              error: "获取用户仓库失败",
              message: error.message,
              username: username
            });
          }
        },
      }),
    ];
  }

  // 创建带监控的工具
  _createMonitoredTools(sessionId, userQuery, res = null) {
    const toolsCalled = [];
    const baseTools = this._createIntegratedMCPTools(sessionId);
    
    const monitoredTools = baseTools.map(tool => {
      const originalFunc = tool.func;
      
      // 创建新的DynamicTool，保持完整的工具结构和invoke方法
      return new DynamicTool({
        name: tool.name,
        description: tool.description,
        func: async (...args) => {
          console.log(`🔧 [Monitor] Tool Called: ${tool.name}`);
          toolsCalled.push(tool.name);
          
          // 🔧 如果有SSE响应对象，发送工具开始信号
          if (res) {
            res.write(`data: ${JSON.stringify({
              type: 'tool_start',
              tool: tool.name,
              message: `正在调用工具: ${tool.name}...`
            })}\n\n`);
          }
          
          const toolStartTime = Date.now();
          try {
            const result = await originalFunc(...args);
            const toolEndTime = Date.now();
            console.log(`⏱️ [Monitor] Tool ${tool.name} completed in ${toolEndTime - toolStartTime}ms`);
            
            // 🔧 如果有SSE响应对象，发送工具完成信号
            if (res) {
              res.write(`data: ${JSON.stringify({
                type: 'tool_end',
                tool: tool.name,
                message: `工具 ${tool.name} 调用完成`
              })}\n\n`);
            }
            
            return result;
          } catch (error) {
            const toolEndTime = Date.now();
            console.error(`❌ [Monitor] Tool ${tool.name} failed after ${toolEndTime - toolStartTime}ms:`, error.message);
            
            // 🔧 如果有SSE响应对象，发送工具错误信号
            if (res) {
              res.write(`data: ${JSON.stringify({
                type: 'tool_error',
                tool: tool.name,
                message: `工具 ${tool.name} 调用失败: ${error.message}`
              })}\n\n`);
            }
            
            throw error;
          }
        }
      });
    });
    
    return {
      tools: monitoredTools,
      toolsCalled
    };
  }

  // 生成对话建议的方法
  async generateSuggestions(conversationContext, aiResponse, userMessage) {
    try {
      // 获取当前语言的文本配置
      const texts = getTexts();
      
      // 根据语言构建不同的提示词
      const suggestionPrompt = texts.suggestionPrompt + `

${texts.title.includes('Assistant') ? 'User Question' : '用户问题'}：${userMessage}
${texts.title.includes('Assistant') ? 'AI Complete Reply' : 'AI完整回复'}：${aiResponse}
${texts.title.includes('Assistant') ? 'Conversation Context' : '对话上下文'}：${JSON.stringify(conversationContext.slice(-2))}

${texts.title.includes('Assistant') ? 
`Core Requirements:
1. Carefully analyze the specific content mentioned in the AI reply (project names, tech stacks, company names, specific experiences, etc.)
2. Generate targeted in-depth questions based on these specific entities to guide users to explore details
3. Avoid generating broad generic questions, focus on specific content
4. Keep questions under 15 words, natural and conversational
5. Priority: GitHub code analysis > specific project details > technical implementation details > work experience > general questions
6. Avoid repeating already discussed questions` :
`核心要求：
1. 仔细分析AI回复中提到的具体内容（项目名称、技术栈、公司名、具体经历等）
2. 基于这些具体实体生成针对性的深入问题，引导用户探索细节
3. 避免生成宽泛的通用问题，要针对具体内容提问
4. 问题长度控制在15字以内，自然口语化
5. 优先级：GitHub代码分析 > 具体项目详情 > 技术实现细节 > 工作经历 > 通用问题
6. 避免重复已讨论的问题`}

${texts.title.includes('Assistant') ? 
`🔗 GitHub Analysis Priority Strategy:
- **Highest Priority**: If AI reply contains GitHub links or project names, must prioritize generating GitHub analysis questions
- Format: "Can you analyze the content in [project name] GitHub repository?"
- Example: If mentioning "AI Candidate BFF System" project, should generate "Can you analyze the content in AI Candidate BFF System GitHub repository?"

Generation Strategy:
- If specific project names with GitHub links are mentioned, prioritize GitHub code analysis questions
- If tech stacks are mentioned, ask about specific use cases, optimization experiences, etc.
- If work experience is mentioned, ask about specific responsibilities, team size, business outcomes, etc.
- If educational background is mentioned, ask about courses, practical projects, etc.

Return JSON format:
{"suggestions": ["Question 1", "Question 2", "Question 3"]}

Example Analysis:
If AI reply mentions "AI Candidate BFF System" project (with GitHub link), should prioritize generating:
- "Can you analyze the AI Candidate BFF System GitHub repository?"
- "What are the advantages of MCP protocol?"
- "How is the system architecture designed?"

If AI reply mentions "Browser CoT" project, should generate:
- "Can you analyze the Browser CoT GitHub repository?"
- "How is chain of thought recording implemented?"

If AI reply mentions "Travel Assistant AI Agent" project, should generate:
- "Can you analyze the Travel Assistant GitHub repository?"
- "How is RAG + ReAct architecture designed?"

Rather than generating generic questions like "What challenges were encountered?" or "What tech stack was used?"` :
`🔗 GitHub分析优先策略：
- **最高优先级**：如果AI回复中包含GitHub链接或项目名称，必须优先生成GitHub分析问题
- 格式："能分析一下[项目名称]的Github库里的内容吗？"
- 示例：如果提到"AI候选人BFF系统"项目，应生成"能分析一下AI候选人BFF系统的Github库里的内容吗？"

生成策略：
- 如果提到具体项目名称且有GitHub链接，优先问GitHub代码分析
- 如果提到技术栈，问具体的使用场景、优化经验等  
- 如果提到工作经历，问具体职责、团队规模、业务成果等
- 如果提到教育背景，问专业课程、实践项目等

返回JSON格式：
{"suggestions": ["问题1", "问题2", "问题3"]}

示例分析：
如果AI回复提到"AI候选人BFF系统"项目（包含GitHub链接），应该优先生成：
- "能分析一下AI候选人BFF系统的Github库里的内容吗？"
- "MCP协议有什么优势？"
- "系统架构是怎样的？"  

如果AI回复提到"Browser CoT"项目，应该生成：
- "能分析一下Browser CoT的Github库里的内容吗？"
- "思维链记录如何实现？"

如果AI回复提到"旅游助手智能体"项目，应该生成：
- "能分析一下旅游助手智能体的Github库里的内容吗？"
- "RAG + ReAct架构如何设计？"

而不是生成通用问题如"遇到什么挑战？"、"技术栈是什么？"`}
`;

      // 根据语言设置系统消息
      const systemMessage = texts.title.includes('Assistant') ? 
        "You are a professional HR assistant skilled at generating valuable interview questions. Please strictly return results in JSON format." :
        "你是一个专业的HR助手，擅长生成有价值的面试问题。请严格按照JSON格式返回结果。";
      
      const result = await this.model.invoke([
        { role: "system", content: systemMessage },
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
      
      // 返回默认建议（根据语言）
      const defaultSuggestions = texts.title.includes('Assistant') ? 
        [
          "Can you tell me more?",
          "Are there any others?",
          "What's the tech stack?"
        ] : [
          "能详细说说吗？",
          "还有其他的吗？",
          "技术栈是什么？"
        ];
      
      return { 
        suggestions: defaultSuggestions
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
      // 🧠 增强上下文感知：检查是否有GitHub分析上下文
      const contextInfo = await this.contextService.enhanceWithGitHubContext(userMessage, sessionId);
      
      // 获取对话历史
      const chatHistory = await chatHistoryService.getFormattedHistory(sessionId);
      
      // 增强系统提示词，包含上下文信息
      let enhancedSystemPrompt = getSystemPrompt();
      if (contextInfo.hasContext) {
        enhancedSystemPrompt += `\n\n🧠 当前会话上下文：
${contextInfo.contextSummary || ''}

${contextInfo.relevantProjects && contextInfo.relevantProjects.length > 0 ? 
  '相关项目上下文：\n' + contextInfo.relevantProjects.map(p => 
    `- ${p.projectName} (${p.language}): ${p.keyInfo?.type || 'Unknown type'}`
  ).join('\n') : ''}

📝 重要提示：
- 你可以基于上述GitHub分析结果回答更深入的技术问题
- 如果用户询问相关项目的具体实现、架构设计等，直接使用已有的分析数据
- 鼓励用户深入探讨已分析项目的技术细节`;
      }
      
      // 构建完整的消息数组
      const messages = [
        { role: "system", content: enhancedSystemPrompt },
        ...chatHistory,
        { role: "user", content: userMessage }
      ];

      console.log(`💬 Processing query with ${chatHistory.length} history messages for session: ${sessionId}`);
      console.log(`🧠 Context info:`, {
        hasContext: contextInfo.hasContext,
        relevantProjects: contextInfo.relevantProjects?.length || 0
      });

      // 保存用户消息到历史
      await chatHistoryService.addMessage(sessionId, 'user', userMessage);

      // 🧠 为当前会话创建带有上下文感知和监控的工具
      const monitoredTools = this._createMonitoredTools(sessionId, userMessage);
      
      // 创建临时的会话感知agent
      const sessionAgent = createReactAgent({
        llm: this.model,
        tools: monitoredTools.tools,
      });

      // 为每个查询创建一个新的 trace
      const queryStartTime = Date.now();
      const result = await sessionAgent.invoke({
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
      
      const queryEndTime = Date.now();
      const queryDuration = queryEndTime - queryStartTime;

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

      // 🧠 生成基于上下文的对话建议
      console.log("🎯 Generating context-aware conversation suggestions...");
      let suggestions;
      
      // 如果有GitHub分析上下文，优先生成上下文相关建议
      if (contextInfo.hasContext && contextInfo.relevantProjects && contextInfo.relevantProjects.length > 0) {
        const contextualSuggestions = this.contextService.generateContextualSuggestions(
          contextInfo.relevantProjects[0].analysisResult
        );
        suggestions = { suggestions: contextualSuggestions };
        console.log("🧠 Generated contextual suggestions based on GitHub analysis");
      } else {
        // 使用传统方法生成建议
        suggestions = await this.generateSuggestions(
          chatHistory,
          finalText,
          userMessage
        );
      }
      
      // 🔍 记录工具调用监控信息
      this.monitorService.recordToolCall(
        sessionId,
        userMessage,
        monitoredTools.toolsCalled,
        queryDuration,
        {
          hasContext: contextInfo.hasContext,
          relevantProjects: contextInfo.relevantProjects?.length || 0,
          historyLength: chatHistory.length
        }
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

  // 流式处理查询 - SSE版本
  async processQueryStream(userMessage, sessionId = 'default', res) {
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
      // 🧠 增强上下文感知：检查是否有GitHub分析上下文
      const contextInfo = await this.contextService.enhanceWithGitHubContext(userMessage, sessionId);
      
      // 获取对话历史
      const chatHistory = await chatHistoryService.getFormattedHistory(sessionId);
      
      // 增强系统提示词，包含上下文信息
      let enhancedSystemPrompt = getSystemPrompt();
      if (contextInfo.hasContext) {
        enhancedSystemPrompt += `\n\n🧠 当前会话上下文：
${contextInfo.contextSummary || ''}

${contextInfo.relevantProjects && contextInfo.relevantProjects.length > 0 ? 
  '相关项目上下文：\n' + contextInfo.relevantProjects.map(p => 
    `- ${p.projectName} (${p.language}): ${p.keyInfo?.type || 'Unknown type'}`
  ).join('\n') : ''}

📝 重要提示：
- 你可以基于上述GitHub分析结果回答更深入的技术问题
- 如果用户询问相关项目的具体实现、架构设计等，直接使用已有的分析数据
- 鼓励用户深入探讨已分析项目的技术细节`;
      }
      
      // 构建完整的消息数组
      const messages = [
        { role: "system", content: enhancedSystemPrompt },
        ...chatHistory,
        { role: "user", content: userMessage }
      ];

      console.log(`💬 Processing stream query with ${chatHistory.length} history messages for session: ${sessionId}`);
      console.log(`🧠 Context info:`, {
        hasContext: contextInfo.hasContext,
        relevantProjects: contextInfo.relevantProjects?.length || 0
      });

      // 保存用户消息到历史
      await chatHistoryService.addMessage(sessionId, 'user', userMessage);

      // 🧠 为当前会话创建带有上下文感知和监控的工具
      const monitoredTools = this._createMonitoredTools(sessionId, userMessage);
      
      // 创建临时的会话感知agent
      const sessionAgent = createReactAgent({
        llm: this.model,
        tools: monitoredTools.tools,
      });

      let fullResponse = '';
      let tokenCount = 0;
      const queryStartTime = Date.now();

      try {
        // 发送开始信号
        res.write(`data: ${JSON.stringify({
          type: 'start',
          message: '正在思考中...'
        })}\n\n`);

        // 🔄 改用LangChain推荐的callbacks方式进行流式处理
        let streamingCallbacks = [
          this.langfuseHandler,
          {
                         handleLLMNewToken(token) {
               fullResponse += token;
               tokenCount++;
               // 发送token到前端
               res.write(`data: ${JSON.stringify({
                 type: 'token',
                 content: token
               })}\n\n`);
               
               // 每50个token输出一次进度
               if (tokenCount % 50 === 0) {
                 console.log(`🔄 已输出 ${tokenCount} 个token...`);
               }
             },
            // 工具事件现在由监控系统处理，这里不再重复
                         handleLLMStart(llm, prompts) {
               console.log("🚀 LLM开始生成回复...");
             },
             handleLLMEnd(output) {
               console.log("✅ LLM回复生成完成");
             }
          }
        ];

        // 使用agent的stream方法而不是streamEvents
        try {
          const streamResult = await sessionAgent.streamLog({
            messages: messages,
          }, {
            callbacks: streamingCallbacks,
            metadata: {
              user_query: userMessage,
              session_id: sessionId,
              history_length: chatHistory.length,
              timestamp: new Date().toISOString(),
              service: "ai-candidate-bff",
              mode: "streaming-mcp-v2",
            }
          });

                     // 处理streamLog的结果
           let chunkCount = 0;
           for await (const chunk of streamResult) {
             // streamLog 会通过callbacks处理，这里主要是确保流程完整
             if (chunk.ops && chunk.ops.length > 0) {
               chunkCount++;
               // 每10个chunk输出一次，避免日志过多
               if (chunkCount % 100 === 0) {
                 console.log(`📝 已处理 ${chunkCount} 个流式块...`);
               }
             }
           }
           console.log(`✅ 流式处理完成，共处理 ${chunkCount} 个块`);
        } catch (streamError) {
          console.warn("⚠️ streamLog failed, trying direct invoke with streaming model");
          
          // 如果streamLog失败，尝试使用带回调的直接调用
          await sessionAgent.invoke({
            messages: messages,
          }, {
            callbacks: streamingCallbacks,
            metadata: {
              user_query: userMessage,
              session_id: sessionId,
              fallback: "direct_invoke",
              timestamp: new Date().toISOString(),
            },
          });
        }

        const queryEndTime = Date.now();
        const queryDuration = queryEndTime - queryStartTime;

        // 如果没有获取到完整响应，尝试从最终结果中提取
        if (!fullResponse.trim()) {
          console.warn("⚠️ No streaming content received, falling back to invoke method");
          
          const result = await sessionAgent.invoke({
            messages: messages,
          }, {
            callbacks: [this.langfuseHandler],
            metadata: {
              user_query: userMessage,
              session_id: sessionId,
              fallback: true,
              timestamp: new Date().toISOString(),
            },
          });

          // 从结果中提取文本
          if (result && Array.isArray(result.messages)) {
            const lastAI = [...result.messages].reverse().find(
              msg => msg.constructor.name === "AIMessage" && msg.content
            );
            if (lastAI && lastAI.content) {
              fullResponse = lastAI.content;
              
              // 模拟流式输出，快速发送每个字符
              for (let i = 0; i < fullResponse.length; i++) {
                res.write(`data: ${JSON.stringify({
                  type: 'token',
                  content: fullResponse[i]
                })}\n\n`);
                
                // 小延迟以产生打字效果
                await new Promise(resolve => setTimeout(resolve, 10));
              }
            }
          }
        }

        // 发送完成信号
        res.write(`data: ${JSON.stringify({
          type: 'completed',
          fullText: fullResponse,
          duration: queryDuration
        })}\n\n`);

        // 保存AI回复到历史
        if (fullResponse.trim()) {
          await chatHistoryService.addMessage(sessionId, 'assistant', fullResponse);
          
          // 📋 在日志中显示完整的AI回复
          console.log("\n" + "=".repeat(60));
          console.log("🤖 AI完整回复内容:");
          console.log("=".repeat(60));
          console.log(fullResponse);
          console.log("=".repeat(60) + "\n");
        } else {
          console.warn("⚠️ 未获取到AI回复内容");
        }

        // 🧠 生成基于上下文的对话建议
        console.log("🎯 Generating context-aware conversation suggestions...");
        let suggestions;
        
        // 如果有GitHub分析上下文，优先生成上下文相关建议
        if (contextInfo.hasContext && contextInfo.relevantProjects && contextInfo.relevantProjects.length > 0) {
          const contextualSuggestions = this.contextService.generateContextualSuggestions(
            contextInfo.relevantProjects[0].analysisResult
          );
          suggestions = { suggestions: contextualSuggestions };
          console.log("🧠 Generated contextual suggestions based on GitHub analysis");
        } else {
          // 使用传统方法生成建议
          suggestions = await this.generateSuggestions(
            chatHistory,
            fullResponse,
            userMessage
          );
        }

        // 发送建议
        res.write(`data: ${JSON.stringify({
          type: 'suggestions',
          suggestions: suggestions.suggestions || []
        })}\n\n`);
        
        // 🔍 记录工具调用监控信息
        this.monitorService.recordToolCall(
          sessionId,
          userMessage,
          monitoredTools.toolsCalled,
          queryDuration,
          {
            hasContext: contextInfo.hasContext,
            relevantProjects: contextInfo.relevantProjects?.length || 0,
            historyLength: chatHistory.length,
            streaming: true
          }
        );

        console.log(`✅ 流式处理完成 - Session: ${sessionId}, 耗时: ${queryDuration}ms, Token数: ${tokenCount}, 工具调用: ${monitoredTools.toolsCalled.length}`);

      } catch (streamError) {
        console.error("Stream processing error:", streamError);
        
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: `流式处理错误: ${streamError.message}`,
          canRetry: true
        })}\n\n`);
        
        // 记录错误到 LangFuse
        if (this.langfuseHandler) {
          this.langfuseHandler.handleLLMError(streamError, {
            user_query: userMessage,
            session_id: sessionId,
            error_type: streamError.constructor.name,
            streaming: true,
            timestamp: new Date().toISOString(),
          });
        }
      }

    } catch (error) {
      console.error("Error in stream LLM processing:", error);
      
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: `处理错误: ${error.message}`,
        canRetry: true
      })}\n\n`);
      
      // 记录错误到 LangFuse
      if (this.langfuseHandler) {
        this.langfuseHandler.handleLLMError(error, {
          user_query: userMessage,
          session_id: sessionId,
          error_type: error.constructor.name,
          streaming: true,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}

const llmService = new LLMService();
module.exports = llmService;