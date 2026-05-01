import { createRouter, createWebHistory } from "vue-router";
import MapWorkbenchView from "@/views/MapWorkbenchView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "map-workbench",
      component: MapWorkbenchView
    }
  ]
});

export default router;
