import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';

const Home = () => import('../components/List/Home.vue');
const CreateUser = () => import('../components/Create/CreateUser.vue');
const ListRealStateAgent = () => import('../components/List/ListRealStateAgent.vue');
const ListProperies = () => import('../components/List/ListProperties.vue');
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
      path: '/list-properties',
      name: 'list-properties',
      component: ListProperies,
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

  if(to.path === '/list-properties' && !userStore.logado && useUserStore.role !== 'ADMIN') {
    return next('/login');
  }

  if (to.path === '/create-real-stand-agent' && !userStore.logado && userStore.usuario.role !== 'ADMIN') {
    return next('/login');
  }

  return next();
});

export default router;
