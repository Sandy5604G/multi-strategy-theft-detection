// Enterprise API Service Layer with Backend + Simulated Fallback Engine

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:8000/api'
  : `http://${window.location.hostname}:8000/api`;

const WS_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'ws://localhost:8000/ws/feed'
  : `ws://${window.location.hostname}:8000/ws/feed`;

// Initial Mock Datasets
let mockUsers = [
  { id: 'usr-001', username: 'admin', fullName: 'Sandeep Sharma (Lead Security)', role: 'Admin', email: 'sandeep@aegis-retail.com', department: 'Executive Security', status: 'Active', lastLogin: 'Just now' },
  { id: 'usr-002', username: 'security_lead', fullName: 'Vikram Singh', role: 'Security Staff', email: 'vikram.s@aegis-retail.com', department: 'Floor Patrol Aisle 3-7', status: 'Active', lastLogin: '12 mins ago' },
  { id: 'usr-003', username: 'manager_store', fullName: 'Ananya Roy', role: 'Viewer', email: 'ananya.r@aegis-retail.com', department: 'Store Operations', status: 'Active', lastLogin: '2 hours ago' }
];

let mockCameras = [];

let mockAlerts = [];

let mockConfig = {
  yoloConfidenceThreshold: 0.50,
  poseDetectionThreshold: 0.65,
  crouchTimeLimitSeconds: 15,
  concealmentCooldownSeconds: 3,
  consecutiveFrameConfirmation: 4,
  autoEscalateThreshold: 0.92,
  soundAlertsEnabled: true,
  snapshotRetentionDays: 60,
  rtspBufferSize: 1024
};

// API Methods
export const api = {
  // Authentication
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend API offline. Using enterprise mock authentication fallback.");
    }
    
    // Mock Fallback
    const user = mockUsers.find(u => u.username === username) || mockUsers[0];
    const token = 'mock-jwt-token-aegis-enterprise-' + Math.random().toString(36).substring(2);
    localStorage.setItem('aegis_jwt_token', token);
    localStorage.setItem('aegis_user', JSON.stringify(user));
    return { access_token: token, user };
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend API offline. Registering user in mock database.");
    }

    const newUser = {
      id: `usr-00${mockUsers.length + 1}`,
      username: userData.username,
      fullName: userData.fullName || userData.username,
      role: userData.role || 'Security Staff',
      email: userData.email,
      department: userData.department || 'General Operations',
      status: 'Active',
      lastLogin: 'Just registered'
    };
    mockUsers.push(newUser);
    return { success: true, user: newUser };
  },

  // Get current user profile
  getCurrentUser: () => {
    const cached = localStorage.getItem('aegis_user');
    if (cached) return JSON.parse(cached);
    return mockUsers[0];
  },

  // Alerts API
  getAlerts: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockAlerts;
  },

  updateAlertStatus: async (alertId, status, notes = '') => {
    try {
      await fetch(`${API_BASE_URL}/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
    } catch (e) {}

    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (notes) alert.notes = notes;
    }
    return mockAlerts;
  },

  // Config API
  getConfig: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockConfig;
  },

  updateConfig: async (newConfig) => {
    try {
      await fetch(`${API_BASE_URL}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {}
    mockConfig = { ...mockConfig, ...newConfig };
    return mockConfig;
  },

  // Users API (Admin)
  getUsers: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockUsers;
  },

  updateUserRole: async (userId, role) => {
    const u = mockUsers.find(x => x.id === userId);
    if (u) u.role = role;
    return mockUsers;
  },

  toggleUserStatus: async (userId) => {
    const u = mockUsers.find(x => x.id === userId);
    if (u) u.status = u.status === 'Active' ? 'Deactivated' : 'Active';
    return mockUsers;
  },

  // Cameras API
  getCameras: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cameras`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockCameras;
  },

  addCamera: async (cam) => {
    const newCam = {
      id: `cam-0${mockCameras.length + 1}`,
      ...cam,
      status: 'ONLINE',
      fps: 30,
      activeAlerts: 0
    };
    mockCameras.push(newCam);
    return mockCameras;
  }
};

export { WS_BASE_URL };
