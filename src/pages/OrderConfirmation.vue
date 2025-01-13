<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const pdfUrl = ref<string | null>(null);

onMounted(() => {
  pdfUrl.value = localStorage.getItem('ticketPdfUrl');
  localStorage.removeItem('ticketPdfUrl'); // Clean up after retrieving
});

const downloadTicket = () => {
  if (pdfUrl.value) {
    const link = document.createElement('a');
    link.href = pdfUrl.value;
    link.download = 'event-ticket.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <div class="mb-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p class="text-gray-600 mb-6">
          Thank you for your purchase. You will receive a confirmation email shortly.
        </p>

        <button
          v-if="pdfUrl"
          @click="downloadTicket"
          class="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors mb-4"
        >
          Download Ticket
        </button>

        <button
          @click="router.push('/')"
          class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Events
        </button>
      </div>
    </div>
  </div>
</template>
