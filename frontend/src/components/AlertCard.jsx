import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertOctagon, Clock, User, Eye, MapPin } from 'lucide-react';

export const AlertCard = ({ alert, onUpdateStatus, onViewDetails }) => {
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return { border: 'rgba(239, 68, 68, 0.6)', bg: 'rgba(239, 68, 68, 0.08)', badge: 'badge-red' };
      case 'HIGH': return { border: 'rgba(239, 68, 68, 0.4)', bg: 'rgba(239, 68, 68, 0.04)', badge: 'badge-red' };
      default: return { border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.04)', badge: 'badge-amber' };
    }
  };

  const style = getSeverityStyle(alert.severity);

  return (
    <div 
      className={`glass-card ${alert.status === 'UNACKNOWLEDGED' ? 'pulse-red' : ''}`} 
      style={{ 
        padding: '1rem', 
        borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
        background: style.bg,
        marginBottom: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem'
      }}
    >
      {/* Top Header info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${style.badge}`} style={{ fontSize: '0.65rem' }}>
            {alert.severity}
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {alert.alertType.replace(/_/g, ' ')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <Clock size={13} />
          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Grid: Thumbnail + Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0.9rem', alignItems: 'center' }}>
        {/* Snapshot Thumbnail */}
        <div 
          onClick={() => onViewDetails(alert)}
          style={{ 
            position: 'relative', 
            height: '75px', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            cursor: 'pointer', 
            border: '1px solid var(--border-color)' 
          }}
        >
          <img src={alert.snapshot} alt="Alert Frame Snapshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="thumb-hover">
            <Eye size={18} color="#fff" />
          </div>
          <span className="badge badge-red" style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '0.55rem', padding: '0.1rem 0.3rem' }}>
            {(alert.confidence * 100).toFixed(0)}% CONF
          </span>
        </div>

        {/* Details Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
            <MapPin size={14} color="#3b82f6" />
            <strong style={{ fontWeight: 600 }}>{alert.cameraName}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <User size={13} color="#06b6d4" />
            <span>Target: <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{alert.trackedPersonId}</strong></span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
            {alert.notes || 'Automated posture concealment trigger.'}
          </p>
        </div>
      </div>

      {/* Action Footer Triage Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Status: <span className={alert.status === 'UNACKNOWLEDGED' ? 'badge badge-red' : (alert.status === 'CONFIRMED' ? 'badge badge-green' : 'badge badge-blue')}>
            {alert.status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {alert.status === 'UNACKNOWLEDGED' && (
            <>
              <button 
                onClick={() => onUpdateStatus(alert.id, 'CONFIRMED', 'Confirmed by guard on floor')}
                className="btn-primary" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: '#10b981' }}
                title="Confirm Theft Alert"
              >
                <CheckCircle2 size={13} />
                <span>Confirm</span>
              </button>

              <button 
                onClick={() => onUpdateStatus(alert.id, 'DISMISSED', 'False positive alarm')}
                className="btn-secondary" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                title="Dismiss as False Alarm"
              >
                <XCircle size={13} />
                <span>Dismiss</span>
              </button>

              <button 
                onClick={() => onUpdateStatus(alert.id, 'ESCALATED', 'Escalated to store manager & local auth')}
                className="btn-danger" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                title="Escalate Alert"
              >
                <AlertOctagon size={13} />
                <span>Escalate</span>
              </button>
            </>
          )}

          <button 
            onClick={() => onViewDetails(alert)}
            className="btn-secondary" 
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
          >
            <span>Details & History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
