<template>
  <div class="register-page-container">
    <h2 class="register-title">
      <span class="title-with-icon">
        <button class="back-button" @click="$router.back()" aria-label="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        Cadastrar Imóvel
      </span>
    </h2>

    <form @submit.prevent="registerProperty" class="register-form">
      <div class="form-group col-span-3">
        <input
          v-model.trim="property.titulo"
          type="text"
          placeholder="Título do Imóvel"
          class="register-input"
          required
        />
      </div>

      <div class="form-group">
        <input
          v-model.trim="property.cep"
          type="text"
          placeholder="CEP"
          class="register-input"
          maxlength="9"
          @input="formatAndLookupCEP"
          required
        />
      </div>

      <div class="form-group col-span-2">
        <input
          v-model.trim="property.logradouro"
          type="text"
          placeholder="Endereço (Rua, Avenida, etc.)"
          class="register-input"
          required
        />
      </div>
      
      <div class="form-group">
        <input
          v-model.trim="property.numero"
          type="text"
          placeholder="Número"
          class="register-input"
          required
        />
      </div>
      
      <div class="form-group">
        <select v-model="property.bairro" class="register-input" required>
          <option value="">Selecione o Bairro</option>
          <option v-for="bairro in bairros" :key="bairro" :value="bairro">
            {{ bairro }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <input
          v-model.trim="property.cidade"
          type="text"
          placeholder="Cidade"
          class="register-input"
          required
          readonly
        />
      </div>
      
      <div class="form-group">
        <input
          v-model.trim="property.estado"
          type="text"
          placeholder="Estado"
          class="register-input"
          required
          readonly
        />
      </div>
      
      <div class="form-group">
        <input
          v-model.number="property.preco"
          type="number"
          placeholder="Preço (R$)"
          class="register-input"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div class="form-group">
        <select v-model="property.tipo" class="register-input" required>
          <option value="">Tipo de Imóvel</option>
          <option value="CASA">Casa</option>
          <option value="APARTAMENTO">Apartamento</option>
          <option value="TERRENO">Terreno</option>
          <option value="COMERCIAL">Comercial</option>
        </select>
      </div>
      
      <div class="form-group">
        <select v-model="property.status" class="register-input" required>
          <option value="">Status</option>
          <option value="DISPONIVEL">Disponível</option>
          <option value="VENDIDO">Vendido</option>
          <option value="ALUGADO">Alugado</option>
        </select>
      </div>
      
      <div class="form-group">
        <input
          v-model.number="property.quartos"
          type="number"
          placeholder="Quartos"
          class="register-input"
          min="0"
        />
      </div>
      
      <div class="form-group">
        <input
          v-model.number="property.banheiros"
          type="number"
          placeholder="Banheiros"
          class="register-input"
          min="0"
        />
      </div>
      
      <div class="form-group">
        <input
          v-model.number="property.vagas_garagem"
          type="number"
          placeholder="Vagas Garagem"
          class="register-input"
          min="0"
        />
      </div>
      
      <div class="form-group">
        <input
          v-model.number="property.area_m2"
          type="number"
          placeholder="Área (m²)"
          class="register-input"
          min="0"
          step="0.01"
        />
      </div>
      
      <div class="form-group">
        <select v-model="property.corretor_id" class="register-input" required>
          <option value="">Corretor Responsável</option>
          <option v-for="corretor in corretores" :key="corretor.id" :value="corretor.id">
            {{ corretor.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group col-span-3">
        <textarea
          v-model.trim="property.descricao"
          placeholder="Descrição detalhada do Imóvel"
          class="register-input textarea-input"
          rows="4"
        ></textarea>
      </div>
      
      <div class="form-group col-span-3">
        <label for="image-upload" class="file-label">Adicionar Imagens (máximo 3)</label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          @change="onFileChange"
          class="register-input file-input"
          :disabled="imagePreviews.length >= 3"
        />
        <div v-if="imagePreviews.length" class="image-previews">
          <div v-for="(image, index) in imagePreviews" :key="index" class="image-preview-item">
            <img :src="image.url" :alt="`Imagem ${index + 1}`" class="thumbnail" />
            <button type="button" @click="removeImage(index)" class="remove-image-button">
              &times;
            </button>
          </div>
        </div>
      </div>
      
      <p v-if="error" class="register-error">{{ error }}</p>
      <button type="submit" class="register-button">Cadastrar Imóvel</button>
    </form>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import ceps from '../../utils/ceps_cg.json';

export default {
  data() {
    return {
      property: {
        titulo: '',
        descricao: '',
        endereco: '',
        logradouro: '',
        numero: '',
        cidade: '',
        bairro: '',
        estado: '',
        cep: '',
        preco: null,
        tipo: '',
        status: 'DISPONIVEL',
        area_m2: null,
        quartos: null,
        banheiros: null,
        vagas_garagem: null,
        corretor_id: '',
      },
      bairros: [],
      corretores: [],
      selectedFiles: [],
      imagePreviews: [],
      error: '',
    };
  },
  setup() {
    const router = useRouter();
    const toast = useToast();
    return { router, toast };
  },
  async mounted() {
    const bairroSet = new Set();
    for (const key in ceps) {
      const bairro = ceps[key].bairro;
      if (bairro) bairroSet.add(bairro);
    }
    this.bairros = Array.from(bairroSet).sort();
    try {
      this.corretores = await window.api.getRealEstateAgent();
    } catch (error) {
      console.error('Erro ao carregar corretores:', error);
      this.toast.error('Erro ao carregar corretores. Tente novamente mais tarde.');
    }
  },
  methods: {
    formatAndLookupCEP(event) {
      let value = event.target.value.replace(/\D/g, '');
      if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
      }
      this.property.cep = value;
      if (value.length === 9) {
        this.lookupCepData(value);
      } else {
        this.property.logradouro = '';
        this.property.cidade = '';
        this.property.estado = '';
        if (!this.property.bairro || this.bairros.includes(this.property.bairro)) {
             this.property.bairro = '';
        }
      }
    },
    lookupCepData(cep) {
      const formattedCep = cep.replace('-', '');
      const cepData = ceps[formattedCep];
      if (cepData) {
        this.property.logradouro = cepData.logradouro || '';
        this.property.cidade = cepData.cidade || '';
        this.property.estado = cepData.estado || '';
        if (!this.property.bairro || this.property.bairro === '') {
          this.property.bairro = cepData.bairro || '';
        }
      } else {
        this.toast.info('CEP não encontrado ou inválido. Por favor, preencha o restante do endereço manualmente.');
        this.property.logradouro = '';
        this.property.cidade = '';
        this.property.estado = '';
      }
    },
    onFileChange(event) {
      const files = Array.from(event.target.files);
      const currentImageCount = this.imagePreviews.length;
      const remainingSlots = 3 - currentImageCount;
      if (files.length > remainingSlots) {
        this.toast.error(`Você pode adicionar no máximo mais ${remainingSlots} imagem(ns).`);
        event.target.value = null;
        return;
      }
      files.slice(0, remainingSlots).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.selectedFiles.push(file);
            this.imagePreviews.push({ file, url: e.target.result });
          };
          reader.readAsDataURL(file);
        } else {
          this.toast.error(`O arquivo "${file.name}" não é uma imagem válida.`);
        }
      });
      event.target.value = null;
    },
    removeImage(index) {
      this.selectedFiles.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      if (this.imagePreviews.length < 3) {
        this.$nextTick(() => {
          const fileInput = document.getElementById('image-upload');
          if (fileInput) fileInput.disabled = false;
        });
      }
    },
    async registerProperty() {
      this.error = '';

      const requiredFields = [
        { name: 'Título do Imóvel', value: this.property.titulo },
        { name: 'Descrição', value: this.property.descricao },
        { name: 'Logradouro', value: this.property.logradouro },
        { name: 'Número', value: this.property.numero },
        { name: 'Bairro', value: this.property.bairro },
        { name: 'Cidade', value: this.property.cidade },
        { name: 'Estado', value: this.property.estado },
        { name: 'CEP', value: this.property.cep },
        { name: 'Preço', value: this.property.preco, isNumber: true },
        { name: 'Tipo de Imóvel', value: this.property.tipo },
        { name: 'Status', value: this.property.status },
        { name: 'Área (m²)', value: this.property.area_m2, isNumber: true },
        { name: 'Quartos', value: this.property.quartos, isNumber: true },
        { name: 'Banheiros', value: this.property.banheiros, isNumber: true },
        { name: 'Vagas de Garagem', value: this.property.vagas_garagem, isNumber: true },
        { name: 'Corretor Responsável', value: this.property.corretor_id },
      ];

      for (const field of requiredFields) {
          const fieldValueAsString = String(field.value);

          if (!field.isNumber) {
              if (fieldValueAsString.trim() === '') {
                  this.error = `Por favor, preencha o campo: "${field.name}".`;
                  this.toast.error(this.error);
                  return;
              }
          } else {
              if (field.value === null || field.value === undefined || isNaN(field.value)) {
                  this.error = `Por favor, preencha o campo numérico: "${field.name}".`;
                  this.toast.error(this.error);
                  return;
              }

              if (field.value < 0) {
                  this.error = `O campo "${field.name}" não pode ser negativo.`;
                  this.toast.error(this.error);
                  return;
              }
          }
      }

      if (this.imagePreviews.length === 0) {
        this.error = 'Por favor, adicione pelo menos uma imagem do imóvel.';
        this.toast.error(this.error);
        return;
      }

      this.property.endereco = `${this.property.logradouro}, ${this.property.numero}, ${this.property.bairro}, ${this.property.cidade}, ${this.property.estado}`;

      const imagesBase64 = this.imagePreviews.map(preview => preview.url.split(',')[1]);

      try {
        const propertyData = {
          titulo: this.property.titulo,
          descricao: this.property.descricao,
          endereco: this.property.endereco,
          cidade: this.property.cidade,
          bairro: this.property.bairro,
          estado: this.property.estado,
          cep: this.property.cep.replace('-', ''),
          preco: parseFloat(this.property.preco),
          tipo: this.property.tipo,
          status: this.property.status,
          area_m2: parseFloat(this.property.area_m2),
          quartos: parseInt(this.property.quartos, 10),
          banheiros: parseInt(this.property.banheiros, 10),
          vagas_garagem: parseInt(this.property.vagas_garagem, 10),
          corretor_id: this.property.corretor_id,
          images_base64: imagesBase64,
        };

        console.log('Dados a serem enviados para o backend:', propertyData);

        const result = await window.api.createProperty(propertyData);
        if (result && result.id) {
          this.toast.success('Imóvel cadastrado com sucesso!');
          this.resetForm();
          this.router.push('/properties-admin-real-estate');
        } else {
          this.error = 'Erro ao cadastrar imóvel. Nenhuma resposta válida recebida.';
          this.toast.error(this.error);
        }
      } catch (error) {
        console.error('Erro no cadastro do imóvel (front-end):', error);
        this.error = `Erro ao salvar dados do imóvel: ${error.message || 'Verifique o console.'}`;
        this.toast.error(this.error);
      }
    },
    resetForm() {
      this.property = {
        titulo: '',
        descricao: '',
        endereco: '',
        logradouro: '',
        numero: '',
        cidade: '',
        bairro: '',
        estado: '',
        cep: '',
        preco: null,
        tipo: '',
        status: 'DISPONIVEL',
        area_m2: null,
        quartos: null,
        banheiros: null,
        vagas_garagem: null,
        corretor_id: '',
      };
      this.selectedFiles = [];
      this.imagePreviews = [];
      this.error = '';
    }
  },
};
</script>

<style scoped>
@import '../../styles/CreateProperty.css';
</style>
