<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  await authStore.login(email.value, password.value);
  if (authStore.isAuthenticated()) {
    if (authStore.isAdmin()) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  }
};
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-center">Login</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#186a3b]"
        />
      </div>

      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#186a3b]"
        />
      </div>

      <div v-if="authStore.error" class="mb-4 text-red-500 text-sm">
        {{ authStore.error }}
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full bg-[#186a3b] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
      >
        {{ authStore.loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>