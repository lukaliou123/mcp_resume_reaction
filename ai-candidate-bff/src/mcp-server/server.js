const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { ServerConfig, CandidateConfig } = require("./config");
const { candidateResources } = require("./resources");
const { candidateTools } = require("./tools");
const { candidatePrompts } = require("./prompts");
const { interviewTools } = require("./tools/interviewTools");

// Return a new instance of an MCP server
function createServer(serverConfig, candidateConfig) {
  const server = new McpServer({
    name: serverConfig.name,
    capabilities: getServerCapabilities(),
    version: serverConfig.version,
  });

  return bindToServer(server, serverConfig, candidateConfig);
}

function bindToServer(server, serverConfig, candidateConfig) {
  // Bind all available candidate tools + resources based on candidate configuration
  const resourceInstances = candidateResources(candidateConfig);
  const toolInstances = candidateTools(candidateConfig, serverConfig);
  const promptInstances = candidatePrompts(candidateConfig);
  const interviewToolInstances = interviewTools(candidateConfig);
  
  if (candidateConfig.resumeText) {
    resourceInstances.ResumeText.bind(server);
    toolInstances.GetResumeText.bind(server);
  }
  
  if (candidateConfig.resumeUrl) {
    resourceInstances.ResumeUrl.bind(server);
    toolInstances.GetResumeUrl.bind(server);
  }
  
  if (candidateConfig.linkedinUrl) {
    resourceInstances.LinkedinUrl.bind(server);
    toolInstances.GetLinkedinUrl.bind(server);
  }
  
  if (candidateConfig.githubUrl) {
    resourceInstances.GithubUrl.bind(server);
    toolInstances.GetGithubUrl.bind(server);
  }
  
  if (candidateConfig.websiteUrl) {
    resourceInstances.WebsiteUrl.bind(server);
    toolInstances.GetWebsiteUrl.bind(server);
  }
  
  if (candidateConfig.websiteText) {
    resourceInstances.WebsiteText.bind(server);
    toolInstances.GetWebsiteText.bind(server);
  }
  
  // Conditionally bind ContactCandidate tool if email and Mailgun config are available
  if (serverConfig.contactEmail && serverConfig.mailgunApiKey && serverConfig.mailgunDomain) {
    toolInstances.ContactCandidate?.bind(server);
  }

  // Bind all prompt templates
  promptInstances.GetCandidateBackground.bind(server);
  promptInstances.AssessTechProficiency.bind(server);
  promptInstances.GeneratePhoneScreen.bind(server);
  promptInstances.SummarizeCareerHighlights.bind(server);
  promptInstances.EvaluateJobFit.bind(server);
  promptInstances.AssessProductCollaboration.bind(server);
  promptInstances.AssessStartupFit.bind(server);
  
  // Bind interview tools
  interviewToolInstances.GenerateInterviewQuestions.bind(server);
  interviewToolInstances.AssessRoleFit.bind(server);

  return server;
}

function getServerCapabilities() {
  return {
    resources: {},
    tools: {},
    prompts: {},
  };
}

module.exports = { createServer, bindToServer, getServerCapabilities }; 