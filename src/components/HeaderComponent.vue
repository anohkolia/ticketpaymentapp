<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <header class="bg-gray-500 text-white p-4 border-b border-gray-700">
    <nav class="container mx-auto">
      <ul class="flex space-x-4 justify-center">
        <li><router-link to="/" class="hover:text-gray-300 font-bold">Accueil</router-link></li>
        <li>
          <router-link to="/eventpage" class="hover:text-gray-300 font-bold"
            >Événements</router-link
          >
        </li>
        <li>
          <router-link to="/" class="hover:text-gray-300 font-bold">Nous Contacter</router-link>
        </li>
        <li>
          <template v-if="authStore.isAuthenticated()">
            <router-link
              v-if="authStore.isAdmin()"
              to="/admin"
              class="hover:text-gray-300 font-bold"
              >Tableau de Bord</router-link
            >
            <button @click="authStore.logout" class="hover:text-gray-300 font-bold">
              Déconnexion
            </button>
          </template>
          <router-link v-else to="/loginpage" class="hover:text-gray-300 font-bold"
            >Connexion</router-link
          >
        </li>
      </ul>
    </nav>
  </header>
</template>
