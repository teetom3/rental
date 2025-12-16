import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import bookingService from '../services/bookingService';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAll(filters);
      setBookings(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleMarkCompleted = async (id) => {
    if (!confirm('Mark this booking as completed?')) return;

    try {
      await bookingService.markAsCompleted(id);
      fetchBookings();
    } catch (error) {
      alert('Failed to mark as completed: ' + error.response?.data?.message);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;

    try {
      await bookingService.cancel(id);
      fetchBookings();
    } catch (error) {
      alert('Failed to cancel: ' + error.response?.data?.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      confirmed: 'badge badge-confirmed',
      completed: 'badge badge-completed',
      cancelled: 'badge badge-cancelled',
    };

    return (
      <span className={statusClasses[status] || 'badge'}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading bookings...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bookings-page">
        <div className="page-header">
          <h1>Bookings</h1>
          <Link to="/bookings/new" className="btn-primary">
            New Booking
          </Link>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date:</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>End Date:</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings found</p>
            <Link to="/bookings/new" className="btn-primary">
              Create your first booking
            </Link>
          </div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.title}</td>
                    <td>{new Date(booking.start_date).toLocaleDateString()}</td>
                    <td>{new Date(booking.end_date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>{booking.items?.length || 0} item(s)</td>
                    <td className="actions">
                      <Link to={`/bookings/${booking.id}`} className="btn-small btn-view">
                        View
                      </Link>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleMarkCompleted(booking.id)}
                          className="btn-small btn-complete"
                        >
                          Complete
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn-small btn-cancel"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;
