import React, { useState, useRef, useEffect } from 'react';
import { Upload, Film, Play, Pause, AlertTriangle, CheckCircle, ShieldAlert, Download, RefreshCw, FileVideo, Eye, Crosshair, Layers } from 'lucide-react';

export const VideoUploadStudio = ({ onUpdateAlertStatus, onViewAlertDetails, onAddAlert }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('/data/demo_shoplifting.mp4');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  const [showBoxes, setShowBoxes] = useState(true);
  const [showPose, setShowPose] = useState(true);
  const [showROI, setShowROI] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const sampleDemoVideos = [
    {
      id: 'demo-01',
      title: 'Aisle Concealment & Shoplifting Test',
      filename: 'demo_shoplifting.mp4',
      size: '384 KB',
      description: 'Customer crouching and reaching into coat inside high-risk aisle.',
      threatLevel: 'HIGH',
      url: '/data/demo_shoplifting.mp4',
      alertType: 'SUSPICIOUS_CONCEALMENT',
      confidence: 0.94
    },
    {
      id: 'demo-02',
      title: 'Checkout Bag Snatching Posture Test',
      filename: 'demo_bag_snatching.mp4',
      size: '368 KB',
      description: 'Rapid physical snatching trajectory near point of sale.',
      threatLevel: 'CRITICAL',
      url: '/data/demo_bag_snatching.mp4',
      alertType: 'BAG_SNATCHING_POSTURE',
      confidence: 0.96
    },
    {
      id: 'demo-03',
      title: 'Crowd Pickpocketing Movement Test',
      filename: 'demo_pickpocketing.mp4',
      size: '346 KB',
      description: 'Hand extension into adjacent person coat pocket.',
      threatLevel: 'HIGH',
      url: '/data/demo_pickpocketing.mp4',
      alertType: 'PICKPOCKETING_POSTURE',
      confidence: 0.91
    },
    {
      id: 'demo-04',
      title: 'Surveillance Baseline Test',
      filename: 'test_video.mp4',
      size: '89 KB',
      description: 'Standard store circulation baseline stream.',
      threatLevel: 'SECURE',
      url: '/data/test_video.mp4',
      alertType: 'NORMAL',
      confidence: 0.98
    }
  ];

  // Overlay Canvas animation during video playback
  useEffect(() => {
    let animId;
    let step = 0;

    const drawOverlay = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      step += 0.03;

      if (showROI) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(40, 40, w - 80, h - 80);
        ctx.setLineDash([]);

        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('CRITICAL ROI ZONE: VIDEO ANALYSIS STUDIO', 50, 60);
      }

      const isAlert = isAnalyzing || (selectedFile && selectedFile.threatLevel !== 'SECURE');
      const boxW = 120;
      const boxH = 210;
      const x1 = w / 2 - boxW / 2 + Math.sin(step) * 60;
      const y1 = h / 2 - boxH / 2 + Math.cos(step * 0.5) * 10;

      if (showBoxes) {
        const color = isAlert ? '#ef4444' : '#10b981';
        ctx.strokeStyle = color;
        ctx.lineWidth = isAlert ? 3 : 2;
        ctx.strokeRect(x1, y1, boxW, boxH);

        if (isAlert) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.fillRect(x1, y1, boxW, boxH);
        }

        const tag = isAlert ? 'ID #209 | SUSPICIOUS 95%' : 'ID #209 | NORMAL 98%';
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - 24, ctx.measureText(tag).width + 16, 24);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(tag, x1 + 6, y1 - 8);
      }

      if (showPose) {
        const headX = x1 + boxW / 2;
        const headY = y1 + 30;
        const chestY = y1 + 90;
        const hipY = y1 + 130;

        ctx.strokeStyle = isAlert ? '#f59e0b' : '#3b82f6';
        ctx.lineWidth = 2;

        ctx.beginPath(); ctx.moveTo(headX, headY); ctx.lineTo(headX, hipY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(headX, chestY); ctx.lineTo(headX - 35, chestY + 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(headX, chestY); ctx.lineTo(headX + 35, chestY - 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(headX, hipY); ctx.lineTo(headX - 25, y1 + boxH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(headX, hipY); ctx.lineTo(headX + 25, y1 + boxH); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        [{ x: headX, y: headY }, { x: headX, y: chestY }, { x: headX, y: hipY }].forEach(p => {
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
        });
      }

      animId = requestAnimationFrame(drawOverlay);
    };

    drawOverlay();
    return () => cancelAnimationFrame(animId);
  }, [showBoxes, showPose, showROI, isAnalyzing, selectedFile]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({ name: file.name, isDemo: false });
      setVideoPreviewUrl(URL.createObjectURL(file));
      setAnalysisResults(null);
    }
  };

  const handleSelectDemo = (demo) => {
    setSelectedFile({ name: demo.title, threatLevel: demo.threatLevel, filename: demo.filename, isDemo: true });
    setVideoPreviewUrl(demo.url);
    setAnalysisResults(null);
  };

  const startAnalysis = () => {
    if (!videoPreviewUrl) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsAnalyzing(false);

        const newAlerts = [
          {
            id: `upload-alt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            cameraName: 'Uploaded Video: ' + (selectedFile?.name || 'Store CCTV Recording'),
            cameraId: 'file-upload',
            alertType: selectedFile?.alertType || 'SUSPICIOUS_CONCEALMENT',
            severity: 'CRITICAL',
            confidence: 0.95,
            trackedPersonId: 'Person #209',
            status: 'UNACKNOWLEDGED',
            notes: 'YOLOv8 + MediaPipe Pose flagged fast hand movement into jacket lining.'
          }
        ];

        setAnalysisResults({
          framesProcessed: 840,
          fps: 30,
          personsTracked: 3,
          suspiciousFrames: 58,
          detectedAlerts: newAlerts
        });

        if (onAddAlert) {
          newAlerts.forEach(alt => onAddAlert(alt));
        }
      }
    }, 120);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      
      {/* Title Header */}
      <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>CCTV VIDEO ANALYSIS & DEMO STUDIO</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Upload offline surveillance files or run pre-loaded demo videos through the multi-theft detection engine
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.2rem' }}>
        
        {/* Left Column: Drag & Drop + Live Analysis Viewport */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Drag and Drop Zone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="glass-card" 
            style={{ 
              padding: '1.8rem', 
              border: '2px dashed var(--border-glow)', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: 'rgba(59, 130, 246, 0.03)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="video/mp4,video/avi,video/mov,video/mkv" 
              style={{ display: 'none' }} 
            />
            
            <div style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.15)', padding: '0.8rem', borderRadius: '50%', marginBottom: '0.6rem' }}>
              <Upload size={26} color="#3b82f6" />
            </div>
            
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              {selectedFile ? selectedFile.name : 'Click to Upload CCTV Recording or Drag File Here'}
            </h3>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Supports MP4, AVI, MOV, MKV up to 500MB • Frame-by-Frame AI Inference
            </p>
          </div>

          {/* Video Player Box with Canvas Detection Overlay */}
          {videoPreviewUrl && (
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  <FileVideo size={16} color="#06b6d4" style={{ display: 'inline', marginRight: '6px' }} />
                  {selectedFile?.name || 'Store Shoplifting Concealment Demo'}
                </span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    onClick={() => setShowBoxes(!showBoxes)} 
                    className="btn-secondary" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: showBoxes ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }}
                  >
                    <Crosshair size={13} color={showBoxes ? '#60a5fa' : 'var(--text-muted)'} />
                    <span>Boxes</span>
                  </button>

                  <button 
                    onClick={() => setShowPose(!showPose)} 
                    className="btn-secondary" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: showPose ? 'rgba(6, 182, 212, 0.2)' : 'transparent' }}
                  >
                    <Layers size={13} color={showPose ? '#22d3ee' : 'var(--text-muted)'} />
                    <span>Pose</span>
                  </button>

                  <button 
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    className="btn-primary" 
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                  >
                    {isAnalyzing ? <RefreshCw size={14} className="spin" /> : <Play size={14} />}
                    <span>{isAnalyzing ? 'Analyzing Frames...' : 'Run Theft Detection'}</span>
                  </button>
                </div>
              </div>

              {/* Stacked Video + Canvas Overlay */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <video 
                  ref={videoRef}
                  src={videoPreviewUrl}
                  controls 
                  autoPlay
                  loop
                  muted
                  playsInline
                  key={videoPreviewUrl}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
                <div className="scan-line" />
              </div>

              {/* Progress bar */}
              {isAnalyzing && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Executing YOLOv8 bounding tracking & pose landmark analysis...</span>
                    <strong style={{ color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>{analysisProgress}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${analysisProgress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)', transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis Results Summary & Timeframe Markers */}
          {analysisResults && (
            <div className="glass-panel alert-glow-red" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={20} color="#ef4444" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>THEFT DETECTION REPORT</h3>
                </div>
                <span className="badge badge-red">{analysisResults.detectedAlerts.length} INCIDENTS FLAGGED</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', fontSize: '0.72rem' }}>
                <div className="glass-card" style={{ padding: '0.7rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Frames Analyzed:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>{analysisResults.framesProcessed}</div>
                </div>

                <div className="glass-card" style={{ padding: '0.7rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Persons Tracked:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee', marginTop: '0.2rem' }}>{analysisResults.personsTracked}</div>
                </div>

                <div className="glass-card" style={{ padding: '0.7rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Suspicious Frames:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>{analysisResults.suspiciousFrames}</div>
                </div>
              </div>

              {/* Incidents List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Timestamped Flagged Incidents:</span>
                {analysisResults.detectedAlerts.map((alt, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>
                        [{alt.timestamp}] {alt.alertType} ({Math.round(alt.confidence * 100)}%)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{alt.notes}</div>
                    </div>
                    <span className="badge badge-red">{alt.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Pre-loaded Demo Videos Gallery */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Film size={16} />
            <span>Pre-Loaded Demo CCTV Gallery</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Select a sample surveillance scenario below to immediately test the AI engine without uploading local files.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {sampleDemoVideos.map(demo => (
              <div 
                key={demo.id} 
                className="glass-card" 
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', borderLeft: `4px solid ${demo.threatLevel === 'HIGH' ? '#ef4444' : (demo.threatLevel === 'CRITICAL' ? '#dc2626' : '#10b981')}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{demo.title}</span>
                  <span className={demo.threatLevel === 'HIGH' || demo.threatLevel === 'CRITICAL' ? 'badge badge-red' : 'badge badge-green'}>
                    {demo.threatLevel}
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  {demo.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <span>data/{demo.filename} • {demo.size}</span>
                  <button 
                    onClick={() => handleSelectDemo(demo)}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                  >
                    <Play size={12} />
                    <span>Load Demo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
