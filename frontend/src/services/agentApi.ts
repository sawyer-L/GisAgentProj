import type { AgentRunResult, RunDemoTaskPayload } from "@/types/agent";

export async function runDemoTask(payload: RunDemoTaskPayload): Promise<AgentRunResult> {
  const response = await fetch("/api/agent-tasks/demo-run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    data: {
      taskId: data.taskId,
      taskType: data.taskType,
      status: data.status,
      selectedFeature: data.selectedFeature,
      prompt: data.prompt,
      layerName: data.layerName,
      finishedAt: data.finishedAt,
      steps: data.steps,
      nearbyFeatures: data.nearbyFeatures,
      summary: data.summary,
      recommendation: data.recommendation,
      reportTitle: data.reportTitle,
      riskLevel: data.riskLevel,
      confidence: data.confidence,
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      evidence: data.evidence
    },
    source: "AI"
  };
}

export async function runGeneralChat(prompt: string): Promise<string> {
  const response = await fetch("/api/agent-tasks/general-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.reply;
}
