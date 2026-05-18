const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hirex_token') : null;
  const headers = { ...options.headers };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch (err) {
    throw new Error('Unable to connect to the server. Please check your internet connection.');
  }

  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error('Server is not responding. Please make sure the backend server is running.');
  }

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  register: (formData) => request('/auth/register', { method: 'POST', body: formData }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (formData) => request('/auth/profile', { method: 'PUT', body: formData }),

  generateQuiz: (topic) => request('/quiz/generate', { method: 'POST', body: JSON.stringify({ topic }) }),
  submitQuiz: (body) => request('/quiz/submit', { method: 'POST', body: JSON.stringify(body) }),
  quizHistory: () => request('/quiz/history'),

  startInterview: () => request('/interview/start'),
  submitInterview: (answers) => request('/interview/submit', { method: 'POST', body: JSON.stringify({ answers }) }),

  getDailyProblem: () => request('/skills/daily-problem'),
  submitSolution: (body) => request('/skills/submit-solution', { method: 'POST', body: JSON.stringify(body) }),
  getProgress: () => request('/skills/progress'),
  chatbot: (message) => request('/skills/chatbot', { method: 'POST', body: JSON.stringify({ message }) }),
};
