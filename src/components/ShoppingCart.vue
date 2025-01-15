<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { CartItem } from '../types';
import { formatPrice, calculateTotal } from '../utils/price';

const router = useRouter();
const props = defineProps<{
  items: CartItem[];
}>();

const emit = defineEmits(['remove-item']);

const total = computed(() => {
  return props.items.reduce((sum, item) =>
    sum + calculateTotal(item.price, item.quantity), 0);
});

const cartIsEmpty = computed(() => !props.items || props.items.length === 0);

const handleCheckout = () => {
  router.push('/checkout');
};
</script>

<template>
  <div class="border rounded-lg p-4 bg-white">
    <h2 class="text-xl font-bold mb-4">Mon panier</h2>
    <div v-if="cartIsEmpty" class="text-gray-500">
      Votre panier est vide
    </div>
    <div v-else class="space-y-4">
      <div v-for="item in items" :key="item.ticketId" class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h3 class="font-semibold">{{ item.name }}</h3>
          <p class="text-sm text-gray-600">Quantité: {{ item.quantity }}</p>
        </div>
        <div class="flex items-center justify-between sm:justify-end gap-4">
          <span>{{ formatPrice(calculateTotal(item.price, item.quantity)) }}</span>
          <button
            @click="emit('remove-item', item.ticketId)"
            class="text-red-600 hover:text-red-800"
          >
            Retirer
          </button>
        </div>
      </div>
      <div class="border-t pt-4 mt-4">
        <div class="flex justify-between items-center font-bold">
          <span>Total</span>
          <span>{{ formatPrice(total) }}</span>
        </div>
        <button
          @click="handleCheckout"
          class="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Proceder au paiement
        </button>
      </div>
    </div>
  </div>
</template>
