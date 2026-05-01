import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { mockLayerPalette, mockSpatialFeatures } from "@/data/mockSpatial";
import { mockPipeLayerPalette, mockPipeSegments } from "@/data/mockPipes";
import { runDemoTask, runGeneralChat } from "@/services/agentApi";
import type { AgentTaskResponse } from "@/types/agent";

export interface LayerItem {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  featureCount: number;
}

export interface AgentStepView {
  id: string;
  title: string;
  status: "done" | "running" | "pending";
  detail: string;
}

export interface AgentResult {
  summary: string;
  highlights: string[];
  recommendation: string;
  riskLevel: "Low" | "Medium" | "High";
  confidence: number;
  estimatedDurationMinutes: number;
  evidence: AgentTaskResponse["evidence"];
}

export interface TaskHistoryItem {
  historyId: string;
  source: "demo" | "AI";
  viewedAt: string;
  response: AgentTaskResponse;
}

export interface ChatMessage {
  id: string;
  speaker: "user" | "assistant" | "system";
  label: string;
  text: string;
}

export interface AgentRosterItem {
  id: string;
  name: string;
  role: string;
  status: string;
  focus: string;
  accent: string;
}

export interface ScenarioCard {
  id: string;
  name: string;
  summary: string;
  target: string;
  prompt: string;
}

export interface MissionMetric {
  label: string;
  value: string;
  detail: string;
}

export interface CapabilityCard {
  id: string;
  title: string;
  subtitle: string;
}

export interface MissionFeedItem {
  id: string;
  title: string;
  body: string;
}

export interface StatusRailItem {
  id: string;
  label: string;
  value: string;
}

const spatialLayers: LayerItem[] = Object.entries(mockLayerPalette).map(([id, meta]) => ({
  id,
  name: meta.name,
  color: meta.color,
  visible: true,
  featureCount: mockSpatialFeatures.filter((feature) => feature.layerId === id).length
}));

const pipeLayers: LayerItem[] = Object.entries(mockPipeLayerPalette).map(([id, meta]) => ({
  id,
  name: meta.name,
  color: meta.color,
  visible: true,
  featureCount: mockPipeSegments.filter((p) => p.layerId === id).length
}));

const defaultLayers: LayerItem[] = [...spatialLayers, ...pipeLayers];

const scenarioCards: ScenarioCard[] = [
  {
    id: "risk-summary",
    name: "城市风险概览",
    summary: "汇总核心资产周边的隐患和可用现场资源。",
    target: "滨河泵站",
    prompt: "分析当前资产 3 公里范围内的风险点，并排列优先响应顺序。"
  },
  {
    id: "dispatch-route",
    name: "巡逻调度路线",
    summary: "生成最近巡逻力量的最佳首动路线。",
    target: "巡逻站A",
    prompt: "为最近的巡逻队创建首动路线，并说明停靠顺序。"
  },
  {
    id: "critical-node",
    name: "关键节点审查",
    summary: "解释为什么所选排水节点应优先于其他集群处理。",
    target: "西北排水节点",
    prompt: "解释为什么该排水节点应作为当前风险集群的核心处理。"
  }
];

const capabilityCards: CapabilityCard[] = [
  {
    id: "ai-chat",
    title: "AI 对话",
    subtitle: "基于所选地图对象和当前场景的自然语言简报。"
  },
  {
    id: "agent-flow",
    title: "Agent 工作流",
    subtitle: "可见的规划、GIS 查询、推理和报告生成步骤链。"
  },
  {
    id: "gis-analysis",
    title: "GIS 洞察",
    subtitle: "地图图层、风险热点和调度资源统一在一个指挥界面中。"
  }
];

const defaultRoster: AgentRosterItem[] = [
  {
    id: "planner",
    name: "规划 Agent",
    role: "任务分解",
    status: "Ready",
    focus: "将任务目标拆解为确定的 GIS 和推理步骤。",
    accent: "#86d4ff"
  },
  {
    id: "gis",
    name: "GIS 分析师",
    role: "空间证据",
    status: "Linked",
    focus: "将请求映射到可见图层、热点和巡逻资源上。",
    accent: "#57d48d"
  },
  {
    id: "reporter",
    name: "报告 Agent",
    role: "呈现输出",
    status: "Watching",
    focus: "将结果转化为面向客户的运营简报。",
    accent: "#ffb45c"
  }
];

const stepTitles: Record<string, string> = {
  "collect-context": "采集地图上下文",
  "query-gis": "执行 GIS 查询",
  "reason-over-map": "生成 AI 推理",
  "compose-report": "撰写结构化报告"
};

const stepDescriptions: Record<string, string> = {
  "collect-context": "获取当前选中资产、相机视角和可见图层信息。",
  "query-gis": "从数据集中读取附近的风险点、巡逻节点和关联地图对象。",
  "reason-over-map": "模拟 AI 推理过程，排列最相关的干预目标。",
  "compose-report": "组装简报、证据卡片和高亮包用于演示。"
};

function defaultResult(): AgentResult {
  return {
    summary: "当前资产附近有两个风险点和一个支援巡逻站。",
    highlights: ["西北排水节点", "河流传感器信标", "巡逻站A"],
    recommendation: "优先检查西北排水节点，然后沿堤防路线继续巡查。",
    riskLevel: "High",
    confidence: 0.93,
    estimatedDurationMinutes: 38,
    evidence: []
  };
}

function initialChat(): ChatMessage[] {
  return [];
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const layers = ref<LayerItem[]>(defaultLayers);
  const selectedScenario = ref("Urban Risk Overview");
  const selectedFeatureName = ref("滨河泵站");
  const userPrompt = ref("分析当前资产 3 公里范围内的风险点，并排列优先响应顺序。");
  const agentSteps = ref<AgentStepView[]>([]);
  const result = ref<AgentResult>(defaultResult());
  const taskId = ref("task-demo-001");
  const reportTitle = ref("Agent Report - demo-task-001");
  const layerName = ref("mock-risk-layer");
  const responseSource = ref<"demo" | "AI">("AI");
  const isLoading = ref(false);
  const errorMessage = ref("");
  const highlightedFeatureNames = ref<string[]>([]);
  const lastRunAt = ref("");
  const responseMessage = ref("点击地图要素或启动任务场景，AI 将进行智能分析。");
  const taskHistory = ref<TaskHistoryItem[]>([]);
  const selectedHistoryId = ref("");
  const chatMessages = ref<ChatMessage[]>(initialChat());
  const agentRoster = ref<AgentRosterItem[]>(defaultRoster);
  const quickScenarios = ref<ScenarioCard[]>(scenarioCards);
  const capabilityHighlights = ref<CapabilityCard[]>(capabilityCards);
  const aiMode = ref<"gis" | "general">("gis");
  const selectedPipeId = ref("");

  const visibleLayers = computed(() => layers.value.filter((item) => item.visible));
  const selectedPipe = computed(() =>
    mockPipeSegments.find((p) => p.id === selectedPipeId.value)
  );
  const allFeatures = computed(() => mockSpatialFeatures);
  const selectedFeature = computed(() =>
    allFeatures.value.find((feature) => feature.name === selectedFeatureName.value)
  );
  const selectedHistoryItem = computed(() =>
    taskHistory.value.find((item) => item.historyId === selectedHistoryId.value)
  );
  const historyCount = computed(() => taskHistory.value.length);
  const highlightCount = computed(() => result.value.highlights.length);
  const evidenceCount = computed(() => result.value.evidence.length);
  const missionMetrics = computed<MissionMetric[]>(() => [
    {
      label: "风险等级",
      value: result.value.riskLevel,
      detail: "当前场景严重程度"
    },
    {
      label: "置信度",
      value: `${Math.round(result.value.confidence * 100)}%`,
      detail: "分析置信度"
    },
    {
      label: "预计时间",
      value: `${result.value.estimatedDurationMinutes} 分钟`,
      detail: "预计现场行动时间"
    },
    {
      label: "证据数",
      value: String(result.value.evidence.length),
      detail: "结构化地图关联证据"
    }
  ]);
  const quickQuestions = computed(() => [
    `为什么 ${selectedFeatureName.value} 应优先处理？`,
    `${selectedFeatureName.value} 的推荐巡逻行动链是什么？`,
    "当前任务场景中排名前三的 GIS 证据点是什么？"
  ]);
  const missionFeed = computed<MissionFeedItem[]>(() => [
    {
      id: "feed-1",
      title: "场景焦点",
      body: `${selectedFeatureName.value} 是当前演示的核心对象。`
    },
    {
      id: "feed-2",
      title: "Agent 状态",
      body: `${agentRoster.value[0]?.status ?? "就绪"} / ${agentRoster.value[1]?.status ?? "已连接"} / ${agentRoster.value[2]?.status ?? "监听中"}`
    },
    {
      id: "feed-3",
      title: "简报信息",
      body: isLoading.value ? "分析中..." : result.value.summary ? "分析完成" : "等待指令"
    }
  ]);
  const currentThemeClass = computed(() => {
    if (selectedScenario.value === "Patrol Dispatch Route") {
      return "theme-dispatch";
    }

    if (selectedScenario.value === "Critical Node Review") {
      return "theme-critical";
    }

    return "theme-risk";
  });
  const statusRail = computed<StatusRailItem[]>(() => [
    {
      id: "rail-1",
      label: "场景",
      value: selectedScenario.value
    },
    {
      id: "rail-2",
      label: "Agent",
      value: `${agentRoster.value[0]?.status ?? "Ready"} / ${agentRoster.value[1]?.status ?? "Linked"}`
    },
    {
      id: "rail-3",
      label: "简报",
      value: result.value.riskLevel
    }
  ]);

  function toggleLayer(layerId: string) {
    const layer = layers.value.find((item) => item.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  function setSelectedFeature(name: string) {
    selectedFeatureName.value = name;
  }

  function selectPipe(pipeId: string) {
    selectedPipeId.value = pipeId;
  }

  function clearPipeSelection() {
    selectedPipeId.value = "";
  }

  function setAgentStatuses(mode: "idle" | "running" | "done") {
    agentRoster.value = agentRoster.value.map((agent) => {
      if (mode === "running") {
        return {
          ...agent,
          status:
            agent.id === "planner"
              ? "规划中"
              : agent.id === "gis"
                ? "查询中"
                : "起草中"
        };
      }

      if (mode === "done") {
        return {
          ...agent,
          status:
            agent.id === "planner"
              ? "已完成"
              : agent.id === "gis"
                ? "已映射"
                : "已生成"
        };
      }

      return {
        ...agent,
        status:
          agent.id === "planner"
            ? "就绪"
            : agent.id === "gis"
              ? "已连接"
              : "监听中"
      };
    });
  }

  function pushChatMessage(message: ChatMessage) {
    chatMessages.value = [...chatMessages.value.slice(-9), message];
  }

  function mapTaskStatus(status: string): "done" | "running" | "pending" {
    if (status === "DONE" || status === "COMPLETED") {
      return "done";
    }

    if (status === "RUNNING") {
      return "running";
    }

    return "pending";
  }

  function applyTaskResponse(response: AgentTaskResponse) {
    taskId.value = response.taskId;
    reportTitle.value = response.reportTitle;
    layerName.value = response.layerName;
    selectedFeatureName.value = response.selectedFeature;
    userPrompt.value = response.prompt;
    agentSteps.value = response.steps.map((step) => ({
      id: step.name,
      title: stepTitles[step.name] ?? step.name,
      status: mapTaskStatus(step.status),
      detail: stepDescriptions[step.name] ?? `Current demo step status: ${step.status}`
    }));
    result.value = {
      summary: response.summary,
      highlights: response.nearbyFeatures,
      recommendation: response.recommendation,
      riskLevel: response.riskLevel,
      confidence: response.confidence,
      estimatedDurationMinutes: response.estimatedDurationMinutes,
      evidence: response.evidence
    };
    highlightedFeatureNames.value = [response.selectedFeature, ...response.nearbyFeatures];
    lastRunAt.value = response.finishedAt;
    setAgentStatuses("done");
  }

  function addHistoryEntry(response: AgentTaskResponse, source: "demo" | "AI") {
    const historyId = `history-${Date.now()}-${taskHistory.value.length + 1}`;
    const entry: TaskHistoryItem = {
      historyId,
      source,
      viewedAt: new Date().toISOString(),
      response: {
        ...response
      }
    };

    taskHistory.value = [entry, ...taskHistory.value].slice(0, 8);
    selectedHistoryId.value = historyId;
  }

  function loadHistoryEntry(historyId: string) {
    const entry = taskHistory.value.find((item) => item.historyId === historyId);
    if (!entry) {
      return;
    }

    selectedHistoryId.value = historyId;
    responseSource.value = entry.source;
    applyTaskResponse(entry.response);
    responseMessage.value = "正在查看历史任务快照。";
    pushChatMessage({
      id: `assistant-history-${Date.now()}`,
      speaker: "assistant",
      label: "AI 助手",
      text: `已重新加载 ${entry.response.selectedFeature} 的简报。相同的高亮目标和证据卡片仍然可用于演示。`
    });
  }

  async function runAnalysis() {
    isLoading.value = true;
    errorMessage.value = "";
    responseMessage.value = "正在调用 AI 进行分析...";
    setAgentStatuses("running");

    pushChatMessage({
      id: `user-${Date.now()}`,
      speaker: "user",
      label: "操作员",
      text: userPrompt.value
    });

    try {
      const { data, source } = await runDemoTask({
        prompt: userPrompt.value,
        selectedFeature: selectedFeatureName.value
      });

      responseSource.value = source;
      applyTaskResponse(data);
      addHistoryEntry(data, source);
      responseMessage.value = "AI 分析完成，结果已生成。";

      pushChatMessage({
        id: `assistant-${Date.now()}`,
        speaker: "assistant",
        label: "AI 助手",
        text: `${data.summary} 建议操作: ${data.recommendation}`
      });
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Unknown error";
      responseMessage.value = "AI 分析运行失败。";
      setAgentStatuses("idle");
      pushChatMessage({
        id: `system-error-${Date.now()}`,
        speaker: "system",
        label: "系统",
        text: responseMessage.value
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function runAnalysisForFeature(name: string) {
    setSelectedFeature(name);
    await runAnalysis();
  }

  async function launchScenario(scenarioId: string) {
    const scenario = quickScenarios.value.find((item) => item.id === scenarioId);
    if (!scenario) {
      return;
    }

    selectedScenario.value = scenario.name;
    selectedFeatureName.value = scenario.target;
    userPrompt.value = scenario.prompt;
    await runAnalysis();
  }

  function toggleAiMode() {
    aiMode.value = aiMode.value === "gis" ? "general" : "gis";
  }

  async function sendGeneralChat() {
    isLoading.value = true;
    errorMessage.value = "";
    responseMessage.value = "正在与 AI 对话...";

    pushChatMessage({
      id: `user-${Date.now()}`,
      speaker: "user",
      label: "操作员",
      text: userPrompt.value
    });

    try {
      const reply = await runGeneralChat(userPrompt.value);
      responseMessage.value = "AI 回复完成。";

      pushChatMessage({
        id: `assistant-${Date.now()}`,
        speaker: "assistant",
        label: "AI 助手",
        text: reply
      });
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Unknown error";
      responseMessage.value = "AI 对话失败。";
      pushChatMessage({
        id: `system-error-${Date.now()}`,
        speaker: "system",
        label: "系统",
        text: responseMessage.value
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function handleSubmit() {
    if (aiMode.value === "general") {
      await sendGeneralChat();
    } else {
      await runAnalysis();
    }
  }

  return {
    layers,
    selectedScenario,
    selectedFeatureName,
    userPrompt,
    agentSteps,
    result,
    taskId,
    reportTitle,
    layerName,
    responseSource,
    isLoading,
    errorMessage,
    highlightedFeatureNames,
    lastRunAt,
    responseMessage,
    taskHistory,
    selectedHistoryId,
    selectedHistoryItem,
    historyCount,
    highlightCount,
    evidenceCount,
    visibleLayers,
    allFeatures,
    selectedFeature,
    chatMessages,
    agentRoster,
    quickScenarios,
    capabilityHighlights,
    missionMetrics,
    quickQuestions,
    missionFeed,
    currentThemeClass,
    statusRail,
    aiMode,
    selectedPipeId,
    selectedPipe,
    toggleLayer,
    setSelectedFeature,
    selectPipe,
    clearPipeSelection,
    runAnalysis,
    runAnalysisForFeature,
    loadHistoryEntry,
    launchScenario,
    toggleAiMode,
    sendGeneralChat,
    handleSubmit
  };
});
