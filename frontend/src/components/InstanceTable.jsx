import React from 'react';

const InstanceTable = ({ instances, onStart, onStop, onRestart, onDelete }) => {
  const getStatusBadge = (status) => {
    const styles = {
      active: { background: 'rgba(1, 195, 168, 0.2)', color: 'var(--success-color)' },
      stopped: { background: 'rgba(160, 174, 192, 0.2)', color: 'var(--text-secondary)' },
      error: { background: 'rgba(166, 61, 42, 0.2)', color: 'var(--danger-color)' },
    };
    return styles[status] || styles.stopped;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (instances.length === 0) {
    return (
      <div className="table-container" style={{ padding: '48px', textAlign: 'center' }}>
        <svg style={{ width: '48px', height: '48px', margin: '0 auto', color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 style={{ marginTop: '16px', fontSize: '16px', fontWeight: '600' }}>No instances</h3>
        <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
          Get started by creating a new white-label instance.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Port</th>
            <th>Status</th>
            <th>Admin Username</th>
            <th>OpenVPN</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {instances.map((instance) => (
            <tr key={instance.id}>
              <td>
                <div style={{ fontWeight: '600' }}>
                  {instance.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '4px' }}>
                  {instance.instance_id.substring(0, 8)}...
                </div>
              </td>
              <td>{instance.port}</td>
              <td>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  ...getStatusBadge(instance.status)
                }}>
                  {instance.status}
                </span>
              </td>
              <td>{instance.admin_username}</td>
              <td>
                {instance.has_openvpn ? (
                  <span style={{ color: 'var(--success-color)' }}>✓ Yes</span>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>✗ No</span>
                )}
              </td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {formatDate(instance.created_at)}
              </td>
              <td>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  {instance.status !== 'active' && (
                    <button
                      onClick={() => onStart(instance.instance_id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success-color)', padding: '4px' }}
                      title="Start"
                    >
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                  
                  {instance.status === 'active' && (
                    <button
                      onClick={() => onStop(instance.instance_id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)', padding: '4px' }}
                      title="Stop"
                    >
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => onRestart(instance.instance_id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--info-color)', padding: '4px' }}
                    title="Restart"
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onDelete(instance.instance_id, instance.name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)', padding: '4px' }}
                    title="Delete"
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstanceTable;

