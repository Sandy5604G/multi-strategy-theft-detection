import React, { useState } from 'react';
import { X, ShieldAlert, Clock, MapPin, User, FileText, Send, Download, CheckCircle2, AlertOctagon } from 'lucide-react';

export const AlertDetailModal = ({ alert, onClose, onUpdateStatus }) => {
  const [noteInput, setNoteInput] = useState('');
  if (!alert) return null;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    const updatedNote = alert.notes ? `${alert.notes} | Note [${new Date().toLocaleTimeString()}]: ${noteInput}` : noteInput;
    onUpdateStatus(alert.id, alert.status, updatedNote);
    setNoteInput('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-glow)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
              <ShieldAlert size={22} color="#ef4444" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>INCIDENT DOSSIER #{alert.id}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alert.alertType.replace(/_/g, ' ')} • {alert.cameraName}</p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Full Frame Image Snapshot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000' }}>
              <img src={alert.snapshot} alt="Incident Full Snapshot" style={{ width: '100%', height: 'auto', display: 'block' }} />
              <div className="scan-line" />
              <div style={{ position: 'absolute', top: '10px', left: '10px' }} className="badge badge-red">
                EVIDENCE FRAME SNAPSHOT
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch(alert.snapshot);
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `EVIDENCE_${alert.id}.jpg`;
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                  } catch (e) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                      const cvs = document.createElement('canvas');
                      cvs.width = img.naturalWidth || 640;
                      cvs.height = img.naturalHeight || 360;
                      const ctx = cvs.getContext('2d');
                      ctx.drawImage(img, 0, 0);
                      const link = document.createElement('a');
                      link.href = cvs.toDataURL('image/jpeg');
                      link.download = `EVIDENCE_${alert.id}.jpg`;
                      link.click();
                    };
                    img.src = alert.snapshot;
                  }
                }}
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
              >
                <Download size={14} />
                <span>Export Frame</span>
              </button>

              <button 
                onClick={() => onUpdateStatus(alert.id, 'CONFIRMED', 'Confirmed via full resolution review')}
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', background: '#10b981' }}
              >
                <CheckCircle2 size={14} />
                <span>Confirm Threat</span>
              </button>
            </div>
          </div>

          {/* Right Column: Telemetry & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Metadata Card */}
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Telemetry Breakout
              </h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Detection Confidence:</span>
                <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>{(alert.confidence * 100).toFixed(1)}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tracked Person ID:</span>
                <strong style={{ color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{alert.trackedPersonId}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{new Date(alert.timestamp).toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                <span className="badge badge-blue">{alert.status}</span>
              </div>
            </div>

            {/* Notes & Audit History */}
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={15} color="#3b82f6" />
                <span>Investigator Notes</span>
              </h4>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', minHeight: '80px', flex: 1, whiteSpace: 'pre-wrap' }}>
                {alert.notes || 'No investigator notes added yet.'}
              </div>

              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={noteInput} 
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add security note..."
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.8rem',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
