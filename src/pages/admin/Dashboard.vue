<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventStore } from '../../stores/event';
import { useToast } from 'vue-toastification';
import CreateEventForm from '../../pages/CreateEventForm.vue';
import type { Event } from '../../types';
import QRScanner from '../../pages/QRScanner.vue';

const eventStore = useEventStore();
const toast = useToast();
const showCreateForm = ref(false);
const events = ref<Event[]>([]);
const loading = ref(true);
const stats = ref({
  totalEvents: 0,
  totalTickets: 0,
  totalRevenue: 0
});

const fetchEvents = async () => {
  loading.value = true;
  try {
    await eventStore.fetchEvents();
    events.value = eventStore.events;

    // Calcules des statistiques
    stats.value.totalEvents = events.value.length;
    stats.value.totalTickets = events.value.reduce((acc, event) => 
      acc + event.tickets.reduce((sum, ticket) => 
        sum + (ticket.quantity - ticket.available), 0), 0);
    stats.value.totalRevenue = events.value.reduce((acc, event) => 
      acc + event.tickets.reduce((sum, ticket) => 
        sum + ((ticket.quantity - ticket.available) * ticket.price), 0), 0);

  } catch (error) {
    console.error(error);
    toast.error("Erreur lors du chargement des événements");
  } finally {
    loading.value = false;
  }
};

const handleEventCreated = () => {
  showCreateForm.value = false;
  fetchEvents();
  toast.success("Événement créé avec succès");
};

const handleDeleteEvent = async (eventId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
    return;
  }

  try {
    await eventStore.deleteEvent(eventId);
    toast.success("Événement supprimé avec succès");
    fetchEvents();
  } catch (error) {
    toast.error("Erreur lors de la suppression de l'événement");
    console.error(error);
  }
};

onMounted(fetchEvents);
</script>

<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <button
        @click="showCreateForm = !showCreateForm"
        class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
      >
        {{ showCreateForm ? 'Cancel' : 'Create Event' }}
      </button>
    </div>

    <div v-if="showCreateForm" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Create New Event</h2>
      <CreateEventForm @created="handleEventCreated" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-700">Total Events</h3>
        <p class="text-3xl font-bold text-primary">{{ stats.totalEvents }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-700">Total Tickets Sold</h3>
        <p class="text-3xl font-bold text-primary">{{ stats.totalTickets }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-700">Total Revenue</h3>
        <p class="text-3xl font-bold text-primary">{{ stats.totalRevenue.toFixed(2) }}€</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Ticket Validation</h2>
      <QRScanner />
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Events</h2>
      
      <div v-if="loading" class="text-center py-4">
        Loading...
      </div>
      
      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2">Title</th>
                <th class="text-left py-2">Date</th>
                <th class="text-left py-2">Location</th>
                <th class="text-left py-2">Tickets Sold</th>
                <th class="text-left py-2">Revenue</th>
                <th class="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id" class="border-b">
                <td class="py-2">{{ event.title }}</td>
                <td class="py-2">{{ new Date(event.date).toLocaleDateString() }}</td>
                <td class="py-2">{{ event.location }}</td>
                <td class="py-2">
                  {{ event.tickets.reduce((sum, ticket) => 
                    sum + (ticket.quantity - ticket.available), 0) }}
                </td>
                <td class="py-2">
                  {{ event.tickets.reduce((sum, ticket) => 
                    sum + ((ticket.quantity - ticket.available) * ticket.price), 0).toFixed(2) }}€
                </td>
                <td class="py-2">
                  <button class="text-blue-600 hover:text-blue-800 mr-2">
                    Edit
                  </button>
                  <button 
                    @click="handleDeleteEvent(event.id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
