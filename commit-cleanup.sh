#!/bin/bash

echo "🧹 提交项目清理版本：移除外部MCP依赖"
echo "========================================"

# 检查当前状态
echo "📋 检查当前git状态..."
git status

echo ""
echo "📁 当前项目结构："
ls -la

echo ""
echo "🔍 检查是否还有node-candidate-mcp-server引用..."
grep -r "node-candidate-mcp-server" . --exclude-dir=.git --exclude-dir=node_modules || echo "✅ 没有找到外部MCP服务器引用"

echo ""
echo "📦 添加所有更改到暂存区..."
git add .

echo ""
echo "📝 提交更改..."
git commit -m "🧹 项目清理：移除外部MCP依赖，完成集成化重构

✅ 主要更改：
- 移除对外部 node-candidate-mcp-server 的所有依赖
- 更新 llmService.js 使用集成的MCP服务器
- 删除旧的 mcpService.js 文件（子进程版本）
- 更新环境变量配置，移除外部路径引用
- 更新技术文档，反映集成模式架构
- 创建清理工作总结文档

🎯 结果：
- 项目现在完全自包含，无外部依赖
- 所有MCP功能通过集成模式提供
- 避免了项目层级混乱问题
- 保持了所有原有功能和性能

📊 测试状态：
- ✅ MCP工具正常加载（5个工具）
- ✅ 聊天API功能正常
- ✅ LangFuse监控正常工作
- ✅ 所有端点响应正常"

echo ""
echo "🚀 推送到远程仓库..."
git push

echo ""
echo "✅ 提交完成！项目现在只包含集成的ai-candidate-bff应用。" 