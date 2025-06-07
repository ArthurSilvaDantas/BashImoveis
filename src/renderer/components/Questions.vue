<template>
  <section class="faq-container">
    <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
      <button class="faq-question" @click="toggle(index)">
        {{ faq.question }}
        <span class="arrow" :class="{ open: faq.open }">⌃</span>
      </button>
      <div v-if="faq.open" class="faq-answer">
        {{ faq.answer }}
      </div>
    </div>
  </section>
</template>
  
<script>
export default {
  data() {
    return {
      faqs: [
        {
          question: 'Gostaria de visitar um imóvel, como devo proceder?',
          answer: 'Entre em contato conosco para agendar uma visita com um de nossos corretores.',
          open: false,
        },
        {
          question: 'Qual o horário de atendimento da Imobiliária BashImóveis?',
          answer: 'De segunda a sexta das 8h às 18h e aos sábados das 8h às 12h.',
          open: false,
        },
        {
          question: 'Quais documentos devem ser apresentados para alugar um imóvel?',
          answer: 'RG, CPF, comprovante de renda e comprovante de residência atual.',
          open: false,
        },
        {
          question: 'Estou interessado em alugar um imóvel e quero fazer uma proposta. O que devo fazer?',
          answer: 'Entre em contato com a imobiliária e envie sua proposta por e-mail ou pessoalmente.',
          open: false,
        },
        {
          question: 'Quais tipos de garantias são aceitas pela Imobiliária BashImóveis para concretizar um contrato de locação?',
          answer: 'Aceitamos fiador, caução e seguro-fiança, dependendo da análise de crédito.',
          open: false,
        },
        {
          question: 'Sou proprietário(a) de um imóvel e gostaria de contratar a Imobiliária BashImóveis para administrá-lo. Qual procedimento devo adotar?',
          answer: 'Agende uma reunião conosco para análise do imóvel e assinatura do contrato de administração.',
          open: false,
        },
        {
          question: 'O que é o aluguel garantido?',
          answer: 'É um serviço onde garantimos o repasse do aluguel ao proprietário mesmo em caso de inadimplência do inquilino.',
          open: false,
        }],
      };
    },
    methods: {
      toggle(index) {
        this.faqs[index].open = !this.faqs[index].open;
    },
  },
};
</script>
  
<style scoped>
@import '../styles/Questions.css'
</style>
  