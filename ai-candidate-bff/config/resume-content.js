// 陈嘉旭的详细简历内容
module.exports = `{
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
  "name": "AI候选人BFF系统",
  "period": "2025-05 ~ 至今",
  "url": "https://github.com/lukaliou123/mcp_resume_reaction",
  "background": "开发一个智能候选人后端服务系统，通过MCP协议集成候选人信息，结合大语言模型提供智能问答服务，支持多AI提供商（OpenAI/阿里云千问），并具备完整的监控和部署能力。",
  "tech_stack": [
    "Node.js", 
    "Express.js", 
    "LangChain.js", 
    "MCP协议", 
    "OpenAI GPT-4", 
    "阿里云千问", 
    "LangFuse", 
    "Docker", 
    "Vercel", 
    "腾讯云"
  ],
  "details": [
    "架构设计与技术选型: 设计基于MCP协议的候选人信息服务架构，选择LangChain.js作为AI编排框架，实现模块化和可扩展的系统设计。",
    "MCP服务器开发: 开发node-candidate-mcp-server库，实现候选人信息的资源管理和工具调用，支持细化的信息获取接口，优化token消耗和响应速度。",
    "BFF服务开发: 构建Express.js后端服务，集成MCP服务器，实现RESTful API接口，支持流式响应和错误处理，提供前端友好的数据格式。",
    "多AI提供商集成: 实现OpenAI和阿里云千问的双提供商支持，根据地区配置自动切换，解决不同模型的语义匹配差异问题。",
    "监控与可观测性: 集成LangFuse进行全链路监控，覆盖AI请求、工具调用、性能指标等，便于问题诊断和性能优化。",
    "部署与运维: 配置Docker容器化部署，支持Vercel和腾讯云多平台部署，解决依赖同步和构建问题，确保生产环境稳定运行。",
    "功能迭代与优化: 实现细化MCP工具功能，将粗粒度简历获取拆分为7个精确工具，提升语义匹配准确性，减少60-80%的token消耗。"
  ]
    },
      {
      "name": "Browser CoT · 浏览器思维链记录与可视化插件",
      "period": "2025-05 ~ 至今",
      "url": "https://github.com/lukaliou123/browser-cot",
      "description": "开发一款浏览器插件，自动捕捉用户的网页浏览行为，构建思维链（Chain of Thought）并进行可视化展示，旨在帮助用户更好地理解和管理自己的信息浏览路径。",
      "tech_stack": [
        "JavaScript",
        "Chrome Extension APIs",
        "LangChain",
        "HTML/CSS",
        "D3.js",
        "Node.js"
      ],
      "details": [
        "自动记录用户的网页浏览行为，包括点击、滚动、停留时间等，构建用户的思维链。",
        "集成 LangChain，实现对用户浏览内容的语义分析，提取关键词和主题。",
        "使用 D3.js 对思维链进行可视化展示，帮助用户直观了解自己的信息浏览路径。",
        "提供插件界面，允许用户查看、编辑和管理自己的思维链。",
        "支持数据导出，方便用户进行进一步的分析和归档。"
      ]
  },
      {
      "name": "Ideas Collection · 个人想法收集与知识管理系统",
      "period": "2025-04 ~ 至今",
      "url": "https://github.com/lukaliou123/ideas_collection",
      "description": "构建一个轻量级的个人想法收集与知识管理平台，支持多源信息的统一收集、分类、检索与展示，旨在提升个人信息整理与复盘效率。",
      "tech_stack": [
        "Python",
        "FastAPI",
        "Docker",
        "Markdown",
        "SQLite",
        "Jinja2"
      ],
      "details": [
        "多源信息收集：支持从网页、命令行等多种渠道快速收集想法和笔记。",
        "结构化存储：采用 Markdown 格式进行内容存储，便于后续的编辑和迁移。",
        "标签与分类：实现灵活的标签系统，支持多维度的内容分类与检索。",
        "Web 界面展示：基于 Jinja2 模板引擎构建简洁的 Web 界面，方便内容浏览与管理。",
        "Docker 部署：提供 Dockerfile 和 docker-compose 配置，简化部署流程，支持快速本地或远程部署。"
      ]
    },
    {
      "name": "旅游助手智能体",
      "period": "2025-04 ~ 至今",
      "url": "https://github.com/lukaliou123/eino_travel_assistant",
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
      "company": "Klook Travel",
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
      "company": "Klook Travel",
      "name": "Kakao Sync 登录及订阅管理",
      "background": "引入 Kakao Sync 接口，实现用户使用Kakao 账号快速登录、管理订阅关系，以及与内部系统数据同步，以更好地服务韩国市场。",
      "tech_stack": ["Golang", "MySQL", "Redis", "自研MQ", "OAuth2.0"],
      "responsibilities": [
        "后端核心开发: 设计并实现登录注册与 Kakao Sync 的数据交互,编写获取/更新用户订阅关系的业务逻辑。",
        "MQ消息流程设计: 规划并优化数据推送流程,通过消息队列将用户订阅信息同步至其他服务。",
        "文档维护与方案宣讲: 整理前同事的项目资料,更新流程图与接口文档,并主持跨部门会议介绍后端方案,确保各方理解一致。",
        "跨团队沟通: 与前端、产品、运营(CRM)等团队多次沟通需求与实现细节,推动项目顺利落地并上线。"
      ]
    },
    {
    "company": "ThoughtWorks China",
    "name": "Thoughtworks GTB 培训项目实践",
    "background": "参与并完成了 Thoughtworks 中国入职前培训 GTB（Graduates Technique Bootcamp），围绕敏捷开发方法与主流技术栈进行系统性训练。",
    "tech_stack": ["Java", "CLI", "SpringBoot", "HTML", "CSS", "JS", "React", "Mockito"],
    "responsibilities": [
      "掌握并应用了 TDD（测试驱动开发）进行项目开发流程，追踪项目演进与需求变化。",
      "学习并应用了功能测试，如单元测试、集成测试、读取与验证代码中的可维护性与稳定性。",
      "学习并应用在项目中的模拟接口测试，包括使用 Mockito 的模拟框架进行接口依赖隔离测试。"
    ]
  },
  {
  "company": "Gangtise",
    "name": "呼叫录音分析与语音转文本系统",
    "background": "负责公司语音呼叫系统中的后端功能开发，包括通话录音的入库、存储与处理，并接入语音识别（ASR）系统进行文本转化，为多个业务线提供智能语音处理能力。",
    "tech_stack": ["SpringBoot", "MySQL", "Redis", "阿里云RPC", "zookeeper"],
    "responsibilities": [
      "通过与电信公司对接，获取呼叫音频及数据，构建录音服务端处理与存储机制。",
      "通过分呼叫维度的数据建模和入库，进行语音数据分发与识别，生成文本以供后续检索。",
      "使用 MySQL 进行部分结构化数据存储，并使用 Redis 进行缓存优化，有效缓解数据冲突问题。",
      "引入 zookeeper 实现节点选举和服务发现机制，提高服务稳定性与可扩展性。",
      "通过 RPC 框架实现前后端服务解耦与统一调度，优化接口性能，提升系统处理效率。"
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