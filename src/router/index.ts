import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import Home from '../pages/HomePage.vue';
import EventPage from '../pages/EventPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import Dashboard from '../pages/admin/Dashboard.vue';
import CheckoutPage from '../pages/CheckoutPage.vue';
import OrderConfirmation from '../pages/OrderConfirmation.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
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
      path: '/admin',
      name: 'admin',
      component: Dashboard,
      meta: { requiresAdmin: true }
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

// Protection du navigateur
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();

//   if (to.meta.requiresAdmin && !authStore.isAdmin) {
//     // Si l'utilisateur n'est pas admin, redirige vers la page de connexion
//     next('/loginpage');
//   } else {
//     next();
//   }
// })

export default router;
