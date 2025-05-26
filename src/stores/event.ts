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
      const { error: err } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (err) {
        console.error('Error deleting event:', err);
        throw new Error('Failed to delete event');
      }

      // Supprime l'événement de la liste locale
      events.value = events.value.filter(event => event.id !== eventId);
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting event:', err);
      throw new Error('Failed to delete event');
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
      'Is Online': event.is_online ? 'Yes' : 'No',
      'Is Private': event.is_private ? 'Yes' : 'No',
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