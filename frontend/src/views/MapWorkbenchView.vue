<template>
  <div class="workspace-shell" :class="store.currentThemeClass">
    <header class="topbar">
      <div class="title-stack">
        <p class="eyebrow">智慧管网 | SMART PIPELINE</p>
        <h1>智慧管网运营指挥平台-(演示版)</h1>
        <p class="hero-copy">
          集成 3D 地形、建筑白膜与地下管网可视化，AI 驱动的智慧管网运营分析平台。
        </p>
      </div>
      <div class="hero-side">
        <div class="topbar-row">
          <div class="status-chip">场景: {{ store.selectedScenario }}</div>
          <button class="report-trigger-btn" :class="{ highlight: reportHighlight }" @click="reportHighlight = false; showReport = true">
            <span class="report-icon">&#x1F4CB;</span>
            分析报告
            <span v-if="store.result.summary" class="report-badge">已有报告</span>
          </button>
        </div>
        <div class="hero-mini-metrics">
          <div v-for="metric in store.missionMetrics" :key="metric.label" class="mini-metric">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>
      </div>
    </header>

    <section class="capability-strip">
      <article v-for="item in store.capabilityHighlights" :key="item.id" class="capability-card">
        <strong>{{ item.title }}</strong>
        <p>{{ item.subtitle }}</p>
      </article>
    </section>

    <section class="status-rail">
      <article v-for="item in store.statusRail" :key="item.id" class="status-rail-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <main class="workspace-grid">
      <aside class="panel left-panel">
        <div class="panel-header">
          <h2>任务场景</h2>
          <span>{{ store.quickScenarios.length }} 个演示流程</span>
        </div>

        <div class="scenario-grid">
          <button
            v-for="scenario in store.quickScenarios"
            :key="scenario.id"
            class="scenario-card"
            @click="store.launchScenario(scenario.id)"
          >
            <strong>{{ scenario.name }}</strong>
            <p>{{ scenario.summary }}</p>
            <small>{{ scenario.target }}</small>
          </button>
        </div>

        <div class="panel-header spaced-header">
          <h2>图层控制</h2>
          <span>{{ store.visibleLayers.length }} 个可见</span>
        </div>

        <ul class="layer-list">
          <li v-for="layer in store.layers" :key="layer.id" class="layer-item">
            <label>
              <input :checked="layer.visible" type="checkbox" @change="store.toggleLayer(layer.id)" />
              <span class="layer-swatch" :style="{ backgroundColor: layer.color }"></span>
              <span>{{ layer.name }}</span>
            </label>
            <span class="feature-count">{{ layer.featureCount }} 个要素</span>
          </li>
        </ul>

        <div class="context-card">
          <h3>当前选中</h3>
          <p>{{ store.selectedFeatureName }}</p>
          <small>{{ store.selectedFeature?.description ?? "点击地图要素触发演示分析。" }}</small>
        </div>

        <div v-if="store.selectedPipe" class="pipe-info-card">
          <h3>管网详情</h3>
          <div class="pipe-type-badge" :style="{ background: pipeTypeColor(store.selectedPipe.pipeType) }">
            {{ pipeTypeLabel(store.selectedPipe.pipeType) }}
          </div>
          <p class="pipe-name">{{ store.selectedPipe.name }}</p>
          <div class="pipe-meta-grid">
            <span>管径: DN{{ store.selectedPipe.diameter }}</span>
            <span>材质: {{ store.selectedPipe.material }}</span>
            <span>状态: {{ store.selectedPipe.status === 'normal' ? '正常' : store.selectedPipe.status === 'warning' ? '预警' : '故障' }}</span>
            <span>安装: {{ store.selectedPipe.installYear }}年</span>
          </div>
          <small>{{ store.selectedPipe.description }}</small>
        </div>
      </aside>

      <section class="map-stage">
        <div class="map-stage-top">
          <div class="floating-brief">
            <span class="brief-kicker">管网指挥面板</span>
            <h2>智慧管网监控中心</h2>
            <p>实时监控供水、排水、燃气管网运行状态，AI 驱动智能分析与风险预警。</p>
          </div>

          <div class="floating-tags">
            <span class="floating-tag">在线管网: 8 条</span>
            <span class="floating-tag">监控要素: 5 个</span>
            <span class="floating-tag">AI 就绪</span>
          </div>

          <div class="pipe-legend">
            <div class="pipe-legend-item">
              <span class="pipe-legend-dot" style="background: #4bb5ff"></span>
              <span>供水管网</span>
            </div>
            <div class="pipe-legend-item">
              <span class="pipe-legend-dot" style="background: #ffb45c"></span>
              <span>排水管网</span>
            </div>
            <div class="pipe-legend-item">
              <span class="pipe-legend-dot" style="background: #ffe066"></span>
              <span>燃气管网</span>
            </div>
          </div>
        </div>

        <div class="command-feed">
          <article v-for="item in store.missionFeed" :key="item.id" class="feed-card">
            <span>{{ item.title }}</span>
            <p>{{ item.body }}</p>
          </article>
        </div>

        <section class="map-panel">
          <MapCanvas />
        </section>
      </section>

      <aside class="panel right-panel">
        <div class="panel-header">
          <h2>AI 对话</h2>
          <div class="ai-mode-toggle">
            <button
              class="mode-btn"
              :class="{ active: store.aiMode === 'gis' }"
              @click="store.aiMode = 'gis'"
            >GIS AI</button>
            <button
              class="mode-btn"
              :class="{ active: store.aiMode === 'general' }"
              @click="store.aiMode = 'general'"
            >通用 AI</button>
          </div>
        </div>

        <div class="prompt-card">
          <label for="agent-prompt">{{ store.aiMode === 'gis' ? 'GIS 分析任务提示' : '输入你的问题' }}</label>
          <textarea id="agent-prompt" v-model="store.userPrompt" rows="5" :placeholder="store.aiMode === 'gis' ? '分析当前资产 3 公里范围内的风险点...' : '输入任何问题，AI 将直接回答...'"></textarea>
          <div class="prompt-actions">
            <button class="run-button" :disabled="store.isLoading" @click="store.handleSubmit()">
              {{ store.isLoading ? "运行中..." : (store.aiMode === 'gis' ? "运行分析" : "发送") }}
            </button>
            <span class="source-badge">{{ store.aiMode === 'gis' ? 'GIS 分析模式' : '通用对话模式' }}</span>
          </div>
          <p class="response-message">{{ store.responseMessage }}</p>
        </div>

        <div class="quick-question-strip">
          <button v-for="question in store.quickQuestions" :key="question" class="question-pill">
            {{ question }}
          </button>
        </div>

        <div class="chat-panel">
          <div v-for="message in store.chatMessages" :key="message.id" class="chat-message" :data-speaker="message.speaker">
            <span class="chat-label">{{ message.label }}</span>
            <p>{{ message.text }}</p>
          </div>
        </div>

        <div class="panel-header spaced-header">
          <h2>Agent 团队</h2>
          <span>{{ store.agentRoster.length }} 个活跃角色</span>
        </div>

        <div class="agent-roster">
          <article v-for="agent in store.agentRoster" :key="agent.id" class="agent-card">
            <div class="agent-head">
              <strong>{{ agent.name }}</strong>
              <span :style="{ color: agent.accent }">{{ agent.status }}</span>
            </div>
            <p>{{ agent.role }}</p>
            <small>{{ agent.focus }}</small>
          </article>
        </div>

        <div class="panel-header spaced-header">
          <h2>执行轨迹</h2>
          <span>{{ store.agentSteps.length }} 个步骤</span>
        </div>

        <ol class="step-list">
          <li v-for="step in store.agentSteps" :key="step.id" class="step-item" :data-status="step.status">
            <div class="step-title">
              <strong>{{ step.title }}</strong>
              <span>{{ step.status }}</span>
            </div>
            <p>{{ step.detail }}</p>
          </li>
        </ol>
      </aside>
    </main>

    <!-- Report modal -->
    <Teleport to="body">
      <div v-if="showReport" class="report-overlay" @click.self="showReport = false">
        <div class="report-modal">
          <div class="report-modal-header">
            <h2>分析报告</h2>
            <span>{{ store.reportTitle }}</span>
            <button class="report-close-btn" @click="showReport = false">&times;</button>
          </div>

          <div class="report-modal-body">
            <div class="result-grid">
              <article class="result-card">
                <h3>AI 摘要</h3>
                <p>{{ store.result.summary }}</p>
              </article>

              <article class="result-card">
                <h3>建议操作</h3>
                <p>{{ store.result.recommendation }}</p>
              </article>

              <article class="result-card">
                <h3>地图高亮</h3>
                <ul>
                  <li v-for="item in store.result.highlights" :key="item">{{ item }}</li>
                </ul>
              </article>

              <article class="result-card">
                <h3>运行诊断</h3>
                <p>{{ store.responseSource === 'AI' ? 'AI 模式' : '演示模式' }}</p>
                <p>高亮: {{ store.highlightCount }}</p>
                <p>证据: {{ store.evidenceCount }}</p>
                <p>可见图层: {{ store.visibleLayers.length }}</p>
              </article>
            </div>

            <div class="evidence-grid">
              <article v-for="item in store.result.evidence" :key="item.id" class="evidence-card">
                <div class="evidence-head">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.status }}</span>
                </div>
                <p>{{ item.category }}</p>
                <small>{{ item.note }}</small>
              </article>
            </div>

            <div class="history-layout">
              <div class="history-column">
                <div class="panel-header">
                  <h2>任务历史</h2>
                  <span>{{ store.historyCount }} 条记录</span>
                </div>

                <div v-if="store.taskHistory.length === 0" class="history-empty">
                  暂无任务历史。启动场景或点击地图创建任务。
                </div>

                <ul v-else class="history-list">
                  <li v-for="item in store.taskHistory" :key="item.historyId">
                    <button
                      class="history-item"
                      :data-active="store.selectedHistoryId === item.historyId"
                      @click="store.loadHistoryEntry(item.historyId)"
                    >
                      <strong>{{ item.response.selectedFeature }}</strong>
                      <span>{{ item.source }} · {{ item.response.status }}</span>
                      <small>{{ item.response.finishedAt }}</small>
                    </button>
                  </li>
                </ul>
              </div>

              <div class="history-detail">
                <div class="panel-header">
                  <h2>快照详情</h2>
                  <span v-if="store.selectedHistoryItem">{{ store.selectedHistoryItem.response.selectedFeature }}</span>
                </div>

                <div v-if="store.selectedHistoryItem" class="history-snapshot">
                  <strong>已保存快照:</strong>
                  <p>{{ store.selectedHistoryItem.response.summary }}</p>
                  <div class="meta-strip">
                    <span>任务: {{ store.taskId }}</span>
                    <span>图层: {{ store.layerName }}</span>
                    <span>目标: {{ store.selectedFeatureName }}</span>
                    <span v-if="store.lastRunAt">完成: {{ store.lastRunAt }}</span>
                    <span>风险: {{ store.result.riskLevel }}</span>
                    <span>置信度: {{ Math.round(store.result.confidence * 100) }}%</span>
                    <span>预计: {{ store.result.estimatedDurationMinutes }} 分钟</span>
                  </div>
                </div>

                <div v-else class="history-empty">
                  运行任意任务以填充快照详情区域。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import MapCanvas from "@/components/MapCanvas.vue";
import { useWorkspaceStore } from "@/stores/workspace";
import type { PipeType } from "@/data/mockPipes";

const store = useWorkspaceStore();
const showReport = ref(false);
const reportHighlight = ref(false);

watch(
  () => store.result.summary,
  (val) => {
    if (val) reportHighlight.value = true;
  }
);

function pipeTypeColor(type: PipeType): string {
  const map: Record<PipeType, string> = {
    "water-supply": "#4bb5ff",
    drainage: "#ffb45c",
    gas: "#ffe066"
  };
  return map[type];
}

function pipeTypeLabel(type: PipeType): string {
  const map: Record<PipeType, string> = {
    "water-supply": "供水",
    drainage: "排水",
    gas: "燃气"
  };
  return map[type];
}
</script>
