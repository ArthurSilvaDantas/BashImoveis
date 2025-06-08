<template>
    <div class="register-container">
        <div class="register-card">
            <h2 class="register-title">
                <span class="title-with-icon">
                    <button class="back-button" @click="$router.back()" aria-label="Voltar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    </button>
                    Cadastrar-se
                </span>
            </h2>

            <form @submit.prevent="register" class="register-form">
                <input
                    v-model="name"
                    type="text"
                    placeholder="Nome completo"
                    class="register-input"
                    required
                />
                <input
                    v-model="email"
                    type="email"
                    placeholder="Email"
                    class="register-input"
                    required
                />
                <input
                    v-model="phone"
                    type="tel"
                    placeholder="Telefone"
                    class="register-input"
                />
                <input
                    v-model="birthdate"
                    type="date"
                    placeholder="Data de nascimento"
                    class="register-input"
                />
                <input
                    v-model="password"
                    type="password"
                    placeholder="Senha"
                    class="register-input"
                    required
                />
  
                <p v-if="error" class="register-error">{{ error }}</p>
                <button type="submit" class="register-button">Cadastrar</button>
            </form>
        </div>
    </div>
</template>
  
<script>
import { useToast } from 'vue-toastification';

export default {
    data() {
      return {
        name: '',
        email: '',
        phone: '',
        birthdate: '',
        password: '',
        error: '',
      };
    },
    methods: {
        async register() {
            const toast = useToast();
            if (!this.name || !this.email || !this.password || !this.phone || !this.birthdate) {
                this.error = 'Por favor, preencha todos os campos.';
                toast.error(this.error);
                return;
            }

            const phoneRegex = /^\d{8,12}$/;
            if (!phoneRegex.test(this.phone)) {
                this.error = 'Telefone inválido. Deve conter 8 ou 12 dígitos.';
                toast.error(this.error);
                return;
            }

            try {
                const emailExists = await window.api.checkEmailExists(this.email);
                if (emailExists) {
                    this.error = 'Usuário já cadastrado.';
                    toast.error(this.error);
                    return;
                }

                const resultado = await window.api.createUser({
                    name: this.name,
                    email: this.email,
                    phone: this.phone,
                    birthdate: this.birthdate,
                    password: this.password,
                    role: 'CLIENTE',
                });
    
                if (resultado) {
                    toast.success('Usuário cadastrado com sucesso!');
                    this.name = '';
                    this.email = '';
                    this.phone = '';
                    this.birthdate = '';
                    this.password = '';
                    this.error = '';
                    this.$router.push('/login');
                } else {
                    this.error = resultado.message || 'Erro ao cadastrar usuário.';
                    toast.error(this.error);
                }
            } catch (err) {
            this.error = 'Erro no cadastro. Tente novamente.';
            toast.error(this.error);
            console.error(err);
            }
        },
    }
};
</script>
  
<style scoped>
@import '../../styles/CreateUser.css';
</style>
  