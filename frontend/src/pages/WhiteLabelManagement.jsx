import React, { useState, useEffect } from 'react';
import { whiteLabelAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import CreateInstanceModal from '../components/CreateInstanceModal';
import InstanceTable from '../components/InstanceTable';

const WhiteLabelManagement = () => {
  const { t } = useTranslation();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await whiteLabelAPI.listInstances();
      setInstances(response.data);
      if (response.data.length > 0) {
        setInitialized(true);
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
      if (error.response?.status === 403) {
        alert('This feature is only available on Super Admin Panel');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!confirm('Initialize white-label system? This will create shared directories and systemd template.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await whiteLabelAPI.initialize();
      if (response.data.success) {
        alert('White-label system initialized successfully!');
        setInitialized(true);
        fetchInstances();
      } else {
        alert('Failed to initialize: ' + response.data.msg);
      }
    } catch (error) {
      console.error('Error initializing system:', error);
      alert('Error initializing system: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstance = () => {
    setShowCreateModal(true);
  };

  const handleInstanceCreated = () => {
    setShowCreateModal(false);
    fetchInstances();
  };

  const handleStartInstance = async (instanceId) => {
    try {
      const response = await whiteLabelAPI.startInstance(instanceId);
      if (response.data.success) {
        alert('Instance started successfully!');
        fetchInstances();
      } else {
        alert('Failed to start instance: ' + response.data.msg);
      }
    } catch (error) {
      console.error('Error starting instance:', error);
      alert('Error starting instance: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleStopInstance = async (instanceId) => {
    try {
      const response = await whiteLabelAPI.stopInstance(instanceId);
      if (response.data.success) {
        alert('Instance stopped successfully!');
        fetchInstances();
      } else {
        alert('Failed to stop instance: ' + response.data.msg);
      }
    } catch (error) {
      console.error('Error stopping instance:', error);
      alert('Error stopping instance: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleRestartInstance = async (instanceId) => {
    try {
      const response = await whiteLabelAPI.restartInstance(instanceId);
      if (response.data.success) {
        alert('Instance restarted successfully!');
        fetchInstances();
      } else {
        alert('Failed to restart instance: ' + response.data.msg);
      }
    } catch (error) {
      console.error('Error restarting instance:', error);
      alert('Error restarting instance: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteInstance = async (instanceId, instanceName) => {
    if (!confirm(`Are you sure you want to delete instance "${instanceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await whiteLabelAPI.deleteInstance(instanceId);
      if (response.data.success) {
        alert('Instance deleted successfully!');
        fetchInstances();
      } else {
        alert('Failed to delete instance: ' + response.data.msg);
      }
    } catch (error) {
      console.error('Error deleting instance:', error);
      alert('Error deleting instance: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading && instances.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="view-header">
        <div>
          <h2>White-Label Instance Management</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Manage multiple isolated OV-Panel instances
          </p>
        </div>
      </div>

      {!initialized && instances.length === 0 && (
        <div style={{ 
          background: 'rgba(252, 122, 30, 0.1)', 
          border: '1px solid var(--accent-color)', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
            System Not Initialized
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            The white-label system needs to be initialized before you can create instances.
            This will create shared directories and systemd service template.
          </p>
          <button onClick={handleInitialize} className="btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Initialize System'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCreateInstance}
            className="btn"
            disabled={!initialized && instances.length === 0}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Instance
          </button>
          
          <button onClick={fetchInstances} className="btn btn-secondary">
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div style={{ color: 'var(--text-secondary)' }}>
          Total Instances: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{instances.length}</span>
        </div>
      </div>

      <InstanceTable
        instances={instances}
        onStart={handleStartInstance}
        onStop={handleStopInstance}
        onRestart={handleRestartInstance}
        onDelete={handleDeleteInstance}
      />

      {showCreateModal && (
        <CreateInstanceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleInstanceCreated}
        />
      )}
    </div>
  );
};

export default WhiteLabelManagement;

