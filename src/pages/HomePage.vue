<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToEvents = () => {
  router.push('/eventpage');
};
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-6">Bienvenue sur eventoffice</h1>
    <p class="text-xl text-gray-600 mb-8">
      Votre plateforme de billetterie en ligne
    </p>
    <button
      @click="goToEvents"
      class="bg-[#186a3b] text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
    >
      Découvrir les événements
    </button>
  </div>
</template>
