const { Tool } = require("./types");
const { candidateTools } = require("./candidateTools");

// 简化版本的interviewTools，暂时返回空对象
function interviewTools(candidateConfig) {
  return {
    GenerateInterviewQuestions: {
      bind: () => {} // 空实现
    },
    AssessRoleFit: {
      bind: () => {} // 空实现
    }
  };
}

module.exports = { Tool, candidateTools, interviewTools }; 