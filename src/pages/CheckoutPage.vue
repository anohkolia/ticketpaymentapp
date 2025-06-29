<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/useCartStore';
import { useOrderStore } from '../stores/useOrderStore';
import { usePurchaseStore } from '../stores/purchase';
import { generateTicketPDF } from '../utils/pdfGenerator';
import { usePaymentService } from '../utils/paymentService';
import { useToast } from 'vue-toastification';
import BackButton from '../components/BackButton.vue';
import OrderSearch from '../components/OrderSearch.vue';
import OrderSummary from '../components/checkout/OrderSummary.vue';
import PaymentForm from '../components/checkout/PaymentForm.vue';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const purchaseStore = usePurchaseStore();
const { processPayment, isProcessing, error: paymentError } = usePaymentService();
const toast = useToast();

const searchResults = ref(orderStore.orders.value);
const processingPurchase = ref(false);

// Vérifier si le panier est vide
const cartIsEmpty = computed(() => cartStore.items.value.length === 0);

const handleSearch = (query: string) => {
  searchResults.value = orderStore.searchOrders(query);
};

const handleSubmit = async (formValues: any) => {
  if (cartIsEmpty.value) {
    toast.error('Votre panier est vide');
    return;
  }

  processingPurchase.value = true;

  try {
    // 1. Traiter le paiement
    const paymentResult = await processPayment({
      cardNumber: formValues.cardNumber,
      expiryDate: formValues.expiryDate,
      cvv: formValues.cvv,
      amount: cartStore.total.value
    });

    if (!paymentResult) {
      processingPurchase.value = false;
      return;
    }

    toast.success('Paiement accepté !');

    // 2. Créer les achats dans la base de données
    const customerInfo = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email
    };

    const purchases = await purchaseStore.createPurchase(
      cartStore.items.value,
      customerInfo,
      cartStore.total.value
    );

    toast.success('Billets créés avec succès !');

    // 3. Créer la commande pour l'historique local
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: `${formValues.firstName} ${formValues.lastName}`,
      email: formValues.email,
      items: cartStore.items.value,
      quantity: cartStore.items.value.reduce((sum, item) => sum + item.quantity, 0),
      total: cartStore.total.value
    };

    orderStore.addOrder(order);

    // 4. Générer le PDF des billets
    const pdfUrl = await generateTicketPDF(
      cartStore.items.value,
      customerInfo,
      cartStore.total.value,
      purchases
    );

    localStorage.setItem('ticketPdfUrl', pdfUrl);
    localStorage.setItem('purchaseData', JSON.stringify({
      purchases,
      customerInfo,
      total: cartStore.total.value
    }));

    // 5. Vider le panier et rediriger
    cartStore.clearCart();
    toast.success('Achat terminé ! Redirection vers la confirmation...');
    
    setTimeout(() => {
      router.push('/confirmation');
    }, 1500);

  } catch (error: any) {
    console.error('Purchase failed:', error);
    toast.error(error.message || 'Erreur lors de l\'achat');
  } finally {
    processingPurchase.value = false;
  }
};

// Rediriger si le panier est vide
if (cartIsEmpty.value) {
  toast.warning('Votre panier est vide. Redirection vers les événements...');
  setTimeout(() => {
    router.push('/eventpage');
  }, 2000);
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="mb-6">
        <BackButton />
      </div>

      <!-- Message si panier vide -->
      <div v-if="cartIsEmpty" class="bg-white rounded-lg shadow-md p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Panier vide</h2>
        <p class="text-gray-600 mb-4">Votre panier est vide. Ajoutez des billets pour continuer.</p>
        <router-link 
          to="/eventpage" 
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voir les événements
        </router-link>
      </div>

      <!-- Formulaire de commande -->
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">Finaliser votre commande</h1>

        <div class="mb-8">
          <OrderSummary
            :items="cartStore.items.value"
            :total="cartStore.total.value"
          />
        </div>

        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-4">Rechercher une commande existante</h2>
          <OrderSearch
            :orders="searchResults"
            @search="handleSearch"
          />
        </div>

        <div v-if="paymentError" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {{ paymentError }}
        </div>

        <div v-if="processingPurchase" class="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Traitement de votre achat en cours...
          </div>
        </div>

        <PaymentForm
          @submit="handleSubmit"
          :disabled="isProcessing || processingPurchase"
        />

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold mb-2">Cartes de test :</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>4111111111111111</strong> - Paiement réussi</p>
            <p><strong>4242424242424242</strong> - Fonds insuffisants</p>
            <p><strong>4000000000000002</strong> - Carte expirée</p>
            <p>Toute autre carte valide - Succès/échec aléatoire</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>