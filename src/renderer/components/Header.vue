<template>
  <header class="header">
    <div class="logo">
      <img src="../assets/LogoBashImoveis.svg" class="logo-img" />
    </div>
    <nav class="navbar" :class="{ 'sticky': isSticky }">
      <ul class="nav-list" v-if="!isAdmin && !isRealStateAgent">
        <li><a href="/">Início</a></li>
        <li><a href="/negotiate-property">Negocie seu Imóvel</a></li>
        <li><a href="/favorites">Imóveis Favoritos</a></li>
        <li><a href="/questions">Perguntas Frequentes</a></li>
        <li v-if="!isLoggedIn"><a href="/login">Entrar</a></li>
        <li v-else>
          <button @click="logout" class="logout-button">Deslogar</button>
        </li>
      </ul>

      <ul class="nav-list" v-if="isAdmin">
        <li><a href="/">Início</a></li>
        <li><a href="/negotiate">Negociações</a></li>
        <li><a href="/real-estate">Imóveis</a></li>
        <li><a href="/crm">CRM</a></li>
        <li><a href="/list-real-state-agent">Corretores</a></li>
        <li v-if="!isLoggedIn"><a href="/login">Entrar</a></li>
        <li v-else>
          <button @click="logout" class="logout-button">Deslogar</button>
        </li>
      </ul>

      <ul class="nav-list" v-else-if="isRealStateAgent">
        <li><a href="/">Início</a></li>
        <li><a href="/negotiate">Negociações</a></li>
        <li><a href="/real-estate">Imóveis</a></li>
        <li v-if="!isLoggedIn"><a href="/login">Entrar</a></li>
        <li v-else>
          <button @click="logout" class="logout-button">Deslogar</button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useUserStore } from '../store/userStore';
import { useToast } from 'vue-toastification';
import { routerKey, useRouter } from 'vue-router';

export default {
  name: "Header",
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const toast = useToast();

    const isAdmin = computed(() => userStore.role === 'ADMIN');
    const isRealStateAgent = computed(() => userStore.role === 'CORRETOR');
    const isLoggedIn = computed(() => userStore.logado);

    const logout = () => {
      userStore.resetUser();
      toast.success("Deslogado com sucesso!");
      router.push('/');
    };

    return {
      isAdmin,
      isRealStateAgent,
      isLoggedIn,
      logout,
    };
  },
  data() {
    return {
      isSticky: false,
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isSticky = window.scrollY > 100;
    },
  },
};
</script>

<style scoped>
@import '../styles/Header.css';
</style>
