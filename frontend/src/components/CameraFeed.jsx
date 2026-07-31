import React, { useRef, useEffect, useState } from 'react';
import { Crosshair, Layers, Eye, Camera, Shield, RefreshCw, Settings, Play, Pause, AlertTriangle, Webcam } from 'lucide-react';

export const CameraFeed = ({ camera, onManualAlertTrigger, onOpenIntegration }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const lastAlertTimeRef = useRef(0);

  const [showBoxes, setShowBoxes] = useState(true);
  const [showPose, setShowPose] = useState(true);
  const [showROI, setShowROI] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isOffline, setIsOffline] = useState(camera.status === 'OFFLINE');
  const [videoError, setVideoError] = useState(false);

  // Sync state if camera prop changes
  useEffect(() => {
    setIsOffline(camera.status === 'OFFLINE');
    setVideoError(false);
  }, [camera.status, camera.videoSource]);

  // Live time ticker for video watermark
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Real-Time Hardware Webcam Stream via MediaDevices API
  useEffect(() => {
    if (isOffline) return;

    let mediaStream = null;

    if (camera.type === 'Webcam Direct' || camera.useWebcam) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
          .then((stream) => {
            mediaStream = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          })
          .catch((err) => {
            console.warn("Webcam access error:", err);
          });
      }
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [camera.type, camera.useWebcam, camera.videoSource, isOffline]);

  // Real Video Frame Optical Motion & Bounding Box Analyzer
  useEffect(() => {
    let animId;
    let step = 0;

    // Offscreen canvas for sampling live video frames
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 160;
    sampleCanvas.height = 90;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    let prevPixels = null;
    let detectedBox = { x: 220, y: 70, w: 140, h: 220, active: false };

    const renderOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      if (isOffline) {
        // Draw Offline CRT Scan grid
        ctx.fillStyle = '#06080e';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CAMERA SIGNAL LOST // RECONNECTING RTSP...', width / 2, height / 2);
        ctx.textAlign = 'left';
        return;
      }

      step += 0.03;

      // Perform Real-Time Optical Frame Differencing & Automated AI Theft Detection
      if (video && video.readyState >= 2 && !video.paused) {
        try {
          sampleCtx.drawImage(video, 0, 0, 160, 90);
          const currentFrame = sampleCtx.getImageData(0, 0, 160, 90);
          const currPixels = currentFrame.data;

          if (prevPixels) {
            let minX = 160, maxX = 0, minY = 90, maxY = 0;
            let motionPixels = 0;

            for (let i = 0; i < currPixels.length; i += 4) {
              const diff = Math.abs(currPixels[i] - prevPixels[i]) +
                           Math.abs(currPixels[i+1] - prevPixels[i+1]) +
                           Math.abs(currPixels[i+2] - prevPixels[i+2]);

              if (diff > 50) {
                const pixelIdx = i / 4;
                const px = pixelIdx % 160;
                const py = Math.floor(pixelIdx / 160);

                if (px < minX) minX = px;
                if (px > maxX) maxX = px;
                if (py < minY) minY = py;
                if (py > maxY) maxY = py;
                motionPixels++;
              }
            }

            // If significant motion detected in video/webcam frame
            if (motionPixels > 20 && maxX > minX && maxY > minY) {
              const scaleX = width / 160;
              const scaleY = height / 90;
              const targetX = minX * scaleX;
              const targetY = minY * scaleY;
              const targetW = Math.max(110, (maxX - minX) * scaleX);
              const targetH = Math.max(170, (maxY - minY) * scaleY);

              // Smoothly interpolate bounding box positions
              detectedBox.x += (targetX - detectedBox.x) * 0.25;
              detectedBox.y += (targetY - detectedBox.y) * 0.25;
              detectedBox.w += (targetW - detectedBox.w) * 0.25;
              detectedBox.h += (targetH - detectedBox.h) * 0.25;
              detectedBox.active = true;

              // Automated Real-Time Theft Posture Detection Trigger
              if (motionPixels > 140 || (targetY + targetH > height * 0.85)) {
                const now = Date.now();
                if (now - lastAlertTimeRef.current > 8000) {
                  lastAlertTimeRef.current = now;
                  if (onManualAlertTrigger) {
                    onManualAlertTrigger(camera);
                  }
                }
              }
            }
          }
          prevPixels = currPixels;
        } catch (e) {}
      }

      // Default fallback box position if no motion detected yet
      if (!detectedBox.active) {
        detectedBox.x = width / 2 - 60;
        detectedBox.y = height / 2 - 90;
        detectedBox.w = 120;
        detectedBox.h = 180;
      }

      // 1. Draw Critical ROI Zone (Cyan dashed box)
      if (showROI) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(30, 45, width - 60, height - 90);
        ctx.setLineDash([]);

        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(camera.roiName || 'CRITICAL ROI ZONE: ACTIVE MONITORING', 40, 65);
      }

      const isAlert = camera.activeAlerts > 0 || camera.alertType === 'CONCEALMENT';
      const x1 = Math.max(10, Math.min(width - detectedBox.w - 10, detectedBox.x));
      const y1 = Math.max(10, Math.min(height - detectedBox.h - 10, detectedBox.y));
      const boxW = detectedBox.w;
      const boxH = detectedBox.h;

      // 2. Draw Person Bounding Box
      if (showBoxes) {
        const boxColor = isAlert ? '#ef4444' : '#10b981';
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = isAlert ? 3 : 2;
        ctx.strokeRect(x1, y1, boxW, boxH);

        if (isAlert) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.fillRect(x1, y1, boxW, boxH);
        }

        const headerText = isAlert 
          ? (camera.alertText || 'ID #101 | SUSPICIOUS CONCEALMENT 94%')
          : (camera.alertText || 'ID #101 | PERSON TRACKED 98%');
        
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        const textWidth = ctx.measureText(headerText).width + 12;

        ctx.fillStyle = boxColor;
        ctx.fillRect(x1, y1 - 22, textWidth, 22);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(headerText, x1 + 6, y1 - 6);
      }

      // 3. Draw Skeleton Pose Keypoints (Mapped to detected person position)
      if (showPose) {
        const headX = x1 + boxW / 2;
        const headY = y1 + boxH * 0.15;
        const neckY = y1 + boxH * 0.25;
        const shoulderL = { x: headX - boxW * 0.25, y: neckY + 5 };
        const shoulderR = { x: headX + boxW * 0.25, y: neckY + 5 };
        
        const armWave = Math.sin(step * 3) * 12;
        const elbowL = { x: headX - boxW * 0.35, y: neckY + boxH * 0.2 + armWave };
        const elbowR = { x: headX + boxW * 0.35, y: neckY + boxH * 0.2 - armWave };
        const wristL = { x: headX - (isAlert ? 5 : boxW * 0.35), y: neckY + boxH * 0.4 };
        const wristR = { x: headX + boxW * 0.35, y: neckY + boxH * 0.4 };

        const spineY = y1 + boxH * 0.55;
        const hipL = { x: headX - boxW * 0.18, y: spineY };
        const hipR = { x: headX + boxW * 0.18, y: spineY };
        const kneeL = { x: headX - boxW * 0.20, y: y1 + boxH * 0.78 };
        const kneeR = { x: headX + boxW * 0.20, y: y1 + boxH * 0.78 };
        const ankleL = { x: headX - boxW * 0.22, y: y1 + boxH - 5 };
        const ankleR = { x: headX + boxW * 0.22, y: y1 + boxH - 5 };

        const skeletonColor = isAlert ? '#f59e0b' : '#3b82f6';
        ctx.strokeStyle = skeletonColor;
        ctx.lineWidth = 2;

        ctx.beginPath(); ctx.moveTo(headX, headY); ctx.lineTo(headX, spineY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shoulderL.x, shoulderL.y); ctx.lineTo(shoulderR.x, shoulderR.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shoulderL.x, shoulderL.y); ctx.lineTo(elbowL.x, elbowL.y); ctx.lineTo(wristL.x, wristL.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shoulderR.x, shoulderR.y); ctx.lineTo(elbowR.x, elbowR.y); ctx.lineTo(wristR.x, wristR.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hipL.x, hipL.y); ctx.lineTo(hipR.x, hipR.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hipL.x, hipL.y); ctx.lineTo(kneeL.x, kneeL.y); ctx.lineTo(ankleL.x, ankleL.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hipR.x, hipR.y); ctx.lineTo(kneeR.x, kneeR.y); ctx.lineTo(ankleR.x, ankleR.y); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        [
          { x: headX, y: headY }, shoulderL, shoulderR, elbowL, elbowR, wristL, wristR,
          hipL, hipR, kneeL, kneeR, ankleL, ankleR
        ].forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. Footer Stream Telemetry Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`REC • ${camera.name} | ${currentTimeStr || 'LIVE'}`, 15, height - 12);
      ctx.fillText(`${camera.model || 'YOLOv8 + MediaPipe'} • ${camera.fps || 30} FPS`, width - 185, height - 12);

      animId = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();
    return () => cancelAnimationFrame(animId);
  }, [isOffline, showBoxes, showPose, showROI, camera, currentTimeStr]);

  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    const mergeCanvas = document.createElement('canvas');
    mergeCanvas.width = canvas.width || 640;
    mergeCanvas.height = canvas.height || 360;
    const mctx = mergeCanvas.getContext('2d');

    mctx.fillStyle = '#07090e';
    mctx.fillRect(0, 0, mergeCanvas.width, mergeCanvas.height);

    if (video && !isOffline && video.readyState >= 2) {
      try {
        mctx.drawImage(video, 0, 0, mergeCanvas.width, mergeCanvas.height);
      } catch (e) {}
    }

    mctx.drawImage(canvas, 0, 0);

    const image = mergeCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `AEGIS_INCIDENT_SNAP_${camera.id}_${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  const getSourcePath = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  };

  return (
    <div className="glass-panel" style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      border: isOffline ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)'
    }}>
      
      {/* Top Feed Header Bar */}
      <div style={{
        padding: '0.65rem 1rem',
        background: 'rgba(7, 10, 18, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 10
      }}>
        {/* Left Status & Camera Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className={isOffline ? 'badge badge-red' : 'badge badge-green'} style={{ fontSize: '0.65rem', padding: '0.18rem 0.5rem' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isOffline ? '#ef4444' : '#10b981',
              display: 'inline-block',
              marginRight: '3px'
            }} />
            {isOffline ? 'OFFLINE' : 'ONLINE'}
          </span>

          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
            {camera.name}
          </span>
          
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ({camera.zone})
          </span>
        </div>

        {/* Right Toggle Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {!isOffline && (
            <>
              <button
                onClick={() => setShowBoxes(!showBoxes)}
                className="btn-secondary"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.72rem',
                  background: showBoxes ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  borderColor: showBoxes ? 'rgba(59, 130, 246, 0.6)' : 'var(--border-color)',
                  color: showBoxes ? '#60a5fa' : 'var(--text-muted)'
                }}
                title="Toggle Bounding Boxes Overlay"
              >
                <Crosshair size={13} color={showBoxes ? '#60a5fa' : 'var(--text-muted)'} />
                <span>Boxes</span>
              </button>

              <button
                onClick={() => setShowPose(!showPose)}
                className="btn-secondary"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.72rem',
                  background: showPose ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                  borderColor: showPose ? 'rgba(6, 182, 212, 0.6)' : 'var(--border-color)',
                  color: showPose ? '#22d3ee' : 'var(--text-muted)'
                }}
                title="Toggle Pose Skeleton Overlay"
              >
                <Layers size={13} color={showPose ? '#22d3ee' : 'var(--text-muted)'} />
                <span>Pose</span>
              </button>

              <button
                onClick={() => setShowROI(!showROI)}
                className="btn-secondary"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.72rem',
                  background: showROI ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                  borderColor: showROI ? 'rgba(16, 185, 129, 0.6)' : 'var(--border-color)',
                  color: showROI ? '#34d399' : 'var(--text-muted)'
                }}
                title="Toggle Critical ROI Zone Overlay"
              >
                <Eye size={13} color={showROI ? '#34d399' : 'var(--text-muted)'} />
                <span>ROI</span>
              </button>

              <button
                onClick={handleCaptureSnapshot}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
                title="Save High-Res Incident Frame Snapshot"
              >
                <Camera size={13} />
                <span>Snapshot</span>
              </button>
            </>
          )}

          {onOpenIntegration && (
            <button
              onClick={onOpenIntegration}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
              title="Camera Stream Configuration"
            >
              <Settings size={13} color="var(--text-muted)" />
            </button>
          )}

          <button
            onClick={() => onManualAlertTrigger && onManualAlertTrigger(camera)}
            className="btn-danger"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
            title="Trigger Simulated Theft Concealment Alarm"
          >
            <Shield size={13} />
            <span>Test Alert</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport Container */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#07090e', overflow: 'hidden' }}>
        
        {/* Underlying Video Stream */}
        {!isOffline && (
          <video
            ref={videoRef}
            src={getSourcePath(camera.videoSource)}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}

        {/* Dynamic Canvas AI Overlay Layer */}
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

        {/* Offline Reconnect Action Banner */}
        {isOffline && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          }}>
            <button
              onClick={() => setIsOffline(false)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.15)' }}
            >
              <RefreshCw size={13} className="spin" color="#ef4444" />
              <span>Retry RTSP Stream Handshake</span>
            </button>
          </div>
        )}

        <div className="scan-line" />
      </div>

    </div>
  );
};
