#!/bin/bash

echo "🔍 AI Candidate BFF 部署验证"
echo "================================"

# 检查package.json和package-lock.json中的@langchain/langgraph版本
echo "📦 检查依赖版本同步状态:"

PACKAGE_VERSION=$(grep -o '"@langchain/langgraph": "[^"]*"' package.json | cut -d'"' -f4)
LOCK_VERSION=$(grep -A1 '"@langchain/langgraph"' package-lock.json | grep '"version"' | cut -d'"' -f4)

echo "  package.json 版本: $PACKAGE_VERSION"
echo "  package-lock.json 版本: $LOCK_VERSION"

if [ "$PACKAGE_VERSION" = "^$LOCK_VERSION" ] || [ "$PACKAGE_VERSION" = "$LOCK_VERSION" ]; then
    echo "  ✅ 版本同步正常"
else
    echo "  ❌ 版本不同步"
    exit 1
fi

# 检查关键文件是否存在
echo ""
echo "📋 检查关键文件:"
FILES=("package.json" "package-lock.json" "index.js" "Dockerfile" ".dockerignore")

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file 缺失"
        exit 1
    fi
done

# 检查npm ci是否能正常工作
echo ""
echo "🔄 测试npm ci命令:"
if npm ci --dry-run > /dev/null 2>&1; then
    echo "  ✅ npm ci 测试通过"
else
    echo "  ❌ npm ci 测试失败"
    echo "  建议运行: rm -rf node_modules package-lock.json && npm install"
    exit 1
fi

# 检查git状态
echo ""
echo "📝 检查Git状态:"
if git status --porcelain | grep -q .; then
    echo "  ⚠️  有未提交的更改:"
    git status --porcelain
    echo ""
    echo "  建议运行:"
    echo "    git add ."
    echo "    git commit -m 'fix: 更新依赖版本'"
    echo "    git push"
else
    echo "  ✅ 所有更改已提交"
fi

echo ""
echo "🚀 部署建议:"
echo "1. 确保所有更改已推送到远程仓库"
echo "2. 在腾讯云重新触发部署"
echo "3. 如果仍然失败，检查腾讯云是否使用了缓存的旧代码包"
echo "4. 考虑清除腾讯云的构建缓存"

echo ""
echo "✅ 验证完成！当前代码状态良好，可以部署。" 