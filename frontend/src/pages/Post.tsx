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
    if (!post || myVote===tipo) return;
    if (user?.id===post.usuario_id) { showToast('No puedes votar tu propia publicación.','info'); return; }
    const pl=likes,pd=dislikes,pv=myVote;
    if(myVote===null){tipo===1?setLikes(l=>l+1):setDislikes(d=>d+1);}
    else{if(tipo===1){setLikes(l=>l+1);setDislikes(d=>Math.max(0,d-1));}else{setDislikes(d=>d+1);setLikes(l=>Math.max(0,l-1));}}
    setMyVote(tipo);
    try { await votesAPI.vote(post.id, tipo); }
    catch { setLikes(pl);setDislikes(pd);setMyVote(pv);showToast('Error al votar.','error'); }
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
    } catch { showToast('Error al comentar.','error'); }
    finally { setSending(false); }
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
        {post.imagen_url
  ? <img 
      src={`http://localhost:3000${post.imagen_url}`} 
      alt="" 
      className="hip-card-img" 
      style={{ cursor:'default' }}
    />
  : <div className="hip-card-img-ph"><i className="bi bi-image"/></div>
}
        <div className="hip-card-body">
          {post.hashtags?.map(h => (
            <span key={h} className="hip-tag" onClick={() => navigate(`/search?q=${h}&mode=hashtag`)}>{h}</span>
          ))}
          {post.descripcion && <p className="hip-desc mt-1"><span className="fw-semibold">@{post.nombre_usuario}</span> {post.descripcion}</p>}
          <div style={{ fontSize:'0.8rem',color:'#aaa',marginTop:3 }}>{likes} me gusta · {dislikes} no me gusta</div>
        </div>
        <div className="hip-actions">
          <button className={`btn-like ${myVote===1?'on':''}`} onClick={() => handleVote(1)}>
            <i className={`bi ${myVote===1?'bi-hand-thumbs-up-fill':'bi-hand-thumbs-up'}`}></i><span>{likes}</span>
          </button>
          <button className={`btn-dislike ${myVote===0?'on':''}`} onClick={() => handleVote(0)}>
            <i className={`bi ${myVote===0?'bi-hand-thumbs-down-fill':'bi-hand-thumbs-down'}`}></i><span>{dislikes}</span>
          </button>
        </div>

        {/* Comentarios */}
        <div style={{ padding:'0 15px 16px' }}>
          <h6 className="fw-bold mb-3">
            <i className="bi bi-chat-dots me-2"></i>Comentarios ({post.total_comentarios || comments.length})
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
            <div key={c.id} className="hip-cmt">
              <div className="hip-avatar sm" style={{ flexShrink:0 }}>{c.nombre_usuario?.[0]?.toUpperCase()}</div>
              <div>
                <span className="hip-cmt-user me-2">@{c.nombre_usuario}</span>
                <span className="hip-cmt-time">{timeAgo(c.fecha_creacion)}</span>
                <p className="hip-cmt-text mb-0">{c.contenido}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
