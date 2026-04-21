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

export default function FeedPage() { // Asumí el nombre FeedPage
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Publicacion[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  async function load(p: number) {
    setLoading(true);
    try {
      const { data } = await postsAPI.getExplore(p); // ⚠️ Ojo, si es tu feed, deberías usar tu endpoint de feed, ej: postsAPI.getFeed(p)
      const arr: Publicacion[] = data.posts ?? data ?? [];
      p === 1 ? setPosts(arr) : setPosts(prev => [...prev, ...arr]);
      setHasMore(arr.length === 10); // Asumiendo que 10 es el límite por página
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
        <div className="hip-spin"><div className="spinner-border text-warning" /></div>
      )}

      <div className="v-feed-stack">
        {posts.map((p) => (
          <article 
            key={p.id} 
            className="insta-card mb-5 custom-hover-card" 
            onClick={() => navigate(`/post/${p.id}`)}
          >
            {/* 1. Header del Post */}
            <div className="p-3 d-flex align-items-center">
              <div className="custom-avatar me-3">
                  {p.nombre_usuario?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="fw-bold fs-6" style={{ color: '#ffc107' }}>@{p.nombre_usuario}</div>
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
            <div className="p-3 pb-2">
              {/* 🚀 DISEÑO TIPO INSTAGRAM PARA LAS INTERACCIONES 🚀 */}
              <div className="d-flex align-items-center gap-4 mb-2">
                <div className="btn-ig-action">
                  <i className="bi bi-hand-thumbs-up"></i>
                  <span className="fs-6 fw-bold">{p.likes_count}</span>
                </div>
                
                <div className="btn-ig-action">
                  <i className="bi bi-hand-thumbs-down"></i>
                  <span className="fs-6 fw-bold">{p.dislikes_count}</span>
                </div>

                <div className="btn-ig-action">
                  <i className="bi bi-chat"></i>
                  <span className="fs-6 fw-bold">{p.total_comentarios || 0}</span>
                </div>
              </div>
              
              <div className="insta-caption mt-2">
                <span className="fw-bold me-2" style={{ color: '#ffc107' }}>@{p.nombre_usuario}</span>
                <span className="text-light">{p.descripcion}</span>
              </div>

              {/* Hashtags Interactivos */}
              <div className="mt-2">
                {p.hashtags && p.hashtags.length > 0 && p.hashtags.map((h: string) => (
                  <span 
                    key={h} 
                    className="text-warning me-2 small fw-bold custom-hashtag" 
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
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
          {/* 🚀 BOTÓN CON LA CLASE GLOW 🚀 */}
          <button className="btn btn-warning rounded-pill px-5 fw-bold btn-glow-warning" onClick={() => load(page + 1)}>
            Cargar más
          </button>
        </div>
      )}

      {/* BLOQUE DE ESTILOS */}
      <style>{`
        /* --- ESTILOS DEL AVATAR --- */
        .custom-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #ffc107;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          padding: 0;
          border: none; 
        }

        /* --- ESTILOS DE LA TARJETA --- */
        .custom-hover-card {
          border: 1px solid #333 !important;
          background-color: #000;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .custom-hover-card:hover {
          border-color: #ffc107 !important;
          box-shadow: 0 0 12px rgba(255, 193, 7, 0.2);
        }

        /* --- ESTILOS PARA INTERACCIONES TIPO INSTAGRAM --- */
        .btn-ig-action {
          background: transparent;
          border: none;
          color: #f8f9fa;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          transition: color 0.2s ease-in-out;
        }
        
        .btn-ig-action i {
          font-size: 1.5rem;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .btn-ig-action:hover {
          color: #ffc107;
        }
        
        .btn-ig-action:hover i {
          transform: scale(1.15);
        }

        .custom-hashtag:hover {
          text-decoration: underline;
          color: #fff !important;
        }

        /* 🚀 EFECTO GLOW PARA EL BOTÓN (Faltaba esto) 🚀 */
        .btn-glow-warning {
          transition: all 0.3s ease-in-out;
        }
        .btn-glow-warning:hover {
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.7), 0 0 25px rgba(255, 193, 7, 0.4);
          background-color: #ffca2c;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}