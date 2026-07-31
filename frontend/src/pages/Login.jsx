import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, User, Mail, Building, Key, CheckCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Security Staff');
  const [department, setDepartment] = useState('Floor Patrol');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register({ username, password, fullName, email, role, department });
        setSuccessMsg('Account registered successfully! You can now log in.');
        setIsRegisterMode(false);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      background: 'radial-gradient(circle at 50% 30%, #152238 0%, #07090e 70%)',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        border: '1px solid var(--border-glow)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)',
            padding: '0.8rem',
            borderRadius: '16px',
            marginBottom: '1rem',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={34} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AEGIS GUARD AI</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Enterprise Theft Detection Portal • LAN Single Sign-On
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Username / Employee ID
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or EMP-402"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.7rem 0.8rem 0.7rem 2.4rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.7rem 0.8rem 0.7rem 2.4rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Singh"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.7rem 0.8rem',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Requested Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#141b2d',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.7rem 0.8rem',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Security Staff">Security Staff (View & Triage Alerts)</option>
                  <option value="Admin">Admin (Full System Control)</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.8rem', fontSize: '0.95rem' }}
          >
            <span>{isRegisterMode ? 'Submit Registration' : 'Authenticate LAN Session'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
          <button 
            onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorMsg(''); }}
            style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            {isRegisterMode ? 'Already registered? Log in here' : 'Request new staff access account'}
          </button>
        </div>
      </div>
    </div>
  );
};
