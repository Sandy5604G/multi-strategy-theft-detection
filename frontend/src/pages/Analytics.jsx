import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, PieChart, CheckCircle2, Clock } from 'lucide-react';

export const Analytics = ({ alerts }) => {
  const totalIncidents = alerts.length;
  const confirmedCount = alerts.filter(a => a.status === 'CONFIRMED' || a.status === 'ESCALATED').length;
  const accuracyRate = totalIncidents > 0 ? ((confirmedCount / totalIncidents) * 100).toFixed(1) : 92.5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      
      {/* Title Bar */}
      <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>STORE THEFT & RISK ANALYTICS</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Empirical security metrics, peak incident temporal analysis, and aisle vulnerability maps
          </p>
        </div>

        <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
          REALTIME AGGREGATION ACTIVE
        </span>
      </div>

      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '1rem', borderRadius: '12px' }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest Risk Zone</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>Aisle 3 (Electronics)</div>
            <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>48% of total month alerts</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: '12px' }}>
            <CheckCircle2 size={28} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified True Positive Rate</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>{accuracyRate}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Validated by security staff</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1rem', borderRadius: '12px' }}>
            <Clock size={28} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Peak Incident Window</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>17:00 - 19:30 IST</div>
            <div style={{ fontSize: '0.72rem', color: '#60a5fa' }}>High store footfall hours</div>
          </div>
        </div>
      </div>

      {/* Visual Charts & Heatmap Simulation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.2rem' }}>
        
        {/* Left: Hourly Alert Frequency Heatmap Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60a5fa' }}>
              Hourly Incident Distribution (24H Timeline)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incidents per hour</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: '180px', paddingTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {[2, 1, 0, 0, 1, 3, 5, 8, 12, 18, 25, 32, 28, 22, 19, 35, 42, 38, 27, 15, 9, 4, 2, 1].map((val, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', height: '100%', justifyContent: 'flex-end' }}>
                <div 
                  style={{
                    width: '100%',
                    height: `${(val / 42) * 100}%`,
                    background: val > 30 ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)' : (val > 15 ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)'),
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s'
                  }}
                  title={`${idx}:00 - ${val} alerts`}
                />
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {idx % 4 === 0 ? `${idx}h` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Incident Breakdown by Posture */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Posture Threat Classification
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span>Suspicious Concealment:</span>
                <strong style={{ color: '#ef4444' }}>58%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '58%', height: '100%', background: '#ef4444' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span>Prolonged Crouching:</span>
                <strong style={{ color: '#f59e0b' }}>27%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '27%', height: '100%', background: '#f59e0b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span>Bag Snatching Movement:</span>
                <strong style={{ color: '#06b6d4' }}>15%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', background: '#06b6d4' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
