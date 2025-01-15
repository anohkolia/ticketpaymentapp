<script setup lang="ts">
import { ref } from 'vue';
import { Ticket } from '../types';
import { formatPrice, calculateTotal } from '../utils/price';

const props = defineProps<{
  ticket: Ticket;
}>();

const quantity = ref(0);
const emit = defineEmits(['add-to-cart']);

const addToCart = () => {
  if (quantity.value > 0) {
    emit('add-to-cart', {
      ticketId: props.ticket.id,
      quantity: quantity.value,
      price: props.ticket.price,
      name: props.ticket.name
    });
    quantity.value = 0;
  }
};
</script>

<template>
  <div class="border rounded-lg p-4 mb-4">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold">{{ ticket.name }}</h3>
      <span class="text-lg">{{ formatPrice(ticket.price) }}</span>
    </div>
    <p class="text-gray-600 mb-4">{{ ticket.description }}</p>
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button
          @click="quantity > 0 && quantity--"
          class="px-3 py-1 border rounded-lg"
          :disabled="quantity === 0"
        >-</button>
        <span class="w-12 text-center">{{ quantity }}</span>
        <button
          @click="quantity < ticket.available && quantity++"
          class="px-3 py-1 border rounded-lg"
          :disabled="quantity === ticket.available"
        >+</button>
      </div>
      <button
        @click="addToCart"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg"
        :disabled="quantity === 0"
      >
        Ajouter au panier
      </button>
    </div>
    <div v-if="quantity > 0" class="mt-2 text-right">
      Total: {{ formatPrice(calculateTotal(ticket.price, quantity)) }}
    </div>
  </div>
</template>
