import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI, commentsAPI, votesAPI } from '../api/clientes';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Publicacion, Comentario } from '../types';

function timeAgo(d: string) {
  const s = Math.floor((Date.now()-new Date(d).getTime())/1000);
  if(s<60) return 'ahora'; if(s<3600) return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`;
}

export default function PostPage() {
  const { id }  = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user }      = useAuth();
  const { showToast } = useToast();

  const [post,     setPost]     = useState<Publicacion|null>(null);
  const [comments, setComments] = useState<Comentario[]>([]);
  const [newCmt,   setNewCmt]   = useState('');
  const [myVote,   setMyVote]   = useState<1|0|null>(null);
  const [likes,    setLikes]    = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const [pR, cR] = await Promise.all([
          postsAPI.getById(Number(id)),
          commentsAPI.list(Number(id), 1),
        ]);
        const p = pR.data as Publicacion;
        setPost(p); setLikes(p.likes_count); setDislikes(p.dislikes_count); setMyVote(p.mi_voto);
        setComments(cR.data.comentarios ?? cR.data ?? []);
      } catch { showToast('Error al cargar.','error'); navigate(-1); }
      finally { setLoading(false); }
    }
    fetch();
  }, [id]);


  async function handleVote(tipo: 0|1) {
    if (!post) return;
    if (user?.id===post.usuario_id) { showToast('No puedes votar tu propia publicación.','info'); return; }
    
    const pl=likes, pd=dislikes, pv=myVote;
    
    // 1. Si hace clic en el botón que ya estaba activo, se quita el voto
    if (myVote === tipo) {
      if (tipo === 1) setLikes(l => Math.max(0, l - 1));
      else setDislikes(d => Math.max(0, d - 1));
      setMyVote(null);
    } 
    // 2. Si es un voto nuevo (no había votado nada previamente)
    else if (myVote === null) {
      if (tipo === 1) setLikes(l => l + 1);
      else setDislikes(d => d + 1);
      setMyVote(tipo);
    } 
    // 3. Si está cambiando su voto de Like a Dislike o viceversa
    else {
      if (tipo === 1) {
        setLikes(l => l + 1);
        setDislikes(d => Math.max(0, d - 1));
      } else {
        setDislikes(d => d + 1);
        setLikes(l => Math.max(0, l - 1));
      }
      setMyVote(tipo);
    }

    try { 
      // Se envía el voto al backend asumiendo que este procesa el "toggle" (borrado) al recibir el mismo tipo
      await votesAPI.vote(post.id, tipo); 
    }
    catch { 
      // Rollback visual si falla la API
      setLikes(pl); setDislikes(pd); setMyVote(pv); 
      showToast('Error al procesar el voto.','error'); 
    }
  }

  async function sendComment(e: FormEvent) {
    e.preventDefault();
    if (!newCmt.trim() || !post) return;
    setSending(true);
    try {
      const { data } = await commentsAPI.create(post.id, newCmt.trim());
      setComments(p => [data.comentario ?? data, ...p]);
      setNewCmt('');
      showToast('Comentario enviado ✓');
      // Actualizamos el contador visual de comentarios
      setPost(prev => prev ? { ...prev, total_comentarios: Number(prev.total_comentarios) + 1 } : prev);
    } catch { showToast('Error al comentar.','error'); }
    finally { setSending(false); }
  }

  //  INICIA EL MODO DE EDICIÓN EN LÍNEA 
  function startEditing(commentId: number, currentText: string) {
    setEditingCommentId(commentId);
    setEditDraft(currentText);
  }

  //  CANCELA LA EDICIÓN 
  function cancelEditing() {
    setEditingCommentId(null);
    setEditDraft('');
  }

  //  GUARDA EL COMENTARIO EDITADO (Llamando a la API) 
  async function saveEditedComment(commentId: number) {
    if (!editDraft.trim()) {
      showToast('El comentario no puede estar vacío.', 'info');
      return;
    }

    try {
      await commentsAPI.update(commentId, editDraft.trim());
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, contenido: editDraft.trim() } : c));
      showToast('Comentario actualizado ✓');
      setEditingCommentId(null);
      setEditDraft('');
    } catch (error) {
      showToast('Error al guardar los cambios.', 'error');
    }
  }

  //  FUNCIÓN PARA ELIMINAR EL COMENTARIO 
  async function handleDeleteComment(commentId: number) {
    if (!window.confirm('¿Seguro que deseas eliminar tu comentario?')) return;
    try {
      await commentsAPI.remove(commentId);
      showToast('Comentario eliminado.');
      // Filtramos la lista para quitar el comentario borrado de la pantalla
      setComments(prev => prev.filter(c => c.id !== commentId));
      // Restamos uno al contador visual
      setPost(prev => prev ? { ...prev, total_comentarios: Math.max(0, Number(prev.total_comentarios) - 1) } : prev);
    } catch (error) {
      showToast('Error al intentar eliminar el comentario.', 'error');
    }
  }

  if (loading) return <div className="hip-spin"><div className="spinner-border text-primary"/></div>;
  if (!post)   return null;

  return (
    <div className="hip-feed">
      <button className="btn btn-link text-decoration-none mb-3 p-0"
        style={{ color:'var(--hip-primary)' }} onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"></i>Volver
      </button>
      <div className="hip-card">
        <div className="hip-card-top">
          <div className="hip-user-row">
            <div className="hip-avatar">{post.nombre_usuario?.[0]?.toUpperCase()}</div>
            <div>
              <div className="hip-uname">@{post.nombre_usuario}</div>
              <div className="hip-utime"><i className="bi bi-clock me-1"></i>{timeAgo(post.fecha_creacion)}</div>
            </div>
          </div>
        </div>

    
        <div className="hip-card-img-container">
          {post.imagen_url
            ? <img 
                src={post.imagen_url} 
                alt={post.descripcion || 'Imagen de la publicación'} 
                className="hip-card-img" 
                style={{ cursor:'default' }}
              />
            : <div className="hip-card-img-ph"><i className="bi bi-image"/></div>
          }
        </div>

        <div className="hip-card-body pb-2">
          {post.hashtags?.map(h => (
            <span key={h} className="hip-tag" onClick={() => navigate(`/search?q=${h}&mode=hashtag`)}>{h}</span>
          ))}
          {post.descripcion && <p className="hip-desc mt-1 mb-0"><span className="fw-semibold">@{post.nombre_usuario}</span> {post.descripcion}</p>}
        </div>

        {/* NUEVO DISEÑO TIPO INSTAGRAM PARA LAS INTERACCIONES 🚀 */}
        <div className="d-flex align-items-center gap-4 px-3 pb-3 mt-2">
          {/* Botón Like */}
          <button className={`btn-ig-action ${myVote===1?'on':''}`} onClick={() => handleVote(1)}>
            <i className={`bi ${myVote===1?'bi-hand-thumbs-up-fill':'bi-hand-thumbs-up'}`}></i>
            <span className="fs-6 fw-bold">{likes}</span>
          </button>
          
          {/* Botón Dislike */}
          <button className={`btn-ig-action ${myVote===0?'on':''}`} onClick={() => handleVote(0)}>
            <i className={`bi ${myVote===0?'bi-hand-thumbs-down-fill':'bi-hand-thumbs-down'}`}></i>
            <span className="fs-6 fw-bold">{dislikes}</span>
          </button>

          {/* Icono de Comentarios */}
          <div className="btn-ig-action" style={{ cursor: 'default' }}>
            <i className="bi bi-chat"></i>
            <span className="fs-6 fw-bold">{post.total_comentarios || comments.length}</span>
          </div>
        </div>

        {/* Comentarios */}
        <div style={{ padding:'0 15px 16px' }}>
          <h6 className="fw-bold mb-3">
            <i className="bi bi-chat-dots me-2"></i>Comentarios
          </h6>
          <form onSubmit={sendComment} className="d-flex gap-2 mb-3">
            <div className="hip-avatar sm" style={{ flexShrink:0 }}>
              {user?.nombre_usuario?.[0]?.toUpperCase()}
            </div>
            <div className="flex-fill position-relative">
              <input type="text" className="form-control" style={{ borderRadius:20,paddingRight:44 }}
                placeholder="Escribe un comentario..." value={newCmt}
                onChange={e => setNewCmt(e.target.value)} maxLength={500} disabled={sending}/>
              <button type="submit" className="btn position-absolute end-0 top-0 h-100 px-3"
                style={{ color:'var(--hip-primary)' }} disabled={!newCmt.trim()||sending}>
                {sending ? <span className="spinner-border spinner-border-sm"/> : <i className="bi bi-send-fill"></i>}
              </button>
            </div>
          </form>
          {comments.length === 0 && (
            <p className="text-muted text-center py-3" style={{ fontSize:'0.9rem' }}>
              <i className="bi bi-chat-square me-2"></i>Sé el primero en comentar
            </p>
          )}
          {comments.map(c => (
            
            <div key={c.id} className="hip-cmt d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex gap-2 flex-grow-1">
                <div className="hip-avatar sm" style={{ flexShrink:0 }}>{c.nombre_usuario?.[0]?.toUpperCase()}</div>
                
                <div className="w-100">
                  <span className="hip-cmt-user me-2">@{c.nombre_usuario}</span>
                  <span className="hip-cmt-time">{timeAgo(c.fecha_creacion)}</span>
                  
                  {/* LÓGICA CONDICIONAL: Mostrar texto o input de edición en línea 🚀 */}
                  {editingCommentId === c.id ? (
                    <div className="mt-1 pe-3">
                      <input 
                        type="text" 
                        className="form-control bg-dark text-white border-warning mb-2" 
                        value={editDraft} 
                        onChange={(e) => setEditDraft(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditedComment(c.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-warning fw-bold rounded-pill px-3" onClick={() => saveEditedComment(c.id)}>
                          Guardar
                        </button>
                        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={cancelEditing}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="hip-cmt-text mb-0 mt-1">{c.contenido}</p>
                  )}
                </div>
              </div>

              {/* Mostrar botones solo si el usuario actual es el dueño del comentario y NO está editando */}
              {user?.nombre_usuario === c.nombre_usuario && editingCommentId !== c.id && (
                <div className="d-flex align-items-center mt-1">
                  {/* BOTÓN DE EDITAR A LA IZQUIERDA  */}
                  <button 
                    className="btn btn-sm text-info border-0 px-2 btn-action-cmt" 
                    onClick={() => startEditing(c.id, c.contenido)}
                    title="Editar comentario"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>

                  <button 
                    className="btn btn-sm text-danger border-0 px-2 btn-action-cmt" 
                    onClick={() => handleDeleteComment(c.id)}
                    title="Eliminar comentario"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
    
      <style>{`
        .hip-card-img-container {
          width: 100%;
          background-color: #000; /* Obliga a que los espacios vacíos sean negros */
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hip-card-img {
          width: 100%;
          height: auto;
          max-height: 600px;
          object-fit: contain; /* Ajusta la imagen sin deformarla */
          display: block; /* Elimina el margen inferior invisible */
        }

        /* --- ESTILOS PARA INTERACCIONES TIPO INSTAGRAM --- */
        .btn-ig-action {
          background: transparent;
          border: none;
          color: #f8f9fa; /* Blanco/gris apagado */
          display: flex;
          align-items: center;
          gap: 6px; /* Espaciado entre icono y número */
          padding: 0;
          transition: color 0.2s ease-in-out;
        }
        
        .btn-ig-action i {
          font-size: 1.5rem; /* Tamaño de los iconos */
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Efecto Hover y Activo (Amarillo) */
        .btn-ig-action:hover, .btn-ig-action.on {
          color: #ffc107;
        }
        
        /* Salto del icono al pasar el mouse */
        .btn-ig-action:hover i {
          transform: scale(1.15);
        }

        /* --- ESTILOS PARA LOS BOTONES DE COMENTARIO (EDITAR/ELIMINAR) --- */
        .btn-action-cmt i {
          display: inline-block; 
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }
        
        .btn-action-cmt:hover i {
          transform: scale(1.4); 
        }
      `}</style>
      
    </div>
  );
}