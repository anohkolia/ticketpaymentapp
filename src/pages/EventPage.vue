<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { CartItem, Event } from '../types/index.ts';
import EventCard from '../components/EventCard.vue';
import TicketSelector from '../components/TicketSelector.vue';
import Cart from '../components/ShoppingCart.vue';
import CartNotification from '../components/CartNotification.vue';
import { useCartStore } from '../stores/useCartStore';
import { useEventStore } from '../stores/event';
import { useToast } from 'vue-toastification';

const router = useRouter();
const cartStore = useCartStore();
const eventStore = useEventStore();
const toast = useToast();

const showNotification = ref(false);
const notificationMessage = ref('');
const showMobileCart = ref(false);
const selectedEvent = ref<Event | null>(null);
const loading = ref(true);

const handleAddToCart = (item: CartItem) => {
  cartStore.addItem(item);
  notificationMessage.value = `${item.quantity} ${item.name} ticket${item.quantity > 1 ? 's' : ''} added to cart`;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const selectEvent = (event: Event) => {
  selectedEvent.value = event;
};

const goBackToEventsList = () => {
  selectedEvent.value = null;
};

const fetchEvents = async () => {
  loading.value = true;
  try {
    await eventStore.fetchEvents();
    
    // Si il n'y a qu'un seul événement, le sélectionner automatiquement
    if (eventStore.events.length === 1) {
      selectedEvent.value = eventStore.events[0];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    toast.error('Erreur lors du chargement des événements');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchEvents();
});
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
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Chargement des événements...</p>
      </div>

      <!-- No Events State -->
      <div v-else-if="eventStore.events.length === 0" class="text-center py-12">
        <div class="bg-white rounded-lg shadow-md p-8">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun événement disponible</h3>
          <p class="text-gray-500">Il n'y a actuellement aucun événement à afficher.</p>
        </div>
      </div>

      <!-- Events List (when no event is selected) -->
      <div v-else-if="!selectedEvent" class="space-y-6">
        <h1 class="text-3xl font-bold text-center mb-8">Événements Disponibles</h1>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="event in eventStore.events" 
            :key="event.id"
            class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            @click="selectEvent(event)"
          >
            <img 
              :src="event.image_url" 
              :alt="event.title" 
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h2 class="text-xl font-bold mb-2">{{ event.title }}</h2>
              <p class="text-gray-600 mb-2">{{ new Date(event.date).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) }}</p>
              <p class="text-gray-600 mb-4">{{ event.location }}</p>
              <p class="text-gray-700 mb-4 line-clamp-3">{{ event.description }}</p>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">
                  {{ event.tickets.length }} type{{ event.tickets.length > 1 ? 's' : '' }} de billet{{ event.tickets.length > 1 ? 's' : '' }}
                </span>
                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Voir les billets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Event Detail View -->
      <div v-else class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-2 space-y-8">
          <!-- Back Button -->
          <button
            @click="goBackToEventsList"
            class="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour aux événements
          </button>

          <!-- Event Details -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              :src="selectedEvent.image_url" 
              :alt="selectedEvent.title" 
              class="w-full h-48 sm:h-64 object-cover" 
            />
            <div class="p-4">
              <h2 class="text-xl sm:text-2xl font-bold mb-2">{{ selectedEvent.title }}</h2>
              <p class="text-gray-600 mb-2">{{ new Date(selectedEvent.date).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) }}</p>
              <p class="text-gray-600 mb-4">{{ selectedEvent.location }}</p>
              <p class="text-gray-700 mb-4">{{ selectedEvent.description }}</p>
            </div>
          </div>

          <!-- Ticket Selection -->
          <div class="bg-white rounded-lg shadow-md p-4">
            <h2 class="text-xl font-bold mb-4">Sélection de billets</h2>
            <div v-if="selectedEvent.tickets.length === 0" class="text-center py-8 text-gray-500">
              Aucun billet disponible pour cet événement.
            </div>
            <TicketSelector
              v-else
              v-for="ticket in selectedEvent.tickets"
              :key="ticket.id"
              :ticket="ticket"
              @add-to-cart="handleAddToCart"
            />
          </div>
        </div>

        <!-- Shopping Cart (Desktop) -->
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

    <!-- Cart Notification -->
    <CartNotification
      :show="showNotification"
      :message="notificationMessage"
    />
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>