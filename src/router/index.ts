import { createRouter, createWebHistory } from 'vue-router'
import EventPage from '../pages/EventPage.vue';
import CheckoutPage from '../pages/CheckoutPage.vue';
import OrderConfirmation from '../pages/OrderConfirmation.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: EventPage
    },
    {
      path: '/checkout',
      component: CheckoutPage
    },
    {
      path: '/confirmation',
      component: OrderConfirmation
    }
  ]
});
