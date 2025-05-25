#!/bin/bash

echo "🚀 启动AI候选人BFF应用..."
echo "=========================================="

# 检查当前目录
echo "📁 当前目录: $(pwd)"

# 进入应用目录
cd ai-candidate-bff

echo "📁 应用目录: $(pwd)"
echo "📋 检查文件..."
ls -la

echo ""
echo "📦 检查package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
    echo "🔍 启动脚本:"
    grep -A 5 '"scripts"' package.json
else
    echo "❌ package.json 不存在"
    exit 1
fi

echo ""
echo "📋 检查主文件..."
if [ -f "index.js" ]; then
    echo "✅ index.js 存在"
else
    echo "❌ index.js 不存在"
    exit 1
fi

echo ""
echo "🔧 检查环境变量..."
if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
    echo "🔍 环境变量（隐藏敏感信息）:"
    grep -v "API_KEY\|SECRET" .env || echo "无非敏感环境变量"
else
    echo "⚠️  .env 文件不存在"
fi

echo ""
echo "📦 检查依赖..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules 存在"
else
    echo "⚠️  node_modules 不存在，正在安装依赖..."
    npm install
fi

echo ""
echo "🚀 启动应用..."
echo "=========================================="
echo "📊 实时日志输出:"
echo ""

# 启动应用并显示日志
npm start 