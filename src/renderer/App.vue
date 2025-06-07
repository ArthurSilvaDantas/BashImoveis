<template>
  <div class="app-container">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
  import Header from './components/Header.vue';
  import Footer from './components/Footer.vue';
  import { RouterView } from 'vue-router';
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #f0f0f0;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background-color: #f9f9f9;
  padding-bottom: 2rem;
}
</style>
