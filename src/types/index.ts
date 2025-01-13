export interface Ticket {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  tickets: Ticket[];
}

export interface CartItem { // c'est un article dans le panier
  ticketId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  email: string;
  items: CartItem[];
  total: number;
}
