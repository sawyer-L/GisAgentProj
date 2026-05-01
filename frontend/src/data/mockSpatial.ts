export interface MockSpatialFeature {
  id: string;
  name: string;
  layerId: "risk-points" | "patrol-stations" | "core-assets";
  longitude: number;
  latitude: number;
  accentColor: string;
  description: string;
}

export const mockSpatialFeatures: MockSpatialFeature[] = [
  {
    id: "core-asset-river-pump",
    name: "滨河泵站",
    layerId: "core-assets",
    longitude: 116.3074,
    latitude: 40.0570,
    accentColor: "#ffe066",
    description: "小米科技园东侧主要监控资产。"
  },
  {
    id: "risk-drainage-northwest",
    name: "西北排水节点",
    layerId: "risk-points",
    longitude: 116.293,
    latitude: 40.069,
    accentColor: "#ff7a59",
    description: "高优先级排水风险点。"
  },
  {
    id: "risk-river-sensor",
    name: "河流传感器信标",
    layerId: "risk-points",
    longitude: 116.321,
    latitude: 40.048,
    accentColor: "#ff7a59",
    description: "堤防沿线的传感器警报热点。"
  },
  {
    id: "patrol-alpha",
    name: "巡逻站A",
    layerId: "patrol-stations",
    longitude: 116.330,
    latitude: 40.061,
    accentColor: "#4bb5ff",
    description: "最近的巡逻队集结点。"
  },
  {
    id: "patrol-beta",
    name: "巡逻站B",
    layerId: "patrol-stations",
    longitude: 116.283,
    latitude: 40.051,
    accentColor: "#4bb5ff",
    description: "次级巡逻支援点。"
  }
];

export const mockLayerPalette: Record<MockSpatialFeature["layerId"], { name: string; color: string }> = {
  "risk-points": {
    name: "风险点",
    color: "#ff7a59"
  },
  "patrol-stations": {
    name: "巡逻站",
    color: "#4bb5ff"
  },
  "core-assets": {
    name: "核心资产",
    color: "#ffe066"
  }
};
