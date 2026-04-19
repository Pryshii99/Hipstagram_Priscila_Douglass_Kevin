import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../api/clientes';
import { Publicacion } from '../types';
import { useToast } from '../context/ToastContext';

export default function ExplorePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posts,   setPosts]   = useState<Publicacion[]>([]);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  async function load(p: number) {
    setLoading(true);
    try {
      const { data } = await postsAPI.getExplore(p);
      const arr: Publicacion[] = data.posts ?? data ?? [];
      p === 1 ? setPosts(arr) : setPosts(prev => [...prev, ...arr]);
      setHasMore(arr.length === 10); setPage(p);
    } catch { showToast('Error al cargar.','error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(1); }, []);

  const medals = ['🥇','🥈','🥉'];

  return (
    <div className="hip-feed">
      <h5 className="fw-bold mb-3" style={{ color:'var(--hip-dark)' }}>
        <i className="bi bi-compass-fill me-2"></i>Top Likes — Lo más popular
      </h5>

      {loading && posts.length === 0 && <div className="hip-spin"><div className="spinner-border text-primary"/></div>}

      <div className="hip-grid">
        {posts.map((p, i) => (
          <div key={p.id} className="hip-grid-item" onClick={() => navigate(`/post/${p.id}`)}>
            {p.imagen_url
             ? <img src={`http://localhost:3000${p.imagen_url}`} alt="" loading="lazy" />
              : <div style={{ width:'100%',height:'100%',background:'#cdd8e5',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <i className="bi bi-image" style={{ fontSize:'2rem',color:'#aab' }}/>
                </div>
            }
            <div className="hip-grid-ov">
              {medals[i] && <span style={{ fontSize:'1.3rem' }}>{medals[i]}</span>}
              <span><i className="bi bi-hand-thumbs-up-fill me-1"></i>{p.likes_count}</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="text-center mt-3">
          <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => load(page+1)}>
            <i className="bi bi-arrow-down-circle me-2"></i>Ver más
          </button>
        </div>
      )}
    </div>
  );
}
