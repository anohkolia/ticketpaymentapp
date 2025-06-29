import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import QRCode from 'qrcode';
import type { Purchase, CartItem } from '../types';

export const usePurchaseStore = defineStore('purchase', () => {
  const purchases = ref<Purchase[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createPurchase = async (
    cartItems: CartItem[],
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
    },
    total: number
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const purchasePromises = cartItems.map(async (item) => {
        // Générer le QR code pour chaque billet
        const qrData = JSON.stringify({
          ticketId: item.ticketId,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          quantity: item.quantity,
          purchaseDate: new Date().toISOString(),
          eventId: item.ticketId // Vous pourriez vouloir ajouter l'eventId au CartItem
        });

        const qrCode = await QRCode.toDataURL(qrData);

        // Créer l'achat dans la base de données
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            ticket_id: item.ticketId,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            customer_email: customerInfo.email,
            qr_code: qrCode,
            user_id: null // Pour les achats sans compte utilisateur
          })
          .select()
          .single();

        if (purchaseError) throw purchaseError;

        // Mettre à jour la disponibilité des billets
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            available: supabase.raw('available - ?', [item.quantity])
          })
          .eq('id', item.ticketId);

        if (updateError) throw updateError;

        return purchase;
      });

      const purchaseResults = await Promise.all(purchasePromises);
      purchases.value.push(...purchaseResults);

      return purchaseResults;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de l\'achat';
      console.error('Purchase error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPurchases = async () => {
    loading.value = true;
    try {
      const { data, error: err } = await supabase
        .from('purchases')
        .select('*, tickets(*)')
        .order('created_at', { ascending: false });

      if (err) throw err;
      purchases.value = data || [];
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des achats';
      console.error('Fetch purchases error:', err);
    } finally {
      loading.value = false;
    }
  };

  const validateTicket = async (qrData: string) => {
    try {
      const ticketData = JSON.parse(qrData);
      
      const { data: purchase, error } = await supabase
        .from('purchases')
        .select('*, tickets(*)')
        .eq('ticket_id', ticketData.ticketId)
        .eq('customer_email', ticketData.email)
        .single();

      if (error || !purchase) {
        return {
          valid: false,
          message: 'Billet invalide ou non trouvé'
        };
      }

      return {
        valid: true,
        message: `Billet valide pour ${purchase.tickets?.name}`,
        purchase
      };
    } catch (err) {
      return {
        valid: false,
        message: 'Erreur lors de la validation du billet'
      };
    }
  };

  return {
    purchases,
    loading,
    error,
    createPurchase,
    fetchPurchases,
    validateTicket
  };
});