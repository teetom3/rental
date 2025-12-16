import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import bookingService from '../services/bookingService';
import equipmentService from '../services/equipmentService';
import './CreateBooking.css';

const CreateBooking = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    items: [],
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentService.getAll();
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setAvailability(null);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { equipment_id: '', qty: 1 }],
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
    setAvailability(null);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({
      ...formData,
      items: newItems,
    });
    setAvailability(null);
  };

  const handleCheckAvailability = async () => {
    if (!formData.start_date || !formData.end_date || formData.items.length === 0) {
      alert('Please fill in dates and add at least one equipment item');
      return;
    }

    setChecking(true);
    try {
      const response = await bookingService.checkAvailability(formData);
      setAvailability(response.data);
    } catch (error) {
      alert('Failed to check availability: ' + error.response?.data?.message);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!availability || !availability.available) {
      alert('Please check availability first and ensure all items are available');
      return;
    }

    try {
      const response = await bookingService.create(formData);
      alert('Booking created successfully!');
      navigate(`/bookings/${response.data.id}`);
    } catch (error) {
      alert('Failed to create booking: ' + error.response?.data?.message);
    }
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
      <div className="create-booking-page">
        <h1>Create New Booking</h1>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h2>Booking Information</h2>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">End Date *</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2>Equipment Items</h2>
              <button type="button" onClick={handleAddItem} className="btn-add">
                + Add Item
              </button>
            </div>

            {formData.items.length === 0 ? (
              <p className="empty-message">No items added yet. Click "Add Item" to start.</p>
            ) : (
              <div className="items-list">
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-fields">
                      <div className="form-group">
                        <label>Equipment</label>
                        <select
                          value={item.equipment_id}
                          onChange={(e) => handleItemChange(index, 'equipment_id', e.target.value)}
                          required
                        >
                          <option value="">Select equipment</option>
                          {equipment.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                              {eq.name} (Available: {eq.total_qty})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value))}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {availability && (
            <div className={`availability-result ${availability.available ? 'available' : 'unavailable'}`}>
              <h3>{availability.available ? 'All items are available!' : 'Some items are unavailable'}</h3>
              <div className="availability-details">
                {availability.details.map((detail, index) => (
                  <div key={index} className={`availability-item ${detail.available ? 'available' : 'unavailable'}`}>
                    <span className="equipment-name">{detail.equipment_name}</span>
                    <span className="availability-status">
                      {detail.available ? (
                        `✓ Available (${detail.available_qty}/${detail.total_qty})`
                      ) : (
                        `✗ Insufficient (Need: ${detail.requested}, Available: ${detail.available_qty})`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={checking || formData.items.length === 0}
              className="btn-check"
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>

            <button
              type="submit"
              disabled={!availability || !availability.available}
              className="btn-submit"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateBooking;
