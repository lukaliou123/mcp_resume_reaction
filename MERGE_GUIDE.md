# 🔄 将Refactor分支合并到Main分支指南

## 📋 操作前准备

### 1. 确认当前状态
```bash
# 查看当前分支
git branch

# 查看分支状态
git status

# 确认refactor分支是最新的
git log --oneline refactor -5
```

### 2. 确保所有更改已提交
```bash
# 如果还有未提交的更改，先提交
git add .
git commit -m "🧹 项目清理：移除外部MCP依赖，完成集成化重构"
```

## 🎯 推荐方法：创建Merge Commit

### 步骤1：切换到main分支
```bash
git checkout main
```

### 步骤2：拉取最新的main分支（如果有远程仓库）
```bash
git pull origin main
```

### 步骤3：合并refactor分支
```bash
git merge refactor --no-ff -m "🔄 完成项目重构：集成MCP服务器，移除外部依赖

✅ 重构完成内容：
- 将外部node-candidate-mcp-server完全集成到ai-candidate-bff中
- 移除所有外部依赖，项目现在完全自包含
- 更新架构为集成模式，提升部署便利性
- 添加LangFuse监控集成
- 完善部署配置（支持Vercel、Railway、Docker等）
- 创建完整的文档和部署指南

🎯 重构成果：
- 项目结构更清晰，避免层级混乱
- 无外部依赖，可安全部署到任何环境
- 保持所有原有功能和性能
- 添加了生产就绪的监控和配置

📊 验证状态：
- ✅ MCP工具正常加载（5个工具）
- ✅ 聊天API功能正常
- ✅ LangFuse监控正常工作
- ✅ 所有端点响应正常
- ✅ 支持多种部署方式"
```

### 步骤4：推送到远程仓库
```bash
git push origin main
```

### 步骤5：清理（可选）
```bash
# 如果不再需要refactor分支，可以删除
git branch -d refactor

# 删除远程refactor分支（如果存在）
git push origin --delete refactor
```

## 🔍 验证合并结果

### 检查合并是否成功
```bash
# 查看最新的提交历史
git log --oneline --graph -10

# 确认文件结构正确
ls -la

# 确认ai-candidate-bff目录存在且完整
ls -la ai-candidate-bff/
```

### 测试功能
```bash
# 进入应用目录并测试
cd ai-candidate-bff
npm start

# 在另一个终端测试API
curl http://localhost:3000/health
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{"message": "测试"}'
```

## 🚨 注意事项

1. **备份重要数据** - 在执行合并前，确保重要数据已备份
2. **团队协作** - 如果是团队项目，提前通知其他成员
3. **CI/CD** - 合并后检查CI/CD流水线是否正常
4. **部署验证** - 合并后在测试环境验证部署是否正常

## 🎉 合并完成后

1. **更新README** - 确保项目README反映新的架构
2. **通知团队** - 告知团队成员项目结构的重大变更
3. **部署测试** - 在测试环境验证新架构的部署
4. **文档更新** - 更新相关技术文档和部署指南

## 🔄 如果需要回滚

如果合并后发现问题，可以回滚：

```bash
# 查看合并前的commit ID
git log --oneline

# 回滚到合并前的状态
git reset --hard <合并前的commit-id>

# 强制推送（谨慎使用）
git push --force-with-lease origin main
```

---

**建议：** 在执行合并前，先在本地测试环境验证refactor分支的所有功能正常工作。 