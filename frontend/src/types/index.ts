export interface Usuario {
  id: number;
  nombre_usuario: string;
  correo: string;
  rol: 'USER' | 'ADMIN';
  activo?: boolean;
  fecha_creacion?: string;
}

export interface Publicacion {
  id: number;
  usuario_id: number;
  nombre_usuario: string;
  imagen_url: string;
  descripcion: string | null;
  estado: 'PENDIENTE' | 'PUBLICADO' | 'BLOQUEADO';
  likes_count: number;
  dislikes_count: number;
  fecha_creacion: string;
  hashtags: string[];
  total_comentarios: number;
  mi_voto: 1 | 0 | null;
}

export interface Comentario {
  id: number;
  publicacion_id: number;
  usuario_id: number;
  nombre_usuario: string;
  contenido: string;
  fecha_creacion: string;
}

export interface Auditoria {
  id: number;
  usuario_id: number | null;
  nombre_usuario?: string;
  accion: string;
  tabla_afectada: string | null;
  detalles: string | null;
  direccion_ip: string | null;
  fecha_creacion: string;
}

export interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuth: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
}

export interface ToastState {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export interface FeedResponse {
  posts: Publicacion[];
  page: number;
}

export interface CommentsResponse {
  comentarios: Comentario[];
  page: number;
}
