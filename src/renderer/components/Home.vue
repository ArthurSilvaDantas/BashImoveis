<template>
    <div class="hero-carousel-container">
      <div class="hero-carousel-wrapper" v-if="images.length > 0">
        <img :src="currentImage" :alt="`Imagem ${currentIndex + 1}`" class="hero-carousel-image" />
  
        <button @click="prevImage" class="hero-carousel-button prev-button">❮</button>
        <button @click="nextImage" class="hero-carousel-button next-button">❯</button>

        <div class="hero-carousel-overlay">
          </div>
        </div>
    </div>
</template>
  
<script>
export default {
    data() {
      return {
        images: [
            'https://objectstorage.sa-saopaulo-1.oraclecloud.com/n/grq6lwb4htd1/b/f40e0e4d-b3a3-48d8-ad3b-c82f49928efc/o/settings/main-images/d5d4cfbf-6fdd-48f6-913a-eddce796c614.jpg',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzcxMjV8MHwxfGFsbHwxfHx8fHx8fHwxNzE4MDM0NzcwfA&ixlib=rb-4.0.3&q=80&w=1200',
            'https://img.olx.com.br/images/63/633547394781862.jpg',
        ],
        currentIndex: 0,
        intervalId: null,
        autoPlayInterval: 5000,
      };
    },
    computed: {
      currentImage() {
        return this.images[this.currentIndex];
      },
    },
    methods: {
      nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
      },
      prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      },
      startAutoPlay() {
        if (this.images.length > 1) {
          this.intervalId = setInterval(this.nextImage, this.autoPlayInterval);
        }
      },
      stopAutoPlay() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      },
    },
    mounted() {
      this.startAutoPlay();
    },
    beforeUnmount() {
      this.stopAutoPlay();
    },
  };
</script>
  
<style scoped>
@import '../styles/Home.css';  
</style>
