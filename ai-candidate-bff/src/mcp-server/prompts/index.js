// 简化版本的prompts，暂时返回空实现
function candidatePrompts(candidateConfig) {
  return {
    GetCandidateBackground: { bind: () => {} },
    AssessTechProficiency: { bind: () => {} },
    GeneratePhoneScreen: { bind: () => {} },
    SummarizeCareerHighlights: { bind: () => {} },
    EvaluateJobFit: { bind: () => {} },
    AssessProductCollaboration: { bind: () => {} },
    AssessStartupFit: { bind: () => {} }
  };
}

module.exports = { candidatePrompts }; 