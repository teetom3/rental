import api from './api';

const bookingService = {
  // Liste toutes les réservations avec filtres optionnels
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    return api.get(`/bookings?${params.toString()}`);
  },

  // Récupère une réservation par ID
  getById: (id) => {
    return api.get(`/bookings/${id}`);
  },

  // Vérifie la disponibilité avant création
  checkAvailability: (bookingData) => {
    return api.post('/bookings/check-availability', bookingData);
  },

  // Crée une nouvelle réservation
  create: (bookingData) => {
    return api.post('/bookings', bookingData);
  },

  // Marque une réservation comme terminée (retour confirmé)
  markAsCompleted: (id) => {
    return api.patch(`/bookings/${id}/complete`);
  },

  // Annule une réservation
  cancel: (id) => {
    return api.delete(`/bookings/${id}`);
  },
};

export default bookingService;
