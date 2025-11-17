import { useState } from 'react';
import apiClient from '../services/api';
import { useTranslation } from 'react-i18next';
import LoadingButton from './LoadingButton';

const AddNodeModal = ({ onClose, onNodeCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    ssh_host: '',
    ssh_port: 22,
    ssh_username: 'root',
    ssh_password: '',
    use_ssh_key: false,
    ssh_key_content: '',
    r2_access_key_id: '',
    r2_secret_access_key: '',
    r2_bucket_name: '',
    r2_account_id: '',
    r2_public_base_url: 'api.openvpn.panel',
    r2_download_token: '8638b5a1-77df-4d24-8253-58977fa508a4',
    protocol: 'tcp',
    ovpn_port: 1194,
    node_port: 9090,
    status: true,
    set_new_setting: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [installProgress, setInstallProgress] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    setInstallProgress('Testing SSH connection...');

    // Prepare payload for auto-install endpoint
    const payload = {
      name: formData.name,
      ssh: {
        host: formData.ssh_host,
        port: Number(formData.ssh_port),
        username: formData.ssh_username,
        password: formData.use_ssh_key ? null : formData.ssh_password,
        use_key: formData.use_ssh_key,
        key_content: formData.use_ssh_key ? formData.ssh_key_content : null,
      },
      r2: {
        access_key_id: formData.r2_access_key_id,
        secret_access_key: formData.r2_secret_access_key,
        bucket_name: formData.r2_bucket_name,
        account_id: formData.r2_account_id,
        public_base_url: formData.r2_public_base_url,
        download_token: formData.r2_download_token,
      },
      protocol: formData.protocol,
      ovpn_port: Number(formData.ovpn_port),
      node_port: Number(formData.node_port),
      status: formData.status,
      set_new_setting: formData.set_new_setting,
    };

    try {
      setInstallProgress('Installing node... This may take 5-10 minutes.');

      const response = await apiClient.post('/node/auto-install', payload);

      if (response.data.success) {
        const result = response.data.data;
        const syncInfo = result?.sync_info;

        let message = response.data.msg || 'Node installed successfully.';

        if (syncInfo) {
          const { total_users, synced, failed } = syncInfo;
          if (total_users > 0) {
            if (failed === 0) {
              message += `\n✓ All ${synced} users synced successfully to the new node.`;
            } else {
              message += `\n⚠ ${synced}/${total_users} users synced (${failed} failed).`;
            }
          } else {
            message += '\nℹ No users to sync.';
          }
        }

        if (result?.installation_details?.steps) {
          message += '\n\nInstallation steps:\n' + result.installation_details.steps.join('\n');
        }

        alert(message);
        onNodeCreated();
      } else {
        setError(response.data.msg || 'Unable to install node.');
        setInstallProgress('');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.response?.data?.msg || 'An error occurred while installing the node.';
      setError(errorDetail);
      setInstallProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>{t('modal_createNodeTitle')} - Auto Install via SSH</h3>
          <button onClick={onClose} className="close-modal-btn" disabled={isLoading}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>

          {/* Node Basic Info */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
              Node Information
            </h4>
            <div className="input-group">
              <label htmlFor="name">{t('nodeName')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength="10"
                placeholder="e.g., Node-US-1"
              />
            </div>
          </div>

          {/* SSH Configuration */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
              SSH Configuration
            </h4>
            <div className="input-group">
              <label htmlFor="ssh_host">Server IP or Hostname *</label>
              <input
                type="text"
                id="ssh_host"
                name="ssh_host"
                value={formData.ssh_host}
                onChange={handleChange}
                required
                placeholder="e.g., 192.168.1.100 or node1.example.com"
              />
            </div>
            <div className="input-group">
              <label htmlFor="ssh_port">SSH Port</label>
              <input
                type="number"
                id="ssh_port"
                name="ssh_port"
                value={formData.ssh_port}
                onChange={handleChange}
                required
                placeholder="22"
              />
            </div>
            <div className="input-group">
              <label htmlFor="ssh_username">SSH Username</label>
              <input
                type="text"
                id="ssh_username"
                name="ssh_username"
                value={formData.ssh_username}
                onChange={handleChange}
                required
                placeholder="root"
              />
            </div>

            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="use_ssh_key"
                name="use_ssh_key"
                checked={formData.use_ssh_key}
                onChange={handleChange}
              />
              <label htmlFor="use_ssh_key" style={{ marginBottom: 0 }}>Use SSH Key (instead of password)</label>
            </div>

            {!formData.use_ssh_key ? (
              <div className="input-group">
                <label htmlFor="ssh_password">SSH Password *</label>
                <input
                  type="password"
                  id="ssh_password"
                  name="ssh_password"
                  value={formData.ssh_password}
                  onChange={handleChange}
                  required={!formData.use_ssh_key}
                  placeholder="Enter SSH password"
                />
              </div>
            ) : (
              <div className="input-group">
                <label htmlFor="ssh_key_content">SSH Private Key *</label>
                <textarea
                  id="ssh_key_content"
                  name="ssh_key_content"
                  value={formData.ssh_key_content}
                  onChange={handleChange}
                  required={formData.use_ssh_key}
                  rows="4"
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
            )}
          </div>

          {/* R2 Storage Configuration */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
              Cloudflare R2 Storage Configuration
            </h4>
            <div className="input-group">
              <label htmlFor="r2_access_key_id">R2 Access Key ID *</label>
              <input
                type="text"
                id="r2_access_key_id"
                name="r2_access_key_id"
                value={formData.r2_access_key_id}
                onChange={handleChange}
                required
                placeholder="Your R2 Access Key ID"
              />
            </div>
            <div className="input-group">
              <label htmlFor="r2_secret_access_key">R2 Secret Access Key *</label>
              <input
                type="password"
                id="r2_secret_access_key"
                name="r2_secret_access_key"
                value={formData.r2_secret_access_key}
                onChange={handleChange}
                required
                placeholder="Your R2 Secret Access Key"
              />
            </div>
            <div className="input-group">
              <label htmlFor="r2_bucket_name">R2 Bucket Name *</label>
              <input
                type="text"
                id="r2_bucket_name"
                name="r2_bucket_name"
                value={formData.r2_bucket_name}
                onChange={handleChange}
                required
                placeholder="your-bucket-name"
              />
            </div>
            <div className="input-group">
              <label htmlFor="r2_account_id">R2 Account ID *</label>
              <input
                type="text"
                id="r2_account_id"
                name="r2_account_id"
                value={formData.r2_account_id}
                onChange={handleChange}
                required
                placeholder="Your Cloudflare Account ID"
              />
            </div>
            <div className="input-group">
              <label htmlFor="r2_public_base_url">R2 Public Base URL</label>
              <input
                type="text"
                id="r2_public_base_url"
                name="r2_public_base_url"
                value={formData.r2_public_base_url}
                onChange={handleChange}
                placeholder="api.openvpn.panel"
              />
            </div>
            <div className="input-group">
              <label htmlFor="r2_download_token">R2 Download Token</label>
              <input
                type="text"
                id="r2_download_token"
                name="r2_download_token"
                value={formData.r2_download_token}
                onChange={handleChange}
                placeholder="8638b5a1-77df-4d24-8253-58977fa508a4"
              />
            </div>
          </div>

          {/* OpenVPN Configuration */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
              OpenVPN Configuration
            </h4>
            <div className="input-group">
              <label htmlFor="protocol">{t('th_protocol')}</label>
              <select id="protocol" name="protocol" value={formData.protocol} onChange={handleChange}>
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="ovpn_port">{t('ovpnPort')}</label>
              <input
                type="number"
                id="ovpn_port"
                name="ovpn_port"
                value={formData.ovpn_port}
                onChange={handleChange}
                required
                placeholder="1194"
              />
            </div>
            <div className="input-group">
              <label htmlFor="node_port">OV-Node Service Port</label>
              <input
                type="number"
                id="node_port"
                name="node_port"
                value={formData.node_port}
                onChange={handleChange}
                required
                placeholder="9090"
              />
            </div>
            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              <label htmlFor="status" style={{ marginBottom: 0 }}>{t('status_active')}</label>
            </div>
          </div>

          {installProgress && (
            <div style={{
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '6px',
              marginBottom: '16px',
              color: 'var(--primary-color)'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>⏳ {installProgress}</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Please wait... Do not close this window.
              </p>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
              {t('cancelButton')}
            </button>
            <LoadingButton isLoading={isLoading} type="submit" className="btn">
              {isLoading ? 'Installing Node...' : 'Install Node'}
            </LoadingButton>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddNodeModal;