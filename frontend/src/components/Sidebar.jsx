import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Monitor, 
  Siren, 
  FileText, 
  Sliders, 
  BarChart3, 
  AlertTriangle,
  Lock,
  Film
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, unackAlertsCount, onTriggerEmergency }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const navItems = [
    { id: 'dashboard', label: 'Surveillance Hub', icon: Monitor, badge: null },
    { id: 'alerts', label: 'Real-Time Alert Triage', icon: Siren, badge: unackAlertsCount > 0 ? unackAlertsCount : null, badgeColor: 'badge-red' },
    { id: 'upload', label: 'Video Studio & Demos', icon: Film, badge: 'NEW', badgeColor: 'badge-blue' },
    { id: 'history', label: 'Incident Audit Logs', icon: FileText, badge: null },
    { id: 'analytics', label: 'Analytics & Heatmaps', icon: BarChart3, badge: null },
    { id: 'admin', label: 'Admin & AI Config', icon: Sliders, badge: null, requiresAdmin: true }
  ];

  return (
    <aside className="glass-panel" style={{ width: '250px', height: '100%', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.2rem 0.8rem', zIndex: 20 }}>
      {/* Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ padding: '0 0.8rem 0.8rem 0.8rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = item.requiresAdmin && !isAdmin;

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && setActiveTab(item.id)}
              disabled={isLocked}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: isActive ? 'rgba(59, 130, 246, 0.4)' : 'transparent',
                background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)' : 'transparent',
                color: isLocked ? 'var(--text-dim)' : (isActive ? '#ffffff' : 'var(--text-muted)'),
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLocked ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? '#3b82f6' : (isLocked ? 'var(--text-dim)' : 'var(--text-muted)')} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`badge ${item.badgeColor}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  {item.badge}
                </span>
              )}

              {isLocked && <Lock size={14} color="var(--text-dim)" />}
            </button>
          );
        })}
      </div>

      {/* Emergency Alarm Trigger Section */}
      <div className="glass-card" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.8rem' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span>ON-FLOOR PANIC ALARM</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
          Broadcast immediate silent security dispatch to all floor guards.
        </p>
        <button
          onClick={onTriggerEmergency}
          className="btn-danger pulse-red"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.55rem' }}
        >
          <Siren size={16} />
          <span>TRIGGER PANIC SIREN</span>
        </button>
      </div>
    </aside>
  );
};
