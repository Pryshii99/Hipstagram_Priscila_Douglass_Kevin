import axios, { AxiosInstance } from 'axios';

const BASE = 'http://localhost:3000/api/v1';
const api: AxiosInstance = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

// Agrega token JWT automáticamente
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('hip_token');
  if (t) cfg.headers!['Authorization'] = `Bearer ${t}`;
  return cfg;
});

// Si el token expira (401) intenta renovarlo con la cookie refresh
api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const { data } = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('hip_token', data.accessToken);
        orig.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const authAPI = {
  register:      (d: object)   => api.post('/auth/register', d),
  login:         (d: object)   => api.post('/auth/login', d),
  logout:        ()            => api.post('/auth/logout'),
  checkUsername: (u: string)   => api.get(`/users/check?username=${u}`),
};

// ── Posts ──
export const postsAPI = {
  getFeed:    (page = 1)        => api.get(`/posts/feed?page=${page}&limit=10`),
  getExplore: (page = 1)        => api.get(`/posts/explore?page=${page}&limit=10`),
  getById:    (id: number)      => api.get(`/posts/${id}`),
  create:     (fd: FormData)    => api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:     (id: number)      => api.delete(`/posts/${id}`),
};

// ── Votos ───
export const votesAPI = {
  vote: (postId: number, tipo_voto: 0 | 1) =>
    api.post(`/posts/votes/${postId}`, { tipo_voto }),
};

// ── Comentarios ───
export const commentsAPI = {
  list:   (postId: number, page = 1) => api.get(`/posts/comments/${postId}?page=${page}&limit=20`),
  create: (postId: number, text: string) => api.post(`/posts/comments/${postId}`, { contenido: text }),
};

// ── Búsqueda ───
export const searchAPI = {
  byHashtag: (q: string, page = 1) => api.get(`/posts/search/hashtag?q=${encodeURIComponent(q)}&page=${page}`),
  freeText:  (q: string, page = 1) => api.get(`/posts/search?q=${encodeURIComponent(q)}&page=${page}`),
};

// ── Usuarios ───
export const usersAPI = {
  me:    ()          => api.get('/users/me'),
  byId:  (id:number) => api.get(`/users/${id}`),
};

// ── Admin ───
export const adminAPI = {
  getPosts:      (estado: string, page = 1) => api.get(`/admin/posts?estado=${estado}&page=${page}`),
  moderatePost:  (id: number, action: string) => api.patch(`/admin/posts/${id}/${action}`),
  getUsers:      (q = '', page = 1)          => api.get(`/admin/users?q=${q}&page=${page}`),
  setUserStatus: (id: number, activo: boolean) => api.patch(`/admin/users/${id}/status`, { activo }),
  getBanned:     ()                           => api.get('/admin/banned-words'),
  setBanned:     (d: object)                  => api.put('/admin/banned-words', d),
  getAudit:      (params?: object)            => api.get('/admin/audit', { params }),
};

export default api;
