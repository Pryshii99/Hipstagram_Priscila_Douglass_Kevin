import React, { useState } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../context/AuthContext';
import { useToast }     from '../context/ToastContext';
import { votesAPI, postsAPI } from '../api/clientes';
import { Publicacion }  from '../types';

interface Props {
  post:     Publicacion;
  onDelete?: (id: number) => void;
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)    return 'ahora mismo';
  if (s < 3600)  return `hace ${Math.floor(s/60)} min`;
  if (s < 86400) return `hace ${Math.floor(s/3600)}h`;
  return `hace ${Math.floor(s/86400)} días`;
}

export default function PostCard({ post, onDelete }: Props) {
  const { user }      = useAuth();
  const { showToast } = useToast();
  const navigate      = useNavigate();

  const [likes,     setLikes]     = useState(post.likes_count);
  const [dislikes,  setDislikes]  = useState(post.dislikes_count);
  const [myVote,    setMyVote]    = useState<1|0|null>(post.mi_voto);
  const [loadVote,  setLoadVote]  = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);
  const [delLoad,   setDelLoad]   = useState(false);

  const isOwner = user?.id === post.usuario_id;

  async function handleVote(tipo: 0|1) {
    if (loadVote) return;
    if (isOwner)  { showToast('No puedes votar tu propia publicación.', 'info'); return; }
    if (myVote === tipo) return; // idempotente

    // Actualización optimista
    const prevLikes = likes, prevDislikes = dislikes, prevVote = myVote;
    if (myVote === null) {
      tipo === 1 ? setLikes(l => l+1) : setDislikes(d => d+1);
    } else {
      if (tipo === 1) { setLikes(l => l+1); setDislikes(d => Math.max(0,d-1)); }
      else            { setDislikes(d => d+1); setLikes(l => Math.max(0,l-1)); }
    }
    setMyVote(tipo);
    setLoadVote(true);
    try {
      await votesAPI.vote(post.id, tipo);
    } catch {
      setLikes(prevLikes); setDislikes(prevDislikes); setMyVote(prevVote);
      showToast('Error al registrar el voto.', 'error');
    } finally { setLoadVote(false); }
  }

  async function handleDelete() {
    if (!window.confirm('¿Eliminar esta publicación? No se puede deshacer.')) return;
    setDelLoad(true);
    try {
      await postsAPI.remove(post.id);
      showToast('Publicación eliminada.');
      onDelete?.(post.id);
    } catch (err: any) {
      const msg = err.response?.status === 409
        ? 'No puedes eliminar porque tiene comentarios.'
        : 'Error al eliminar. Intenta de nuevo.';
      showToast(msg, 'error');
    } finally { setDelLoad(false); setShowMenu(false); }
  }

  const ini = post.nombre_usuario?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="hip-card">

      {/* ── Cabecera ──────────────────────────────── */}
      <div className="hip-card-top">
        <div className="hip-user-row">
          <div className="hip-avatar">{ini}</div>
          <div>
            <div className="hip-uname">@{post.nombre_usuario}</div>
            <div className="hip-utime">
              <i className="bi bi-clock me-1"></i>{timeAgo(post.fecha_creacion)}
            </div>
          </div>
        </div>

        {isOwner && (
          <div style={{ position:'relative' }}>
            <button className="btn-more" onClick={() => setShowMenu(o => !o)}>
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            {showMenu && (
              <div style={{
                position:'absolute', right:0, top:36, background:'#fff',
                borderRadius:10, boxShadow:'0 4px 18px rgba(0,0,0,0.13)',
                minWidth:150, zIndex:100, overflow:'hidden'
              }}>
                <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger"
                  onClick={handleDelete} disabled={delLoad}>
                  {delLoad ? <span className="spinner-border spinner-border-sm"/> : <i className="bi bi-trash3-fill"></i>}
                  Eliminar foto
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Imagen ────────────────────────────────── */}
      {post.imagen_url ? (
        <img src={post.imagen_url} alt={post.descripcion ?? ''} className="hip-card-img"
          onClick={() => navigate(`/post/${post.id}`)} loading="lazy" />
      ) : (
        <div className="hip-card-img-ph" onClick={() => navigate(`/post/${post.id}`)}>
          <i className="bi bi-image"></i>
          <span style={{ fontSize:'0.82rem' }}>Sin imagen</span>
        </div>
      )}

      {/* ── Cuerpo ────────────────────────────────── */}
      <div className="hip-card-body">
        {post.hashtags?.length > 0 && (
          <div className="mb-1">
            {post.hashtags.map(h => (
              <span key={h} className="hip-tag"
                onClick={() => navigate(`/search?q=${encodeURIComponent(h)}&mode=hashtag`)}>
                {h}
              </span>
            ))}
          </div>
        )}
        {post.descripcion && (
          <p className="hip-desc mb-1">
            <span className="fw-semibold">@{post.nombre_usuario}</span> {post.descripcion}
          </p>
        )}
        <div style={{ fontSize:'0.8rem', color:'#aaa', marginTop:3 }}>
          {likes} me gusta · {dislikes} no me gusta
          {post.total_comentarios > 0 && ` · ${post.total_comentarios} comentarios`}
        </div>
      </div>

      {/* ── Acciones: Like / Dislike / Comentar ────── */}
      <div className="hip-actions">

        {/* 👍 Me gusta */}
        <button className={`btn-like ${myVote === 1 ? 'on' : ''}`}
          onClick={() => handleVote(1)} disabled={loadVote || isOwner} title="Me gusta">
          <i className={`bi ${myVote === 1 ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i>
          <span>{likes}</span>
        </button>

        {/* 👎 No me gusta */}
        <button className={`btn-dislike ${myVote === 0 ? 'on' : ''}`}
          onClick={() => handleVote(0)} disabled={loadVote || isOwner} title="No me gusta">
          <i className={`bi ${myVote === 0 ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'}`}></i>
          <span>{dislikes}</span>
        </button>

        {/* 💬 Comentar */}
        <button className="btn-cmt" onClick={() => navigate(`/post/${post.id}`)} title="Comentar">
          <i className="bi bi-chat-dots"></i>
          <span>Comentar</span>
        </button>

        {/* ↗ Ver */}
        <button className="btn-cmt" onClick={() => navigate(`/post/${post.id}`)}
          style={{ marginLeft:'auto' }} title="Ver publicación">
          <i className="bi bi-arrow-right-circle"></i>
          <span className="d-none d-sm-inline">Ver</span>
        </button>
      </div>
    </div>
  );
}
