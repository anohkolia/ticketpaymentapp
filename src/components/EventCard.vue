<script setup lang="ts">
import { Event } from '../types';
import { formatPrice } from '../utils/price';

defineProps<{
  event: Event;
}>();
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <img :src="event.imageUrl" :alt="event.title" class="w-full h-48 sm:h-64 object-cover">
    <div class="p-4">
      <h2 class="text-xl sm:text-2xl font-bold mb-2">{{ event.title }}</h2>
      <p class="text-gray-600 mb-2">{{ event.date }}</p>
      <p class="text-gray-600 mb-4">{{ event.location }}</p>
      <p class="text-gray-700 mb-4">{{ event.description }}</p>
      <div class="space-y-2">
        <div v-for="ticket in event.tickets" :key="ticket.id"
             class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span>{{ ticket.name }}</span>
          <span class="font-semibold">{{ formatPrice(ticket.price) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
