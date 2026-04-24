import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchAPI } from '../api/clientes';
import { Publicacion } from '../types';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query,   setQuery]   = useState(searchParams.get('q') || '');
  const [mode,    setMode]    = useState(searchParams.get('mode') || 'hashtag');
  const [results, setResults] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { 
      setQuery(q); 
      doSearch(q, mode); 
    }
  }, []);

  async function doSearch(q = query, m = mode) {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const fn = m === 'hashtag' ? searchAPI.byHashtag : searchAPI.freeText;
      const { data } = await fn(q);
      setResults(data.posts ?? data ?? []);
    } catch {
      // Manejo silencioso del error para mantener la UX
    } finally {
      setLoading(false);
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault(); 
    setSearchParams({ q: query, mode }); 
    doSearch();
  }

  return (
    <div className="hip-feed">
      <h5 className="fw-bold mb-3" style={{ color: 'var(--hip-primary)' }}>
        <i className="bi bi-search me-2"></i>Buscar
      </h5>
      
      {/* Tarjeta de búsqueda con borde de identidad amarilla */}
      <div className="hip-card p-3 mb-3" style={{ border: '1px solid var(--hip-primary)', borderRadius: '15px' }}>
        <form onSubmit={onSearch}>
          <div className="d-flex gap-2 mb-3">
            <div className="flex-fill position-relative">
              <i className="bi bi-search position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: '#bbb' }}></i>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                style={{ paddingLeft: 36, borderRadius: 10 }}
                placeholder={mode === 'hashtag' ? '#guate, #viaje...' : 'Busca cualquier texto...'}
                value={query} 
                onChange={e => setQuery(e.target.value)} 
              />
            </div>
            
            {/* 🚀 BOTÓN PRINCIPAL CON GLOW 🚀 */}
            <button type="submit" className="btn btn-warning rounded-pill px-4 fw-bold btn-glow-warning" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm"/>
              ) : (
                <>
                  <i className="bi bi-search me-1"></i>Buscar
                </>
              )}
            </button>
          </div>

          <div className="d-flex gap-2">
            {([['hashtag', 'bi-hash', 'Por hashtag'], ['text', 'bi-fonts', 'Texto libre']] as const).map(([m, ic, lbl]) => (
              <button 
                key={m} 
                type="button"
                /* 🚀 CLASE GLOW CONDICIONADA AL ESTADO ACTIVO 🚀 */
                className={`btn btn-sm rounded-pill fw-bold ${mode === m ? 'btn-warning btn-glow-warning' : 'btn-outline-secondary'}`}
                onClick={() => setMode(m)}
              >
                <i className={`bi ${ic} me-1`}></i>{lbl}
              </button>
            ))}
          </div>
        </form>
      </div>

      {results.length > 0 && (
        <div className="hip-grid">
          {results.map(p => (
            <div key={p.id} className="hip-grid-item" onClick={() => navigate(`/post/${p.id}`)}>
              {p.imagen_url ? (
                <img src={`http://localhost:3000${p.imagen_url}`} alt="" loading="lazy" />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: '#222', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <i className="bi bi-image" style={{ fontSize: '2rem', color: '#444' }}/>
                </div>
              )}
              <div className="hip-grid-ov">
                <span><i className="bi bi-hand-thumbs-up-fill me-1"></i>{p.likes_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-search" style={{ fontSize: '2.5rem' }}></i>
          <p className="mt-2">Sin resultados para "<strong>{query}</strong>"</p>
        </div>
      )}

   
      <style>{`
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