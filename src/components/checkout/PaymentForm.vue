<script setup lang="ts">
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const props = defineProps<{
  disabled?: boolean;
}>();

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email format'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  cardNumber: yup.string()
    .required('Card number is required')
    .matches(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryDate: yup.string()
    .required('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)'),
  cvv: yup.string()
    .required('CVV is required')
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
        <label class="block text-sm font-medium text-gray-700">First Name</label>
        <input
          v-model="values.firstName"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
        <span v-if="errors.firstName" class="text-red-500 text-sm">{{ errors.firstName }}</span>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          v-model="values.lastName"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
        <span v-if="errors.lastName" class="text-red-500 text-sm">{{ errors.lastName }}</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Email</label>
      <input
        v-model="values.email"
        type="email"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        :disabled="disabled"
      />
      <span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Card Number</label>
      <input
        v-model="values.cardNumber"
        type="text"
        maxlength="16"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        :disabled="disabled"
      />
      <span v-if="errors.cardNumber" class="text-red-500 text-sm">{{ errors.cardNumber }}</span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Expiry Date (MM/YY)</label>
        <input
          v-model="values.expiryDate"
          type="text"
          maxlength="5"
          placeholder="MM/YY"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
        <span v-if="errors.expiryDate" class="text-red-500 text-sm">{{ errors.expiryDate }}</span>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">CVV</label>
        <input
          v-model="values.cvv"
          type="text"
          maxlength="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :disabled="disabled"
        />
        <span v-if="errors.cvv" class="text-red-500 text-sm">{{ errors.cvv }}</span>
      </div>
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      :disabled="disabled"
    >
      <span v-if="disabled">Processing Payment...</span>
      <span v-else>Complete Purchase</span>
    </button>
  </form>
</template>
