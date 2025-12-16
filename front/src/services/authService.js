import api from './api';

const authService = {
  // Inscription
  register: (userData) => {
    return api.post('/register', userData);
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.get('/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  // Récupère l'utilisateur connecté
  getMe: () => {
    return api.get('/getMe');
  },

  // Vérifie si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

export default authService;
