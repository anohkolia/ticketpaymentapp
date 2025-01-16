<script setup lang="ts">
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const props = defineProps<{
  disabled?: boolean;
}>();

const schema = yup.object({
  email: yup.string().required('*').email('Invalid email format'),
  firstName: yup.string().required('*'),
  lastName: yup.string().required('*'),
  cardNumber: yup.string()
    .required('*')
    .matches(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryDate: yup.string()
    .required('*')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)'),
  cvv: yup.string()
    .required('*')
    .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
});

const emit = defineEmits(['submit']);

const { handleSubmit, errors, values } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  }
});

const onSubmit = handleSubmit((formValues) => {
  emit('submit', formValues);
});
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nom <span v-if="errors.firstName" class="text-red-500 text-sm">{{ errors.firstName }}</span></label>
        <input
          v-model="values.firstName"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Prenom <span v-if="errors.lastName" class="text-red-500 text-sm">{{ errors.lastName }}</span></label>
        <input
          v-model="values.lastName"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Email <span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span></label>
      <input
        v-model="values.email"
        type="email"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        :disabled="disabled"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Numéro de Carte <span v-if="errors.cardNumber" class="text-red-500 text-sm">{{ errors.cardNumber }}</span></label>
      <input
        v-model="values.cardNumber"
        type="text"
        maxlength="16"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        :disabled="disabled"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Date Expiration (MM/YY) <span v-if="errors.expiryDate" class="text-red-500 text-sm">{{ errors.expiryDate }}</span></label>
        <input
          v-model="values.expiryDate"
          type="text"
          maxlength="5"
          placeholder="MM/YY"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">CVV <span v-if="errors.cvv" class="text-red-500 text-sm">{{ errors.cvv }}</span></label>
        <input
          v-model="values.cvv"
          type="text"
          maxlength="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
      </div>
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      :disabled="disabled"
    >
      <span v-if="disabled">Traitement du paiements...</span>
      <span v-else>Passer la commande</span>
    </button>
  </form>
</template>
