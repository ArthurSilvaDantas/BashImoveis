<template>
    <div class="register-container">
        <div class="register-card">
            <h2 class="register-title">
                Cadastrar-se
            </h2>

            <form @submit.prevent="register" class="register-form">
                <input
                    v-model="creci"
                    type="text"
                    placeholder="CRECI"
                    class="register-input"
                    required
                />
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

                <input
                    type="file"
                    @change="onFileChange"
                    accept="image/*" 
                    class="register-input"
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
        creci: '',
        email: '',
        phone: '',
        birthdate: '',
        password: '',
        file: null,
        fileBase64: null,
        error: '',
      };
    },
    methods: {
        onFileChange(event) {
            const file = event.target.files[0];
            if (!file) {
                this.file = null;
                this.fileBase64 = null;
                return;
            }
            this.file = file;

            const reader = new FileReader();
            reader.onload = () => {
                this.fileBase64 = reader.result.split(',')[1];
            };
            reader.readAsDataURL(file);
        },
        async register() {
            const toast = useToast();

            if (!this.name || !this.email || !this.password || !this.phone || !this.birthdate || !this.creci) {
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

                const resultado = await window.api.createRealState({
                    creci: this.creci,
                    name: this.name,
                    email: this.email,
                    phone: this.phone,
                    birthdate: this.birthdate,
                    password: this.password,
                    image_base64: this.fileBase64,
                    role: 'CORRETOR',
                });
    
                if (resultado) {
                    toast.success('Usuário cadastrado com sucesso!');
                    this.name = '';
                    this.creci = '';
                    this.email = '';
                    this.phone = '';
                    this.birthdate = '';
                    this.password = '';
                    this.file = null;
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
