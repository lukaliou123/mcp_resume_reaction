#!/bin/bash

# 部署前检查脚本

set -e

echo "🔍 执行部署前检查..."

# 检查必需文件
echo "📁 检查必需文件..."
required_files=(
    "package.json"
    "index.js"
    "config/candidate.js"
    "config/resume-content.js"
    "config/server.js"
    "src/mcp-server/server.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必需文件: $file"
        exit 1
    fi
done

echo "✅ 所有必需文件存在"

# 检查package.json
echo "📦 检查package.json..."
if ! node -e "require('./package.json')"; then
    echo "❌ package.json格式错误"
    exit 1
fi

echo "✅ package.json格式正确"

# 检查配置文件
echo "⚙️  检查配置文件..."
if ! node -e "require('./config/candidate.js')"; then
    echo "❌ 候选人配置文件格式错误"
    exit 1
fi

echo "✅ 配置文件格式正确"

# 检查依赖
echo "📚 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules不存在，正在安装依赖..."
    npm ci --only=production
fi

echo "✅ 依赖检查完成"

# 测试应用启动
echo "🧪 测试应用启动..."
timeout 10s npm run start:prod &
PID=$!
sleep 5

if kill -0 $PID 2>/dev/null; then
    echo "✅ 应用启动测试成功"
    kill $PID
else
    echo "❌ 应用启动失败"
    exit 1
fi

echo "🎉 所有检查通过，可以部署！" 