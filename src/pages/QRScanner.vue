<script setup lang="ts">
import { ref } from 'vue';
import { usePurchaseStore } from '../stores/purchase';
import { useToast } from 'vue-toastification';

const purchaseStore = usePurchaseStore();
const toast = useToast();

const scanning = ref(false);
const manualInput = ref('');
const scanResult = ref<{
  valid: boolean;
  message: string;
  purchase?: any;
} | null>(null);

const startScanning = () => {
  scanning.value = true;
  toast.info('Scanner QR non implémenté. Utilisez la saisie manuelle pour tester.');
  // Dans une vraie application, vous utiliseriez une bibliothèque comme vue-qrcode-reader
};

const validateManualInput = async () => {
  if (!manualInput.value.trim()) {
    toast.error('Veuillez saisir des données QR');
    return;
  }

  try {
    const result = await purchaseStore.validateTicket(manualInput.value);
    scanResult.value = result;
    
    if (result.valid) {
      toast.success('Billet valide !');
    } else {
      toast.error('Billet invalide !');
    }
  } catch (error) {
    toast.error('Erreur lors de la validation');
    scanResult.value = {
      valid: false,
      message: 'Erreur lors de la validation du billet'
    };
  }
};

const generateTestQR = () => {
  // Générer des données QR de test
  const testData = JSON.stringify({
    ticketId: 't1',
    customerName: 'Test User',
    email: 'test@example.com',
    quantity: 1,
    purchaseDate: new Date().toISOString(),
    eventId: '1'
  });
  
  manualInput.value = testData;
  toast.info('Données QR de test générées');
};

const clearResult = () => {
  scanResult.value = null;
  manualInput.value = '';
};
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg border">
      <h3 class="text-lg font-semibold mb-4">Scanner de QR Code</h3>
      
      <!-- Boutons d'action -->
      <div class="flex flex-wrap gap-3 mb-4">
        <button
          @click="startScanning"
          class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          :disabled="scanning"
        >
          {{ scanning ? 'Scan en cours...' : '📷 Scanner QR Code' }}
        </button>
        
        <button
          @click="generateTestQR"
          class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          🧪 Générer QR Test
        </button>
        
        <button
          v-if="scanResult"
          @click="clearResult"
          class="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          🗑️ Effacer
        </button>
      </div>

      <!-- Saisie manuelle -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Saisie manuelle des données QR (pour test)
        </label>
        <div class="flex gap-2">
          <textarea
            v-model="manualInput"
            placeholder="Collez ici les données du QR code..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          ></textarea>
          <button
            @click="validateManualInput"
            class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Valider
          </button>
        </div>
      </div>

      <!-- Résultat de la validation -->
      <div v-if="scanResult" :class="[
        'p-4 rounded-lg border-l-4',
        scanResult.valid 
          ? 'bg-green-50 border-green-400 text-green-800' 
          : 'bg-red-50 border-red-400 text-red-800'
      ]">
        <div class="flex items-center mb-2">
          <svg v-if="scanResult.valid" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="font-semibold">
            {{ scanResult.valid ? '✅ BILLET VALIDE' : '❌ BILLET INVALIDE' }}
          </span>
        </div>
        
        <p class="mb-2">{{ scanResult.message }}</p>
        
        <div v-if="scanResult.valid && scanResult.purchase" class="text-sm">
          <p><strong>Client:</strong> {{ scanResult.purchase.customer_name }}</p>
          <p><strong>Email:</strong> {{ scanResult.purchase.customer_email }}</p>
          <p><strong>Quantité:</strong> {{ scanResult.purchase.quantity }}</p>
          <p><strong>Prix:</strong> {{ scanResult.purchase.total_price.toFixed(2) }}€</p>
          <p><strong>Date d'achat:</strong> {{ new Date(scanResult.purchase.created_at).toLocaleDateString('fr-FR') }}</p>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="font-semibold text-blue-800 mb-2">📋 Instructions</h4>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• Cliquez sur "Scanner QR Code" pour activer la caméra (non implémenté)</li>
          <li>• Utilisez "Générer QR Test" pour créer des données de test</li>
          <li>• Collez les données QR dans le champ de saisie manuelle</li>
          <li>• Cliquez sur "Valider" pour vérifier le billet</li>
        </ul>
      </div>
    </div>
  </div>
</template>