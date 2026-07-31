import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, Users, Video, Save, Plus, ShieldCheck, UserCheck, Lock, RotateCcw } from 'lucide-react';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState(null);
  const [users, setUsers] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  // New Camera Modal state
  const [newCamName, setNewCamName] = useState('');
  const [newCamUrl, setNewCamUrl] = useState('');
  const [newCamZone, setNewCamZone] = useState('Aisle 1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cfg = await api.getConfig();
    const usrs = await api.getUsers();
    const cams = await api.getCameras();
    setConfig(cfg);
    setUsers(usrs);
    setCameras(cams);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    await api.updateConfig(config);
    setSaveStatus('AI Detection Parameters saved successfully to configuration DB!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleRoleChange = async (userId, role) => {
    const updated = await api.updateUserRole(userId, role);
    setUsers([...updated]);
  };

  const handleToggleStatus = async (userId) => {
    const updated = await api.toggleUserStatus(userId);
    setUsers([...updated]);
  };

  const handleAddCamera = async (e) => {
    e.preventDefault();
    if (!newCamName.trim()) return;
    const updated = await api.addCamera({ name: newCamName, url: newCamUrl, zone: newCamZone, type: 'RTSP Stream' });
    setCameras([...updated]);
    setNewCamName('');
    setNewCamUrl('');
  };

  if (!config) return <div style={{ padding: '2rem' }}>Loading Configuration...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      
      {/* Admin Title Header */}
      <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>ENTERPRISE ADMIN & CONTROL PANEL</h2>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>ADMIN RBAC GRANTED</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Live-tune AI detection thresholds, manage authorized security personnel, and configure RTSP video streams
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('config')}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', background: activeTab === 'config' ? 'rgba(59, 130, 246, 0.25)' : 'transparent' }}
          >
            <Sliders size={15} />
            <span>AI Thresholds</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', background: activeTab === 'users' ? 'rgba(59, 130, 246, 0.25)' : 'transparent' }}
          >
            <Users size={15} />
            <span>User Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cameras')}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', background: activeTab === 'cameras' ? 'rgba(59, 130, 246, 0.25)' : 'transparent' }}
          >
            <Video size={15} />
            <span>Camera Streams ({cameras.length})</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
          {saveStatus}
        </div>
      )}

      {/* Tab 1: AI Threshold Tuning */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60a5fa' }}>
              Live AI Detection Parameters (Hot-Reloadable)
            </h3>
            <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
              <Save size={16} />
              <span>Apply AI Configuration</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Slider 1: YOLO Object Detection Confidence */}
            <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>YOLOv8 Minimum Confidence Cutoff:</span>
                <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>{(config.yoloConfidenceThreshold * 100).toFixed(0)}%</strong>
              </div>
              <input 
                type="range" min="0.2" max="0.95" step="0.05"
                value={config.yoloConfidenceThreshold}
                onChange={(e) => setConfig({ ...config, yoloConfidenceThreshold: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Lower confidence increases sensitivity to potential persons/items; higher confidence prevents false positive detections.
              </p>
            </div>

            {/* Slider 2: Pose Estimation Sensitivity */}
            <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Pose Estimation Skeleton Threshold:</span>
                <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{(config.poseDetectionThreshold * 100).toFixed(0)}%</strong>
              </div>
              <input 
                type="range" min="0.3" max="0.9" step="0.05"
                value={config.poseDetectionThreshold}
                onChange={(e) => setConfig({ ...config, poseDetectionThreshold: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Determines keypoint joint confidence required to classify crouching and conceal postures.
              </p>
            </div>

            {/* Slider 3: Crouch Duration Limit */}
            <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Crouch Alert Time Limit (Seconds):</span>
                <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{config.crouchTimeLimitSeconds}s</strong>
              </div>
              <input 
                type="range" min="5" max="60" step="1"
                value={config.crouchTimeLimitSeconds}
                onChange={(e) => setConfig({ ...config, crouchTimeLimitSeconds: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Time a person can remain in a crouching position near merchandise before an alert triggers.
              </p>
            </div>

            {/* Slider 4: Consecutive Frame Confirmation */}
            <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Consecutive Frame Confirmations:</span>
                <strong style={{ color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>{config.consecutiveFrameConfirmation} Frames</strong>
              </div>
              <input 
                type="range" min="1" max="10" step="1"
                value={config.consecutiveFrameConfirmation}
                onChange={(e) => setConfig({ ...config, consecutiveFrameConfirmation: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Number of contiguous AI frames required to confirm suspicious theft posture prior to sounding alert siren.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: User Account Management & RBAC */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem' }}>FULL NAME</th>
                <th style={{ padding: '0.8rem' }}>USERNAME / ID</th>
                <th style={{ padding: '0.8rem' }}>EMAIL</th>
                <th style={{ padding: '0.8rem' }}>ASSIGNED RBAC ROLE</th>
                <th style={{ padding: '0.8rem' }}>STATUS</th>
                <th style={{ padding: '0.8rem', textAlign: 'right' }}>MANAGE</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.8rem', fontWeight: 600 }}>{u.fullName}</td>
                  <td style={{ padding: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{u.username}</td>
                  <td style={{ padding: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        background: '#141b2d',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.3rem 0.6rem',
                        color: '#fff',
                        fontSize: '0.78rem'
                      }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Security Staff">Security Staff</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <span className={u.status === 'Active' ? 'badge badge-green' : 'badge badge-red'}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Camera Streams Config */}
      {activeTab === 'cameras' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.2rem' }}>
          <div className="glass-panel" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#60a5fa' }}>Configured Camera Sources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {cameras.map(c => (
                <div key={c.id} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.url}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="badge badge-blue">{c.zone}</span>
                    <span className={c.status === 'ONLINE' ? 'badge badge-green' : 'badge badge-red'}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Camera Form */}
          <form onSubmit={handleAddCamera} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Add RTSP / Video Feed</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Feed Name</label>
              <input
                type="text"
                required
                value={newCamName}
                onChange={(e) => setNewCamName(e.target.value)}
                placeholder="e.g. Aisle 12 Jewelry"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>RTSP Stream URL</label>
              <input
                type="text"
                required
                value={newCamUrl}
                onChange={(e) => setNewCamUrl(e.target.value)}
                placeholder="rtsp://192.168.1.109:554/live"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Store Zone</label>
              <input
                type="text"
                value={newCamZone}
                onChange={(e) => setNewCamZone(e.target.value)}
                placeholder="e.g. High Risk Aisle"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
              <Plus size={15} />
              <span>Register Stream Source</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
