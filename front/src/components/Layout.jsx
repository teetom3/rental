import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">
            <span className="brand-icon">📦</span>
            <span className="brand-text">GestionLoc</span>
          </Link>
        </div>

        <ul className="navbar-menu">
          <li>
            <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''}>
              <span className="nav-icon">🏠</span>
              Tableau de bord
            </Link>
          </li>
          <li>
            <Link to="/bookings" className={isActive('/bookings') ? 'active' : ''}>
              <span className="nav-icon">📋</span>
              Réservations
            </Link>
          </li>
          <li>
            <Link to="/equipment" className={isActive('/equipment') ? 'active' : ''}>
              <span className="nav-icon">🔧</span>
              Équipement
            </Link>
          </li>
        </ul>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</span>
            <span className="user-name">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span>Déconnexion</span>
            <span className="logout-icon">→</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
