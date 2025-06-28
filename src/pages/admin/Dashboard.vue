<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventStore } from '../../stores/event';
import { useToast } from 'vue-toastification';
import CreateEventForm from './CreateEventForm.vue';
import type { Event } from '../../types';
import QRScanner from '../QRScanner.vue';

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
      <h1 class="text-3xl font-bold">Tableau de Bord Admin</h1>
      <button
        @click="showCreateForm = !showCreateForm"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        {{ showCreateForm ? 'Annuler' : 'Créer un Événement' }}
      </button>
    </div>

    <!-- Formulaire de création d'événement -->
    <div v-if="showCreateForm" class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <h2 class="text-xl font-semibold mb-6 text-gray-800">Créer un Nouvel Événement</h2>
      <CreateEventForm @created="handleEventCreated" />
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-700">Total Événements</h3>
        <p class="text-3xl font-bold text-blue-600">{{ stats.totalEvents }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-700">Billets Vendus</h3>
        <p class="text-3xl font-bold text-green-600">{{ stats.totalTickets }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-700">Revenus Total</h3>
        <p class="text-3xl font-bold text-purple-600">{{ stats.totalRevenue.toFixed(2) }}€</p>
      </div>
    </div>

    <!-- Scanner QR -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Validation des Billets</h2>
      <QRScanner />
    </div>

    <!-- Liste des événements -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Événements</h2>
      
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>
      
      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="text-left py-3 px-4 font-semibold">Titre</th>
                <th class="text-left py-3 px-4 font-semibold">Date</th>
                <th class="text-left py-3 px-4 font-semibold">Lieu</th>
                <th class="text-left py-3 px-4 font-semibold">Billets Vendus</th>
                <th class="text-left py-3 px-4 font-semibold">Revenus</th>
                <th class="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id" class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">{{ event.title }}</td>
                <td class="py-3 px-4">{{ new Date(event.date).toLocaleDateString('fr-FR') }}</td>
                <td class="py-3 px-4">{{ event.location }}</td>
                <td class="py-3 px-4">
                  {{ event.tickets.reduce((sum, ticket) => 
                    sum + (ticket.quantity - ticket.available), 0) }}
                </td>
                <td class="py-3 px-4">
                  {{ event.tickets.reduce((sum, ticket) => 
                    sum + ((ticket.quantity - ticket.available) * ticket.price), 0).toFixed(2) }}€
                </td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-3 font-medium">
                    Modifier
                  </button>
                  <button 
                    @click="handleDeleteEvent(event.id)"
                    class="text-red-600 hover:text-red-800 font-medium"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="events.length === 0" class="text-center py-8 text-gray-500">
          Aucun événement trouvé. Créez votre premier événement !
        </div>
      </div>
    </div>
  </div>
</template>