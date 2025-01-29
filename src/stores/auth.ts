import { defineStore } from 'pinia';
import { ref } from 'vue';
import { User } from '../types';

export const userAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      user.value = {
        id: '1',
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        };
    } catch (err) {
      error.value = 'Invalid credentials';
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
  };

  const isAuthenticated = () => !!user.value;
  const isAdmin = () => user.value?.role === 'admin';

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };
});
