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

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="hip-explore-container">
      {/* Encabezado discreto estilo Instagram */}
      <div className="px-2 py-3">
        <h6 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.8rem', color: '#8e8e8e' }}>
          <i className="bi bi-grid-3x3 me-2"></i>Publicaciones Destacadas
        </h6>
      </div>

      {loading && posts.length === 0 && (
        <div className="hip-spin"><div className="spinner-border text-primary" /></div>
      )}

      {/* GRID DE 3 COLUMNAS PEGADAS */}
      <div className="insta-grid">
        {posts.map((p, i) => (
          <div key={p.id} className="insta-item" onClick={() => navigate(`/post/${p.id}`)}>
            {p.imagen_url ? (
              <img src={`http://localhost:3000${p.imagen_url}`} alt="" loading="lazy" />
            ) : (
              <div className="insta-placeholder">
                <i className="bi bi-image" />
              </div>
            )}

            {/* OVERLAY CON DETALLES (Aparece en Hover) */}
            <div className="insta-overlay">
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <div className="fw-bold text-white mb-1">
                  <i className="bi bi-heart-fill me-2"></i>{p.likes_count}
                </div>
                <div className="small text-white-50">
                  @{p.nombre_usuario} • {timeAgo(p.fecha_creacion)}
                </div>
                {medals[i] && <div className="mt-2" style={{ fontSize: '1.5rem' }}>{medals[i]}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

 {hasMore && !loading && (
        <div className="text-center my-4">
          {/* 🚀 BOTÓN CON LA NUEVA CLASE GLOW 🚀 */}
          <button className="btn btn-warning rounded-pill px-4 fw-bold btn-glow-warning" onClick={() => load(page + 1)}>
            Cargar más
          </button>
        </div>
      )}

      {/* BLOQUE DE ESTILOS CSS PARA EL BOTÓN */}
      <style>{`
        .btn-glow-warning {
          transition: all 0.3s ease-in-out;
        }
        .btn-glow-warning:hover {
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.7), 0 0 25px rgba(255, 193, 7, 0.4);
          background-color: #ffca2c; /* Aclara un poco el amarillo para dar sensación de iluminación */
          transform: translateY(-1px); /* Da un pequeño efecto de que el botón se levanta */
        }
      `}</style>
    </div>
  );
}