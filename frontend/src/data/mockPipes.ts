export type PipeType = "water-supply" | "drainage" | "gas";
export type PipeStatus = "normal" | "warning" | "fault";

export interface PipeSegment {
  id: string;
  name: string;
  pipeType: PipeType;
  layerId: string;
  coordinates: [number, number][];
  diameter: number;
  material: string;
  status: PipeStatus;
  installYear: number;
  description: string;
}

export interface PipeStyle {
  color: string;
  glowPower: number;
  label: string;
}

export const pipeStyleMap: Record<PipeType, PipeStyle> = {
  "water-supply": { color: "#4bb5ff", glowPower: 0.3, label: "供水" },
  drainage: { color: "#ffb45c", glowPower: 0.25, label: "排水" },
  gas: { color: "#ffe066", glowPower: 0.35, label: "燃气" }
};

export const statusColorMap: Record<PipeStatus, string> = {
  normal: "",
  warning: "#ff8c42",
  fault: "#ff4444"
};

export const mockPipeLayerPalette: Record<
  string,
  { name: string; color: string }
> = {
  "water-supply-pipes": { name: "供水管网", color: "#4bb5ff" },
  "drainage-pipes": { name: "排水管网", color: "#ffb45c" },
  "gas-pipes": { name: "燃气管网", color: "#ffe066" }
};

export const mockPipeSegments: PipeSegment[] = [
  // --- Water supply pipes ---
  {
    id: "pipe-ws-001",
    name: "主供水管DN600",
    pipeType: "water-supply",
    layerId: "water-supply-pipes",
    coordinates: [
      [116.293, 40.069],
      [116.298, 40.065],
      [116.303, 40.061],
      [116.3074, 40.0570]
    ],
    diameter: 600,
    material: "PE",
    status: "normal",
    installYear: 2018,
    description: "西北片区至小米科技园主干供水管线。"
  },
  {
    id: "pipe-ws-002",
    name: "东分支供水管DN400",
    pipeType: "water-supply",
    layerId: "water-supply-pipes",
    coordinates: [
      [116.3074, 40.0570],
      [116.313, 40.053],
      [116.321, 40.048]
    ],
    diameter: 400,
    material: "PVC",
    status: "warning",
    installYear: 2015,
    description: "科技园至东侧传感器区域分支管线，近期压力异常。"
  },
  {
    id: "pipe-ws-003",
    name: "西分支供水管DN300",
    pipeType: "water-supply",
    layerId: "water-supply-pipes",
    coordinates: [
      [116.3074, 40.0570],
      [116.298, 40.054],
      [116.283, 40.051]
    ],
    diameter: 300,
    material: "铸铁",
    status: "normal",
    installYear: 2008,
    description: "科技园至西侧巡逻站B分支管线。"
  },
  // --- Drainage pipes ---
  {
    id: "pipe-dr-001",
    name: "东西排水主干管DN800",
    pipeType: "drainage",
    layerId: "drainage-pipes",
    coordinates: [
      [116.286, 40.062],
      [116.296, 40.061],
      [116.306, 40.059],
      [116.316, 40.058],
      [116.326, 40.058]
    ],
    diameter: 800,
    material: "混凝土",
    status: "normal",
    installYear: 2005,
    description: "横贯小米科技园东西向排水主干管。"
  },
  {
    id: "pipe-dr-002",
    name: "南侧排水支管DN500",
    pipeType: "drainage",
    layerId: "drainage-pipes",
    coordinates: [
      [116.306, 40.059],
      [116.312, 40.054],
      [116.321, 40.048]
    ],
    diameter: 500,
    material: "PVC",
    status: "fault",
    installYear: 2012,
    description: "传感器信标附近排水支管，检测到管道破损。"
  },
  {
    id: "pipe-dr-003",
    name: "东北雨水管DN600",
    pipeType: "drainage",
    layerId: "drainage-pipes",
    coordinates: [
      [116.326, 40.058],
      [116.328, 40.060],
      [116.330, 40.061]
    ],
    diameter: 600,
    material: "混凝土",
    status: "warning",
    installYear: 2010,
    description: "巡逻站A附近雨水排放管，近期流量偏高。"
  },
  // --- Gas pipes ---
  {
    id: "pipe-gs-001",
    name: "中压燃气管DN200",
    pipeType: "gas",
    layerId: "gas-pipes",
    coordinates: [
      [116.290, 40.060],
      [116.298, 40.058],
      [116.304, 40.057],
      [116.3074, 40.0570]
    ],
    diameter: 200,
    material: "钢管",
    status: "normal",
    installYear: 2020,
    description: "西侧至科技园区域中压燃气管线。"
  },
  {
    id: "pipe-gs-002",
    name: "低压燃气支管DN150",
    pipeType: "gas",
    layerId: "gas-pipes",
    coordinates: [
      [116.316, 40.058],
      [116.324, 40.059],
      [116.330, 40.061]
    ],
    diameter: 150,
    material: "PE",
    status: "normal",
    installYear: 2021,
    description: "巡逻站A方向低压燃气支线。"
  }
];
