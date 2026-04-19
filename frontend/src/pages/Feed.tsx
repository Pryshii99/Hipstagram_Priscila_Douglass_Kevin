import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../api/clientes';
import { Publicacion } from '../types';
import { useToast } from '../context/ToastContext';

// ── Función de utilidad para formatear el tiempo ──
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Publicacion[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  async function load(p: number) {
    setLoading(true);
    try {
      const { data } = await postsAPI.getExplore(p);
      const arr: Publicacion[] = data.posts ?? data ?? [];
      p === 1 ? setPosts(arr) : setPosts(prev => [...prev, ...arr]);
      setHasMore(arr.length === 10);
      setPage(p);
    } catch {
      showToast('Error al cargar.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  return (
    <div className="insta-feed-container">
      <div className="feed-header px-2 mb-4">
        <h5 className="fw-bold mb-0">
          <i className="bi bi-stars me-2 text-warning"></i>Descubrir Destacados
        </h5>
        <small className="text-secondary">Explora lo más popular de la comunidad</small>
      </div>

      {loading && posts.length === 0 && (
        <div className="hip-spin"><div className="spinner-border text-primary" /></div>
      )}

      <div className="v-feed-stack">
        {posts.map((p) => (
          <article 
            key={p.id} 
            className="insta-card mb-5" 
            onClick={() => navigate(`/post/${p.id}`)}
          >
            {/* 1. Header del Post */}
            <div className="p-3 d-flex align-items-center">
              <div className="insta-avatar-ring me-3">
                <div className="insta-avatar-bg">
                  {p.nombre_usuario?.[0]?.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="fw-bold fs-6">@{p.nombre_usuario}</div>
                <div className="text-secondary small">{timeAgo(p.fecha_creacion)}</div>
              </div>
            </div>

            {/* 2. Imagen Central */}
            <div className="insta-card-img-container">
              {p.imagen_url ? (
                <img src={`http://localhost:3000${p.imagen_url}`} alt="Post" loading="lazy" />
              ) : (
                <div className="insta-img-ph"><i className="bi bi-image" /></div>
              )}
            </div>

            {/* 3. Acciones y Contenido */}
            <div className="p-3">
              <div className="d-flex gap-4 mb-3 fs-4">
                <i className="bi bi-hand-thumbs-up text-white"></i>
                <i className="bi bi-hand-thumbs-down text-white"></i>
                <i className="bi bi-chat text-white"></i>
              </div>
              
              <div className="fw-bold mb-1 small text-secondary">
                {p.likes_count} Likes • {p.dislikes_count} Dislikes
              </div>
              
              <div className="insta-caption mt-2">
                <span className="fw-bold me-2">@{p.nombre_usuario}</span>
                {p.descripcion}
              </div>

              {/* Hashtags Interactivos (Solo un bloque, corregido) */}
              <div className="mt-2">
                {p.hashtags && p.hashtags.length > 0 && p.hashtags.map((h: string) => (
                  <span 
                    key={h} 
                    className="text-warning me-2 small fw-bold" 
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que al hacer clic en el hashtag se abra el post
                      navigate(`/search?q=${h.replace('#','')}&mode=hashtag`);
                    }}
                  >
                    {h.startsWith('#') ? h : `#${h}`}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="text-center my-5">
          <button className="btn btn-warning rounded-pill px-5 fw-bold" onClick={() => load(page + 1)}>
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
}