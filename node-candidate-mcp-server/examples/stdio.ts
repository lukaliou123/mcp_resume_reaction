import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, CandidateConfig, ServerConfig } from "../dist";

async function startServer() {
  try {
    const candidateConfig = new CandidateConfig("陈嘉旭");
    candidateConfig.resumeUrl = "";
    candidateConfig.websiteUrl = "";
    candidateConfig.linkedinUrl = "https://www.linkedin.com/in/jiaxu-chen-731896237/";
    candidateConfig.githubUrl = "https://github.com/lukaliou123";
    candidateConfig.resumeText = `{
  "name": "陈嘉旭",
  "position": "AI应用开发/Golang后端开发",
  "contact": {
    "phone": "18976581578",
    "email": "708980731@qq.com"
  },
  "links": {
    "linkedin": "https://www.linkedin.com/in/jiaxu-chen-731896237/",
    "github": "https://github.com/lukaliou123",
    "resumeUrl": "",
    "websiteUrl": ""
  },
  "education": [
    {
      "period": "2022-08 ~ 2024-03",
      "school": "悉尼大学",
      "degree": "Master of Information Technology (Software Engineering)"
    },
    {
      "period": "2018-08 ~ 2022-08",
      "school": "悉尼大学",
      "degree": "Bachelor of Computing (Software Development)"
    }
  ],
  "work_experience": [
    {
      "company": "客路旅行",
      "period": "2024-03 ~ 2024-12",
      "title": "Golang开发工程师",
      "responsibilities": [
        "使用 Golang 进行用户相关业务的后端开发，注重业务与用户价值的挖掘。",
        "以 Consultant 思维与产品、前端团队紧密协作，以快捷迭代高效交付并持续优化功能。"
      ]
    },
    {
      "company": "ThoughtWorks中国",
      "period": "2022-12 ~ 2023-02",
      "title": "实习Java开发工程师",
      "responsibilities": [
        "参与 Thoughtwork 中国 GTB (Graduates Technique Bootcamp)，系统学习敏捷开发流程和相关工具使用。"
      ]
    },
    {
      "company": "Gangtise",
      "period": "2022-05 ~ 2022-07",
      "title": "实习Java开发工程师",
      "responsibilities": [
        "参与 Gangtise云投研APP电话会议录制和语音转文字功能开发，该功能之后在苹果应用商店上线。"
      ]
    }
  ],
  "personal_projects": [
    {
      "name": "旅游助手智能体",
      "period": "2025-04 ~ 至今",
      "description": "基于RAG + ReAct 架构，融合大语言模型与地图服务，使用字节跳动CloudWeGo Eino框架与高德地图MCP SSE辅以Cursor开发，打造一站式智能旅游咨询助手，支持自然语言问答、POI推荐、路线规划与上下文记忆，提升用户旅游规划效率与体验。",
      "tech_stack": [
        "Golang", "Cursor", "CloudWeGo Eino框架", "高德地图 MCP SSE", "火山引擎ARK", "Redis-Stack", "MySQL", "Hertz", "APMPlus", "Langfuse", "Docker"
      ],
      "details": [
        "自然语言交互: 基于Eino 的ReAct Agent 架构，调用ARK 大模型完成多轮对话与旅游服务推荐。",
        "知识库检索: 使用查询重写技术从 Redis-Stack 向量库获取多样化检索结果，自定义融合算法确保关键地理信息覆盖。",
        "上下文记忆: 实现内存/MySQL 双存储，并支持连接MySQL失败时的降级。",
        "高德地图工具调用: 集成12类MCP API, Agent 根据对话语境自主调度工具。",
        "POI数据处理: 自定义 Interceptor Tool 异步解析MCPAPI响应，结构化提取地点名称、地址、经纬度等信息，并按需入库。",
        "路线规划: 支持驾车、公交、步行多模式规划，综合输出时间、距离、费用等建议，帮助用户快速决策。",
        "Web 服务接口: 基于Hertz 框架构建 HTTP接口，利用SSE实现大模型流式输出。",
        "可观测性: 集成使用 APMPlus与Langfuse,覆盖大模型请求、检索与工具调用全链路,便于性能监控与故障诊断。"
      ]
    }
  ],
  "work_projects": [
    {
      "name": "韩国手机号格式统一",
      "background": "解决因韩国手机号可带「0」或不带「0」导致的重复注册、重复账号问题，对注册、登录、转区、注销等流程进行全面改造，并兼容老旧及新版框架。",
      "tech_stack": ["Golang", "MySQL", "Redis", "XML 旧框架", "自研 Gin-like 新框架"],
      "responsibilities": [
        "需求拆分与技术方案: 根据PRD 拆解任务、撰写开发文档并进行评审，制定兼容老新框架的整体方案。",
        "核心功能开发与代码 Review: 清洗数据库，负责注册、登录、转区、注销等核心逻辑的开发,分割进行 Code Review,保证代码质量。",
        "新旧框架适配: 为XML旧框架和自研 Gin-like 新框架提供兼容，复用核心逻辑，减少重复代码并降低维护难度。"
      ]
    },
    {
      "name": "Kakao Sync 登录及订阅管理",
      "background": "引入 Kakao Sync 接口，实现用户使用Kakao 账号快速登录、管理订阅关系，以及与内部系统数据同步，以更好地服务韩国市场。",
      "tech_stack": ["Golang", "MySQL", "Redis", "自研MQ", "OAuth2.0"],
      "responsibilities": [
        "后端核心开发: 设计并实现登录注册与 Kakao Sync 的数据交互,编写获取/更新用户订阅关系的业务逻辑。",
        "MQ消息流程设计: 规划并优化数据推送流程,通过消息队列将用户订阅信息同步至其他服务。",
        "文档维护与方案宣讲: 整理前同事的项目资料,更新流程图与接口文档,并主持跨部门会议介绍后端方案,确保各方理解一致。",
        "跨团队沟通: 与前端、产品、运营(CRM)等团队多次沟通需求与实现细节,推动项目顺利落地并上线。"
      ]
    }
  ],
  "skills": [
    "熟悉 Golang, Java, Python等编程语言,具备良好的代码规范与开发习惯",
    "熟悉常见设计模式与并发编程,并在工作中根据业务需求选择合适的模式与并发策略",
    "熟练使用 MySql,拥有生产环境下的数据库设计与查询优化经验",
    "熟悉 Redis 缓存机制,在项目中实际应用以提升系统性能",
    "熟悉消息中间件进行消息的异步处理",
    "熟悉敏捷开发流程,有过企业培训和实操经验",
    "熟练使用AI工具,如Cursor(编程助手),Flowith(知识库助手)等",
    "熟悉基于大语言模型的后端开发,如CloudWeGo Eino 框架，Langchain框架与其相关开发流程"
  ],
  "other_experience": [
    {
      "company": "海南朗普贸易有限公司",
      "period": "2025-01 ~ 2025-03",
      "title": "业余顾问",
      "responsibilities": [
        "优化公司管理模式: 基于互联网公司经验,优化现有管理模式,将工作效率提升一倍。",
        "搭建公司知识库Wiki: 修补公司文档并在飞书搭建Wiki,制作仪表盘直观展示营收状况。",
        "跨组织协调资金问题: 与多方机构对接,成功收回60%国企2024年拖欠的应收货款。",
        "搭建飞书知识库机器人: 基于Coze配置飞书智能知识库机器人,提升员工工作效率。"
      ]
    }
  ],
  "self_evaluation": [
    "主观能动性: 对具有正面影响的工作主动推进并持续跟进,确保事项落地。",
    "沟通协调能力: 能根据不同对象灵活调整沟通方式,确保双方就方案达成共识。",
    "抗压能力: 在高压力环境下保持状态,并及时完成工作。"
  ]
}`;
    
    const serverConfig: ServerConfig = {
      name: "jaydon-candidate-server",
      version: "1.0.1",
    };
    
    const server = createServer(serverConfig, candidateConfig);
    console.log(`Starting MCP server: ${serverConfig.name} v${serverConfig.version}`);
    await server.connect(new StdioServerTransport());    
    console.log("Server connected via Stdio. Waiting for MCP messages...");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Execute the function
startServer(); 