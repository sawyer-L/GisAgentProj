import { type Ref, ref } from "vue";
import {
  Cartesian3,
  ClassificationType,
  Color,
  Entity,
  HeightReference,
  PolylineGlowMaterialProperty,
  type Viewer
} from "cesium";
import {
  mockPipeSegments,
  pipeStyleMap,
  statusColorMap,
  type PipeSegment
} from "@/data/mockPipes";

function resolveColor(pipe: PipeSegment): Color {
  const override = statusColorMap[pipe.status];
  const hex = override || pipeStyleMap[pipe.pipeType].color;
  return Color.fromCssColorString(hex).withAlpha(0.9);
}

function resolveGlow(pipe: PipeSegment): number {
  const base = pipeStyleMap[pipe.pipeType].glowPower;
  if (pipe.status === "fault") return 0.5;
  if (pipe.status === "warning") return base + 0.1;
  return base;
}

function resolveWidth(pipe: PipeSegment): number {
  return Math.min(10, Math.max(3, Math.round((pipe.diameter / 300) * 4)));
}

export function usePipeNetwork(viewer: Ref<Viewer | undefined>) {
  const pipeEntityMap = new Map<string, Entity>();
  const defaultWidths = new Map<string, number>();

  function addPipes() {
    if (!viewer.value) return;

    for (const pipe of mockPipeSegments) {
      const positions = Cartesian3.fromDegreesArray(
        pipe.coordinates.flat()
      );

      const width = resolveWidth(pipe);
      defaultWidths.set(pipe.id, width);

      const entity = viewer.value.entities.add({
        id: pipe.id,
        name: pipe.name,
        description: `
          <p><strong>${pipe.name}</strong></p>
          <p>类型: ${pipeStyleMap[pipe.pipeType].label} | 管径: DN${pipe.diameter}</p>
          <p>材质: ${pipe.material} | 状态: ${pipe.status === "normal" ? "正常" : pipe.status === "warning" ? "预警" : "故障"}</p>
          <p>安装年份: ${pipe.installYear}</p>
          <p>${pipe.description}</p>
        `,
        polyline: {
          positions,
          width,
          material: new PolylineGlowMaterialProperty({
            glowPower: resolveGlow(pipe),
            color: resolveColor(pipe)
          }),
          clampToGround: true,
          classificationType: ClassificationType.TERRAIN
        }
      });

      pipeEntityMap.set(pipe.id, entity);
    }
  }

  function removePipes() {
    if (!viewer.value) return;
    for (const entity of pipeEntityMap.values()) {
      viewer.value.entities.remove(entity);
    }
    pipeEntityMap.clear();
    defaultWidths.clear();
  }

  function setPipeVisibility(layerId: string, visible: boolean) {
    for (const pipe of mockPipeSegments) {
      if (pipe.layerId === layerId) {
        const entity = pipeEntityMap.get(pipe.id);
        if (entity) entity.show = visible;
      }
    }
  }

  function highlightPipe(pipeId: string) {
    const entity = pipeEntityMap.get(pipeId);
    const pipe = mockPipeSegments.find((p) => p.id === pipeId);
    if (!entity?.polyline || !pipe) return;

    const baseWidth = defaultWidths.get(pipeId) ?? 4;
    entity.polyline.width = baseWidth * 2;
    entity.polyline.material = new PolylineGlowMaterialProperty({
      glowPower: 0.6,
      color: Color.fromCssColorString("#ffffff").withAlpha(0.95)
    });
  }

  function clearHighlight() {
    for (const pipe of mockPipeSegments) {
      const entity = pipeEntityMap.get(pipe.id);
      if (!entity?.polyline) continue;

      const width = defaultWidths.get(pipe.id) ?? 4;
      entity.polyline.width = width;
      entity.polyline.material = new PolylineGlowMaterialProperty({
        glowPower: resolveGlow(pipe),
        color: resolveColor(pipe)
      });
    }
  }

  return {
    addPipes,
    removePipes,
    setPipeVisibility,
    highlightPipe,
    clearHighlight
  };
}
