import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Activity, 
  Video, 
  Volume2, 
  VolumeX, 
  UserCheck, 
  LogOut, 
  Server, 
  Wifi,
  ChevronDown,
  Lock
} from 'lucide-react';

export const Header = ({ isSoundMuted, toggleSound, wsStatus, alerts = [], cameras = [], onViewAlertDetails }) => {
  const { user, logout, switchRole } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [ping, setPing] = useState(4);

  // Simulate subtle latency ping fluctuation for live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(3 + Math.random() * 4));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const unackAlerts = alerts.filter(a => a.status === 'UNACKNOWLEDGED');
  const activeTheftAlert = unackAlerts[0]; // Most recent theft alert
  const onlineCount = cameras.filter(c => c.status === 'ONLINE').length;
  const totalCount = cameras.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Dynamic Theft Alert Bar - Clear by default, displays IF AND ONLY IF theft happens */}
      {activeTheftAlert && (
        <div style={{
          background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%)',
          color: '#ffffff',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          fontSize: '0.85rem',
          fontWeight: 800,
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
          animation: 'pulse 1.5s infinite',
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={20} className="spin-slow" />
            <span>
              🚨 CRITICAL THEFT ALERT DETECTED: [{activeTheftAlert.alertType.replace('_', ' ')}] ON {activeTheftAlert.cameraName.toUpperCase()} ({Math.round((activeTheftAlert.confidence || 0.94) * 100)}% CONFIDENCE)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {onViewAlertDetails && (
              <button
                onClick={() => onViewAlertDetails(activeTheftAlert)}
                style={{
                  background: '#ffffff',
                  color: '#b91c1c',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Inspect Incident
              </button>
            )}
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'var(--font-mono)' }}>
              {unackAlerts.length} Active {unackAlerts.length === 1 ? 'Alert' : 'Alerts'}
            </span>
          </div>
        </div>
      )}

      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30 }}>
        {/* Brand & System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)', padding: '0.55rem', borderRadius: '10px', display: 'flex', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}>
              <ShieldAlert size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff 0%, #9ca3af 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AEGIS GUARD AI
                </h1>
                <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>PROD LAN</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Enterprise Detection System • Store #402
              </p>
            </div>
          </div>

          {/* Live System Telemetry */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Server size={14} color="#10b981" />
              <span>AI Core: <strong style={{ color: '#10b981' }}>YOLOv8 + MediaPipe Pose</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Video size={14} color="#3b82f6" />
              <span>Feeds: <strong style={{ color: 'var(--text-main)' }}>{onlineCount}/{totalCount} Online</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Wifi size={14} color="#06b6d4" />
              <span>LAN Latency: <strong style={{ color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>{ping}ms</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
              <Activity size={14} color={wsStatus === 'CONNECTED' ? '#10b981' : '#f59e0b'} />
              <span className={wsStatus === 'CONNECTED' ? 'badge badge-green' : 'badge badge-amber'} style={{ fontSize: '0.65rem' }}>
                {wsStatus || 'SIMULATING WS'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Sound, RBAC Role Swapper, User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Sound Alert Toggle */}
          <button 
            onClick={toggleSound}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            title={isSoundMuted ? 'Unmute alert sirens' : 'Mute alert sirens'}
          >
            {isSoundMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#10b981" />}
            <span>{isSoundMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          {/* Quick RBAC Role Swapper */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(59, 130, 246, 0.4)' }}
            >
              <UserCheck size={15} color="#3b82f6" />
              <span>Role: <strong style={{ color: '#60a5fa' }}>{user?.role}</strong></span>
              <ChevronDown size={14} />
            </button>

            {showRoleDropdown && (
              <div className="glass-panel" style={{ position: 'absolute', top: '120%', right: 0, width: '210px', padding: '0.5rem', zIndex: 100 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', padding: '0.3rem 0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Switch RBAC Role:
                </div>
                {['Admin', 'Security Staff', 'Viewer'].map((r) => (
                  <button
                    key={r}
                    onClick={() => { switchRole(r); setShowRoleDropdown(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.7rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: user?.role === r ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: user?.role === r ? '#60a5fa' : 'var(--text-main)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      marginBottom: '2px'
                    }}
                  >
                    <span>{r}</span>
                    {user?.role === r && <Lock size={12} color="#60a5fa" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              {user?.fullName ? user.fullName.charAt(0) : 'S'}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user?.fullName || 'Sandeep Sharma'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.department || 'Executive Security'}</div>
            </div>
            <button 
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '0.45rem', borderRadius: '8px' }}
              title="Logout of session"
            >
              <LogOut size={16} color="#ef4444" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};
