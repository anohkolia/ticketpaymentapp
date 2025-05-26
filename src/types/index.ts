export interface Ticket {
    id: string;
    name: string;
    //type: string;
    price: number;
    description: string;
    //quantity: number;
    available: number;
    //created_at: string;
    //event_id: string;
  }
  
  export interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    //created_at: string;
    imageUrl: string;
    tickets: Ticket[];
  }
  
  export interface CartItem { // c'est un article dans le panier
    ticketId: string;
    quantity: number;
    price: number;
    name: string;
  }
  
  export interface Order { // c'est une commande passée par un utilisateur
    id: string;
    date: string;
    customerName: string;
    email: string;
    items: CartItem[];
    quantity: number;
    total: number;
  }

  export interface Purchase { // c'est un achat effectué par un utilisateur
  id: string;
  user_id: string;
  ticket_id: string;
  quantity: number;
  total_price: number;
  qr_code: string;
  created_at: string;
}
  
  export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
  }
  