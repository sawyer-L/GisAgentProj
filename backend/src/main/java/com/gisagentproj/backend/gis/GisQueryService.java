package com.gisagentproj.backend.gis;

import com.gisagentproj.backend.agent.AgentTaskService.EvidenceItem;
import com.gisagentproj.backend.entity.SpatialFeature;
import com.gisagentproj.backend.repository.SpatialFeatureRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GisQueryService {

    private static final Logger log = LoggerFactory.getLogger(GisQueryService.class);
    private static final double NEARBY_RADIUS_METERS = 3000;

    private static final Map<String, double[]> FEATURE_COORDS = Map.of(
        "滨河泵站", new double[]{116.3074, 40.0570},
        "西北排水节点", new double[]{116.293, 40.069},
        "河流传感器信标", new double[]{116.321, 40.048},
        "巡逻站A", new double[]{116.330, 40.061}
    );

    @Autowired(required = false)
    private SpatialFeatureRepository featureRepository;

    public String demoLayerName() {
        return "risk-layer";
    }

    public List<String> nearbyFeatures(String selectedFeature) {
        if (featureRepository != null) {
            try {
                return nearbyFeaturesFromDb(selectedFeature);
            } catch (Exception e) {
                log.warn("DB query failed, falling back to mock: {}", e.getMessage());
            }
        }
        return mockNearbyFeatures(selectedFeature);
    }

    public String assessRiskLevel(String selectedFeature) {
        if (featureRepository != null) {
            try {
                return assessRiskLevelFromDb(selectedFeature);
            } catch (Exception e) {
                log.warn("DB risk assessment failed, falling back to mock: {}", e.getMessage());
            }
        }
        return mockRiskLevel(selectedFeature);
    }

    public double assessConfidence(String selectedFeature) {
        return switch (selectedFeature) {
            case "西北排水节点" -> 0.95;
            case "滨河泵站" -> 0.93;
            case "巡逻站A" -> 0.89;
            default -> 0.85;
        };
    }

    public int estimateDuration(String selectedFeature) {
        return switch (selectedFeature) {
            case "滨河泵站" -> 38;
            case "西北排水节点" -> 31;
            case "巡逻站A" -> 24;
            default -> 30;
        };
    }

    public List<EvidenceItem> buildEvidence(String selectedFeature, List<String> nearbyFeatures) {
        if (featureRepository != null) {
            try {
                return buildEvidenceFromDb(selectedFeature, nearbyFeatures);
            } catch (Exception e) {
                log.warn("DB evidence build failed, falling back to mock: {}", e.getMessage());
            }
        }
        return mockBuildEvidence(selectedFeature, nearbyFeatures);
    }

    // --- Database-backed implementations ---

    private List<String> nearbyFeaturesFromDb(String selectedFeature) {
        double[] coords = FEATURE_COORDS.get(selectedFeature);
        if (coords == null) {
            log.info("Unknown feature '{}', using DB search by name", selectedFeature);
            List<SpatialFeature> found = featureRepository.findByName(selectedFeature);
            if (found.isEmpty()) return mockNearbyFeatures(selectedFeature);
            coords = new double[]{
                found.get(0).getGeom().getCoordinate().x,
                found.get(0).getGeom().getCoordinate().y
            };
        }

        List<SpatialFeature> nearby = featureRepository.findNearbyAllLayers(
            coords[0], coords[1], NEARBY_RADIUS_METERS
        );

        return nearby.stream()
            .map(SpatialFeature::getName)
            .filter(name -> !name.equals(selectedFeature))
            .toList();
    }

    private String assessRiskLevelFromDb(String selectedFeature) {
        List<SpatialFeature> features = featureRepository.findByName(selectedFeature);
        if (features.isEmpty()) return mockRiskLevel(selectedFeature);

        String props = features.get(0).getProperties();
        if (props != null && props.contains("Critical")) return "High";
        if (props != null && props.contains("Active")) return "High";
        return "Medium";
    }

    private List<EvidenceItem> buildEvidenceFromDb(String selectedFeature, List<String> nearbyFeatures) {
        List<EvidenceItem> evidence = new ArrayList<>();
        int counter = 1;

        for (String featureName : nearbyFeatures) {
            List<SpatialFeature> dbFeatures = featureRepository.findByName(featureName);
            if (!dbFeatures.isEmpty()) {
                SpatialFeature sf = dbFeatures.get(0);
                String category = extractProperty(sf.getProperties(), "category", "Related Feature");
                String status = extractProperty(sf.getProperties(), "status", "Unknown");
                String note = "空间要素位置: " + sf.getGeom().getCoordinate().x
                    + ", " + sf.getGeom().getCoordinate().y;
                evidence.add(new EvidenceItem("ev-" + counter++, featureName, category, status, note));
            } else {
                evidence.add(new EvidenceItem("ev-" + counter++, featureName, "关联要素", "活跃",
                    selectedFeature + " 附近的要素"));
            }
        }

        return evidence;
    }

    private String extractProperty(String json, String key, String defaultValue) {
        if (json == null) return defaultValue;
        // Simple JSON property extraction without full parser
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return defaultValue;
        int colonIdx = json.indexOf(':', idx);
        if (colonIdx < 0) return defaultValue;
        int startQuote = json.indexOf('"', colonIdx + 1);
        if (startQuote < 0) return defaultValue;
        int endQuote = json.indexOf('"', startQuote + 1);
        if (endQuote < 0) return defaultValue;
        return json.substring(startQuote + 1, endQuote);
    }

    // --- Mock fallback implementations ---

    private List<String> mockNearbyFeatures(String selectedFeature) {
        return switch (selectedFeature) {
            case "西北排水节点" -> List.of("河流传感器信标", "巡逻站A", "滨河泵站");
            case "巡逻站A" -> List.of("西北排水节点", "河流传感器信标", "滨河泵站");
            default -> List.of("西北排水节点", "河流传感器信标", "巡逻站A");
        };
    }

    private String mockRiskLevel(String selectedFeature) {
        return switch (selectedFeature) {
            case "西北排水节点", "滨河泵站" -> "高";
            case "巡逻站A" -> "中";
            default -> "低";
        };
    }

    private List<EvidenceItem> mockBuildEvidence(String selectedFeature, List<String> nearbyFeatures) {
        List<EvidenceItem> evidence = new ArrayList<>();
        int counter = 1;
        for (String feature : nearbyFeatures) {
            String category = inferCategory(feature);
            String status = inferStatus(feature, selectedFeature);
            String note = inferNote(feature, selectedFeature);
            evidence.add(new EvidenceItem("ev-" + counter++, feature, category, status, note));
        }
        return evidence;
    }

    private String inferCategory(String feature) {
        if (feature.contains("排水")) return "排水风险";
        if (feature.contains("传感器")) return "传感器警报";
        if (feature.contains("巡逻")) return "支援资源";
        if (feature.contains("泵站")) return "核心资产";
        return "关联要素";
    }

    private String inferStatus(String feature, String selectedFeature) {
        if (feature.contains("排水")) return "优先";
        if (feature.contains("传感器")) return "关注";
        if (feature.contains("巡逻")) return "可用";
        return "待跟进";
    }

    private String inferNote(String feature, String selectedFeature) {
        if (feature.contains("排水")) return "附近风险指标最集中的区域。";
        if (feature.contains("传感器")) return "最近读数建议持续监测。";
        if (feature.contains("巡逻")) return "最近的现场响应团队。";
        return selectedFeature + " 的关联上下文。";
    }
}
