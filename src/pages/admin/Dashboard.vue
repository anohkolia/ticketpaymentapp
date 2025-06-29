<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventStore } from '../../stores/event';
import { useToast } from 'vue-toastification';
import CreateEventForm from './CreateEventForm.vue';
import EditEventForm from './EditEventForm.vue';
import type { Event } from '../../types';
import QRScanner from '../QRScanner.vue';

const eventStore = useEventStore();
const toast = useToast();
const showCreateForm = ref(false);
const showEditForm = ref(false);
const editingEvent = ref<Event | null>(null);
const events = ref<Event[]>([]);
const loading = ref(true);
const deleting = ref<string | null>(null);
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
    console.error('Error fetching events:', error);
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

const handleEventUpdated = () => {
  showEditForm.value = false;
  editingEvent.value = null;
  fetchEvents();
  toast.success("Événement modifié avec succès");
};

const handleEditEvent = (event: Event) => {
  editingEvent.value = event;
  showEditForm.value = true;
  showCreateForm.value = false;
};

const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
  // Confirmation avec le nom de l'événement
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${eventTitle}" ?\n\nCette action supprimera également :\n- Tous les billets associés\n- Tous les achats liés\n\nCette action est irréversible.`)) {
    return;
  }

  deleting.value = eventId;

  try {
    console.log('Starting deletion process for event:', eventId);
    
    await eventStore.deleteEvent(eventId);
    
    toast.success(`Événement "${eventTitle}" supprimé avec succès`);
    
    // Recharger la liste des événements
    await fetchEvents();
    
  } catch (error: any) {
    console.error('Delete event error:', error);
    
    // Messages d'erreur plus spécifiques
    if (error.message.includes('foreign key')) {
      toast.error("Impossible de supprimer l'événement : des achats sont liés à cet événement");
    } else if (error.message.includes('permission')) {
      toast.error("Vous n'avez pas les permissions pour supprimer cet événement");
    } else {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    }
  } finally {
    deleting.value = null;
  }
};

const cancelEdit = () => {
  showEditForm.value = false;
  editingEvent.value = null;
};

const cancelCreate = () => {
  showCreateForm.value = false;
};

onMounted(fetchEvents);
</script>

<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Tableau de Bord Admin</h1>
      <button
        @click="showCreateForm = !showCreateForm; showEditForm = false; editingEvent = null"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        {{ showCreateForm ? 'Annuler' : 'Créer un Événement' }}
      </button>
    </div>

    <!-- Formulaire de création d'événement -->
    <div v-if="showCreateForm" class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800">Créer un Nouvel Événement</h2>
        <button
          @click="cancelCreate"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <CreateEventForm @created="handleEventCreated" />
    </div>

    <!-- Formulaire de modification d'événement -->
    <div v-if="showEditForm && editingEvent" class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800">Modifier l'Événement</h2>
        <button
          @click="cancelEdit"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <EditEventForm 
        :event="editingEvent" 
        @updated="handleEventUpdated" 
        @cancel="cancelEdit"
      />
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
                <td class="py-3 px-4">
                  <div class="flex items-center">
                    <img 
                      :src="event.image_url" 
                      :alt="event.title"
                      class="w-12 h-12 object-cover rounded-lg mr-3"
                    />
                    <div>
                      <div class="font-medium">{{ event.title }}</div>
                      <div class="text-sm text-gray-500 truncate max-w-xs">{{ event.description }}</div>
                    </div>
                  </div>
                </td>
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
                  <div class="flex space-x-2">
                    <button 
                      @click="handleEditEvent(event)"
                      :disabled="deleting === event.id"
                      class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Modifier
                    </button>
                    <button 
                      @click="handleDeleteEvent(event.id, event.title)"
                      :disabled="deleting === event.id"
                      class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <span v-if="deleting === event.id" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                      {{ deleting === event.id ? 'Suppression...' : 'Supprimer' }}
                    </button>
                  </div>
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