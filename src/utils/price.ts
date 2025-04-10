export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-UE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export const calculateTotal = (price: number, quantity: number): number => {
  return price * quantity
}
