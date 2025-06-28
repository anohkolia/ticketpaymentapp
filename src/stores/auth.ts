import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;

    // Validate password length
    if (password.length < 6) {
      error.value = 'Le mot de passe doit contenir au moins 6 caractères';
      loading.value = false;
      return;
    }

    try {
      // Try to sign in first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If login fails and it's the admin email, try to create the account
      if (signInError && email === 'admin@eventoffice.com') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('weak_password')) {
            error.value = 'Le mot de passe doit contenir au moins 6 caractères';
          } else {
            error.value = "Une erreur s'est produite lors de la création du compte administrateur";
          }
          return;
        }

        if (!signUpError && signUpData.user) {
          // Update user metadata to set admin role
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
          
          // Try to sign in again after creating the account
          const { data: newData, error: newSignInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (newSignInError) {
            error.value = "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
            return;
          }
          
          if (newData.user) {
            user.value = {
              id: newData.user.id,
              email: newData.user.email!,
              role: 'admin' // Définir explicitement le rôle admin
            };
          }
          return;
        }
      }

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          error.value = 'Email ou mot de passe incorrect';
        } else {
          error.value = "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
        }
        return;
      }

      if (data.user) {
        // Pour l'email admin, forcer le rôle admin
        const role = email === 'admin@eventoffice.com' ? 'admin' : (data.user.user_metadata.role || 'user');
        
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          role: role
        };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      error.value = "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      user.value = null;
    } catch (err) {
      console.error('Logout error:', err);
    }
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
    isAdmin
  };
});