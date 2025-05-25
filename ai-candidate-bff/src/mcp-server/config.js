class ServerConfig {
  constructor(name = "Candidate MCP Server", version = "1.0.0", options = {}) {
    this.name = name;
    this.version = version;
    this.mailgunApiKey = options.mailgunApiKey;
    this.mailgunDomain = options.mailgunDomain;
    this.contactEmail = options.contactEmail;
  }
}

class CandidateConfig {
  constructor(name = "Candidate", options = {}) {
    this.name = name;
    this.resumeText = options.resumeText;
    this.resumeUrl = options.resumeUrl;
    this.linkedinUrl = options.linkedinUrl;
    this.githubUrl = options.githubUrl;
    this.websiteUrl = options.websiteUrl;
    this.websiteText = options.websiteText;
  }
}

module.exports = { CandidateConfig, ServerConfig }; 