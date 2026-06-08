const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export async function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchTasks() {
  return apiFetch('/api/tasks');
}

export async function fetchOverdueTasks() {
  return apiFetch('/api/tasks/overdue');
}

export async function fetchEscalationHistory() {
  return apiFetch('/api/escalations/history');
}

export async function createEscalation(taskId, reason) {
  return apiFetch('/api/escalations', {
    method: 'POST',
    body: JSON.stringify({ taskId, reason }),
  });
}

export async function updateEscalationStatus(id, status) {
  return apiFetch(`/api/escalations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function triggerNotification(escalationId) {
  return apiFetch('/api/notifications/trigger', {
    method: 'POST',
    body: JSON.stringify({ escalationId }),
  });
}

export async function fetchAuditLogs() {
  return apiFetch('/api/audit');
}
