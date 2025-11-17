import React, { useState } from 'react';
import { whiteLabelAPI } from '../services/api';

const CreateInstanceModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    admin_username: '',
    admin_password: '',
    port: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.admin_username || !formData.admin_password || !formData.port) {
      setError('All fields are required');
      return;
    }

    const port = parseInt(formData.port);
    if (isNaN(port) || port < 1024 || port > 65535) {
      setError('Port must be between 1024 and 65535');
      return;
    }

    if (formData.admin_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await whiteLabelAPI.createInstance({
        name: formData.name,
        admin_username: formData.admin_username,
        admin_password: formData.admin_password,
        port: port,
      });

      if (response.data.success) {
        alert('Instance created successfully!');
        onSuccess();
      } else {
        setError(response.data.msg || 'Failed to create instance');
      }
    } catch (err) {
      console.error('Error creating instance:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create instance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: '22px', fontWeight: '700' }}>
            Create White-Label Instance
          </h2>
          <button onClick={onClose} className="close-modal-btn">
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(166, 61, 42, 0.2)',
            border: '1px solid var(--danger-color)',
            color: 'var(--danger-color)',
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '0 30px 20px 30px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Instance Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Customer A"
              required
            />
          </div>

          <div className="input-group">
            <label>Admin Username *</label>
            <input
              type="text"
              name="admin_username"
              value={formData.admin_username}
              onChange={handleChange}
              placeholder="admin"
              required
            />
          </div>

          <div className="input-group">
            <label>Admin Password *</label>
            <input
              type="password"
              name="admin_password"
              value={formData.admin_password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label>Port Number * (1024-65535)</label>
            <input
              type="number"
              name="port"
              value={formData.port}
              onChange={handleChange}
              placeholder="9001"
              required
              min={1024}
              max={65535}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Create Instance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInstanceModal;

