export interface AgentStep {
  name: string;
  status: string;
}

export interface AgentEvidenceItem {
  id: string;
  title: string;
  category: string;
  status: string;
  note: string;
}

export interface AgentTaskResponse {
  taskId: string;
  taskType: string;
  status: string;
  selectedFeature: string;
  prompt: string;
  layerName: string;
  finishedAt: string;
  steps: AgentStep[];
  nearbyFeatures: string[];
  summary: string;
  recommendation: string;
  reportTitle: string;
  riskLevel: "Low" | "Medium" | "High";
  confidence: number;
  estimatedDurationMinutes: number;
  evidence: AgentEvidenceItem[];
}

export interface RunDemoTaskPayload {
  prompt: string;
  selectedFeature: string;
}

export interface AgentRunResult {
  data: AgentTaskResponse;
  source: "demo" | "AI";
}
