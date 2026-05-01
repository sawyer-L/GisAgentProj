package com.gisagentproj.backend.agent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gisagentproj.backend.ai.AiGatewayService;
import com.gisagentproj.backend.entity.AgentTask;
import com.gisagentproj.backend.gis.GisQueryService;
import com.gisagentproj.backend.report.ReportService;
import com.gisagentproj.backend.repository.AgentTaskRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AgentTaskService {

    private static final Logger log = LoggerFactory.getLogger(AgentTaskService.class);

    private final AiGatewayService aiGatewayService;
    private final GisQueryService gisQueryService;
    private final ReportService reportService;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private AgentTaskRepository taskRepository;

    public AgentTaskService(
        AiGatewayService aiGatewayService,
        GisQueryService gisQueryService,
        ReportService reportService,
        ObjectMapper objectMapper
    ) {
        this.aiGatewayService = aiGatewayService;
        this.gisQueryService = gisQueryService;
        this.reportService = reportService;
        this.objectMapper = objectMapper;
    }

    public AgentTaskDemoResponse demoTask() {
        return runDemoTask(
            "分析当前资产 3 公里范围内的风险点，并建议巡逻顺序。",
            "滨河泵站"
        );
    }

    public AgentTaskDemoResponse runDemoTask(String prompt, String selectedFeature) {
        OffsetDateTime startedAt = OffsetDateTime.now();

        List<String> nearbyFeatures = gisQueryService.nearbyFeatures(selectedFeature);
        String summary = aiGatewayService.summarize(prompt, selectedFeature, nearbyFeatures);
        String recommendation = aiGatewayService.recommendation(selectedFeature, nearbyFeatures);
        String taskId = "task-" + UUID.randomUUID().toString().substring(0, 8);
        String reportTitle = reportService.buildReportTitle(taskId);
        String riskLevel = gisQueryService.assessRiskLevel(selectedFeature);
        double confidence = gisQueryService.assessConfidence(selectedFeature);
        int estimatedDurationMinutes = gisQueryService.estimateDuration(selectedFeature);
        List<EvidenceItem> evidence = gisQueryService.buildEvidence(selectedFeature, nearbyFeatures);
        OffsetDateTime finishedAt = OffsetDateTime.now();

        List<TaskStep> steps = List.of(
            new TaskStep("collect-context", "DONE"),
            new TaskStep("query-gis", "DONE"),
            new TaskStep("ai-summary", "DONE"),
            new TaskStep("compose-report", "DONE")
        );

        // Persist to database if available
        if (taskRepository != null) {
            try {
                AgentTask task = new AgentTask();
                task.setTaskType("spatial-risk-summary");
                task.setStatus("COMPLETED");
                task.setSelectedFeature(selectedFeature);
                task.setPrompt(prompt);
                task.setLayerName(gisQueryService.demoLayerName());
                task.setSummary(summary);
                task.setRecommendation(recommendation);
                task.setReportTitle(reportTitle);
                task.setRiskLevel(riskLevel);
                task.setConfidence(confidence);
                task.setEstimatedDurationMinutes(estimatedDurationMinutes);
                task.setNearbyFeatures(toJson(nearbyFeatures));
                task.setEvidence(toJson(evidence));
                task.setStartedAt(startedAt);
                task.setFinishedAt(finishedAt);
                taskRepository.save(task);
                log.info("Persisted agent task: {}", task.getId());
            } catch (Exception e) {
                log.warn("Failed to persist agent task: {}", e.getMessage());
            }
        }

        return new AgentTaskDemoResponse(
            taskId,
            "spatial-risk-summary",
            "COMPLETED",
            selectedFeature,
            prompt,
            gisQueryService.demoLayerName(),
            finishedAt,
            steps,
            nearbyFeatures,
            summary,
            recommendation,
            reportTitle,
            riskLevel,
            confidence,
            estimatedDurationMinutes,
            evidence
        );
    }

    public List<AgentTask> getRecentTasks() {
        if (taskRepository != null) {
            return taskRepository.findTop20ByOrderByCreatedAtDesc();
        }
        return List.of();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    public record AgentTaskDemoResponse(
        String taskId,
        String taskType,
        String status,
        String selectedFeature,
        String prompt,
        String layerName,
        OffsetDateTime finishedAt,
        List<TaskStep> steps,
        List<String> nearbyFeatures,
        String summary,
        String recommendation,
        String reportTitle,
        String riskLevel,
        double confidence,
        int estimatedDurationMinutes,
        List<EvidenceItem> evidence
    ) {
    }

    public record TaskStep(String name, String status) {
    }

    public record EvidenceItem(String id, String title, String category, String status, String note) {
    }
}
