# 流式输出实现方案 (SSE Streaming Implementation Plan)

## 📋 项目概述

为 AI 候选人 BFF 系统实现类似 ChatGPT 的流式文本输出效果，提升用户体验，减少等待时的焦虑感。

## 🎯 实现目标

### 主要目标
- 实现 token-by-token 的流式文本输出
- 保持现有功能完整性（MCP工具调用、对话历史、建议生成等）
- 提供渐进式的用户体验改进

### 用户体验提升
- ✅ 即时反馈，告别"黑屏等待"
- ✅ 类似 ChatGPT 的打字机效果
- ✅ 流式过程中显示思考状态
- ✅ 保持响应的交互性

## 🏗️ 技术方案

### 核心技术选择：SSE (Server-Sent Events)
**为什么选择 SSE？**
- ✅ 单向数据流，符合聊天场景
- ✅ 自动重连机制
- ✅ 比 WebSocket 更轻量
- ✅ 原生浏览器支持
- ✅ 与现有 HTTP 架构兼容性好

### 技术栈兼容性
- **后端**: Express.js 原生支持 SSE
- **AI模型**: LangChain OpenAI 支持流式输出
- **前端**: 原生 JavaScript EventSource API

## 📅 分阶段实现计划

### 阶段1: MVP版本 (2-3天) ✅ 已完成
**目标**: 基础流式文本输出

**核心功能**:
- ✅ 新增 `/chat/stream` SSE 端点
- ✅ LangChain 流式处理集成
- ✅ 前端 ReadableStream 实现
- ✅ 基础错误处理
- ✅ 流式光标动画效果
- ✅ 工具调用状态显示

**技术要点**:
```javascript
// 后端 SSE 响应格式
data: {"type": "token", "content": "hello"}
data: {"type": "end"}
data: {"type": "error", "message": "..."}
```

### 阶段2: 增强版本 (2-3天)
**目标**: 工具调用状态展示

**核心功能**:
- [ ] 工具调用过程可视化
- [ ] 思考过程流式展示
- [ ] 多工具串联状态管理
- [ ] 更丰富的状态提示

**技术要点**:
```javascript
// 扩展 SSE 消息类型
data: {"type": "thinking", "content": "正在分析GitHub仓库..."}
data: {"type": "tool_call", "tool": "github_analyze", "status": "started"}
data: {"type": "tool_result", "tool": "github_analyze", "status": "completed"}
```

### 阶段3: 完整版本 (1-2天)
**目标**: 完善用户体验

**核心功能**:
- [ ] 流式/非流式模式切换
- [ ] 高级错误恢复机制
- [ ] 性能优化和缓存
- [ ] 移动端适配优化

## 🔧 具体实现方案

### 1. 后端改造 (`ai-candidate-bff/index.js`)

#### 新增 SSE 端点
```javascript
// 流式聊天端点
app.post('/chat/stream', async (req, res) => {
  // 设置 SSE 响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  try {
    const { message, sessionId } = req.body;
    
    // 生成或使用会话ID
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 发送会话ID
    res.write(`data: ${JSON.stringify({
      type: 'session',
      sessionId: currentSessionId
    })}\n\n`);
    
    // 调用流式处理
    await llmService.processQueryStream(message, currentSessionId, res);
    
  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error.message
    })}\n\n`);
  } finally {
    res.end();
  }
});
```

### 2. LLM服务改造 (`ai-candidate-bff/llmService.js`)

#### 新增流式处理方法
```javascript
async processQueryStream(userMessage, sessionId, res) {
  // 获取对话历史和上下文
  const contextInfo = await this.contextService.enhanceWithGitHubContext(userMessage, sessionId);
  const chatHistory = await chatHistoryService.getFormattedHistory(sessionId);
  
  // 构建消息
  const messages = [
    { role: "system", content: enhancedSystemPrompt },
    ...chatHistory,
    { role: "user", content: userMessage }
  ];

  // 保存用户消息
  await chatHistoryService.addMessage(sessionId, 'user', userMessage);

  let fullResponse = '';
  
  try {
    // 创建流式agent
    const streamAgent = createReactAgent({
      llm: this.model,
      tools: this._createMonitoredTools(sessionId, userMessage).tools,
    });

    // 流式处理
    const stream = await streamAgent.streamEvents({
      messages: messages,
    }, {
      version: "v1",
      callbacks: [this.langfuseHandler]
    });

    for await (const event of stream) {
      if (event.event === 'on_llm_stream') {
        const token = event.data?.chunk?.content;
        if (token) {
          fullResponse += token;
          res.write(`data: ${JSON.stringify({
            type: 'token',
            content: token
          })}\n\n`);
        }
      }
    }

    // 发送完成信号
    res.write(`data: ${JSON.stringify({
      type: 'completed',
      fullText: fullResponse
    })}\n\n`);

    // 保存AI回复
    await chatHistoryService.addMessage(sessionId, 'assistant', fullResponse);

    // 生成建议
    const suggestions = await this.generateSuggestions(chatHistory, fullResponse, userMessage);
    res.write(`data: ${JSON.stringify({
      type: 'suggestions',
      suggestions: suggestions.suggestions || []
    })}\n\n`);

  } catch (error) {
    console.error('Stream processing error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error.message
    })}\n\n`);
  }
}
```

### 3. 前端改造 (`ai-candidate-bff/public/index.html`)

#### 流式消息处理
```javascript
class StreamingChat {
  constructor() {
    this.eventSource = null;
    this.currentMessageElement = null;
    this.isStreaming = false;
  }

  async sendStreamMessage(message) {
    if (this.isStreaming) return;
    
    this.isStreaming = true;
    
    // 显示用户消息
    addMessage(message, true);
    messageInput.value = '';
    
    // 创建AI消息容器
    this.currentMessageElement = this.createStreamingMessageElement();
    
    try {
      const response = await fetch('/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message,
          sessionId: currentSessionId 
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            this.handleStreamData(data);
          }
        }
      }
    } catch (error) {
      this.handleStreamError(error);
    } finally {
      this.isStreaming = false;
    }
  }

  handleStreamData(data) {
    switch (data.type) {
      case 'session':
        currentSessionId = data.sessionId;
        localStorage.setItem('chatSessionId', currentSessionId);
        break;
        
      case 'token':
        this.appendToken(data.content);
        break;
        
      case 'completed':
        this.finalizeMessage();
        break;
        
      case 'suggestions':
        this.addSuggestions(data.suggestions);
        break;
        
      case 'error':
        this.handleStreamError(data.message);
        break;
    }
  }

  appendToken(token) {
    if (this.currentMessageElement) {
      const textElement = this.currentMessageElement.querySelector('.message-text');
      textElement.textContent += token;
      
      // 自动滚动
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  createStreamingMessageElement() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper ai-wrapper';
    
    wrapper.innerHTML = `
      <div class="message ai-message">
        <div class="avatar ai-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
          <div class="message-text"></div>
          <div class="streaming-cursor">|</div>
        </div>
      </div>
    `;
    
    chatContainer.appendChild(wrapper);
    return wrapper;
  }
}

// 初始化流式聊天
const streamingChat = new StreamingChat();
```

## 📊 性能考虑

### 优化策略
1. **Token 批处理**: 避免过频繁的DOM更新
2. **防抖机制**: 限制滚动事件触发频率
3. **内存管理**: 及时清理EventSource连接
4. **错误恢复**: 实现自动重连机制

### 监控指标
- 流式响应延迟
- Token传输速率
- 错误率和重连成功率
- 用户体验满意度

## 🔒 错误处理策略

### 常见错误场景
1. **网络中断**: 自动重连机制
2. **服务端错误**: 优雅降级到非流式模式
3. **解析错误**: 跳过错误数据，继续处理
4. **超时处理**: 设置合理的超时时间

### 错误恢复流程
```javascript
// 错误恢复示例
function handleStreamError(error) {
  console.error('Stream error:', error);
  
  // 尝试降级到非流式模式
  if (retryCount < MAX_RETRIES) {
    setTimeout(() => {
      sendMessageToServer(lastUserMessage); // 降级处理
    }, RETRY_DELAY);
  }
}
```

## 🧪 测试策略

### 功能测试
- [x] 基础流式输出
- [ ] 错误场景处理
- [ ] 网络不稳定环境
- [ ] 多并发用户测试

### 性能测试
- [ ] 长文本流式输出
- [ ] 高频率token传输
- [ ] 内存使用情况
- [ ] 移动端性能

## 📱 移动端适配

### 考虑因素
- 网络稳定性较差
- 电池和性能限制
- 屏幕空间有限
- 触摸交互优化

### 适配策略
- 降低更新频率
- 简化动画效果
- 优化批处理大小
- 智能预加载

## 🎉 成功指标

### 用户体验指标
- 响应感知时间 < 500ms
- 流式输出流畅度 > 95%
- 错误率 < 1%
- 用户满意度提升

### 技术指标
- 首字节时间 < 200ms
- 平均token延迟 < 50ms
- 内存使用稳定
- CPU使用合理

---

## 📝 开发备注

### 当前状态
- ✅ 方案设计完成
- ✅ MVP版本开发完成
- ✅ 基础功能测试通过
- 🔄 等待用户体验测试

### 下一步行动
1. ✅ 实现后端SSE端点
2. ✅ 集成LangChain流式处理
3. ✅ 开发前端ReadableStream处理
4. ✅ 基础测试和调试
5. 🔄 用户体验测试和优化
6. ⏳ 准备阶段2增强版本

---

*文档创建时间: 2024-12-19*
*最后更新: 2024-12-19* 