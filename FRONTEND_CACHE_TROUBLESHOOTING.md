# 前端缓存问题排查指南

## 问题描述
前端只显示一个"eino"项目，而不是完整的4个个人项目列表。

## 可能原因分析

### 1. 浏览器缓存问题 ⭐ 最常见
- 浏览器缓存了旧的API响应
- 静态资源（HTML/CSS/JS）被缓存
- Service Worker缓存（如果有）

### 2. AI工具选择问题
- AI仍在使用`get_resume_text`而不是`get_personal_projects`
- 工具选择策略不够明确

### 3. 服务器状态问题
- 服务器没有重启，仍在使用旧代码
- 环境变量或配置没有更新

## 排查步骤

### 步骤1：清除浏览器缓存
```bash
# Chrome/Edge
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

# 或者
1. Ctrl+Shift+Delete
2. 选择"缓存的图片和文件"
3. 点击"清除数据"
```

### 步骤2：检查网络请求
```bash
# 在开发者工具中
1. 打开 Network 标签
2. 点击"个人项目"按钮
3. 查看 /chat 请求的响应内容
4. 确认响应中是否包含所有4个项目
```

### 步骤3：重启服务器
```bash
cd ai-candidate-bff
# 停止当前服务器 (Ctrl+C)
npm start
```

### 步骤4：测试API响应
```bash
# 使用curl测试
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "个人项目"}'
```

### 步骤5：检查服务器日志
```bash
# 查看服务器启动日志
# 确认加载了所有细化工具：
# - mcp__candidate__get_personal_projects
# - mcp__candidate__get_work_projects
# 等
```

## 预期结果

正确的个人项目响应应该包含：
1. **AI候选人BFF系统** (2025-05 ~ 至今)
2. **Browser CoT · 浏览器思维链记录与可视化插件** (2025-05 ~ 至今)  
3. **Ideas Collection · 个人想法收集与知识管理系统** (2025-04 ~ 至今)
4. **旅游助手智能体** (2025-04 ~ 至今)

## 快速验证命令

```bash
# 在ai-candidate-bff目录下运行
node test-live-query.js
```

这个脚本会：
- 模拟前端请求
- 检查响应内容
- 验证是否包含AI候选人BFF项目
- 显示响应预览

## 如果问题仍然存在

1. **检查AI模型配置**
   - 确认使用的是OpenAI还是千问
   - 不同模型的工具选择行为可能不同

2. **查看LangFuse监控**
   - 登录LangFuse查看工具调用日志
   - 确认AI实际调用了哪个工具

3. **手动测试MCP服务**
   ```bash
   node quick-status-check.js
   ```

4. **联系开发者**
   - 提供浏览器开发者工具的Network截图
   - 提供服务器控制台日志

---

**更新时间**: 2024年当前时间  
**适用版本**: AI候选人BFF v1.0.0 