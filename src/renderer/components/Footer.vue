<template>
    <footer class="footer">
        <div class="logo">
            <img src="../assets/LogoBashImoveis.svg" class="logo-img" />
        </div>
        <div class="footer-copy">
            <p>&copy; {{ new Date().getFullYear() }} - BashImóveis | Todos os direitos reservados.</p>
        </div>
    </footer>
</template>
  
<script>
export default {
    name: "Footer",
};
</script>
  
<style scoped>
@import '../styles/Footer.css';
</style>
  