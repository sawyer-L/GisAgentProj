package com.gisagentproj.backend.api;

import com.gisagentproj.backend.agent.AgentTaskService;
import com.gisagentproj.backend.ai.AiGatewayService;
import com.gisagentproj.backend.entity.AgentTask;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent-tasks")
public class AgentTaskController {

    private final AgentTaskService agentTaskService;
    private final AiGatewayService aiGatewayService;

    public AgentTaskController(AgentTaskService agentTaskService, AiGatewayService aiGatewayService) {
        this.agentTaskService = agentTaskService;
        this.aiGatewayService = aiGatewayService;
    }

    @GetMapping("/demo")
    public AgentTaskService.AgentTaskDemoResponse demo() {
        return agentTaskService.demoTask();
    }

    @PostMapping("/demo-run")
    public AgentTaskService.AgentTaskDemoResponse runDemo(@RequestBody DemoRunRequest request) {
        return agentTaskService.runDemoTask(request.prompt(), request.selectedFeature());
    }

    @PostMapping("/general-chat")
    public Map<String, String> generalChat(@RequestBody GeneralChatRequest request) {
        String reply = aiGatewayService.generalChat(request.prompt());
        return Map.of("reply", reply);
    }

    @GetMapping("/history")
    public List<AgentTask> history() {
        return agentTaskService.getRecentTasks();
    }

    public record DemoRunRequest(String prompt, String selectedFeature) {
    }

    public record GeneralChatRequest(String prompt) {
    }
}
