# 部署指南

## 部署前准备

### 1. 发布MCP服务器到npm
```bash
cd node-candidate-mcp-server
npm run build
npm publish
```

### 2. 更新依赖
将`package.json`中的本地依赖改为npm依赖：
```json
{
  "dependencies": {
    "@jhgaylor/candidate-mcp-server": "^1.3.3"
  }
}
```

## 部署选项

### 选项1: Vercel部署（推荐）

1. 安装Vercel CLI：
```bash
npm i -g vercel
```

2. 在项目根目录创建`vercel.json`：
```json
{
  "version": 2,
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
    "OPENAI_API_KEY": "@openai-api-key",
    "MAILGUN_API_KEY": "@mailgun-api-key",
    "MAILGUN_DOMAIN": "@mailgun-domain"
  }
}
```

3. 部署：
```bash
vercel --prod
```

### 选项2: Railway部署

1. 连接GitHub仓库到Railway
2. 设置环境变量：
   - `OPENAI_API_KEY`
   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`
3. Railway会自动检测Node.js项目并部署

### 选项3: Docker部署

1. 构建镜像：
```bash
docker build -t ai-candidate-bff .
```

2. 运行容器：
```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -e MAILGUN_API_KEY=your_key \
  -e MAILGUN_DOMAIN=your_domain \
  ai-candidate-bff
```

### 选项4: 传统VPS部署

1. 上传代码到服务器
2. 安装依赖：
```bash
npm ci --only=production
```

3. 使用PM2管理进程：
```bash
npm install -g pm2
pm2 start index.js --name "ai-candidate-bff"
pm2 startup
pm2 save
```

## 环境变量配置

确保在部署环境中设置以下环境变量：

```bash
OPENAI_API_KEY=your_openai_api_key
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
PORT=3000
NODE_ENV=production
```

## 验证部署

部署完成后，访问以下端点验证：

1. 健康检查：`GET /health`
2. MCP端点：`POST /mcp`
3. 聊天端点：`POST /chat`
4. 前端界面：`GET /`

## 注意事项

1. **安全性**：确保API密钥安全存储，不要提交到代码仓库
2. **CORS配置**：根据实际域名配置CORS策略
3. **日志监控**：在生产环境中配置适当的日志记录和监控
4. **性能优化**：考虑添加缓存和负载均衡 