<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title" v-if="!isLoggedIn">Entrar na sua conta</h2>
      <form v-if="!isLoggedIn" @submit.prevent="login" class="login-form">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="login-input"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Senha"
          class="login-input"
          required
        />
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="login-button">Entrar</button>
      </form>

      <p v-if="!isLoggedIn" class="login-register">
        Ainda não tem conta?
        <a href="/create-user">Cadastre-se</a>
      </p>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../store/userStore';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
    };
  },
  computed: {
    isLoggedIn() {
      const userStore = useUserStore();
      return userStore.logado;
    },
    userStore() {
      return useUserStore();
    }
  },
  methods: {
    async login() {
      try {
        const toast = useToast();
        if (!this.email || !this.password) {
          this.error = 'Por favor, preencha todos os campos.';
          toast.error(this.error);
          return;
        }
        
        const usuario = await window.api.verifyLogin(this.email, this.password);

        if (!usuario) {
          this.error = 'E-mail ou senha inválidos';
          toast.error(this.error);
        } else {
          const userStore = useUserStore();
          userStore.setUser(usuario);
          userStore.saveToLocalStorage();
          toast.success('Login realizado com sucesso!');
          this.$router.push('/');
        }
      } catch (err) {
        this.error = 'Erro ao realizar login. Tente novamente.';
        console.error(err);
      }
    },
  },
  mounted() {
    const userStore = useUserStore();
    userStore.loadFromLocalStorage();
  },
};
</script>

<style scoped>
@import '../styles/Login.css';
</style>
