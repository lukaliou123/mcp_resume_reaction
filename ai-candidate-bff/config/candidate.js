const resumeContent = require('./resume-content');
const resumeContentEn = require('./resume-content-en');
const { getCurrentLanguage } = require('./i18n');

// 根据当前语言获取相应的简历内容
function getResumeContent() {
  const lang = getCurrentLanguage();
  return lang === 'en-US' ? resumeContentEn : resumeContent;
}

// 根据当前语言获取候选人姓名
function getCandidateName() {
  const lang = getCurrentLanguage();
  return lang === 'en-US' ? 'Jaydon Chen' : '陈嘉旭';
}

module.exports = {
  // 基本信息
  name: getCandidateName(),
  email: "708980731@qq.com",
  
  // 链接信息
  resumeUrl: "",
  websiteUrl: "",
  linkedinUrl: "https://www.linkedin.com/in/jiaxu-chen-731896237/",
  githubUrl: "https://github.com/lukaliou123",
  
  // 详细简历内容（根据语言动态获取）
  resumeText: getResumeContent(),
  
  // 网站内容（如果有）
  websiteText: "",
  
  // 元数据
  lastUpdated: new Date().toISOString(),
  version: "1.0.0",
  
  // 多语言支持函数
  getResumeContent,
  getCandidateName
}; 