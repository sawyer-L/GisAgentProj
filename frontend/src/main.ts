import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "cesium/Build/Cesium/Widgets/widgets.css";

createApp(App).use(createPinia()).use(router).mount("#app");
