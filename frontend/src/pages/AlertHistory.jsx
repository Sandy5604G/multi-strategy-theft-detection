import React, { useState } from 'react';
import { Search, Download, Filter, ShieldAlert, Eye, Calendar, MapPin, User } from 'lucide-react';

export const AlertHistory = ({ alerts, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = alerts.filter(a => {
    const matchesSearch = a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.cameraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.trackedPersonId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Alert ID', 'Timestamp', 'Camera', 'Alert Type', 'Severity', 'Confidence', 'Tracked ID', 'Status', 'Notes'];
    const rows = filtered.map(a => [
      a.id,
      a.timestamp,
      `"${a.cameraName}"`,
      a.alertType,
      a.severity,
      (a.confidence * 100).toFixed(1) + '%',
      a.trackedPersonId,
      a.status,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AEGIS_INCIDENT_REPORT_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      
      {/* Top Header & Search Controls */}
      <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>INCIDENT AUDIT LOGS</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Searchable, tamper-evident log archive of all historical security alerts
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, camera, person..."
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.8rem 0.5rem 2.3rem',
                color: '#fff',
                fontSize: '0.82rem',
                width: '240px'
              }}
            />
          </div>

          {/* Severity Select */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: '#141b2d',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.8rem',
              color: '#fff',
              fontSize: '0.82rem'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#141b2d',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.8rem',
              color: '#fff',
              fontSize: '0.82rem'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="UNACKNOWLEDGED">Unacknowledged</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DISMISSED">Dismissed</option>
            <option value="ESCALATED">Escalated</option>
          </select>

          {/* Export CSV */}
          <button onClick={handleExportCSV} className="btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.83rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700 }}>INCIDENT ID</th>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700 }}>TIMESTAMP</th>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700 }}>CAMERA LOCATION</th>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700 }}>ALERT TYPE</th>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700 }}>CONFIDENCE</th>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700 }}>TARGET ID</th>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '0.9rem 1.2rem', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No historical logs found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map(alert => (
                <tr key={alert.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa' }}>
                    {alert.id}
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', fontWeight: 600 }}>
                    {alert.cameraName}
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <span className={alert.severity === 'CRITICAL' ? 'badge badge-red' : 'badge badge-amber'}>
                      {alert.alertType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 700 }}>
                    {(alert.confidence * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-mono)', color: '#22d3ee' }}>
                    {alert.trackedPersonId}
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <span className={alert.status === 'UNACKNOWLEDGED' ? 'badge badge-red' : (alert.status === 'CONFIRMED' ? 'badge badge-green' : 'badge badge-blue')}>
                      {alert.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => onViewDetails(alert)}
                      className="btn-secondary" 
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} />
                      <span>Inspect Dossier</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
