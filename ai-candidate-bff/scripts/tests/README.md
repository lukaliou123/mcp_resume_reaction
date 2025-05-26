# 测试脚本目录

本目录包含了AI候选人BFF系统的所有测试和调试脚本。这些脚本用于开发、调试和验证系统功能。

## 目录结构

```
scripts/tests/
├── README.md                           # 本文档
├── 核心功能测试/
│   ├── test-live-query.js             # 实时查询测试
│   ├── test-llm-query.js              # LLM查询测试
│   ├── test-llm-tool-calls.js         # LLM工具调用测试
│   ├── test-mcp.js                    # MCP服务测试
│   └── test-openai.js                 # OpenAI API测试
├── 工具选择与调试/
│   ├── debug-tool-selection.js        # 工具选择调试
│   ├── debug-tools.js                 # 工具调试
│   ├── test-tool-selection-debug.js   # 工具选择调试测试
│   └── test-mcp-tools-step-by-step.js # MCP工具逐步测试
├── 项目查询测试/
│   ├── test-new-project-queries.js    # 新项目查询测试
│   ├── test-new-project-queries-fixed.js # 修复版项目查询测试
│   ├── test-refined-buttons.js        # 精细化按钮测试
│   └── test-refined-tools.js          # 精细化工具测试
├── 环境与配置/
│   ├── test-env.js                    # 环境变量测试
│   ├── test-env-vars.js               # 环境变量验证
│   └── simple-test.js                 # 简单测试
├── 验证脚本/
│   ├── verify-button-mapping.js       # 按钮映射验证
│   ├── verify-updated-tools.js        # 工具更新验证
│   └── quick-status-check.js          # 快速状态检查
├── 服务器测试/
│   ├── start-test-server.js           # 测试服务器启动
│   └── test-llm-refined.js            # LLM精细化测试
```

## 常用测试脚本

### 快速验证
```bash
# 快速状态检查
node scripts/tests/quick-status-check.js

# 实时查询测试
node scripts/tests/test-live-query.js

# 简单功能测试
node scripts/tests/simple-test.js
```

### 深度调试
```bash
# 工具选择调试
node scripts/tests/debug-tool-selection.js

# MCP工具逐步测试
node scripts/tests/test-mcp-tools-step-by-step.js

# LLM工具调用测试
node scripts/tests/test-llm-tool-calls.js
```

### 环境验证
```bash
# 环境变量检查
node scripts/tests/test-env-vars.js

# OpenAI连接测试
node scripts/tests/test-openai.js

# MCP服务测试
node scripts/tests/test-mcp.js
```

## 使用说明

1. **运行前确保**：
   - 已安装所有依赖：`npm install`
   - 配置了正确的环境变量（`.env`文件）
   - MCP服务正在运行

2. **测试顺序建议**：
   - 先运行环境验证脚本
   - 再运行核心功能测试
   - 最后进行深度调试

3. **故障排查**：
   - 如果测试失败，先检查环境变量
   - 查看服务器日志输出
   - 使用调试脚本定位问题

## 维护说明

- 新增测试脚本请放在对应分类目录
- 更新此README文档说明新脚本用途
- 定期清理过时的测试脚本
- 保持脚本的可执行性和文档完整性

---

**最后更新**: 2024年当前时间  
**维护者**: AI候选人BFF开发团队 