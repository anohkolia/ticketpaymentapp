import { ref } from 'vue';

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}

export const usePaymentService = () => {
  const isProcessing = ref(false);
  const error = ref<string | null>(null);

  const validateCard = (cardNumber: string): boolean => {
    // Basic Luhn algorithm check
    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost side
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const processPayment = async (details: PaymentDetails): Promise<boolean> => {
    isProcessing.value = true;
    error.value = null;

    try {
      // Validate card number format
      if (!/^\d{16}$/.test(details.cardNumber)) {
        throw new Error('Invalid card number format');
      }

      // Validate card number using Luhn algorithm
      if (!validateCard(details.cardNumber)) {
        throw new Error('Invalid card number');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test card scenarios
      switch (details.cardNumber) {
        case '4111111111111111':
          return true;
        case '4242424242424242':
          throw new Error('Insufficient funds');
        case '4000000000000002':
          throw new Error('Card expired');
        default:
          // Random success/failure for other valid cards
          if (Math.random() > 0.5) {
            throw new Error('Transaction declined by bank');
          }
          return true;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Payment failed';
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    isProcessing,
    error,
    processPayment
  };
};
