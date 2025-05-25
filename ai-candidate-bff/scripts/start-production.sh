#!/bin/bash

# AI候选人BFF生产环境启动脚本

set -e

echo "🚀 启动AI候选人BFF生产环境..."

# 检查Node.js版本
NODE_VERSION=$(node --version)
echo "📦 Node.js版本: $NODE_VERSION"

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ 错误: OPENAI_API_KEY环境变量未设置"
    exit 1
fi

if [ -z "$LANGFUSE_PUBLIC_KEY" ]; then
    echo "⚠️  警告: LANGFUSE_PUBLIC_KEY未设置，监控功能将不可用"
fi

# 设置生产环境
export NODE_ENV=production

# 检查配置文件
if [ ! -f "config/candidate.js" ]; then
    echo "❌ 错误: 候选人配置文件不存在"
    exit 1
fi

echo "✅ 配置检查完成"

# 启动应用
echo "🎯 启动应用..."
exec npm run start:prod 