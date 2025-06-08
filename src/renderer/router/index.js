import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';

// General
const Home = () => import('../components/Home.vue');
const Questions = () => import('../components/Questions.vue');
const Login = () => import('../components/Login.vue');
// User
const CreateUser = () => import('../components/Create/CreateUser.vue');
// Real State Agent
const ListRealStateAgent = () => import('../components/List/ListRealStateAgent.vue');
// Property
const ListProperties = () => import('../components/List/ListProperties.vue');
const CreateProperty = () => import('../components/Create/CreateProperty.vue');

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
      component: ListProperties,
    },
    {
      path: '/create-property',
      name: 'create-property',
      component: CreateProperty,
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

  if(to.path === '/list-properties' && userStore.role !== 'ADMIN') {
    return next('/login');
  }

  if(to.path === '/create-property' && useUserStore.role === 'CLIENTE') {
    return next('/login');
  }

  if (to.path === '/list-real-state-agent' && userStore.role !== 'ADMIN') {
    console.log('User is not an ADMIN');
    return next('/login');
  }

  return next();
});

export default router;
