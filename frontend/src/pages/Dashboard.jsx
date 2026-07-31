import React, { useState } from 'react';
import { CameraFeed } from '../components/CameraFeed';
import { AlertCard } from '../components/AlertCard';
import { CameraIntegrationModal } from '../components/CameraIntegrationModal';
import { Grid, Layout, ShieldAlert, AlertTriangle, CheckCircle, Video, Activity, Plus, Filter, RefreshCw } from 'lucide-react';

export const Dashboard = ({ cameras, alerts, onUpdateAlertStatus, onViewAlertDetails, onSimulateAlert, onAddCamera }) => {
  const [selectedCameraId, setSelectedCameraId] = useState(cameras[0]?.id || 'cam-01');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' (2x2) or 'spotlight' (1 big + thumbnails)
  const [alertFilter, setAlertFilter] = useState('ALL'); // 'ALL', 'UNACKNOWLEDGED', 'CONFIRMED'
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  const selectedCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];
  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'UNACKNOWLEDGED') return a.status === 'UNACKNOWLEDGED';
    if (alertFilter === 'CONFIRMED') return a.status === 'CONFIRMED' || a.status === 'ESCALATED';
    return true;
  });

  const unackCount = alerts.filter(a => a.status === 'UNACKNOWLEDGED').length;
  const onlineCount = cameras.filter(c => c.status === 'ONLINE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', height: '100%' }}>
      
      {/* Top Metric Telemetry Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action Required</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{unackCount} Critical Alerts</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
            <Video size={22} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host Surveillance Feeds</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{onlineCount} Online / {cameras.length} Total</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved Today</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
              {alerts.filter(a => a.status === 'CONFIRMED').length} Incidents
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
            <Activity size={22} color="#06b6d4" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Detection Accuracy</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>94.2%</div>
          </div>
        </div>
      </div>

      {/* Main Layout: Camera Surveillance Grid (Left) vs Real-Time Alert Triage (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.2rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Section: Multi-Camera Grid Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0, overflowY: 'auto' }}>
          
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            background: 'rgba(13, 17, 26, 0.7)',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Video size={16} color="#3b82f6" />
              <span style={{ letterSpacing: '0.04em' }}>SURVEILLANCE CAMERA MATRIX (2x2 GRID)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Integration Button */}
              <button 
                onClick={() => setIsIntegrationModalOpen(true)}
                className="btn-primary" 
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>Integrate Camera</span>
              </button>

              {/* Grid Toggle */}
              <button 
                onClick={() => setLayoutMode('grid')}
                className="btn-secondary" 
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.78rem',
                  background: layoutMode === 'grid' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  borderColor: layoutMode === 'grid' ? '#3b82f6' : 'var(--border-color)'
                }}
              >
                <Grid size={14} />
                <span>2x2 Grid View</span>
              </button>

              {/* Spotlight Toggle */}
              <button 
                onClick={() => setLayoutMode('spotlight')}
                className="btn-secondary" 
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.78rem',
                  background: layoutMode === 'spotlight' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  borderColor: layoutMode === 'spotlight' ? '#3b82f6' : 'var(--border-color)'
                }}
              >
                <Layout size={14} />
                <span>Spotlight View</span>
              </button>
            </div>
          </div>

          {/* Camera Viewport Grid Rendering */}
          {cameras.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '3.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1.2rem',
              minHeight: '380px',
              border: '1px dashed rgba(59, 130, 246, 0.4)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.15)',
                padding: '1.2rem',
                borderRadius: '50%',
                display: 'inline-flex',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
              }}>
                <Video size={40} color="#3b82f6" />
              </div>
              <div style={{ maxWidth: '480px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                  NO SURVEILLANCE CAMERAS INTEGRATED
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Real-time AI monitoring is standing by. Add your RTSP stream, IP Security camera, or USB Webcam to launch live surveillance in your dashboard.
                </p>
              </div>
              <button
                onClick={() => setIsIntegrationModalOpen(true)}
                className="btn-primary"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem', marginTop: '0.4rem' }}
              >
                <Plus size={18} />
                <span>Integrate Camera Feed</span>
              </button>
            </div>
          ) : layoutMode === 'spotlight' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CameraFeed
                camera={selectedCamera}
                onManualAlertTrigger={onSimulateAlert}
                onOpenIntegration={() => setIsIntegrationModalOpen(true)}
              />
              
              {/* Camera Selector Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {cameras.map(cam => (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCameraId(cam.id)}
                    className="glass-card"
                    style={{
                      padding: '0.65rem',
                      cursor: 'pointer',
                      border: selectedCameraId === cam.id ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                      background: selectedCameraId === cam.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{cam.name}</span>
                      <span className={cam.status === 'ONLINE' ? 'badge badge-green' : 'badge badge-red'} style={{ fontSize: '0.6rem' }}>
                        {cam.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{cam.zone} • {cam.model}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 2x2 Grid View */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {cameras.map(cam => (
                <CameraFeed
                  key={cam.id}
                  camera={cam}
                  onManualAlertTrigger={onSimulateAlert}
                  onOpenIntegration={() => setIsIntegrationModalOpen(true)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Real-Time Alert Triage Stream */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#ef4444" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>LIVE ALERT TICKER</span>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              {['ALL', 'UNACKNOWLEDGED', 'CONFIRMED'].map(f => (
                <button
                  key={f}
                  onClick={() => setAlertFilter(f)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.65rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: alertFilter === f ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                    color: alertFilter === f ? '#60a5fa' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Stream List */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.2rem' }}>
            {filteredAlerts.length === 0 ? (
              <div style={{
                padding: '3.5rem 1.2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <ShieldAlert size={28} color="rgba(255,255,255,0.2)" />
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>LIVE ALERT TICKER CLEAR</div>
                <p style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  No alerts present. Alerts will appear here <strong>only when your connected cameras detect a theft event</strong> or when tested.
                </p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onUpdateStatus={onUpdateAlertStatus}
                  onViewDetails={onViewAlertDetails}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Integration Modal Component */}
      <CameraIntegrationModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        onAddCamera={onAddCamera}
      />
    </div>
  );
};
