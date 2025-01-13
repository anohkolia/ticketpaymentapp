import { reactive, computed } from 'vue';
import type { Order } from '../types';

const state = reactive({
  orders: [] as Order[]
});

export const useOrderStore = () => {
  const addOrder = (order: Order) => {
    state.orders.unshift(order);
  };

  const searchOrders = (query: string) => {
    const searchTerm = query.toLowerCase();
    return state.orders.filter(order =>
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.email.toLowerCase().includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm)
    );
  };

  return {
    orders: computed(() => state.orders),
    addOrder,
    searchOrders
  };
};
