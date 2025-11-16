import React, { useState, useEffect } from 'react';
import { whiteLabelAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import CreateInstanceModal from '../components/CreateInstanceModal';
import InstanceTable from '../components/InstanceTable';
import LoadingButton from '../components/LoadingButton';

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          White-Label Instance Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage multiple isolated OV-Panel instances
        </p>
      </div>

      {!initialized && instances.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            System Not Initialized
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            The white-label system needs to be initialized before you can create instances.
            This will create shared directories and systemd service template.
          </p>
          <LoadingButton
            onClick={handleInitialize}
            loading={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
          >
            Initialize System
          </LoadingButton>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={handleCreateInstance}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={!initialized && instances.length === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Instance
          </button>
          
          <button
            onClick={fetchInstances}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="text-gray-600 dark:text-gray-400">
          Total Instances: <span className="font-semibold">{instances.length}</span>
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

