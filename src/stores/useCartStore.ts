import { reactive, computed } from 'vue';
import { CartItem } from '../types';

// classe pour gérer l'état du panier d'achats

const state = reactive({
  items: [] as CartItem[]
});

export const useCartStore = () => {
  const total = computed(() => {
    return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  const addItem = (newItem: CartItem) => {
    const existingItem = state.items.find(item => item.ticketId === newItem.ticketId);

    if (existingItem) {
      existingItem.quantity += newItem.quantity;
    } else {
      state.items.push(newItem);
    }
  };

  const removeItem = (ticketId: string) => {
    state.items = state.items.filter(item => item.ticketId !== ticketId);
  };

  const clearCart = () => {
    state.items = [];
  };

  const getItemCount = computed(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  });

  return {
    items: computed(() => state.items),
    total,
    addItem,
    removeItem,
    clearCart,
    getItemCount
  };
};
