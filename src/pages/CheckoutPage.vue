<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/useCartStore';
import { useOrderStore } from '../stores/useOrderStore';
import { generateTicketPDF } from '../utils/pdfGenerator';
import { usePaymentService } from '../utils/paymentService';
import BackButton from '../components/BackButton.vue';
import OrderSearch from '../components/OrderSearch.vue';
import OrderSummary from '../components/checkout/OrderSummary.vue';
import PaymentForm from '../components/checkout/PaymentForm.vue';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const { processPayment, isProcessing, error: paymentError } = usePaymentService();

const searchResults = ref(orderStore.orders.value);

const handleSearch = (query: string) => {
  searchResults.value = orderStore.searchOrders(query);
};

const handleSubmit = async (formValues: any) => {
  try {
    const paymentResult = await processPayment({
      cardNumber: formValues.cardNumber,
      expiryDate: formValues.expiryDate,
      cvv: formValues.cvv,
      amount: cartStore.total.value
    });

    if (!paymentResult) {
      return;
    }

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

    const pdfUrl = await generateTicketPDF(
      cartStore.items.value,
      {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email
      },
      cartStore.total.value
    );

    localStorage.setItem('ticketPdfUrl', pdfUrl);
    cartStore.clearCart();
    router.push('/confirmation');
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
</script>

<!-- Composant de la page de commande -->

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="mb-6">
        <BackButton />
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">Commande</h1>

        <div class="mb-8">
          <OrderSummary
            :items="cartStore.items.value"
            :total="cartStore.total.value"
          />
        </div>

        <OrderSearch
          :orders="searchResults"
          @search="handleSearch"
        />

        <div v-if="paymentError" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {{ paymentError }}
        </div>

        <PaymentForm
          @submit="handleSubmit"
          :disabled="isProcessing"
        />

        <div class="mt-4 text-sm text-gray-600">
          <p>Test card numbers:</p>
          <ul class="list-disc list-inside">
            <li>4111111111111111 - Payment will succeed</li>
            <li>4242424242424242 - Insufficient funds error</li>
            <li>4000000000000002 - Expired card error</li>
            <li>Any other valid card number - Random success/failure</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
