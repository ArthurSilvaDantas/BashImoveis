<template>
  <div class="page-container">
    <header class="actions-bar">
      <div class="filters-wrapper">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar corretor..."
          class="filtro-input"
          @keyup.enter="searchCorretor"
          aria-label="Buscar corretor"
        />
        <button class="search-button" @click="searchCorretor" aria-label="Buscar">🔍</button>
        <button class="search-button" @click="resetCorretor" aria-label="Limpar busca">❌</button>
      </div>
      <button class="cadastrar-button" @click="openModal" aria-label="Cadastrar Corretor">
        <span class="button-icon">+</span> Cadastrar Corretor
      </button>
    </header>
  
    <section class="results-list" v-if="corretores.length > 0">
      <div class="corretor-card" v-for="corretor in corretores" :key="corretor.id">
        <div class="corretor-avatar">
          <img :src="'data:image/jpeg;base64,' + corretor.image_base64" alt="Foto do Corretor" />
        </div>
        <div class="corretor-info">
          <h3>{{ corretor.name }} | {{ corretor.creci }}</h3>
          <p><strong>Email:</strong> {{ corretor.email }}</p>
        </div>
        <div class="card-actions">
          <button class="edit-button" @click="editCorretor(corretor)">✏️ Editar</button>
          <button class="delete-button" @click="deleteCorretor(corretor.id)">🗑️ Excluir</button>
        </div>
      </div>
    </section>
  
    <section v-else-if="buscou" class="no-results">
      <p>Nenhum corretor encontrado.</p>
    </section>
    
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showModalEdit" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <EditRealStantAgent
          :corretor="editingCorretor"
          @close="closeModal"
        />
      </div>  
    </transition>
  </div>

  <transition name="modal-fade">
    <div
      class="modal-overlay"
      v-if="showDeleteModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div class="modal-content">
        <h3 id="delete-modal-title">Excluir corretor</h3>
        <p>Tem certeza que deseja excluir este corretor?</p>
        <div class="modal-actions">
          <button class="cancel-button" @click="showDeleteModal = false">Cancelar</button>
          <button class="confirm-delete-button" @click="confirmDelete">Excluir</button>
        </div>
      </div>
    </div>
  </transition>
</template>
  
<script>
import { useToast } from 'vue-toastification';
import EditRealStantAgent from './EditUsers/EditRealStantAgent.vue';
  
export default {
  components: { EditRealStantAgent },
  data() {
    return {
      showModalEdit: false,
      searchQuery: '',
      corretores: [],
      buscou: false,
      editingCorretor: null,
      showDeleteModal: false,
      corretorParaExcluir: null,
    };
  },
  mounted() {
    this.loadCorretores();
  },
  methods: {
    openModal() {
      this.editingCorretor = null;
      this.showModalEdit = true;
    },
    editCorretor(corretor) {
      this.editingCorretor = { ...corretor };
      this.showModalEdit = true;
    },
    async closeModal(updated) {
      this.showModalEdit = false;
      this.editingCorretor = null;
      if (updated) {
        await this.loadCorretores();
      }
    },
    async loadCorretores() {
      try {
        this.corretores = await window.api.getRealEstateAgent();
        this.buscou = true;
      } catch (error) {
        console.error('Erro ao carregar corretores:', error);
        this.corretores = [];
        this.buscou = true;
      }
    },
    async searchCorretor() {
      const toast = useToast();
  
      if (!this.searchQuery.trim()) {
        toast.error('Por favor, digite o nome do corretor para buscar.');
        return;
      }
      try {
        const results = await window.api.getRealEstateAgentByName(this.searchQuery.trim());
        if (Array.isArray(results)) {
          this.corretores = results;
          this.buscou = true;
          if (results.length === 0) {
            toast.info('Nenhum corretor encontrado com este nome.');
          }
        } else {
          this.corretores = [];
          this.buscou = true;
          toast.error('Erro ao buscar corretores. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao buscar corretores:', error);
        toast.error('Erro ao buscar corretores. Tente novamente.');
      }
    },
    async resetCorretor() {
      this.searchQuery = '';
      await this.loadCorretores();
    },
    deleteCorretor(corretorId) {
      this.corretorParaExcluir = corretorId;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      const toast = useToast();
      try {
        const resultado = await window.api.deleteRealEstateAgent(this.corretorParaExcluir);
        if (resultado) {
          toast.success('Corretor excluído com sucesso!');
          this.showDeleteModal = false;
          this.loadCorretores();
        } else {
          toast.error('Erro ao excluir corretor. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao excluir corretor:', error);
        toast.error('Erro ao excluir corretor. Tente novamente.');
      }
      this.showDeleteModal = false;
    }
  }
};
</script>
  
<style scoped>
@import '../styles/ListRealStateAgent.css'
</style>
  