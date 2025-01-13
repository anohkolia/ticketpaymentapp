<script setup lang="ts">
import type { CartItem } from '../../types';
import { formatPrice } from '../../utils/price';

defineProps<{
  items: CartItem[];
  total: number;
}>();
</script>

<template>
  <div class="p-4 bg-gray-50 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
    <div v-for="item in items" :key="item.ticketId" class="flex justify-between mb-2">
      <span>{{ item.name }} (x{{ item.quantity }})</span>
      <span>{{ formatPrice(item.price * item.quantity) }}</span>
    </div>
    <div class="border-t mt-4 pt-4 font-bold flex justify-between">
      <span>Total</span>
      <span>{{ formatPrice(total) }}</span>
    </div>
  </div>
</template>
