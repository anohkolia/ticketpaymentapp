<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const title = ref('');
const description = ref('');
const date = ref('');
const location = ref('');
const isPrivate = ref(false);
const tickets = ref([{ type: '', price: 0, quantity: 0 }]);
const error = ref<string | null>(null);
const loading = ref(false);

const emit = defineEmits(['created']);

const createEvent = async () => {
  if (!authStore.user?.id) {
    error.value = 'You must be logged in to create an event';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title: title.value,
        description: description.value,
        date: new Date(date.value).toISOString(),
        location: location.value,
        is_private: isPrivate.value,
        created_by: authStore.user.id
      })
      .select()
      .single();

    if (eventError) throw eventError;

    if (!event) {
      throw new Error('Failed to create event');
    }

    // Create tickets
    const ticketsData = tickets.value.map(ticket => ({
      event_id: event.id,
      type: ticket.type,
      price: ticket.price,
      quantity: ticket.quantity,
      available: ticket.quantity
    }));

    const { error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsData);

    if (ticketsError) throw ticketsError;

    emit('created');
    resetForm();
  } catch (err: any) {
    error.value = err.message || 'Failed to create event';
    console.error('Error creating event:', err);
  } finally {
    loading.value = false;
  }
};

const addTicketType = () => {
  tickets.value.push({ type: '', price: 0, quantity: 0 });
};

const removeTicketType = (index: number) => {
  tickets.value.splice(index, 1);
};

const resetForm = () => {
  title.value = '';
  description.value = '';
  date.value = '';
  location.value = '';
  isPrivate.value = false;
  tickets.value = [{ type: '', price: 0, quantity: 0 }];
  error.value = null;
};
</script>

<template>
  <form @submit.prevent="createEvent" class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700">Title</label>
      <input
        v-model="title"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        v-model="description"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Date</label>
      <input
        v-model="date"
        type="datetime-local"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Location</label>
      <input
        v-model="location"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
      />
    </div>

    <div class="flex space-x-4">
      <label class="flex items-center">
        <input
          v-model="isPrivate"
          type="checkbox"
          class="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span class="ml-2 text-sm text-gray-700">Private Event</span>
      </label>
    </div>

    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">Tickets</h3>
        <button
          type="button"
          @click="addTicketType"
          class="text-sm text-primary hover:text-primary-dark"
        >
          Add Ticket Type
        </button>
      </div>

      <div
        v-for="(ticket, index) in tickets"
        :key="index"
        class="flex space-x-4 items-end"
      >
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700">Type</label>
          <input
            v-model="ticket.type"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700">Price</label>
          <input
            v-model.number="ticket.price"
            type="number"
            min="0"
            step="0.01"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            v-model.number="ticket.quantity"
            type="number"
            min="1"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <button
          v-if="tickets.length > 1"
          type="button"
          @click="removeTicketType(index)"
          class="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
    </div>

    <div v-if="error" class="text-red-600">{{ error }}</div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
    >
      {{ loading ? 'Creating...' : 'Create Event' }}
    </button>
  </form>
</template>