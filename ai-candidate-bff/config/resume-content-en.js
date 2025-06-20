// Jaydon Chen's detailed resume content in English
module.exports = `{
  "name": "Jaydon Chen",
  "position": "AI Application Development/Golang Backend Development",
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
      "school": "University of Sydney",
      "degree": "Master of Information Technology (Software Engineering)"
    },
    {
      "period": "2018-08 ~ 2022-08",
      "school": "University of Sydney",
      "degree": "Bachelor of Computing (Software Development)"
    }
  ],
  "work_experience": [
    {
      "company": "Klook Travel",
      "period": "2024-03 ~ 2024-12",
      "title": "Golang Development Engineer",
      "responsibilities": [
        "Used Golang for user-related backend development, focusing on business and user value discovery.",
        "Collaborated closely with product and frontend teams with a consultant mindset, delivering efficient iterations and continuous feature optimization."
      ]
    },
    {
      "company": "ThoughtWorks China",
      "period": "2022-12 ~ 2023-02",
      "title": "Java Development Engineer Intern",
      "responsibilities": [
        "Participated in ThoughtWorks China GTB (Graduates Technique Bootcamp), systematically learning agile development processes and related tool usage."
      ]
    },
    {
      "company": "Gangtise",
      "period": "2022-05 ~ 2022-07",
      "title": "Java Development Engineer Intern",
      "responsibilities": [
        "Participated in developing conference recording and speech-to-text features for Gangtise cloud investment research APP, which was later launched on the Apple App Store."
      ]
    }
  ],
  "personal_projects": [
    {
      "name": "HighGoPress: High-Concurrency Real-time Counting Service",
      "period": "2025-06 ~ Present",
      "url": "https://github.com/lukaliou123/high_go_press",
      "background": "Built a high-concurrency real-time counting system supporting 20,000 QPS, high availability, and observability. The project simulates high-frequency write scenarios like likes, follows, and page views in social media, evolving from high-performance monolithic architecture to production-grade microservices architecture.",
      "tech_stack": [
        "Go", "gRPC", "Gin", "Redis", "Kafka", "Consul", "Protocol Buffers", "pprof", "Prometheus", "Grafana"
      ],
      "details": [
        "High-performance monolithic architecture design and implementation: Built a high-performance monolithic service based on Gin, Redis, and Worker Pool, achieving 21k+ QPS stably at 500 concurrency with P99 latency below 50ms through five progressive stress tests.",
        "Performance optimization practices: Implemented object reusing based on sync.Pool and dynamic-capacity Goroutine pools, significantly reducing GC pressure and memory allocation.",
        "Asynchronous architecture design and decoupling: Introduced Kafka as asynchronous message bus in the architecture to decouple core counting from data persistence processes, laying foundation for future API response speed and system throughput improvements.",
        "Microservices architecture evolution: Led the architectural refactoring from monolithic to microservices, splitting the system into API Gateway and Counter Service, using gRPC for inter-service communication, establishing foundation for horizontal scaling.",
        "gRPC connection pool and load balancing: To solve inter-service communication efficiency issues, designed and implemented a gRPC connection pool with Keep-Alive, auto-reconnection, and Round-Robin load balancing strategy, aiming to restore QPS close to single-service version.",
        "Service governance and discovery: Integrated Consul for automatic service registration, discovery, and health check mechanisms to enhance system's dynamic scaling capabilities and availability.",
        "Enterprise-grade monitoring system: Built complete Prometheus+Grafana monitoring stack, including system overview, service details, and business monitoring with multiple alert rules, achieving end-to-end observability.",
        "Scientific performance engineering methodology: Established standardized performance testing process with 5 stress levels (from 10 to 500 concurrency), ensuring every architectural optimization effect can be quantified and verified."
      ]
    },
    {
      "name": "AI Candidate BFF System",
      "period": "2025-05 ~ Present",
      "url": "https://github.com/lukaliou123/mcp_resume_reaction",
      "background": "Developed an intelligent candidate backend service system that integrates candidate information through MCP protocol, combines with large language models to provide intelligent Q&A services, supports multiple AI providers (OpenAI/Alibaba Qianwen), and features complete monitoring and deployment capabilities.",
      "tech_stack": [
        "Node.js", "Express.js", "LangChain.js", "MCP Protocol", "OpenAI GPT-4", "Alibaba Qianwen", "LangFuse", "Docker", "Vercel", "Tencent Cloud"
      ],
      "details": [
        "Architecture design and technology selection: Designed candidate information service architecture based on MCP protocol, selected LangChain.js as AI orchestration framework, implementing modular and scalable system design.",
        "MCP server development: Developed node-candidate-mcp-server library, implementing candidate information resource management and tool calling, supporting fine-grained information retrieval interfaces, optimizing token consumption and response speed.",
        "BFF service development: Built Express.js backend service, integrated MCP server, implemented RESTful API interfaces, supporting streaming responses and error handling, providing frontend-friendly data format.",
        "Multi-AI provider integration: Implemented dual provider support for OpenAI and Alibaba Qianwen, automatically switching based on regional configuration, solving semantic matching differences between different models.",
        "Monitoring and observability: Integrated LangFuse for full-chain monitoring, covering AI requests, tool calls, performance metrics, facilitating problem diagnosis and performance optimization.",
        "Deployment and operations: Configured Docker containerized deployment, supporting multiple platform deployment on Vercel and Tencent Cloud, resolving dependency synchronization and build issues, ensuring stable production environment operation.",
        "Feature iteration and optimization: Implemented fine-grained MCP tool functionality, splitting coarse-grained resume retrieval into 7 precise tools, improving semantic matching accuracy and reducing 60-80% token consumption."
      ]
    },
    {
      "name": "Browser CoT · Browser Chain of Thought Recording and Visualization Plugin",
      "period": "2025-05 ~ Present",
      "url": "https://github.com/lukaliou123/browser-cot",
      "description": "Developed a browser plugin that automatically captures users' web browsing behavior, builds Chain of Thought and provides visualization, helping users better understand and manage their information browsing paths.",
      "tech_stack": [
        "JavaScript", "Chrome Extension APIs", "LangChain", "HTML/CSS", "D3.js", "Node.js"
      ],
      "details": [
        "Automatically records users' web browsing behavior including clicks, scrolls, dwell time, etc., building users' chain of thought.",
        "Integrated LangChain for semantic analysis of browsing content, extracting keywords and topics.",
        "Used D3.js for chain of thought visualization, helping users intuitively understand their information browsing paths.",
        "Provided plugin interface allowing users to view, edit, and manage their chain of thought.",
        "Supported data export for further analysis and archiving."
      ]
    },
    {
      "name": "Ideas Collection · Personal Idea Collection and Knowledge Management System",
      "period": "2025-04 ~ Present",
      "url": "https://github.com/lukaliou123/ideas_collection",
      "description": "Built a lightweight personal idea collection and knowledge management platform supporting unified collection, categorization, search, and display of multi-source information, aiming to improve personal information organization and review efficiency.",
      "tech_stack": [
        "Python", "FastAPI", "Docker", "Markdown", "SQLite", "Jinja2"
      ],
      "details": [
        "Multi-source information collection: Supports rapid idea and note collection from multiple channels including web and command line.",
        "Structured storage: Uses Markdown format for content storage, facilitating subsequent editing and migration.",
        "Tagging and categorization: Implements flexible tagging system supporting multi-dimensional content categorization and search.",
        "Web interface display: Built clean web interface based on Jinja2 template engine for convenient content browsing and management.",
        "Docker deployment: Provides Dockerfile and docker-compose configuration, simplifying deployment process, supporting quick local or remote deployment."
      ]
    },
    {
      "name": "Travel Assistant AI Agent",
      "period": "2025-04 ~ Present",
      "url": "https://github.com/lukaliou123/eino_travel_assistant",
      "description": "Based on RAG + ReAct architecture, integrating large language models with map services, using ByteDance CloudWeGo Eino framework and Gaode Map MCP SSE with Cursor development, creating a one-stop intelligent travel consultation assistant supporting natural language Q&A, POI recommendations, route planning, and contextual memory, improving user travel planning efficiency and experience.",
      "tech_stack": [
        "Golang", "Cursor", "CloudWeGo Eino Framework", "Gaode Map MCP SSE", "Volcano Engine ARK", "Redis-Stack", "MySQL", "Hertz", "APMPlus", "Langfuse", "Docker"
      ],
      "details": [
        "Natural language interaction: Based on Eino's ReAct Agent architecture, calling ARK large model for multi-turn conversations and travel service recommendations.",
        "Knowledge base retrieval: Using query rewriting technology to retrieve diverse results from Redis-Stack vector database, custom fusion algorithms ensure key geographic information coverage.",
        "Contextual memory: Implemented memory/MySQL dual storage with fallback support when MySQL connection fails.",
        "Gaode Map tool calling: Integrated 12 types of MCP APIs, Agent autonomously schedules tools based on conversation context.",
        "POI data processing: Custom Interceptor Tool asynchronously parses MCP API responses, structurally extracts location names, addresses, coordinates, and stores as needed.",
        "Route planning: Supports driving, public transport, walking multi-mode planning, comprehensively outputs time, distance, cost suggestions, helping users make quick decisions.",
        "Web service interface: Built HTTP interface based on Hertz framework, using SSE for large model streaming output.",
        "Observability: Integrated APMPlus and Langfuse, covering full-chain monitoring of large model requests, retrieval, and tool calls, facilitating performance monitoring and fault diagnosis."
      ]
    }
  ],
  "work_projects": [
    {
      "company": "Klook Travel",
      "name": "Korean Phone Number Format Unification",
      "background": "Solved duplicate registration and account issues caused by Korean phone numbers with or without '0', comprehensively reformed registration, login, region transfer, account cancellation processes, compatible with legacy and new frameworks.",
      "tech_stack": ["Golang", "MySQL", "Redis", "XML Legacy Framework", "Self-developed Gin-like New Framework"],
      "responsibilities": [
        "Requirement breakdown and technical solution: Broke down tasks according to PRD, wrote development documentation and conducted reviews, formulated overall solution compatible with legacy and new frameworks.",
        "Core functionality development and code review: Cleaned database, responsible for core logic development of registration, login, region transfer, cancellation, conducted segmented code reviews ensuring code quality.",
        "Legacy and new framework adaptation: Provided compatibility for XML legacy framework and self-developed Gin-like new framework, reused core logic, reduced duplicate code and maintenance difficulty."
      ]
    },
    {
      "company": "Klook Travel",
      "name": "Kakao Sync Login and Subscription Management",
      "background": "Introduced Kakao Sync interface to enable users to quickly login with Kakao accounts, manage subscription relationships, and synchronize data with internal systems to better serve the Korean market.",
      "tech_stack": ["Golang", "MySQL", "Redis", "Self-developed MQ", "OAuth2.0"],
      "responsibilities": [
        "Backend core development: Designed and implemented login registration and Kakao Sync data interaction, wrote business logic for getting/updating user subscription relationships.",
        "MQ message flow design: Planned and optimized data push processes, synchronized user subscription information to other services through message queues.",
        "Documentation maintenance and solution presentation: Organized previous colleague's project materials, updated flow charts and interface documentation, hosted cross-department meetings to introduce backend solutions, ensuring consistent understanding among all parties.",
        "Cross-team communication: Communicated multiple times with frontend, product, operations (CRM) teams on requirements and implementation details, promoting smooth project landing and launch."
      ]
    },
    {
      "company": "ThoughtWorks China",
      "name": "Thoughtworks GTB Training Project Practice",
      "background": "Participated in and completed ThoughtWorks China pre-employment training GTB (Graduates Technique Bootcamp), conducting systematic training around agile development methods and mainstream technology stacks.",
      "tech_stack": ["Java", "CLI", "SpringBoot", "HTML", "CSS", "JS", "React", "Mockito"],
      "details": [
        "Agile development practice: Learned TDD (Test-Driven Development), pair programming, continuous integration and other agile development practices.",
        "Technology stack training: Systematically learned Java backend development, frontend technology stack, testing frameworks and other mainstream technologies.",
        "Team collaboration: Participated in simulated project development, experienced complete agile development process from requirement analysis to product delivery.",
        "Code quality assurance: Learned to use various testing tools and frameworks to ensure code quality and reliability."
      ]
    }
  ],
  "skills": [
    {
      "category": "Programming Languages",
      "items": ["Golang", "Java", "Python", "JavaScript", "TypeScript"]
    },
    {
      "category": "Backend Development",
      "items": ["Gin", "SpringBoot", "Node.js", "Express.js", "gRPC", "RESTful API"]
    },
    {
      "category": "Database & Cache",
      "items": ["MySQL", "Redis", "SQLite", "Redis-Stack"]
    },
    {
      "category": "AI & Machine Learning",
      "items": ["LangChain", "OpenAI GPT", "MCP Protocol", "RAG", "Vector Database"]
    },
    {
      "category": "DevOps & Deployment",
      "items": ["Docker", "Kubernetes", "Vercel", "Railway", "Tencent Cloud"]
    },
    {
      "category": "Monitoring & Observability",
      "items": ["Prometheus", "Grafana", "LangFuse", "APMPlus", "Performance Testing"]
    },
    {
      "category": "Message Queue & Middleware",
      "items": ["Kafka", "Consul", "Service Discovery", "Load Balancing"]
    }
  ],
  "other_experience": [
    {
      "category": "Academic Research",
      "items": ["Software Engineering Research", "University Projects", "Technical Documentation"]
    },
    {
      "category": "Community Contribution",
      "items": ["Open Source Projects", "GitHub Contributions", "Technical Blogging"]
    }
  ]
}`; 