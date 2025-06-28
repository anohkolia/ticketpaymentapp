<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const title = ref('');
const description = ref('');
const date = ref('');
const location = ref('');
const imageUrl = ref('');
const tickets = ref([{ 
  name: '', 
  type: '', 
  price: 0, 
  quantity: 0, 
  description: '' 
}]);
const error = ref<string | null>(null);
const loading = ref(false);

const emit = defineEmits(['created']);

const createEvent = async () => {
  if (!authStore.user?.id) {
    error.value = 'Vous devez être connecté pour créer un événement';
    return;
  }

  // Validation des champs requis
  if (!title.value || !description.value || !date.value || !location.value) {
    error.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  // Validation des billets
  for (const ticket of tickets.value) {
    if (!ticket.name || !ticket.type || ticket.price <= 0 || ticket.quantity <= 0) {
      error.value = 'Veuillez remplir correctement tous les champs des billets';
      return;
    }
  }

  loading.value = true;
  error.value = null;

  try {
    // Créer l'événement
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title: title.value,
        description: description.value,
        date: new Date(date.value).toISOString(),
        location: location.value,
        image_url: imageUrl.value || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
        is_private: false, // Toujours défini comme événement public
        created_by: authStore.user.id
      })
      .select()
      .single();

    if (eventError) throw eventError;

    if (!event) {
      throw new Error('Échec de la création de l\'événement');
    }

    // Créer les billets
    const ticketsData = tickets.value.map(ticket => ({
      event_id: event.id,
      name: ticket.name,
      type: ticket.type,
      price: ticket.price,
      quantity: ticket.quantity,
      available: ticket.quantity,
      description: ticket.description
    }));

    const { error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsData);

    if (ticketsError) throw ticketsError;

    emit('created');
    resetForm();
  } catch (err: any) {
    error.value = err.message || 'Échec de la création de l\'événement';
    console.error('Erreur lors de la création de l\'événement:', err);
  } finally {
    loading.value = false;
  }
};

const addTicketType = () => {
  tickets.value.push({ 
    name: '', 
    type: '', 
    price: 0, 
    quantity: 0, 
    description: '' 
  });
};

const removeTicketType = (index: number) => {
  if (tickets.value.length > 1) {
    tickets.value.splice(index, 1);
  }
};

const resetForm = () => {
  title.value = '';
  description.value = '';
  date.value = '';
  location.value = '';
  imageUrl.value = '';
  tickets.value = [{ 
    name: '', 
    type: '', 
    price: 0, 
    quantity: 0, 
    description: '' 
  }];
  error.value = null;
};

// Fonction pour formater la date pour l'input datetime-local
const formatDateForInput = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Définir une date par défaut
date.value = formatDateForInput();
</script>

<template>
  <form @submit.prevent="createEvent" class="space-y-6">
    <!-- Informations de base -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Titre de l'événement <span class="text-red-500">*</span>
        </label>
        <input
          v-model="title"
          type="text"
          required
          placeholder="Ex: Diner Gala 2025"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Lieu <span class="text-red-500">*</span>
        </label>
        <input
          v-model="location"
          type="text"
          required
          placeholder="Ex: RohazonPark, Rennes"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Description <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="description"
        required
        rows="4"
        placeholder="Décrivez votre événement..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      ></textarea>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Date et Heure <span class="text-red-500">*</span>
        </label>
        <input
          v-model="date"
          type="datetime-local"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          URL de l'image
        </label>
        <input
          v-model="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p class="text-xs text-gray-500 mt-1">Laissez vide pour utiliser une image par défaut</p>
      </div>
    </div>

    <!-- Section des billets -->
    <div class="border-t pt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Types de Billets</h3>
        <button
          type="button"
          @click="addTicketType"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          + Ajouter un Type
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(ticket, index) in tickets"
          :key="index"
          class="bg-gray-50 p-4 rounded-lg border"
        >
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium text-gray-700">Billet {{ index + 1 }}</h4>
            <button
              v-if="tickets.length > 1"
              type="button"
              @click="removeTicketType(index)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Supprimer
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nom du billet <span class="text-red-500">*</span>
              </label>
              <input
                v-model="ticket.name"
                type="text"
                required
                placeholder="Ex: Pass Normal"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Type <span class="text-red-500">*</span>
              </label>
              <input
                v-model="ticket.type"
                type="text"
                required
                placeholder="Ex: Standard, VIP"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Prix (€) <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="ticket.price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="49.99"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Quantité <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="ticket.quantity"
                type="number"
                min="1"
                required
                placeholder="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="ticket.description"
              rows="2"
              placeholder="Description du billet..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <!-- Boutons d'action -->
    <div class="flex justify-end space-x-4 pt-6 border-t">
      <button
        type="button"
        @click="resetForm"
        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        :disabled="loading"
      >
        Réinitialiser
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Création en cours...' : 'Créer l\'Événement' }}
      </button>
    </div>
  </form>
</template>