import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import type { Event } from '../types';

export const useEventStore = defineStore('event', () => {
  const events = ref<Event[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref({
    date: '',
    location: '',
    price: {
      min: 0,
      max: 1000
    },
    isOnline: null as boolean | null,
    isPrivate: null as boolean | null
  });

  const fetchEvents = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from('events')
        .select('*, tickets(*)')
        .order('date', { ascending: true });

      if (err) {
        console.error('Supabase error:', err);
        throw new Error('Failed to fetch events');
      }

      events.value = data || [];

      // Log pour le débogage
      console.log('Fetched events:', events.value);
    } catch (err) {
      console.error('Error fetching events:', err);
      error.value = 'Impossible de charger les événements';
    } finally {
      loading.value = false;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      console.log('Attempting to delete event:', eventId);
      
      // Vérifier d'abord si l'événement existe et appartient à l'utilisateur
      const { data: eventCheck, error: checkError } = await supabase
        .from('events')
        .select('id, created_by, title')
        .eq('id', eventId)
        .single();

      if (checkError) {
        console.error('Error checking event:', checkError);
        throw new Error('Événement non trouvé');
      }

      if (!eventCheck) {
        throw new Error('Événement non trouvé');
      }

      console.log('Event found:', eventCheck);

      // Supprimer d'abord les achats liés aux billets de cet événement
      const { error: purchasesError } = await supabase
        .from('purchases')
        .delete()
        .in('ticket_id', 
          supabase
            .from('tickets')
            .select('id')
            .eq('event_id', eventId)
        );

      if (purchasesError) {
        console.warn('Warning deleting purchases:', purchasesError);
        // Ne pas arrêter le processus si la suppression des achats échoue
      }

      // Ensuite supprimer les billets associés
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .eq('event_id', eventId);

      if (ticketsError) {
        console.error('Error deleting tickets:', ticketsError);
        throw new Error('Erreur lors de la suppression des billets');
      }

      console.log('Tickets deleted successfully');

      // Enfin supprimer l'événement
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (eventError) {
        console.error('Error deleting event:', eventError);
        throw new Error('Erreur lors de la suppression de l\'événement');
      }

      console.log('Event deleted successfully');

      // Supprimer l'événement de la liste locale
      events.value = events.value.filter(event => event.id !== eventId);
      
      return { success: true };
    } catch (err: any) {
      console.error('Error in deleteEvent:', err);
      error.value = err.message || 'Erreur lors de la suppression de l\'événement';
      throw err;
    }
  };

  const searchEvents = (query: string) => {
    if (!query) return events.value;
    const searchTerm = query.toLowerCase();
    return events.value.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.location.toLowerCase().includes(searchTerm)
    );
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(events.value.map(event => ({
      Title: event.title,
      Description: event.description,
      Date: new Date(event.date).toLocaleDateString(),
      Location: event.location,
      'Total Tickets': event.tickets.reduce((sum, t) => sum + t.quantity, 0),
      'Available Tickets': event.tickets.reduce((sum, t) => sum + t.available, 0)
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Events');
    XLSX.writeFile(wb, 'events.xlsx');
  };

  const exportToPDF = async () => {
    const jsPDF = await import('jspdf');
    const doc = new jsPDF.default();
    
    events.value.forEach((event, index) => {
      if (index > 0) doc.addPage();
      
      doc.setFontSize(16);
      doc.text(event.title, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 20, 30);
      doc.text(`Location: ${event.location}`, 20, 40);
      doc.text(`Description: ${event.description}`, 20, 50);
      
      let y = 70;
      doc.text('Tickets:', 20, y);
      event.tickets.forEach(ticket => {
        y += 10;
        doc.text(`${ticket.type}: ${ticket.price}€ (${ticket.available} available)`, 30, y);
      });
    });
    
    doc.save('events.pdf');
  };

  return {
    events,
    loading,
    error,
    filters,
    fetchEvents,
    deleteEvent,
    searchEvents,
    exportToExcel,
    exportToPDF
  };
});