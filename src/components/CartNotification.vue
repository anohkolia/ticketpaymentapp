<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  message: string
}>()

const isVisible = ref(false)

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      isVisible.value = true
      setTimeout(() => {
        isVisible.value = false
      }, 3000)
    }
  },
)
</script>

<!-- Composant pour afficher une notification temporaire en bas à droite de l'écran -->
<template>
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
    >
      {{ message }}
    </div>
  </transition>
</template>
