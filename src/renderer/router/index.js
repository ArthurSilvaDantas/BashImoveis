import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';

const Home = () => import('../components/Home.vue');
const CreateUser = () => import('../components/CreateUsers/CreateUser.vue');
const ListRealStateAgent = () => import('../components/ListRealStateAgent.vue');
const Questions = () => import('../components/Questions.vue');
const Login = () => import('../components/Login.vue');

const baseUrl = '/';

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes: [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/create-user',
        name: 'create-user',
        component: CreateUser,
    },
    {
        path: '/list-real-state-agent',
        name: 'list-real-state-agent',
        component: ListRealStateAgent,
    },
    {
        path: '/questions',
        name: 'questions',
        component: Questions,
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (!userStore.logado) {
    userStore.loadFromLocalStorage();
  }

  if (to.path === '/login' && userStore.logado) {
    return next('/');
  }

  if (to.path === '/create-real-stand-agent' && !userStore.logado && userStore.usuario.role !== 'ADMIN') {
    return next('/login');
  }

  return next();
});

export default router;
