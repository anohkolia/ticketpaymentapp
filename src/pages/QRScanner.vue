<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const scanning = ref(false);
const scanResult = ref<{
  valid: boolean;
  message: string;
} | null>(null);

const startScanning = () => {
  scanning.value = true;
  // L'implémentation de la lecture des codes QR
 // Cela utiliserait typiquement une bibliothèque comme `vue-qrcode-reader`
};

const validateTicket = async (qrData: string) => {
  try {
    const data = JSON.parse(qrData);
    
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*, tickets(*)')
      .eq('id', data.ticketId)
      .single();

    if (error) throw error;

    if (!purchase) {
      scanResult.value = {
        valid: false,
        message: 'Invalid ticket'
      };
      return;
    }

    scanResult.value = {
      valid: true,
      message: `Valid ticket for ${purchase.tickets.type}`
    };
  } catch (err) {
    scanResult.value = {
      valid: false,
      message: 'Error validating ticket'
    };
  }
};
</script>

<template>
  <div class="space-y-4">
    <button
      @click="startScanning"
      class="bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90"
    >
      Start Scanning
    </button>

    <div v-if="scanResult" :class="[
      'p-4 rounded-lg',
      scanResult.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    ]">
      {{ scanResult.message }}
    </div>
  </div>
</template>