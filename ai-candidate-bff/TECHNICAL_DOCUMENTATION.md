# 技术文档：AI 助手的候选人信息交互页面

## 1. 项目概述

本项目旨在构建一个 PC Web 页面，用户可以通过该页面与 AI 助手进行自然语言交互，以查询和了解特定候选人的相关信息。AI 助手将通过调用一个 Model Context Protocol (MCP) 服务器来获取候选人的结构化数据。

## 2. 核心功能需求

*   用户可以在 PC 页面的聊天界面通过自然语言提问关于候选人的问题。
*   AI 助手能够理解用户的问题，并判断需要从 MCP Server 获取哪些信息。
*   AI 助手调用 MCP Server 提供的工具或资源来获取具体信息。
*   AI 助手整合从 MCP Server 获取的信息，并以自然语言的形式在聊天界面回复用户。
*   初期支持查询的候选人信息范围包括但不限于：姓名、简历文本、简历链接、GitHub 个人资料链接、LinkedIn 个人资料链接、个人网站链接等。

## 3. 系统架构图

```
+-----------------+      +---------------------+      +----------------------+      +-----------------+      +-----------------+
|   PC Web UI     |----->|   Application BFF   |----->|   LLM (OpenAI API)   |<---->|  LangChain.js   |----->|   MCP Server    |
| (HTML/JS/Vue/  |      | (Node.js + Express) |      +----------------------+      | (Agent, Tools)  |      | (@jhgaylor/...) |
|  React, etc.)   |      +---------------------+                                    +-----------------+      +-----------------+
+-----------------+
       ^                                                                                     |
       |-------------------------------------------------------------------------------------|
                                          (AI Response)
```

**组件说明:**

*   **PC Web UI:** 用户交互界面，负责接收用户输入和展示 AI 回复。
*   **Application BFF (Backend For Frontend):** 后端应用，处理前端请求，协调与 LLM 和 MCP Server 的交互。
    *   使用 Node.js 和 Express.js (初期) 或 NestJS (未来考虑) 构建。
    *   集成 LangChain.js 来管理与 LLM 的交互和工具调用。
*   **LLM (OpenAI API):** 大型语言模型，负责理解用户意图、决定调用哪些工具以及生成自然语言回复。
*   **LangChain.js:** JavaScript/TypeScript 版本的 LangChain 框架，用于：
    *   封装与 OpenAI API 的交互。
    *   管理 Prompts。
    *   创建 Chains (链) 和 Agents (智能体)。
    *   将 MCP Server 提供的功能抽象为 LangChain Tools。
*   **MCP Server:** 基于 `@jhgaylor/node-candidate-mcp-server` 库构建，提供候选人的结构化信息。
    *   初期通过子进程和 STDIN/STDOUT 与 BFF 通信。
    *   未来可以改造成通过 HTTP 提供服务。

## 4. 技术栈选型

*   **前端 (PC Web UI):**
    *   初期：简单 HTML + JavaScript，用于快速验证。
    *   后续：可选用 Vue.js 或 React 等现代前端框架。
*   **后端 (Application BFF):**
    *   运行时：Node.js
    *   Web 框架：Express.js (初期)
    *   LLM 应用框架：LangChain.js
*   **大型语言模型 (LLM):**
    *   OpenAI API (e.g., GPT-3.5-turbo, GPT-4)
*   **MCP Server:**
    *   基础库：`@jhgaylor/node-candidate-mcp-server`
    *   通信方式 (BFF 与 MCP Server)：
        *   初期：通过子进程启动 `examples/stdio.ts` (或其编译后的 `.js` 文件)，使用 STDIN/STDOUT 进行 JSON-RPC 通信。
        *   未来：考虑将 MCP Server 改造为 HTTP 服务，使用 `@modelcontextprotocol/sdk` 中的 `StreamableHTTPServerTransport`。

## 5. 详细流程设计

1.  **用户输入:** 用户在前端页面输入自然语言问题 (例如："介绍一下候选人的 GitHub 情况")。
2.  **请求传递:** 前端将用户问题发送到 Application BFF。
3.  **意图理解与工具选择 (LangChain.js + OpenAI - 第一轮):**
    *   BFF 使用 LangChain.js Agent。
    *   Agent 将用户问题和预设的 Prompt (包含可用工具列表和描述) 发送给 OpenAI API。
    *   OpenAI API 返回一个判断，指示需要调用哪个或哪些 MCP Server 工具 (例如 `get_github_url`) 以及调用时需要的参数。
4.  **MCP Server 调用:**
    *   BFF 根据 LLM 的指示，格式化成 MCP JSON-RPC 请求。
    *   BFF 通过 STDIN 将请求发送给作为子进程运行的 MCP Server (`stdio.ts` 脚本)。
    *   MCP Server 执行相应工具 (如 `GetGithubUrl`)，并通过 STDOUT 返回 JSON-RPC 响应 (包含 GitHub URL)。
5.  **信息获取与处理:** BFF 解析 MCP Server 的响应，提取所需信息。
6.  **答案生成 (LangChain.js + OpenAI - 第二轮):**
    *   BFF 将从 MCP Server 获取到的信息和原始用户问题 (以及可能的对话历史) 再次通过 LangChain.js 发送给 OpenAI API。
    *   OpenAI API 根据这些信息生成一段自然的、针对用户问题的回复。
7.  **响应返回:** BFF 将 AI 生成的回复发送回前端。
8.  **前端展示:** 前端页面将 AI 的回复展示给用户。

**Prompt 设计思路 (初步):**

*   **工具判断 Prompt:**
    *   角色：你是一个能干的助手，你需要根据用户的问题，从以下可用工具中选择最合适的工具来获取信息。
    *   可用工具列表：
        *   `get_resume_text`: 获取候选人的纯文本简历内容。
        *   `get_resume_url`: 获取候选人简历的链接。
        *   `get_linkedin_url`: 获取候选人 LinkedIn 档案的链接。
        *   `get_github_url`: 获取候选人 GitHub 主页的链接。
        *   ... (其他 MCP Server 提供的工具)
    *   输出格式要求：指定一个 JSON 格式，包含工具名称和参数。
*   **答案生成 Prompt:**
    *   角色：你是一个乐于助人的 AI 助手。
    *   上下文：提供用户的问题和从工具调用中获取的相关信息。
    *   指令：请根据提供的信息，用自然、友好的方式回答用户的问题。

## 6. MCP Server 接口定义 (初期 - 基于 `examples/stdio.ts`)

根据 `@jhgaylor/node-candidate-mcp-server/examples/stdio.ts` 的配置，初期可用的工具/资源（通过 `resources/read` 或 `tools/call` 调用）包括：

*   **资源 (通过 `resources/read`):**
    *   `candidate-info://resume-text`: 获取 `candidateConfig.resumeText`
    *   `candidate-info://resume-url`: 获取 `candidateConfig.resumeUrl`
    *   `candidate-info://linkedin-url`: 获取 `candidateConfig.linkedinUrl`
    *   `candidate-info://github-url`: 获取 `candidateConfig.githubUrl`
    *   `candidate-info://website-url`: 获取 `candidateConfig.websiteUrl`
*   **工具 (通过 `tools/call`):**
    *   `get_resume_text`: (功能上与读取资源 `candidate-info://resume-text` 类似)
    *   `get_resume_url`: (功能上与读取资源 `candidate-info://resume-url` 类似)
    *   ... (可以查看 `stdio.ts` 或 MCP Server 内部注册了哪些工具)

*(注意：具体可用的工具和资源需要以 `stdio.ts` 实际运行时注册到 MCP Server 实例为准。)*

## 7. 开发步骤与里程碑 (初步)

1.  **【BFF】基础后端框架搭建:**
    *   初始化 Node.js + Express.js 项目。
    *   设置基本的 API 端点 (例如 `/chat`)。
2.  **【BFF & MCP】后端与 MCP Server (Stdio) 通信实现:**
    *   在 BFF 中实现通过子进程启动 `node-candidate-mcp-server/examples/stdio.ts` (或其编译产物)。
    *   实现向子进程的 STDIN 发送 JSON-RPC 请求，并从 STDOUT 读取和解析响应的逻辑。
    *   编写一个简单的测试接口，手动构造 MCP 请求，验证与 MCP Server 的通信。
3.  **【BFF & LLM】集成 LangChain.js 和 OpenAI API (第一轮：工具判断):**
    *   安装 `langchain` 和 `openai` npm 包。
    *   配置 OpenAI API Key。
    *   使用 LangChain.js 定义 MCP 工具 (`Tool` 对象)。
    *   创建 LangChain Agent，并设计用于工具判断的 Prompt。
    *   实现接收用户问题后，调用 Agent 判断应使用哪个 MCP 工具的逻辑。
4.  **【BFF & MCP & LLM】实现 LangChain.js Agent 调用 MCP Server 工具:**
    *   将步骤 2 中的 MCP Server 通信逻辑封装成 LangChain `Tool` 的执行函数。
    *   确保 Agent 能够成功调用这些封装好的 MCP 工具。
5.  **【BFF & LLM】集成 LangChain.js (第二轮：基于工具结果生成回复):**
    *   设计用于生成最终回复的 Prompt。
    *   实现获取 MCP 工具返回结果后，结合用户问题，调用 OpenAI API 生成回复的逻辑。
6.  **【Frontend】开发简单前端页面进行联调:**
    *   创建简单的 HTML 页面，包含输入框和聊天显示区域。
    *   实现将用户输入发送到 BFF `/chat` 接口，并展示返回的 AI 回复。
7.  **【ALL】端到端测试和迭代优化。**

## 8. (可选) 部署方案初步考虑

*   **BFF 应用:** 可以部署到 Node.js 支持的云平台 (如 Vercel, Heroku, AWS EC2/Lambda, Google Cloud Run 等)。
*   **MCP Server:**
    *   Stdio 模式：与 BFF 应用部署在同一台服务器/容器内，由 BFF 应用作为子进程启动。
    *   HTTP 模式 (未来)：可以作为独立服务部署。
*   需要管理 OpenAI API Key 等敏感配置。

## 9. (可选) 潜在风险与挑战

*   **Prompt Engineering:** 设计高效、准确的 Prompt 可能需要多次迭代。
*   **LLM 幻觉:** LLM 可能会生成不准确或虚构的信息，需要注意。
*   **MCP Server 稳定性:** 确保作为子进程的 MCP Server 稳定运行，并能正确处理错误。
*   **Stdio 通信的复杂性:** 管理子进程和 STDIN/STDOUT 流可能比 HTTP 通信更复杂，尤其是在错误处理和并发方面。
*   **LangChain.js 学习曲线:** 团队成员可能需要时间熟悉 LangChain.js 的概念和用法。
*   **成本控制:** OpenAI API 调用会产生费用，需要监控和管理。 