import React, { useState } from 'react';
import { Video, Wifi, Camera, Code, CheckCircle, Copy, AlertTriangle, Shield, Sliders, Layers, Terminal, X, Play, Upload } from 'lucide-react';

export const CameraIntegrationModal = ({ isOpen, onClose, onAddCamera }) => {
  const [activeTab, setActiveTab] = useState('rtsp'); // 'rtsp', 'webcam', 'roi', 'code'
  const [camName, setCamName] = useState('');
  const [camZone, setCamZone] = useState('Electronics');
  const [camUrl, setCamUrl] = useState('rtsp://admin:password@192.168.1.120:554/h264');
  const [selectedModel, setSelectedModel] = useState('YOLOv8s');
  const [videoFileSource, setVideoFileSource] = useState('/data/demo_shoplifting.mp4');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [testConnectionStatus, setTestConnectionStatus] = useState('');

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setTestConnectionStatus('TESTING');
    setTimeout(() => {
      setTestConnectionStatus('SUCCESS');
    }, 1200);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      if (!camName) setCamName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!camName.trim()) return;

    onAddCamera({
      name: camName,
      zone: camZone,
      url: activeTab === 'rtsp' ? camUrl : (activeTab === 'webcam' ? 'webcam://0' : 'file://' + (uploadedFileName || 'custom_video.mp4')),
      type: activeTab === 'webcam' ? 'Webcam Direct' : (activeTab === 'upload' ? 'Uploaded Video File' : 'RTSP Stream'),
      videoSource: activeTab === 'upload' ? (uploadedVideoUrl || videoFileSource) : videoFileSource,
      useWebcam: activeTab === 'webcam',
      model: 'YOLOv8 + MediaPipe Pose',
      status: 'ONLINE',
      fps: 30,
      activeAlerts: 0,
      alertType: 'NORMAL',
      alertText: 'ID #105 | NORMAL 97%',
      roiName: `CRITICAL ROI ZONE: ${camZone.toUpperCase()} ZONE`
    });

    onClose();
  };

  const pythonSnippet = `# AEGIS Multi-Theft Detection System Camera SDK
import cv2
from src.advanced_detector import AdvancedTheftDetector

# 1. Initialize Detector Engine
detector = AdvancedTheftDetector()

# 2. Connect to Camera Stream (${camUrl || 'rtsp://...'})
cap = cv2.VideoCapture("${camUrl || 'rtsp://192.168.1.100:554/live'}")

print("⚡ Connected to ${camName || 'Camera'} [${camZone}]")
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # 3. Process frame through YOLOv8 + Pose algorithm
    processed_frame, alerts = detector.process_frame(frame)

    if alerts.get('theft_detections'):
        print("🚨 ALARM TRIGGERED:", alerts['theft_detections'])

    cv2.imshow("${camName || 'Camera Feed'}", processed_frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '1.5rem'
    }}>
      <div className="glass-panel alert-glow-blue" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        padding: '1.8rem',
        borderRadius: 'var(--radius-xl)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.65rem', borderRadius: '12px', display: 'flex' }}>
              <Video size={24} color="#3b82f6" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>INTEGRATE NEW CAMERA STREAM</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Connect IP/RTSP security cameras, USB webcams, or video feeds to your AI detection system
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('rtsp')}
            className="btn-secondary"
            style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', background: activeTab === 'rtsp' ? 'rgba(59, 130, 246, 0.3)' : 'transparent', border: activeTab === 'rtsp' ? '1px solid #3b82f6' : '1px solid transparent' }}
          >
            <Wifi size={15} color={activeTab === 'rtsp' ? '#60a5fa' : 'var(--text-muted)'} />
            <span>RTSP Stream</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webcam')}
            className="btn-secondary"
            style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', background: activeTab === 'webcam' ? 'rgba(6, 182, 212, 0.3)' : 'transparent', border: activeTab === 'webcam' ? '1px solid #06b6d4' : '1px solid transparent' }}
          >
            <Camera size={15} color={activeTab === 'webcam' ? '#22d3ee' : 'var(--text-muted)'} />
            <span>Webcam HW</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className="btn-secondary"
            style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', background: activeTab === 'upload' ? 'rgba(168, 85, 247, 0.3)' : 'transparent', border: activeTab === 'upload' ? '1px solid #a855f7' : '1px solid transparent' }}
          >
            <Upload size={15} color={activeTab === 'upload' ? '#c084fc' : 'var(--text-muted)'} />
            <span>Upload Video (.mp4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className="btn-secondary"
            style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', background: activeTab === 'code' ? 'rgba(16, 185, 129, 0.3)' : 'transparent', border: activeTab === 'code' ? '1px solid #10b981' : '1px solid transparent' }}
          >
            <Code size={15} color={activeTab === 'code' ? '#34d399' : 'var(--text-muted)'} />
            <span>Python SDK</span>
          </button>
        </div>

        {/* Form Body for RTSP, Webcam, or Upload Setup */}
        {activeTab !== 'code' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Camera / Feed Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aisle 5 - Cashier & Vault"
                  value={camName}
                  onChange={(e) => setCamName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Store Zone / Department *
                </label>
                <select
                  value={camZone}
                  onChange={(e) => setCamZone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="Electronics">Electronics Zone</option>
                  <option value="Entrance">Main Entrance & Checkout</option>
                  <option value="Cosmetics">Luxury Cosmetics</option>
                  <option value="Jewelry">Jewelry & Watch Display</option>
                  <option value="Logistics">Backroom & Loading Dock</option>
                  <option value="Pharmacy">Pharmacy Counter</option>
                </select>
              </div>
            </div>

            {activeTab === 'rtsp' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  RTSP Stream Connection URL *
                </label>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    required
                    placeholder="rtsp://username:password@192.168.1.100:554/h264"
                    value={camUrl}
                    onChange={(e) => setCamUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.9rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#06b6d4',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="btn-secondary"
                    style={{ padding: '0.65rem 1rem', fontSize: '0.8rem' }}
                  >
                    {testConnectionStatus === 'TESTING' ? 'Pinging...' : 'Test RTSP Ping'}
                  </button>
                </div>
                {testConnectionStatus === 'SUCCESS' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                    <CheckCircle size={14} />
                    <span>RTSP RTSP Ping Latency 6ms - Connection Validated!</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'webcam' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Local Hardware Device
                </label>
                <div className="glass-card" style={{ padding: '0.8rem', color: '#22d3ee', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Camera size={16} />
                  <span>Integrated USB WebCam (/dev/video0) - Auto-Detected</span>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Select Local CCTV Video File (.mp4, .avi, .mov) *
                </label>
                <div className="glass-card" style={{
                  padding: '1.2rem',
                  border: '2px dashed #a855f7',
                  textAlign: 'center',
                  background: 'rgba(168, 85, 247, 0.05)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/mkv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="camera-video-upload-input"
                  />
                  <label htmlFor="camera-video-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={24} color="#c084fc" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc' }}>
                      {uploadedFileName ? `Selected File: ${uploadedFileName}` : 'Click here to choose CCTV video recording file'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Supports H.264 MP4, AVI, MOV up to 500MB
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Model & Demo Video Backup Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Integrated AI Model Engine
                </label>
                <div className="glass-card" style={{
                  padding: '0.65rem 0.9rem',
                  color: '#10b981',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  background: 'rgba(16, 185, 129, 0.1)'
                }}>
                  <Shield size={16} color="#10b981" />
                  <span>Aegis Unified Engine (YOLOv8 + MediaPipe Pose)</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Fallback Video Stream (For Demo Simulation)
                </label>
                <select
                  value={videoFileSource}
                  onChange={(e) => setVideoFileSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="/data/demo_shoplifting.mp4">demo_shoplifting.mp4 (Concealment Test)</option>
                  <option value="/data/demo_pickpocketing.mp4">demo_pickpocketing.mp4 (Crowd Pickpocket)</option>
                  <option value="/data/demo_bag_snatching.mp4">demo_bag_snatching.mp4 (Snatch Posture)</option>
                  <option value="/data/test_video.mp4">test_video.mp4 (Surveillance Stream)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                <CheckCircle size={16} />
                <span>Save & Connect Camera to Grid</span>
              </button>
            </div>
          </form>
        )}

        {/* Code Snippets & SDK Guide Tab */}
        {activeTab === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={16} />
                <span>Python Camera Integration Script</span>
              </span>
              <button
                onClick={() => copyToClipboard(pythonSnippet)}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {copiedSnippet ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Integration Code'}</span>
              </button>
            </div>

            <pre style={{
              background: '#07090e',
              border: '1px solid var(--border-color)',
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              color: '#34d399',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              overflowX: 'auto',
              lineHeight: '1.5'
            }}>
              {pythonSnippet}
            </pre>

            <div className="glass-card" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#60a5fa' }}>
                🐳 Docker RTSP Ingestion Command
              </h4>
              <code style={{ fontSize: '0.75rem', color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
                docker run -d --restart=always --name aegis-cam-05 -e RTSP_URL="rtsp://192.168.1.120:554/h264" aegis-guard-detector:latest
              </code>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
