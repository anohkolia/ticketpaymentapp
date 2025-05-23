import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/HomePage.vue';
import EventPage from '../pages/EventPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import CheckoutPage from '../pages/CheckoutPage.vue';
import OrderConfirmation from '../pages/OrderConfirmation.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/eventpage',
      name: 'eventpage',
      component: EventPage
    },
    {
      path: '/loginpage',
      name: 'loginpage',
      component: LoginPage
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
