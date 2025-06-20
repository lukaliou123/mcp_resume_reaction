const i18nConfig = {
  'zh-CN': {
    // 页面标题和描述
    title: 'AI候选人信息助手',
    subtitle: '与AI助手对话，获取候选人的详细信息',
    
    // 候选人信息
    candidateName: '陈嘉旭',
    candidatePosition: 'AI应用开发/Golang后端开发',
    candidateSkills: ['Golang', 'Java', 'Python', 'MySQL', 'Redis'],
    
    // 欢迎消息
    welcomeMessage: '您好！我是AI候选人信息助手。您可以向我询问关于候选人的任何问题，例如教育背景、工作经历、技能特长等。',
    
    // 快速问题按钮
    quickQuestions: [
      '介绍候选人背景',
      '技术能力有哪些',
      '工作经历',
      '个人项目',
      '工作项目',
      '非IT经验',
      '教育背景'
    ],
    
    // UI 界面文本
    ui: {
      send: '发送',
      clear: '清除历史',
      inputPlaceholder: '请输入您的问题...',
      loading: '正在思考中...',
      toolCall: '工具调用完成',
      error: '抱歉，发生了错误',
      retry: '点击重试',
      footer: '© 2025 AI候选人信息助手 | Powered by LangChain.js'
    },
    
    // 系统提示词 (用于LLM)
    systemPrompt: `你是一个专业的招聘助手，负责为用户介绍和解答关于候选人"陈嘉旭"的各类信息。请用中文回答所有问题。`,
    
    // 建议生成提示词
    suggestionPrompt: '基于以下对话信息，生成2-3个相关的后续问题建议（用中文表达）：'
  },
  
  'en-US': {
    // Page title and description
    title: 'AI Candidate Information Assistant',
    subtitle: 'Chat with AI assistant to get detailed candidate information',
    
    // Candidate information
    candidateName: 'Jaydon Chen',
    candidatePosition: 'AI Application Development/Golang Backend Development',
    candidateSkills: ['Golang', 'Java', 'Python', 'MySQL', 'Redis'],
    
    // Welcome message
    welcomeMessage: 'Hello! I am an AI candidate information assistant. You can ask me any questions about the candidate, such as educational background, work experience, skills, etc.',
    
    // Quick question buttons
    quickQuestions: [
      'Candidate Overview',
      'Technical Skills',
      'Work Experience',
      'Personal Projects',
      'Work Projects',
      'Non-IT Experience',
      'Education Background'
    ],
    
    // UI interface text
    ui: {
      send: 'Send',
      clear: 'Clear History',
      inputPlaceholder: 'Please enter your question...',
      loading: 'Thinking...',
      toolCall: 'Tool call completed',
      error: 'Sorry, an error occurred',
      retry: 'Click to retry',
      footer: '© 2025 AI Candidate Information Assistant | Powered by LangChain.js'
    },
    
    // System prompt (for LLM)
    systemPrompt: `You are a professional recruitment assistant responsible for introducing and answering various information about candidate "Jaydon Chen". Please answer all questions in English.`,
    
    // Suggestion generation prompt
    suggestionPrompt: 'Based on the following conversation information, generate 2-3 relevant follow-up question suggestions (in English):'
  }
};

// 获取当前语言配置
function getCurrentLanguage() {
  return process.env.APP_LANGUAGE || 'zh-CN';
}

// 获取当前语言的文本
function getTexts(lang = null) {
  const currentLang = lang || getCurrentLanguage();
  return i18nConfig[currentLang] || i18nConfig['zh-CN'];
}

// 获取特定键的文本
function getText(key, lang = null) {
  const texts = getTexts(lang);
  const keys = key.split('.');
  let result = texts;
  
  for (const k of keys) {
    result = result[k];
    if (!result) return key; // 如果找不到，返回原始key
  }
  
  return result;
}

module.exports = {
  i18nConfig,
  getCurrentLanguage,
  getTexts,
  getText
}; 