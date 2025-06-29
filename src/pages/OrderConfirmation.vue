<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Purchase } from '../types';

const router = useRouter();
const pdfUrl = ref<string | null>(null);
const purchaseData = ref<{
  purchases: Purchase[];
  customerInfo: any;
  total: number;
} | null>(null);

onMounted(() => {
  pdfUrl.value = localStorage.getItem('ticketPdfUrl');
  const storedPurchaseData = localStorage.getItem('purchaseData');
  
  if (storedPurchaseData) {
    purchaseData.value = JSON.parse(storedPurchaseData);
  }

  // Nettoyer le localStorage après récupération
  localStorage.removeItem('ticketPdfUrl');
  localStorage.removeItem('purchaseData');
});

const downloadTicket = () => {
  if (pdfUrl.value) {
    const link = document.createElement('a');
    link.href = pdfUrl.value;
    link.download = `billets-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const viewQRCode = (purchase: Purchase) => {
  if (purchase.qr_code) {
    // Ouvrir le QR code dans une nouvelle fenêtre
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>QR Code - Billet</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f3f4f6;">
            <div style="text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="margin-bottom: 1rem;">Billet - ${purchase.customer_name}</h2>
              <img src="${purchase.qr_code}" alt="QR Code" style="max-width: 300px; height: auto;" />
              <p style="margin-top: 1rem; color: #666;">Présentez ce QR code à l'entrée</p>
            </div>
          </body>
        </html>
      `);
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-8">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Achat confirmé !</h1>
        <p class="text-gray-600 mb-6">
          Merci pour votre achat. Vos billets ont été générés avec succès.
        </p>
      </div>

      <!-- Détails de l'achat -->
      <div v-if="purchaseData" class="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-4">Détails de votre achat</h2>
        <div class="space-y-2 text-sm">
          <p><strong>Client :</strong> {{ purchaseData.customerInfo.firstName }} {{ purchaseData.customerInfo.lastName }}</p>
          <p><strong>Email :</strong> {{ purchaseData.customerInfo.email }}</p>
          <p><strong>Total payé :</strong> {{ purchaseData.total.toFixed(2) }}€</p>
          <p><strong>Nombre de billets :</strong> {{ purchaseData.purchases.length }}</p>
        </div>
      </div>

      <!-- QR Codes des billets -->
      <div v-if="purchaseData && purchaseData.purchases.length > 0" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Vos billets</h2>
        <div class="grid gap-4">
          <div 
            v-for="(purchase, index) in purchaseData.purchases" 
            :key="purchase.id"
            class="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 class="font-medium">Billet {{ index + 1 }}</h3>
              <p class="text-sm text-gray-600">Quantité: {{ purchase.quantity }}</p>
              <p class="text-sm text-gray-600">Prix: {{ purchase.total_price.toFixed(2) }}€</p>
            </div>
            <button
              @click="viewQRCode(purchase)"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Voir QR Code
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          v-if="pdfUrl"
          @click="downloadTicket"
          class="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          📄 Télécharger les billets (PDF)
        </button>

        <button
          @click="router.push('/eventpage')"
          class="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          🎫 Voir d'autres événements
        </button>

        <button
          @click="router.push('/')"
          class="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
        >
          🏠 Retour à l'accueil
        </button>
      </div>

      <!-- Informations importantes -->
      <div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 class="font-semibold text-yellow-800 mb-2">📋 Informations importantes</h3>
        <ul class="text-sm text-yellow-700 space-y-1">
          <li>• Conservez vos billets et QR codes précieusement</li>
          <li>• Présentez le QR code à l'entrée de l'événement</li>
          <li>• Un email de confirmation sera envoyé sous peu</li>
          <li>• En cas de problème, contactez notre support</li>
        </ul>
      </div>
    </div>
  </div>
</template>