import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, postsAPI } from '../api/clientes';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Usuario, Publicacion } from '../types';

const BASE_URL = 'http://localhost:3000';

export default function ProfilePage() {
  const { user } = useAuth(); 
  const { showToast }    = useToast();
  const navigate         = useNavigate();
  const [profile, setProfile] = useState<Usuario|null>(null);
  const [posts,   setPosts]   = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🚀 NUEVO ESTADO PARA EL MODAL DE ELIMINACIÓN 🚀
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  useEffect(() => {
    usersAPI.me()
      .then(({ data }) => { 
        setProfile(data.user ?? data); 
        
        // 🚀 ORDENAR PUBLICACIONES POR LIKES (De mayor a menor) 🚀
        const fetchedPosts: Publicacion[] = data.posts ?? [];
        fetchedPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        
        setPosts(fetchedPosts); 
        setLoading(false);
      })
      .catch(() => {
        showToast('Error al cargar el perfil.', 'error');
        setLoading(false);
      });
  }, []);

  // Función para abrir el modal
  const triggerDelete = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setPostToDelete(postId); // Abre el modal con este ID
  };

  // Función real de eliminación (se ejecuta al confirmar en el modal)
  const confirmDelete = async () => {
    if (postToDelete === null) return;

    try {
      await postsAPI.remove(postToDelete);
      showToast('Publicación eliminada correctamente.');
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete)); 
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.status === 400) {
        showToast('No se puede eliminar porque existen registros dependientes.', 'error');
      } else {
        showToast('Error al intentar eliminar la publicación.', 'error');
      }
    } finally {
      setPostToDelete(null); // Cierra el modal pase lo que pase
    }
  };

  if (loading) return <div className="hip-spin"><div className="spinner-border text-primary"/></div>;

  const ini = (profile?.nombre_usuario || user?.nombre_usuario || '?')[0].toUpperCase();
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);

  return (
    <div className="hip-feed">
      
      {/* SECCIÓN DE PERFIL ESTILO INSTAGRAM (Limpia) */}
      <div className="mb-4 px-2 mt-2">
        
        {/* Fila 1: Avatar y Estadísticas */}
        <div className="d-flex align-items-center mb-3">
          <div className="me-4">
            <div className="hip-avatar" style={{ width: '85px', height: '85px', fontSize: '2.5rem' }}>{ini}</div>
          </div>
          
          <div className="d-flex justify-content-around flex-grow-1 text-center">
            <div>
              <div className="fw-bold fs-5">{posts.length}</div>
              <div style={{ fontSize: '0.85rem' }}>publicaciones</div>
            </div>
            <div>
              <div className="fw-bold fs-5">{totalLikes}</div>
              <div style={{ fontSize: '0.85rem' }}>likes</div>
            </div>
          </div>
        </div>

        {/* Fila 2: Información del usuario (Bio) */}
        <div className="mb-3">
          <div className="fw-bold" style={{ fontSize: '1.05rem' }}>@{profile?.nombre_usuario}</div>
          <div className="text-secondary mb-1" style={{ fontSize: '0.9rem' }}>{profile?.correo}</div>
          <span className={`badge ${profile?.rol==='ADMIN'?'bg-danger':'bg-warning text-dark'}`}>
            <i className={`bi ${profile?.rol==='ADMIN'?'bi-shield-fill':'bi-person-fill'} me-1`}></i>
            {profile?.rol}
          </span>
        </div>
      </div>

      {/* BARRA SEPARADORA CON ICONO DE CUADRÍCULA */}
      <div className="d-flex justify-content-center border-top border-secondary mt-4 mb-1">
        <div className="text-center" style={{ width: '50%', borderTop: '2px solid white', marginTop: '-2px', paddingTop: '10px' }}>
          <i className="bi bi-grid-3x3" style={{ fontSize: '1.4rem' }}></i>
        </div>
      </div>

      {/* Grid de Publicaciones */}
      {posts.length === 0 && (
        <div className="text-center py-5 text-muted mt-4">
          <div className="mb-3 rounded-circle border border-2 border-secondary d-inline-flex align-items-center justify-content-center" style={{ width:'80px', height:'80px' }}>
             <i className="bi bi-camera" style={{ fontSize:'2.5rem' }}></i>
          </div>
          <h4 className="fw-bold text-white">Aún no hay publicaciones</h4>
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

            <div className="hip-grid-ov d-flex justify-content-between align-items-center w-100 px-2">
              <span><i className="bi bi-hand-thumbs-up-fill me-1"></i>{p.likes_count}</span>
              
              <button 
                className="btn btn-sm btn-danger rounded-circle" 
                style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => triggerDelete(p.id, e)}
                title="Eliminar publicación"
              >
                <i className="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🚀 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN 🚀 */}
      {postToDelete !== null && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3"></i>
            <h4 className="fw-bold text-white">¿Eliminar publicación?</h4>
            <p className="text-secondary">Esta acción no se puede deshacer y se perderán todos los comentarios y likes.</p>
            
            <div className="d-flex flex-column gap-2 w-100 mt-3">
              <button className="btn btn-danger fw-bold rounded-pill" onClick={confirmDelete}>
                Eliminar
              </button>
              <button className="btn btn-outline-secondary fw-bold rounded-pill" onClick={() => setPostToDelete(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .img-error .hip-grid-error-overlay { display: flex !important; }

        /* --- ESTILOS DEL MODAL DE ELIMINACIÓN --- */
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(5px);
        }

        .delete-modal-content {
          background: #1a1a1a;
          border: 1px solid #ffc107; /* Borde amarillo Hipstagram */
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          max-width: 350px;
          width: 90%;
          box-shadow: 0 0 30px rgba(255, 193, 7, 0.2);
        }
      `}</style>
    </div>
  );
}