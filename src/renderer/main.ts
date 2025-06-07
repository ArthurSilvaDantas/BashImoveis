// @ts-ignore
import { createApp } from 'vue'
// @ts-ignore
import App from './App.vue';
// @ts-ignore
import router from './router';
// @ts-ignore
import { createPinia } from 'pinia';
// @ts-ignore
import Toast from 'vue-toastification';
// @ts-ignore
import 'vue-toastification/dist/index.css';

const app = createApp(App);
app.use(createPinia());

app.use(Toast, {
    position: 'top-right',
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
});

app.use(router);
app.mount('#app');
