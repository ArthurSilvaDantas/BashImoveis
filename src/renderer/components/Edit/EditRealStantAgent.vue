<template>
  <div class="register-container">
    <div class="register-card" role="document" aria-labelledby="modal-title">
      <button
        class="modal-close-button"
        @click="$emit('close', false)"
        aria-label="Fechar modal"
        type="button"
      >
        &times;
      </button>
  
      <h2 id="modal-title" class="register-title">
        {{ corretor ? 'Editar Corretor' : 'Cadastrar Corretor' }}
      </h2>
  
      <form @submit.prevent="register" class="register-form" novalidate>
        <input
          v-model.trim="creci"
          type="text"
          placeholder="CRECI"
          class="register-input"
          required
          autocomplete="off"
        />
        <input
          v-model.trim="name"
          type="text"
          placeholder="Nome completo"
          class="register-input"
          required
          autocomplete="name"
        />
        <input
          v-model.trim="email"
          type="email"
          placeholder="Email"
          class="register-input"
          required
          autocomplete="email" 
          :readonly="!!corretor"
        />
        <input
          v-model.trim="phone"
          type="tel"
          placeholder="Telefone"
          class="register-input"
          autocomplete="tel"
        />
        <input
          v-model="birthdate"
          type="date"
          placeholder="Data de nascimento"
          class="register-input"
        />
        <input
          v-model.trim="password"
          type="password"
          placeholder="Senha"
          class="register-input"
          :required="!corretor"
          autocomplete="new-password"
        />
        <input
          type="file"
          accept="image/*"
          @change="onFileChange"
          class="register-input"
          aria-label="Enviar foto de perfil"
        />
  
        <p v-if="error" class="register-error" role="alert">{{ error }}</p>
  
        <button type="submit" class="register-button">
          {{ corretor ? 'Salvar Alterações' : 'Cadastrar' }}
        </button>
      </form>
    </div>
  </div>
</template>
  
<script>
import { useToast } from 'vue-toastification';
  
export default {
  name: 'EditRealStantAgent',
  props: {
    corretor: {
      type: Object,
      default: null,
    },
  },
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
  watch: {
    corretor: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.name = newVal.name || '';
          this.creci = newVal.creci || '';
          this.email = newVal.email || '';
          this.phone = newVal.phone || '';
          this.birthdate = newVal.birthdate || '';
          this.password = '';
          this.fileBase64 = newVal.image_base64 || null;
          this.file = null;
        } else {
          this.resetForm();
        }
        this.error = '';
      },
    },
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
  
      if (!this.creci || !this.name || !this.email || (!this.corretor && !this.password)) {
        this.error = 'Por favor, preencha todos os campos obrigatórios.';
        toast.error(this.error);
        return;
      }
  
      if (this.phone) {
        const phoneRegex = /^\d{8,12}$/;
        if (!phoneRegex.test(this.phone)) {
          this.error = 'Telefone inválido. Deve conter entre 8 e 12 dígitos numéricos.';
          toast.error(this.error);
          return;
        }
      }
  
      try {
        if (this.corretor) {
          const resultado = await window.api.updateRealEstateAgent({
            id: this.corretor.id,
            creci: this.creci,
            name: this.name,
            email: this.email,
            phone: this.phone,
            birthdate: this.birthdate,
            password: this.password || null,
            image_base64: this.fileBase64,
            role: 'CORRETOR',
          });
  
          if (resultado) {
            toast.success('Usuário atualizado com sucesso!');
            this.$emit('close', true);
          } else {
            this.error = resultado?.message || 'Erro ao atualizar usuário.';
            toast.error(this.error);
          }
        } else {
          const emailExists = await window.api.checkEmailExists(this.email);
          if (emailExists) {
            this.error = 'Usuário já cadastrado.';
            toast.error(this.error);
            return;
          }
  
          const resultado = await window.api.createRealEstateAgent({
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
            this.resetForm();
            this.$emit('close', true);
          } else {
            this.error = resultado?.message || 'Erro no cadastro do usuário.';
            toast.error(this.error);
          }
        }
      } catch (error) {
        console.error(error);
        this.error = 'Erro ao salvar dados. Tente novamente.';
        toast.error(this.error);
      }
    },
    resetForm() {
      this.name = '';
      this.creci = '';
      this.email = '';
      this.phone = '';
      this.birthdate = '';
      this.password = '';
      this.file = null;
      this.fileBase64 = null;
      this.error = '';
    },
  },
};
</script>
  
<style scoped>
@import '../../styles/EditRealStantAgent.css'  
</style>
  