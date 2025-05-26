#!/bin/bash

echo "🔍 AI Candidate BFF 部署前检查"
echo "================================"

# 检查Node.js版本
echo "📦 Node.js版本检查:"
node --version
npm --version
echo ""

# 检查package.json和package-lock.json同步状态
echo "🔄 依赖同步检查:"
if npm ci --dry-run > /dev/null 2>&1; then
    echo "✅ package.json 和 package-lock.json 同步正常"
else
    echo "❌ package.json 和 package-lock.json 不同步"
    echo "请运行: rm package-lock.json && npm install"
    exit 1
fi

# 检查关键依赖
echo ""
echo "📋 关键依赖检查:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules 目录存在"
    DEP_COUNT=$(find node_modules -maxdepth 2 -type d | wc -l)
    echo "✅ 已安装 $DEP_COUNT 个依赖包"
else
    echo "❌ node_modules 目录不存在"
    echo "请运行: npm install"
    exit 1
fi

# 检查环境变量模板
echo ""
echo "🔧 环境变量检查:"
if [ -f ".env.example" ] || [ -f ".env" ]; then
    echo "✅ 环境变量配置文件存在"
else
    echo "⚠️  建议创建 .env.example 文件"
fi

# 检查启动脚本
echo ""
echo "🚀 启动脚本检查:"
if npm run start:prod --dry-run > /dev/null 2>&1; then
    echo "✅ 生产环境启动脚本正常"
else
    echo "❌ 生产环境启动脚本有问题"
    exit 1
fi

echo ""
echo "🎉 所有检查通过！项目可以部署到腾讯云"
echo ""
echo "📝 部署建议:"
echo "1. 确保腾讯云环境变量已正确配置"
echo "2. 使用代码包部署而非Docker镜像部署"
echo "3. Node.js版本建议使用18.x"
echo "4. 确保端口3000可用" 