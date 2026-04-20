import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate de importar postsAPI o el cliente que uses para las publicaciones
import { usersAPI, postsAPI } from '../api/clientes';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Usuario, Publicacion } from '../types';

// 1. SOLUCIÓN AL ERROR DE ENV: 
const BASE_URL = 'http://localhost:3000';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { showToast }    = useToast();
  const navigate         = useNavigate();
  const [profile, setProfile] = useState<Usuario|null>(null);
  const [posts,   setPosts]   = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. SOLUCIÓN AL ERROR DE FINALLY:
  useEffect(() => {
    usersAPI.me()
      .then(({ data }) => { 
        setProfile(data.user ?? data); 
        setPosts(data.posts ?? []); 
        setLoading(false); // ← Termina de cargar si hay éxito
      })
      .catch(() => {
        showToast('Error al cargar el perfil.', 'error');
        setLoading(false); // ← Termina de cargar si hay error
      });
  }, []);

  // 3. 🚀 LÓGICA DE ELIMINACIÓN Y CAPTURA DE ERROR DE LLAVE FORÁNEA (DBA) 🚀
  const handleDeletePost = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que al hacer clic en borrar, te lleve al detalle de la foto
    
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;

    try {
      // Llamada a tu API (asegúrate de que el método se llame delete o deletePost en clientes.ts)
      await postsAPI.remove(postId);
      
      showToast('Publicación eliminada correctamente.');
      // Actualizamos el estado para quitar la foto de la cuadrícula inmediatamente
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId)); 
      
    } catch (error: any) {
      // Captura del error de restricción RESTRICT de la base de datos
      if (error.response?.status === 409 || error.response?.status === 400) {
        showToast('No se puede eliminar porque existen registros dependientes (comentarios o likes).', 'error');
      } else {
        showToast('Error al intentar eliminar la publicación.', 'error');
      }
    }
  };

  if (loading) return <div className="hip-spin"><div className="spinner-border text-primary"/></div>;

  const ini = (profile?.nombre_usuario || user?.nombre_usuario || '?')[0].toUpperCase();
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);

  return (
    <div className="hip-feed">
      <div className="hip-card p-4 mb-3">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="hip-avatar lg">{ini}</div>
          <div>
            <h5 className="mb-0 fw-bold">@{profile?.nombre_usuario}</h5>
            <small className="text-muted">{profile?.correo}</small><br/>
            <span className={`badge mt-1 ${profile?.rol==='ADMIN'?'bg-danger':'bg-primary'}`}>
              <i className={`bi ${profile?.rol==='ADMIN'?'bi-shield-fill':'bi-person-fill'} me-1`}></i>
              {profile?.rol}
            </span>
          </div>
        </div>
        <div className="row g-2 text-center mb-3">
          {[
            ['bi-images',         posts.length, 'Publicaciones'],
            ['bi-hand-thumbs-up', totalLikes,   'Likes recibidos'],
          ].map(([ic,val,lbl]) => (
            <div key={String(lbl)} className="col-6">
              <div style={{ background:'var(--hip-light)',borderRadius:10,padding:'12px 8px' }}>
                <i className={`bi ${ic}`} style={{ fontSize:'1.4rem',color:'var(--hip-primary)' }}></i>
                <div className="fw-bold fs-5">{val}</div>
                <div style={{ fontSize:'0.78rem',color:'#888' }}>{lbl}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-outline-danger w-100 rounded-pill"
          onClick={() => { logout(); navigate('/login'); }}>
          <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
        </button>
      </div>

      <h6 className="fw-bold mb-2"><i className="bi bi-grid-3x3-gap me-2"></i>Mis publicaciones</h6>

      {posts.length === 0 && (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-camera" style={{ fontSize:'2.5rem' }}></i>
          <p className="mt-2">Aún no has publicado nada</p>
          <button className="btn btn-primary rounded-pill" onClick={() => navigate('/new')}>
            <i className="bi bi-plus-lg me-1"></i>Publicar foto
          </button>
        </div>
      )}

      <div className="hip-grid">
        {posts.map(p => (
          <div key={p.id} className="hip-grid-item" onClick={() => navigate(`/post/${p.id}`)}>
            {p.imagen_url
              ? <img 
                  src={`${BASE_URL}${p.imagen_url}`} 
                  alt="" 
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.classList.add('img-error');
                  }}
                />
              : <div style={{ width:'100%',height:'100%',background:'#cdd8e5',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <i className="bi bi-image" style={{ fontSize:'2rem',color:'#aab' }}/>
                </div>
            }
            
            <div className="hip-grid-error-overlay" style={{ display: 'none', width:'100%',height:'100%',background:'#cdd8e5',alignItems:'center',justifyContent:'center' }}>
                <i className="bi bi-image" style={{ fontSize:'2rem',color:'#aab' }}/>
            </div>

            {/* 4. BOTÓN DE ELIMINAR AGREGADO AQUÍ */}
            <div className="hip-grid-ov d-flex justify-content-between align-items-center w-100 px-2">
              <span><i className="bi bi-hand-thumbs-up-fill me-1"></i>{p.likes_count}</span>
              
              <button 
                className="btn btn-sm btn-danger rounded-circle" 
                style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => handleDeletePost(p.id, e)}
                title="Eliminar publicación"
              >
                <i className="bi bi-trash-fill"></i>
              </button>
            </div>
            
          </div>
        ))}
      </div>
      
      <style>{`
        .img-error .hip-grid-error-overlay { display: flex !important; }
      `}</style>
    </div>
  );
}