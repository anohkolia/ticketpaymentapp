<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/auth';
import type { Event } from '../../types';

const props = defineProps<{
  event: Event;
}>();

const emit = defineEmits(['updated', 'cancel']);

const authStore = useAuthStore();
const title = ref('');
const description = ref('');
const date = ref('');
const location = ref('');
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const currentImageUrl = ref('');
const tickets = ref<Array<{
  id?: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  description: string;
  available: number;
}>>([]);
const error = ref<string | null>(null);
const loading = ref(false);

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Veuillez sélectionner un fichier image valide (JPG, JPEG, PNG)';
      return;
    }
    
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'La taille du fichier ne doit pas dépasser 5MB';
      return;
    }
    
    imageFile.value = file;
    error.value = null;
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  // Reset the file input
  const fileInput = document.getElementById('editImageUpload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const uploadImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Erreur lors du téléchargement de l\'image');
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.warn('Image upload failed:', error);
    throw error;
  }
};

const updateEvent = async () => {
  if (!authStore.user?.id) {
    error.value = 'Vous devez être connecté pour modifier un événement';
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
    let imageUrl = currentImageUrl.value;
    
    // Upload de la nouvelle image si un fichier est sélectionné
    if (imageFile.value) {
      try {
        imageUrl = await uploadImage(imageFile.value);
      } catch (uploadError) {
        console.warn('Erreur lors du téléchargement de l\'image, conservation de l\'image actuelle');
        // Continue avec l'image actuelle si l'upload échoue
      }
    }

    // Mettre à jour l'événement
    const { error: eventError } = await supabase
      .from('events')
      .update({
        title: title.value,
        description: description.value,
        date: new Date(date.value).toISOString(),
        location: location.value,
        image_url: imageUrl
      })
      .eq('id', props.event.id);

    if (eventError) throw eventError;

    // Supprimer les anciens billets
    const { error: deleteTicketsError } = await supabase
      .from('tickets')
      .delete()
      .eq('event_id', props.event.id);

    if (deleteTicketsError) throw deleteTicketsError;

    // Créer les nouveaux billets
    const ticketsData = tickets.value.map(ticket => ({
      event_id: props.event.id,
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

    emit('updated');
  } catch (err: any) {
    error.value = err.message || 'Échec de la modification de l\'événement';
    console.error('Erreur lors de la modification de l\'événement:', err);
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
    description: '',
    available: 0
  });
};

const removeTicketType = (index: number) => {
  if (tickets.value.length > 1) {
    tickets.value.splice(index, 1);
  }
};

// Fonction pour formater la date pour l'input datetime-local
const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Initialiser le formulaire avec les données de l'événement
onMounted(() => {
  title.value = props.event.title;
  description.value = props.event.description;
  date.value = formatDateForInput(props.event.date);
  location.value = props.event.location;
  currentImageUrl.value = props.event.image_url;
  
  // Copier les billets existants
  tickets.value = props.event.tickets.map(ticket => ({
    id: ticket.id,
    name: ticket.name,
    type: ticket.type,
    price: ticket.price,
    quantity: ticket.quantity,
    available: ticket.available,
    description: ticket.description
  }));
});
</script>

<template>
  <form @submit.prevent="updateEvent" class="space-y-6">
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
          Image de l'événement
        </label>
        <div class="space-y-3">
          <!-- Image actuelle -->
          <div v-if="currentImageUrl && !imagePreview" class="relative inline-block">
            <img 
              :src="currentImageUrl" 
              alt="Image actuelle" 
              class="w-32 h-24 object-cover rounded-lg border border-gray-300"
            />
            <span class="text-xs text-gray-500 block mt-1">Image actuelle</span>
          </div>

          <input
            id="editImageUpload"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            @change="handleImageUpload"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p class="text-xs text-gray-500">
            Formats acceptés: JPG, JPEG, PNG (max 5MB). Laissez vide pour conserver l'image actuelle.
          </p>
          
          <!-- Aperçu de la nouvelle image -->
          <div v-if="imagePreview" class="relative inline-block">
            <img 
              :src="imagePreview" 
              alt="Nouvel aperçu" 
              class="w-32 h-24 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              @click="removeImage"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
            <span class="text-xs text-gray-500 block mt-1">Nouvelle image</span>
          </div>
        </div>
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
        @click="emit('cancel')"
        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        :disabled="loading"
      >
        Annuler
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Modification en cours...' : 'Modifier l\'Événement' }}
      </button>
    </div>
  </form>
</template>