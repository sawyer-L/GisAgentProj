<template>
  <div ref="containerRef" class="map-canvas"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  Cesium3DTileStyle,
  Color,
  Entity,
  LabelStyle,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  createWorldTerrainAsync,
  Viewer
} from "cesium";
import { mockSpatialFeatures } from "@/data/mockSpatial";
import { useWorkspaceStore } from "@/stores/workspace";
import { configureCesiumIon } from "@/config/cesium";
import { usePipeNetwork } from "@/composables/usePipeNetwork";

const store = useWorkspaceStore();
const containerRef = ref<HTMLDivElement | null>(null);

let viewer: Viewer | undefined;
let clickHandler: ScreenSpaceEventHandler | undefined;
let buildingsTileset: Cesium3DTileset | undefined;
const entityMap = new Map<string, Entity>();

let pipeNetwork: ReturnType<typeof usePipeNetwork>;

function addMockEntities() {
  if (!viewer) return;

  mockSpatialFeatures.forEach((feature) => {
    const entity = viewer!.entities.add(
      new Entity({
        id: feature.name,
        name: feature.name,
        position: Cartesian3.fromDegrees(feature.longitude, feature.latitude),
        description: feature.description,
        point: {
          pixelSize: 14,
          color: Color.fromCssColorString(feature.accentColor),
          outlineColor: Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: feature.name,
          font: "13px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cartesian2(0, -26)
        }
      })
    );
    entityMap.set(feature.name, entity);
  });
}

function refreshEntityVisibility() {
  const visibleLayerIds = new Set(store.visibleLayers.map((l) => l.id));
  mockSpatialFeatures.forEach((feature) => {
    const entity = entityMap.get(feature.name);
    if (entity) entity.show = visibleLayerIds.has(feature.layerId);
  });

  // Sync pipe layer visibility
  store.layers.forEach((layer) => {
    if (layer.id.includes("pipes")) {
      pipeNetwork.setPipeVisibility(layer.id, layer.visible);
    }
  });
}

function refreshEntityStyles() {
  const highlightedNames = new Set(store.highlightedFeatureNames);

  mockSpatialFeatures.forEach((feature) => {
    const entity = entityMap.get(feature.name);
    if (!entity?.point || !entity.label) return;

    const isSelected = feature.name === store.selectedFeatureName;
    const isHighlighted = highlightedNames.has(feature.name);
    const activeColor = isSelected
      ? Color.fromCssColorString("#ffe066")
      : isHighlighted
        ? Color.fromCssColorString("#57d48d")
        : Color.fromCssColorString(feature.accentColor);

    entity.point.pixelSize = isSelected ? 20 : isHighlighted ? 17 : 14;
    entity.point.color = activeColor;
    entity.label.fillColor = isSelected ? Color.fromCssColorString("#ffe066") : Color.WHITE;
  });
}

function bindSelection() {
  if (!viewer) return;

  clickHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  clickHandler.setInputAction((movement: { position: unknown }) => {
    const picked = viewer?.scene.pick(movement.position);
    const entity = picked?.id as Entity | undefined;

    if (entity?.id && typeof entity.id === "string" && entity.id.startsWith("pipe-")) {
      store.selectPipe(entity.id);
    } else if (entity?.name) {
      store.clearPipeSelection();
      void store.runAnalysisForFeature(entity.name);
    }
  }, ScreenSpaceEventType.LEFT_CLICK);
}

async function initScene() {
  if (!containerRef.value) return;

  console.log("[MapCanvas] Configuring Cesium Ion...");
  configureCesiumIon();

  let terrainProvider;
  try {
    terrainProvider = await createWorldTerrainAsync();
    console.log("[MapCanvas] Terrain loaded OK");
  } catch (e) {
    console.warn("[MapCanvas] Terrain failed, using default:", e);
  }

  console.log("[MapCanvas] Creating Viewer...");
  viewer = new Viewer(containerRef.value, {
    terrainProvider,
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: true,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false
  });
  console.log("[MapCanvas] Viewer created");

  viewer.scene.globe.depthTestAgainstTerrain = false;
  viewer.scene.globe.baseColor = Color.fromCssColorString("#0a1628");

  // Load OSM Buildings white model
  try {
    buildingsTileset = await Cesium3DTileset.fromIonAssetId(96188);
    buildingsTileset.style = new Cesium3DTileStyle({
      color: "color('white', 0.6)"
    });
    viewer.scene.primitives.add(buildingsTileset);
    console.log("[MapCanvas] OSM Buildings loaded");
  } catch (e) {
    console.warn("[MapCanvas] OSM Buildings failed:", e);
  }

  // Camera at Xiaomi HQ area, zoomed in to see buildings
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(116.3174, 40.0660, 200),
    orientation: {
      heading: -90,
      pitch: 0,
      roll: 0
    }
  });

  console.log("[MapCanvas] Adding spatial entities...");
  addMockEntities();

  console.log("[MapCanvas] Adding pipe network...");
  pipeNetwork = usePipeNetwork(ref(viewer));
  pipeNetwork.addPipes();

  bindSelection();
  refreshEntityVisibility();
  refreshEntityStyles();
  console.log("[MapCanvas] Scene init complete");
  void store.runAnalysis();
}

onMounted(() => {
  void initScene();
});

watch(
  () => store.layers.map((layer) => `${layer.id}:${layer.visible}`).join("|"),
  () => {
    refreshEntityVisibility();
  }
);

watch(
  () => `${store.selectedFeatureName}|${store.highlightedFeatureNames.join("|")}`,
  () => {
    refreshEntityStyles();
  }
);

watch(
  () => store.selectedPipeId,
  (newId, oldId) => {
    if (oldId) pipeNetwork.clearHighlight();
    if (newId) pipeNetwork.highlightPipe(newId);
  }
);

onBeforeUnmount(() => {
  clickHandler?.destroy();
  pipeNetwork?.removePipes();
  if (buildingsTileset) viewer?.scene.primitives.remove(buildingsTileset);
  viewer?.destroy();
  entityMap.clear();
});
</script>
