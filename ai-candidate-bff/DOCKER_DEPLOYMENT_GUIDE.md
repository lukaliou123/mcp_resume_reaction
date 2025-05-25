# Docker部署问题解决指南

## 问题描述

在腾讯云使用Docker镜像部署时遇到以下错误：

```
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @langchain/langgraph@0.2.73 from lock file
```

## 问题根本原因

### 1. npm ci 命令的严格性
- `npm ci` 是为CI/CD环境设计的命令
- 要求 `package.json` 和 `package-lock.json` **完全同步**
- 任何不一致都会导致构建失败

### 2. 依赖同步问题
- `package.json` 中包含了新添加的依赖（如 `@langchain/langgraph`）
- `package-lock.json` 中缺少对应的锁定版本信息
- 这通常发生在手动编辑 `package.json` 后没有运行 `npm install`

### 3. Docker构建环境的特殊性
- Docker构建使用 `npm ci` 而不是 `npm install`
- 本地开发可能使用 `npm start` 直接运行，掩盖了依赖问题
- Docker环境暴露了这个潜在问题

## 解决方案

### 方案1：修复依赖同步（推荐）

```bash
# 1. 删除现有的lock文件和node_modules
rm -rf node_modules package-lock.json

# 2. 重新安装依赖，生成新的lock文件
npm install

# 3. 验证同步状态
npm ci --dry-run

# 4. 提交更新
git add package-lock.json
git commit -m "fix: 更新package-lock.json解决Docker构建问题"
git push
```

### 方案2：修改Dockerfile（不推荐）

```dockerfile
# 不推荐：使用npm install替代npm ci
RUN npm install --omit=dev && npm cache clean --force
```

**为什么不推荐方案2：**
- `npm install` 在生产环境不够稳定
- 可能安装不同版本的依赖
- 违背了Docker构建的确定性原则

## 验证修复

### 1. 本地验证
```bash
# 检查依赖同步
npm ci --dry-run

# 测试应用启动
npm start
```

### 2. Docker构建验证
```bash
# 本地Docker构建测试
docker build -t ai-candidate-bff-test .

# 运行容器测试
docker run -p 3000:3000 ai-candidate-bff-test
```

## 预防措施

### 1. 开发流程
- 添加新依赖后立即运行 `npm install`
- 提交代码时确保包含 `package-lock.json`
- 使用 `npm ci` 进行本地测试

### 2. CI/CD配置
- 在构建脚本中添加依赖同步检查
- 使用 `npm ci` 而不是 `npm install`

### 3. 团队协作
- 统一Node.js和npm版本
- 建立代码审查流程，检查依赖变更

## 当前状态

✅ **已修复**：
- 重新生成了 `package-lock.json`
- 更新了 Dockerfile 使用现代npm语法
- 验证了应用可以正常启动
- 提交了修复到远程仓库

✅ **可以重新部署**：
现在可以在腾讯云重新触发Docker构建，应该能够成功。

## 部署建议

### 腾讯云部署选项

1. **Docker镜像部署**（当前方案）
   - 优点：环境一致性好
   - 缺点：构建时间较长

2. **代码包部署**（推荐）
   - 优点：部署速度快，资源占用少
   - 缺点：需要配置Node.js运行环境

### 环境变量配置

确保在腾讯云配置以下环境变量：
```
NODE_ENV=production
PORT=3000
AI_PROVIDER_AREA=cn
DASHSCOPE_API_KEY=your_key
DASHSCOPE_MODEL=qwen-turbo-latest
LANGFUSE_PUBLIC_KEY=your_key
LANGFUSE_SECRET_KEY=your_key
```

## 总结

这个问题的本质是**依赖管理问题**，而不是Docker配置问题。通过修复 `package.json` 和 `package-lock.json` 的同步状态，可以彻底解决Docker构建失败的问题。 