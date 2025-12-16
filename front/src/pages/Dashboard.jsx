import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import bookingService from '../services/bookingService';
import equipmentService from '../services/equipmentService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEquipment: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [loading, setLoading] = useState(true);

  // Get Monday of current week
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Get array of 7 days from Monday
  function getWeekDays(startDate) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // Check if booking overlaps with a specific day
  function isBookingOnDay(booking, day) {
    const bookingStart = new Date(booking.start_date);
    const bookingEnd = new Date(booking.end_date);
    bookingStart.setHours(0, 0, 0, 0);
    bookingEnd.setHours(23, 59, 59, 999);

    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return bookingStart <= dayEnd && bookingEnd >= dayStart;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, equipmentRes] = await Promise.all([
          bookingService.getAll(),
          equipmentService.getAll(),
        ]);

        const bookingsData = bookingsRes.data.data || [];
        const equipment = equipmentRes.data || [];

        setBookings(bookingsData);
        setStats({
          totalBookings: bookingsData.length,
          confirmedBookings: bookingsData.filter((b) => b.status === 'confirmed').length,
          completedBookings: bookingsData.filter((b) => b.status === 'completed').length,
          totalEquipment: equipment.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const previousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>Tableau de bord</h1>

        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Total Réservations</h3>
              <p className="stat-number">{stats.totalBookings}</p>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>Confirmées</h3>
              <p className="stat-number">{stats.confirmedBookings}</p>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">✔</div>
            <div className="stat-content">
              <h3>Terminées</h3>
              <p className="stat-number">{stats.completedBookings}</p>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Équipements</h3>
              <p className="stat-number">{stats.totalEquipment}</p>
            </div>
          </div>
        </div>

        <div className="calendar-section">
          <div className="calendar-header">
            <h2>Calendrier hebdomadaire</h2>
            <div className="calendar-nav">
              <button onClick={previousWeek} className="nav-btn">← Précédent</button>
              <button onClick={goToToday} className="today-btn">Aujourd'hui</button>
              <button onClick={nextWeek} className="nav-btn">Suivant →</button>
            </div>
          </div>

          <div className="calendar-legend">
            <span className="legend-item">
              <span className="legend-dot confirmed"></span> Confirmées
            </span>
            <span className="legend-item">
              <span className="legend-dot completed"></span> Terminées
            </span>
            <span className="legend-item">
              <span className="legend-dot cancelled"></span> Annulées
            </span>
          </div>

          <div className="week-calendar">
            {getWeekDays(currentWeekStart).map((day, index) => {
              const dayBookings = bookings.filter((booking) =>
                isBookingOnDay(booking, day)
              );
              const isToday =
                day.toDateString() === new Date().toDateString();
              const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

              return (
                <div
                  key={index}
                  className={`calendar-day ${isToday ? 'is-today' : ''}`}
                >
                  <div className="day-header">
                    <div className="day-name">{dayNames[index]}</div>
                    <div className="day-number">
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="day-events">
                    {dayBookings.length > 0 ? (
                      dayBookings.map((booking) => {
                        let statusClass = 'event-confirmed';
                        if (booking.status === 'completed')
                          statusClass = 'event-completed';
                        if (booking.status === 'cancelled')
                          statusClass = 'event-cancelled';

                        return (
                          <div
                            key={booking.id}
                            className={`event-block ${statusClass}`}
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                          >
                            <div className="event-title">{booking.title}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-events">Aucune réservation</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Actions rapides</h2>
          <div className="actions-grid">
            <Link to="/bookings/new" className="action-card">
              <div className="action-icon">➕</div>
              <h3>Nouvelle Réservation</h3>
              <p>Créer une nouvelle réservation</p>
            </Link>

            <Link to="/bookings" className="action-card">
              <div className="action-icon">📋</div>
              <h3>Voir les Réservations</h3>
              <p>Consulter toutes les réservations</p>
            </Link>

            <Link to="/equipment" className="action-card">
              <div className="action-icon">🔧</div>
              <h3>Gérer l'Équipement</h3>
              <p>Voir et modifier l'équipement</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
