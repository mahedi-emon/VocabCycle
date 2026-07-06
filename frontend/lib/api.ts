const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    // Attempt token refresh or redirect to login
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken && !endpoint.includes('/auth/token/refresh/')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('access_token', data.access);
          // Retry original request
          headers.set('Authorization', `Bearer ${data.access}`);
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          return retryResponse;
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
      }
    }
    // Logout user
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  return response;
}

export const api = {
  // Auth
  async register(data: any) {
    const res = await fetchAPI('/api/v1/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  async login(data: any) {
    const res = await fetchAPI('/api/v1/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  async googleAuth(token: string) {
    const res = await fetchAPI('/api/v1/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return res;
  },

  // User Profile & Settings
  async getProfile() {
    const res = await fetchAPI('/api/v1/user/');
    return res;
  },

  async updateProfile(data: any) {
    const res = await fetchAPI('/api/v1/user/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  async updateSettings(reminder_on: boolean) {
    const res = await fetchAPI('/api/v1/user/settings/', {
      method: 'PUT',
      body: JSON.stringify({ reminder_on }),
    });
    return res;
  },

  async changePassword(data: any) {
    const res = await fetchAPI('/api/v1/user/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  // Vocabulary & Cycles
  async getVocab() {
    const res = await fetchAPI('/api/v1/vocab/');
    return res;
  },

  async addWords(words: any[]) {
    const res = await fetchAPI('/api/v1/vocab/', {
      method: 'POST',
      body: JSON.stringify({ words }),
    });
    return res;
  },

  async getCycles() {
    const res = await fetchAPI('/api/v1/cycles/');
    return res;
  },

  async getCurrentCycle() {
    const res = await fetchAPI('/api/v1/cycles/current/');
    return res;
  },

  async startCycle() {
    const res = await fetchAPI('/api/v1/cycles/start/', {
      method: 'POST',
    });
    return res;
  },

  async completeCycle() {
    const res = await fetchAPI('/api/v1/cycles/complete/', {
      method: 'POST',
    });
    return res;
  },

  async getCycleDetails(id: string) {
    const res = await fetchAPI(`/api/v1/cycles/${id}/`);
    return res;
  },

  async getCycleWords(id: string) {
    const res = await fetchAPI(`/api/v1/cycles/${id}/words/`);
    return res;
  },

  // Reviews
  async recordReview() {
    const res = await fetchAPI('/api/v1/reviews/', {
      method: 'POST',
    });
    return res;
  },

  // Stats & Search
  async getStats() {
    const res = await fetchAPI('/api/v1/stats/');
    return res;
  },

  async search(query: string) {
    const res = await fetchAPI(`/api/v1/search/?word=${encodeURIComponent(query)}`);
    return res;
  },
};
