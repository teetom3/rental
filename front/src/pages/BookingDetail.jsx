import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import bookingService from '../services/bookingService';
import './BookingDetail.css';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getById(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      alert('Booking not found');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!confirm('Mark this booking as completed?')) return;

    try {
      await bookingService.markAsCompleted(id);
      fetchBooking();
    } catch (error) {
      alert('Failed to mark as completed: ' + error.response?.data?.message);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;

    try {
      await bookingService.cancel(id);
      fetchBooking();
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
        <div className="loading">Loading booking details...</div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="error">Booking not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="booking-detail-page">
        <div className="page-header">
          <div>
            <Link to="/bookings" className="back-link">
              ← Back to Bookings
            </Link>
            <h1>Booking #{booking.id}</h1>
          </div>
          <div className="header-actions">
            {booking.status === 'confirmed' && (
              <>
                <button onClick={handleMarkCompleted} className="btn-complete">
                  Mark as Completed
                </button>
                <button onClick={handleCancel} className="btn-cancel">
                  Cancel Booking
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h2>Booking Information</h2>

            <div className="detail-row">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{booking.title}</span>
            </div>

            {booking.description && (
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{booking.description}</span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{getStatusBadge(booking.status)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Start Date:</span>
              <span className="detail-value">
                {new Date(booking.start_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">End Date:</span>
              <span className="detail-value">
                {new Date(booking.end_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">
                {Math.ceil(
                  (new Date(booking.end_date) - new Date(booking.start_date)) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                day(s)
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">
                {new Date(booking.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="detail-card">
            <h2>Equipment Items</h2>

            {booking.items && booking.items.length > 0 ? (
              <div className="items-list">
                {booking.items.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-header">
                      <h3>{item.equipment?.name || 'Unknown Equipment'}</h3>
                      <span className="item-qty">Qty: {item.qty}</span>
                    </div>

                    {item.equipment && (
                      <div className="item-details">
                        <p className="item-category">
                          Category: {item.equipment.category}
                        </p>
                        {item.equipment.description && (
                          <p className="item-description">
                            {item.equipment.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">No items found</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingDetail;
