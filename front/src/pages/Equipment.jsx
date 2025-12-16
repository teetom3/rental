import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import equipmentService from '../services/equipmentService';
import './Equipment.css';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    total_qty: '',
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await equipmentService.getAll();
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description || '',
        total_qty: item.total_qty,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        total_qty: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      total_qty: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await equipmentService.update(editingId, formData);
      } else {
        await equipmentService.create(formData);
      }
      fetchEquipment();
      handleCloseModal();
    } catch (error) {
      alert('Failed to save equipment: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this equipment?')) return;

    try {
      await equipmentService.delete(id);
      fetchEquipment();
    } catch (error) {
      alert('Failed to delete equipment: ' + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading equipment...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="equipment-page">
        <div className="page-header">
          <h1>Equipment</h1>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            Add Equipment
          </button>
        </div>

        {equipment.length === 0 ? (
          <div className="empty-state">
            <p>No equipment found</p>
            <button onClick={() => handleOpenModal()} className="btn-primary">
              Add your first equipment
            </button>
          </div>
        ) : (
          <div className="equipment-grid">
            {equipment.map((item) => (
              <div key={item.id} className="equipment-card">
                <div className="equipment-header">
                  <h3>{item.name}</h3>
                  <span className="category-badge">{item.category}</span>
                </div>

                {item.description && (
                  <p className="equipment-description">{item.description}</p>
                )}

                <div className="equipment-footer">
                  <div className="qty-info">
                    <span className="qty-label">Total Quantity:</span>
                    <span className="qty-value">{item.total_qty}</span>
                  </div>

                  <div className="equipment-actions">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-small btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Equipment' : 'Add Equipment'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="equipment-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="total_qty">Total Quantity *</label>
                  <input
                    type="number"
                    id="total_qty"
                    name="total_qty"
                    value={formData.total_qty}
                    onChange={handleChange}
                    min="1"
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

                <div className="modal-actions">
                  <button type="button" onClick={handleCloseModal} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Equipment;
