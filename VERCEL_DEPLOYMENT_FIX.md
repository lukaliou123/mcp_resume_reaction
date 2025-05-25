# 🚀 Vercel部署修复指南

## 🔍 问题分析

### 本地问题
- ❌ **错误访问方式**: 直接访问 `http://localhost:3000/chat`
- ✅ **正确访问方式**: 访问 `http://localhost:3000` (主页)

### Vercel部署问题
- ❌ **404错误**: `/chat` 端点返回404
- 🔧 **原因**: Vercel配置不正确，没有正确识别Node.js应用

## ✅ 解决方案

### 1. 本地测试
```bash
# 启动应用
cd ai-candidate-bff && npm start

# 正确的访问方式
curl http://localhost:3000/health          # 健康检查
curl http://localhost:3000                 # 主页（聊天界面）
curl -X POST http://localhost:3000/chat \  # API测试
  -H "Content-Type: application/json" \
  -d '{"message": "测试"}'
```

### 2. Vercel重新部署
已更新 `vercel.json` 配置：

```json
{
  "version": 2,
  "name": "ai-candidate-bff",
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. 提交并重新部署
```bash
# 提交更改
git add .
git commit -m "🔧 修复Vercel部署配置

- 更新vercel.json使用@vercel/node构建器
- 修复路由配置确保所有请求正确转发到index.js
- 解决/chat端点404问题"

# 推送到远程仓库（触发Vercel自动部署）
git push
```

### 4. Vercel环境变量配置
在Vercel项目设置中添加以下环境变量：

```
NODE_ENV=production
OPENAI_API_KEY=你的OpenAI密钥
OPENAI_MODEL=gpt-4.1-nano
LANGFUSE_PUBLIC_KEY=pk-lf-c1ca0c8d-719f-49f3-aa91-dea138066b74
LANGFUSE_SECRET_KEY=sk-lf-80217aa1-0957-41ec-951e-9f7f94dfa3fc
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

## 🧪 验证步骤

### 部署成功后测试：
1. **主页访问**: `https://mcp-resume-reaction.vercel.app/`
2. **健康检查**: `https://mcp-resume-reaction.vercel.app/health`
3. **聊天功能**: 在主页界面测试对话

### 预期结果：
- ✅ 主页正常显示聊天界面
- ✅ 可以正常发送消息并收到AI回复
- ✅ 健康检查端点返回正常状态
- ✅ 所有MCP工具正常工作

## 🔧 故障排除

如果仍有问题：
1. 检查Vercel构建日志
2. 确认Root Directory设置为 `ai-candidate-bff`
3. 确认所有环境变量已正确设置
4. 检查函数日志中的错误信息 