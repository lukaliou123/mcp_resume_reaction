# AI候选人BFF部署指南

## 概述

本文档提供了AI候选人BFF应用的完整部署指南，支持多种部署平台和方式。

## 环境要求

- Node.js 18+
- npm 或 yarn
- 有效的OpenAI API密钥
- LangFuse账户（用于监控）

## 环境变量配置

### 必需的环境变量

```bash
# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-nano

# LangFuse监控配置
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key_here
LANGFUSE_SECRET_KEY=your_langfuse_secret_key_here
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# 应用配置
NODE_ENV=production
PORT=3000
```

### 可选的环境变量

```bash
# 邮件服务（如果需要）
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here

# 安全配置
CORS_ORIGIN=https://your-domain.com
SESSION_SECRET=your_session_secret_here
```

## 部署选项

### 1. Vercel部署（推荐）

Vercel是最简单的部署方式，特别适合前端+API项目。

#### 步骤：

1. **连接GitHub仓库**
   ```bash
   # 推送代码到GitHub
   git push origin refactor
   ```

2. **在Vercel中导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击"New Project"
   - 选择你的GitHub仓库
   - 选择 `ai-candidate-bff` 目录

3. **配置环境变量**
   在Vercel项目设置中添加以下环境变量：
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `LANGFUSE_PUBLIC_KEY`
   - `LANGFUSE_SECRET_KEY`
   - `LANGFUSE_BASE_URL`

4. **部署**
   Vercel会自动检测到 `vercel.json` 配置并部署应用。

#### 优势：
- 自动部署和CI/CD
- 全球CDN
- 自动HTTPS
- 免费额度充足

### 2. Railway部署

Railway提供简单的容器化部署，支持数据库和其他服务。

#### 步骤：

1. **连接GitHub仓库**
   - 访问 [railway.app](https://railway.app)
   - 点击"New Project"
   - 选择"Deploy from GitHub repo"

2. **配置环境变量**
   在Railway项目设置中添加环境变量（同Vercel）

3. **部署**
   Railway会自动检测到 `railway.json` 配置并部署。

#### 优势：
- 支持数据库
- 简单的容器化部署
- 良好的开发者体验

### 3. Docker部署

适合自建服务器或云服务器部署。

#### 本地测试：

```bash
# 构建镜像
docker build -t ai-candidate-bff .

# 运行容器
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -e LANGFUSE_PUBLIC_KEY=your_key \
  -e LANGFUSE_SECRET_KEY=your_key \
  ai-candidate-bff
```

#### 使用docker-compose：

```bash
# 创建环境变量文件
cp .env.production .env

# 编辑环境变量
nano .env

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 生产环境部署：

```bash
# 在服务器上
git clone your-repo
cd ai-candidate-bff
cp .env.production .env
# 编辑.env文件设置真实的API密钥
docker-compose up -d
```

### 4. 传统VPS部署

适合使用PM2进行进程管理的传统部署方式。

#### 步骤：

```bash
# 1. 安装依赖
npm ci --only=production

# 2. 设置环境变量
cp .env.production .env
# 编辑.env文件

# 3. 安装PM2
npm install -g pm2

# 4. 启动应用
pm2 start index.js --name "ai-candidate-bff"

# 5. 设置开机自启
pm2 startup
pm2 save

# 6. 监控
pm2 status
pm2 logs ai-candidate-bff
```

## 健康检查

所有部署方式都支持健康检查：

```bash
# 检查应用状态
curl http://your-domain/health

# 检查监控状态
curl http://your-domain/monitoring
```

## 配置更新

### 候选人信息更新

1. **修改配置文件**
   ```bash
   # 编辑候选人信息
   nano config/candidate.js
   nano config/resume-content.js
   ```

2. **重新部署**
   - **Vercel/Railway**: 推送到GitHub自动部署
   - **Docker**: 重新构建镜像并重启容器
   - **PM2**: 重启应用 `pm2 restart ai-candidate-bff`

### 环境变量更新

- **Vercel**: 在项目设置中更新环境变量
- **Railway**: 在项目设置中更新环境变量
- **Docker**: 更新.env文件并重启容器
- **PM2**: 更新.env文件并重启应用

## 监控和日志

### LangFuse监控

访问 [LangFuse Dashboard](https://cloud.langfuse.com) 查看：
- API调用统计
- Token使用情况
- 错误日志
- 性能指标

### 应用日志

- **Vercel**: 在Vercel Dashboard查看函数日志
- **Railway**: 在Railway Dashboard查看部署日志
- **Docker**: `docker-compose logs -f`
- **PM2**: `pm2 logs ai-candidate-bff`

## 故障排除

### 常见问题

1. **应用无法启动**
   - 检查环境变量是否正确设置
   - 检查OpenAI API密钥是否有效
   - 查看应用日志

2. **MCP工具无法加载**
   - 确认配置文件路径正确
   - 检查候选人配置文件格式

3. **LangFuse监控不工作**
   - 检查LangFuse密钥是否正确
   - 确认网络连接正常

### 调试命令

```bash
# 本地调试
npm run dev

# 生产环境测试
npm run start:prod

# 健康检查
npm run health-check

# Docker调试
docker logs container_name
```

## 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码API密钥
   - 使用平台的环境变量管理功能

2. **网络安全**
   - 配置CORS_ORIGIN限制访问来源
   - 使用HTTPS（Vercel/Railway自动提供）

3. **访问控制**
   - 考虑添加API密钥验证
   - 实施速率限制

## 性能优化

1. **缓存策略**
   - 候选人信息缓存
   - API响应缓存

2. **监控指标**
   - 响应时间
   - 错误率
   - 资源使用情况

---

## 快速部署检查清单

- [ ] 设置所有必需的环境变量
- [ ] 测试OpenAI API连接
- [ ] 配置LangFuse监控
- [ ] 验证候选人配置文件
- [ ] 测试健康检查端点
- [ ] 配置域名和HTTPS（如需要）
- [ ] 设置监控和告警
- [ ] 备份配置文件 