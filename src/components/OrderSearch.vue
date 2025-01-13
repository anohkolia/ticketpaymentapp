<script setup lang="ts">
import { ref } from 'vue';
import type { Order } from '../types';
import { formatPrice } from '../utils/price';
import { format } from 'date-fns';

const props = defineProps<{
  orders: Order[];
}>();

const searchQuery = ref('');
const emit = defineEmits(['search']);

const handleSearch = () => {
  emit('search', searchQuery.value);
};
</script>

<template>
  <div class="mb-8">
    <div class="flex gap-4 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, email, or order ID"
        class="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        @input="handleSearch"
      />
    </div>

    <div v-if="orders.length > 0" class="space-y-4">
      <div v-for="order in orders" :key="order.id"
           class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="font-semibold">{{ order.customerName }}</h3>
            <p class="text-sm text-gray-600">{{ order.email }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">
              {{ format(new Date(order.date), 'MMM d, yyyy') }}
            </p>
            <p class="font-semibold">{{ formatPrice(order.total) }}</p>
          </div>
        </div>
        <div class="text-sm text-gray-600">
          <p>Order ID: {{ order.id }}</p>
          <ul class="mt-2">
            <li v-for="item in order.items" :key="item.ticketId">
              {{ item.quantity }}x {{ item.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <p v-else class="text-gray-500 text-center">No orders found</p>
  </div>
</template>
