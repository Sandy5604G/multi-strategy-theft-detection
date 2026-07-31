import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AlertHistory } from './pages/AlertHistory';
import { AdminPanel } from './pages/AdminPanel';
import { Analytics } from './pages/Analytics';
import { VideoUploadStudio } from './pages/VideoUploadStudio';
import { Login } from './pages/Login';
import { AlertDetailModal } from './components/AlertDetailModal';
import { api, WS_BASE_URL } from './services/api';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [wsStatus, setWsStatus] = useState('SIMULATING');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadInitialData();

    // Try WebSocket connection to FastAPI backend
    let socket;
    try {
      socket = new WebSocket(WS_BASE_URL);
      socket.onopen = () => setWsStatus('CONNECTED');
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_ALERT') {
            handleIncomingAlert(data.alert);
          }
        } catch (err) {}
      };
      socket.onerror = () => setWsStatus('SIMULATING');
      socket.onclose = () => setWsStatus('SIMULATING');
    } catch (e) {
      setWsStatus('SIMULATING');
    }

    return () => {
      if (socket) socket.close();
    };
  }, [user]);

  const loadInitialData = async () => {
    const cams = await api.getCameras();
    const alrts = await api.getAlerts();
    setCameras(cams);
    setAlerts(alrts);
  };

  const handleIncomingAlert = (newAlert) => {
    setAlerts(prev => [newAlert, ...prev]);

    // Play Audio Siren Chirp if not muted
    if (!isSoundMuted) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {}
    }
  };

  const handleAddCamera = async (camData) => {
    const updated = await api.addCamera(camData);
    setCameras([...updated]);
  };

  const handleUpdateAlertStatus = async (alertId, status, notes = '') => {
    const updated = await api.updateAlertStatus(alertId, status, notes);
    setAlerts([...updated]);
    if (selectedAlertForModal && selectedAlertForModal.id === alertId) {
      setSelectedAlertForModal({ ...selectedAlertForModal, status, notes });
    }
  };

  // Simulates real-time theft detection event on-demand for quick UI verification
  const handleSimulateAlert = (targetCam) => {
    const types = ['SUSPICIOUS_CONCEALMENT', 'PROLONGED_CROUCHING', 'BAG_SNATCHING_POSTURE'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    const simulatedAlert = {
      id: `alt-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      cameraName: targetCam ? targetCam.name : 'Aisle 3 - High Risk Electronics',
      cameraId: targetCam ? targetCam.id : 'cam-01',
      alertType: selectedType,
      severity: selectedType === 'SUSPICIOUS_CONCEALMENT' ? 'CRITICAL' : 'HIGH',
      confidence: parseFloat((0.89 + Math.random() * 0.1).toFixed(2)),
      trackedPersonId: `Person #${Math.floor(100 + Math.random() * 50)}`,
      status: 'UNACKNOWLEDGED',
      snapshot: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=600&q=80',
      notes: 'Real-time AI posture detection trigger.'
    };

    handleIncomingAlert(simulatedAlert);
  };

  const handleTriggerEmergency = () => {
    if (window.confirm('BROADCAST EMERGENCY SIREN: Are you sure you want to trigger on-floor security panic alert?')) {
      handleSimulateAlert(cameras[0]);
    }
  };

  if (loading) return null;
  if (!user) return <Login />;

  const unackCount = alerts.filter(a => a.status === 'UNACKNOWLEDGED').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unackAlertsCount={unackCount}
        onTriggerEmergency={handleTriggerEmergency}
      />

      {/* Main Right Section */}
      <div className="main-content">
        <Header
          isSoundMuted={isSoundMuted}
          toggleSound={() => setIsSoundMuted(!isSoundMuted)}
          wsStatus={wsStatus}
          alerts={alerts}
          cameras={cameras}
          onViewAlertDetails={(alert) => setSelectedAlertForModal(alert)}
        />

        <main className="page-body">
          {activeTab === 'dashboard' && (
            <Dashboard
              cameras={cameras}
              alerts={alerts}
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onViewAlertDetails={(alert) => setSelectedAlertForModal(alert)}
              onSimulateAlert={handleSimulateAlert}
              onAddCamera={handleAddCamera}
            />
          )}

          {activeTab === 'alerts' && (
            <Dashboard
              cameras={cameras}
              alerts={alerts}
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onViewAlertDetails={(alert) => setSelectedAlertForModal(alert)}
              onSimulateAlert={handleSimulateAlert}
              onAddCamera={handleAddCamera}
            />
          )}

          {activeTab === 'upload' && (
            <VideoUploadStudio
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onViewAlertDetails={(alert) => setSelectedAlertForModal(alert)}
              onAddAlert={(newAlert) => handleIncomingAlert(newAlert)}
            />
          )}

          {activeTab === 'history' && (
            <AlertHistory
              alerts={alerts}
              onViewDetails={(alert) => setSelectedAlertForModal(alert)}
            />
          )}

          {activeTab === 'admin' && <AdminPanel />}

          {activeTab === 'analytics' && <Analytics alerts={alerts} />}
        </main>
      </div>

      {/* Modal Popup for Incident Dossiers */}
      {selectedAlertForModal && (
        <AlertDetailModal
          alert={selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          onUpdateStatus={handleUpdateAlertStatus}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
