export interface Ticket {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  quantity: number;
  available: number;
  created_at: string;
  event_id: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  created_at: string;
  image_url: string; // Changed from imageUrl to match database schema
  is_private: boolean;
  created_by: string; // Added to match database schema
  tickets: Ticket[];
}

export interface CartItem {
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
  quantity: number;
  total: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  ticket_id: string;
  quantity: number;
  total_price: number;
  qr_code: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  tickets?: Ticket; // Optional relation to ticket
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Database table interfaces for Supabase
export interface DatabaseEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface DatabaseTicket {
  id: string;
  event_id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  available: number;
  description: string;
  created_at: string;
}

export interface DatabasePurchase {
  id: string;
  user_id: string;
  ticket_id: string;
  quantity: number;
  total_price: number;
  customer_name: string;
  customer_email: string;
  qr_code: string;
  created_at: string;
}

// Form interfaces
export interface PaymentFormData {
  email: string;
  firstName: string;
  lastName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Supabase Database Schema Types
export interface Database {
  public: {
    Tables: {
      events: {
        Row: DatabaseEvent;
        Insert: Omit<DatabaseEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseEvent, 'id' | 'created_at'>>;
      };
      tickets: {
        Row: DatabaseTicket;
        Insert: Omit<DatabaseTicket, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseTicket, 'id' | 'created_at'>>;
      };
      purchases: {
        Row: DatabasePurchase;
        Insert: Omit<DatabasePurchase, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabasePurchase, 'id' | 'created_at'>>;
      };
    };
  };
}