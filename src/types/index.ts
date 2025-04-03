export type ModelType = {
  name: string;
  value: string;
};

export type ActionType = {
  name: string;
  value: string;
};

export type Parameter = {
  key: string;
  value: string;
  isSecret?: boolean;
};

export type ExpectedResult = {
  description: string;
};

export type Step = {
  id: string;
  stepNumber: number;
  actionType: string;
  expectedResults: ExpectedResult[];
  parameters: Parameter[];
};

export type AgentConfig = {
  codeWriterModel?: string;
  htmlAssistantModel?: string;
  progressCheckerModel?: string;
  startPageUrl: string;
  projectName: string;
  scenarioName: string;
};

export type TestScenario = {
  agentConfig: AgentConfig;
  steps: Step[];
};
