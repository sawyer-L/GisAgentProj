package com.gisagentproj.backend.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiGatewayService {

    private static final Logger log = LoggerFactory.getLogger(AiGatewayService.class);

    private final AiProviderConfig config;
    private final RestClient restClient;

    public AiGatewayService(AiProviderConfig config) {
        this.config = config;
        this.restClient = RestClient.builder()
            .baseUrl(config.getBaseUrl())
            .build();
    }

    public String summarize(String prompt, String selectedFeature, List<String> nearbyFeatures) {
        if (!isConfigured()) {
            return mockSummarize(selectedFeature, nearbyFeatures);
        }

        String userMessage = String.format(
            "You are a GIS analysis assistant. The user selected '%s' on the map. "
            + "Nearby features: %s. "
            + "User request: %s. "
            + "Provide a concise risk summary in 2-3 sentences.",
            selectedFeature, String.join(", ", nearbyFeatures), prompt
        );

        return callAi(userMessage);
    }

    public String recommendation(String selectedFeature, List<String> nearbyFeatures) {
        if (!isConfigured()) {
            return mockRecommendation(selectedFeature, nearbyFeatures);
        }

        String nearest = nearbyFeatures.isEmpty() ? selectedFeature : nearbyFeatures.get(0);
        String userMessage = String.format(
            "You are a GIS field operations advisor. The user is analyzing '%s'. "
            + "Nearby features: %s. "
            + "Recommend a patrol/inspection order and explain why. Keep it to 2-3 sentences.",
            selectedFeature, String.join(", ", nearbyFeatures)
        );

        return callAi(userMessage);
    }

    public String generalChat(String prompt) {
        if (!isConfigured()) {
            return "AI 未配置。请设置 AI_API_KEY 环境变量以启用通用对话功能。";
        }

        String systemMessage = "你是一个有帮助的 AI 助手。请用中文回答用户的问题。";
        return callAiWithSystem(systemMessage, prompt);
    }

    private boolean isConfigured() {
        return config.getApiKey() != null && !config.getApiKey().isBlank();
    }

    private String callAi(String userMessage) {
        try {
            Map<String, Object> body = Map.of(
                "model", config.getModel(),
                "max_tokens", config.getMaxTokens(),
                "messages", List.of(
                    Map.of("role", "user", "content", userMessage)
                )
            );

            AnthropicResponse response = restClient.post()
                .uri("/v1/messages")
                .header("x-api-key", config.getApiKey())
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .body(body)
                .retrieve()
                .body(AnthropicResponse.class);

            if (response != null && response.content() != null && !response.content().isEmpty()) {
                return response.content().get(0).effectiveText();
            }

            log.warn("Empty AI response, falling back to mock");
            return "AI response unavailable.";
        } catch (Exception e) {
            log.error("AI call failed: {} ({})", e.getClass().getName(), e.getMessage(), e);
            return "AI call failed: " + e.getClass().getSimpleName() + " - " + e.getMessage();
        }
    }

    private String callAiWithSystem(String systemMessage, String userMessage) {
        try {
            Map<String, Object> body = Map.of(
                "model", config.getModel(),
                "max_tokens", config.getMaxTokens(),
                "system", systemMessage,
                "messages", List.of(
                    Map.of("role", "user", "content", userMessage)
                )
            );

            AnthropicResponse response = restClient.post()
                .uri("/v1/messages")
                .header("x-api-key", config.getApiKey())
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .body(body)
                .retrieve()
                .body(AnthropicResponse.class);

            if (response != null && response.content() != null && !response.content().isEmpty()) {
                return response.content().get(0).effectiveText();
            }

            log.warn("Empty AI response");
            return "AI 响应为空。";
        } catch (Exception e) {
            log.error("AI call failed: {} ({})", e.getClass().getName(), e.getMessage(), e);
            return "AI 调用失败: " + e.getClass().getSimpleName() + " - " + e.getMessage();
        }
    }

    private String mockSummarize(String selectedFeature, List<String> nearbyFeatures) {
        return "Mock AI summary: around " + selectedFeature
            + ", the agent found " + nearbyFeatures.size()
            + " relevant nearby features.";
    }

    private String mockRecommendation(String selectedFeature, List<String> nearbyFeatures) {
        String nearest = nearbyFeatures.isEmpty() ? selectedFeature : nearbyFeatures.get(0);
        return "Recommend inspecting " + nearest
            + " first, then continuing a focused patrol around " + selectedFeature + ".";
    }

    record AnthropicResponse(
        String id,
        String type,
        String role,
        List<ContentBlock> content
    ) {}

    record ContentBlock(
        String type,
        String text,
        String thinking
    ) {
        String effectiveText() {
            return text != null ? text : thinking;
        }
    }
}
