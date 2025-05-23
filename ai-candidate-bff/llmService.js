
const { MultiServerMCPClient } = require("@langchain/mcp-adapters");
const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const SYSTEM_PROMPT = `你是一个专业的招聘助手，负责为用户介绍和解答关于候选人“陈嘉旭”的各类信息。你可以调用多种工具获取候选人的简历、教育背景、工作经历、项目经验、技能特长、社交媒体链接等结构化数据。
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
- 用户问“候选人有哪些技术能力？”时，你应调用相关工具，提炼技能亮点，结构化地回答。
- 用户问“能介绍一下候选人的背景吗？”时，你应综合简历、教育、工作经历等信息，简明扼要地介绍。
请始终以专业、友好、可信赖的语气作答。`;
class LLMService {
  constructor() {
    this.agent = null;
    this._initAgent();
  }

  async _initAgent() {
    this.client = new MultiServerMCPClient({
      mcpServers: {
        candidate: {
          transport: "stdio",
          command: "npx",
          args: ["ts-node", "/home/blueroad/idea_demos/resume_mcp/node-candidate-mcp-server/examples/stdio.ts"],
        },
      },
    });
    this.tools = await this.client.getTools();
    console.log("Loaded MCP tools:", this.tools);
    this.model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
      temperature: 0.2,
    });
    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
    });
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
    const result = await this.agent.invoke({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }],
    });
    console.log("Agent invoke result:", result);
  
    // 新增：从 messages 数组中提取最后一个 AIMessage 的 content
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
  }
}

const llmService = new LLMService();
module.exports = llmService;