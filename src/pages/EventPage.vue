<script setup lang="ts">
import { ref } from 'vue';
import type { CartItem, Event } from '../types/index.ts';
import EventCard from '../components/EventCard.vue';
import TicketSelector from '../components/TicketSelector.vue';
import Cart from '../components/ShoppingCart.vue';
import CartNotification from '../components/CartNotification.vue';
import { useCartStore } from '../stores/useCartStore';

const cartStore = useCartStore();
const showNotification = ref(false);
const notificationMessage = ref('');
const showMobileCart = ref(false);

const event = ref<Event>({
  id: '1',
  title: 'Diner Gala 2025',
  date: 'Juillet 15, 2025 à 19h00',
  location: 'RohazonPark, Rennes',
  description: 'Je ne sais pas trop quoi mettre  ici, mais je suis sûr que ce sera un événement incroyable!',
  imageUrl: 'https://picsum.photos/800/400',
  tickets: [
    {
      id: 't1',
      name: 'Admission générale',
      price: 49.99,
      description: 'Access to all main stage performances',
      available: 100
    },
    {
      id: 't2',
      name: 'Pass VIP',
      price: 149.99,
      description: 'Premium viewing area, exclusive lounge access, and meet & greet',
      available: 20
    }
  ]
});

const handleAddToCart = (item: CartItem) => {
  cartStore.addItem(item);
  notificationMessage.value = `${item.quantity} ${item.name} ticket${item.quantity > 1 ? 's' : ''} added to cart`;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <!-- Mobile Cart Toggle Button -->
    <div class="fixed bottom-4 right-4 md:hidden z-50">
      <button
        @click="showMobileCart = !showMobileCart"
        class="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center" v-if="cartStore.getItemCount">
          {{ cartStore.getItemCount }}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    </div>

    <!-- Mobile Cart Overlay -->
    <div
      v-if="showMobileCart"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="showMobileCart = false"
    >
      <div
        class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white p-4"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Votre Panier</h2>
          <button @click="showMobileCart = false" class="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Cart
          :items="cartStore.items.value"
          @remove-item="cartStore.removeItem"
        />
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-2 space-y-8">
          <EventCard :event="event" />
          <div class="bg-white rounded-lg shadow-md p-4">
            <h2 class="text-xl font-bold mb-4">Sélection de billets</h2>
            <TicketSelector
              v-for="ticket in event.tickets"
              :key="ticket.id"
              :ticket="ticket"
              @add-to-cart="handleAddToCart"
            />
          </div>
        </div>
        <div class="hidden md:block">
          <div class="sticky top-8">
            <Cart
              :items="cartStore.items.value"
              @remove-item="cartStore.removeItem"
            />
          </div>
        </div>
      </div>
    </div>
    <CartNotification
      :show="showNotification"
      :message="notificationMessage"
    />
  </div>
</template>
