// @ts-ignore
import { createApp } from 'vue'
// @ts-ignore
import App from './App.vue';
// @ts-ignore
import router from './router';
// @ts-ignore
import { createPinia } from 'pinia';

const app = createApp(App);
app.use(createPinia());

app.use(router);
app.mount('#app');
