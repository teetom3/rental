import api from './api';

const equipmentService = {
  // Liste tous les équipements
  getAll: () => {
    return api.get('/equipment');
  },

  // Récupère un équipement par ID
  getById: (id) => {
    return api.get(`/equipment/${id}`);
  },

  // Crée un nouvel équipement
  create: (equipmentData) => {
    return api.post('/equipment', equipmentData);
  },

  // Met à jour un équipement
  update: (id, equipmentData) => {
    return api.put(`/equipment/${id}`, equipmentData);
  },

  // Supprime un équipement
  delete: (id) => {
    return api.delete(`/equipment/${id}`);
  },
};

export default equipmentService;
