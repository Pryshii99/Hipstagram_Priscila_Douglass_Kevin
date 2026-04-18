import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/clientes';
import { useToast } from '../context/ToastContext';
import { Publicacion, Usuario, Auditoria } from '../types';

type Tab = 'posts' | 'users' | 'words' | 'audit';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id:'posts', icon:'bi-image',          label:'Contenido'  },
  { id:'users', icon:'bi-people-fill',    label:'Usuarios'   },
  { id:'words', icon:'bi-slash-circle',   label:'Palabras'   },
  { id:'audit', icon:'bi-clipboard-data', label:'Auditoría'  },
];

export default function AdminPage() {
  const { showToast } = useToast();
  const [tab,     setTab]     = useState<Tab>('posts');
  const [posts,   setPosts]   = useState<Publicacion[]>([]);
  const [users,   setUsers]   = useState<Usuario[]>([]);
  const [audit,   setAudit]   = useState<Auditoria[]>([]);
  const [banned,  setBanned]  = useState('');
  const [filter,  setFilter]  = useState('PENDIENTE');
  const [userQ,   setUserQ]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab==='posts') loadPosts();
    if (tab==='users') loadUsers();
    if (tab==='audit') loadAudit();
    if (tab==='words') loadBanned();
  }, [tab, filter]);

  async function loadPosts() {
    setLoading(true);
    try { const { data } = await adminAPI.getPosts(filter); setPosts(data.posts ?? []); }
    catch { showToast('Error.','error'); }
    finally { setLoading(false); }
  }
  async function loadUsers() {
    setLoading(true);
    try { const { data } = await adminAPI.getUsers(userQ); setUsers(data.users ?? []); }
    catch {showToast('Error.','error');}
    finally { setLoading(false); }
  }
  async function loadAudit() {
    setLoading(true);
    try { const { data } = await adminAPI.getAudit(); setAudit(data.registros ?? []); }
    catch {showToast('Error.','error');}
    finally { setLoading(false); }
  }
  async function loadBanned() {
    try { const { data } = await adminAPI.getBanned(); setBanned(JSON.stringify(data,null,2)); }
    catch { showToast('Error.','error');}
  }
  async function moderate(id: number, action: string) {
    try { await adminAPI.moderatePost(id, action); showToast('Moderado ✓'); loadPosts(); }
    catch { showToast('Error.','error'); }
  }
  async function toggleUser(id: number, activo: boolean) {
    try { await adminAPI.setUserStatus(id, !activo); showToast(`Usuario ${activo?'desactivado':'activado'} ✓`); loadUsers(); }
    catch { showToast('Error.','error'); }
  }
  async function saveBanned() {
    try { JSON.parse(banned); await adminAPI.setBanned(JSON.parse(banned)); showToast('Lista actualizada ✓'); }
    catch { showToast('JSON inválido.','error'); }
  }

  function timeStr(d?: string) { return d ? new Date(d).toLocaleString() : '—'; }

  return (
    <div className="container py-4" style={{ maxWidth:900 }}>
      <h4 className="fw-bold mb-4" style={{ color:'var(--hip-dark)' }}>
        <i className="bi bi-shield-lock-fill me-2"></i>Panel de Administración
      </h4>

      <ul className="nav nav-pills mb-4 gap-2">
        {TABS.map(t => (
          <li key={t.id} className="nav-item">
            <button className={`nav-link ${tab===t.id?'active':''}`}
              style={{ borderRadius:10 }} onClick={() => setTab(t.id)}>
              <i className={`bi ${t.icon} me-2`}></i>{t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ── CONTENIDO ── */}
      {tab==='posts' && (
        <div>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            {(['PENDIENTE','BLOQUEADO','PUBLICADO'] as const).map(s => (
              <button key={s} className={`btn btn-sm rounded-pill ${filter===s?'btn-primary':'btn-outline-secondary'}`}
                onClick={() => setFilter(s)}>
                <i className={`bi ${s==='PENDIENTE'?'bi-hourglass-split':s==='BLOQUEADO'?'bi-slash-circle':'bi-check-circle'} me-1`}></i>
                {s}
              </button>
            ))}
          </div>
          {loading && <div className="hip-spin"><div className="spinner-border text-primary"/></div>}
          {!loading && posts.length===0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-check-all" style={{ fontSize:'2.5rem' }}></i>
              <p className="mt-2">No hay publicaciones con estado {filter}</p>
            </div>
          )}
          {posts.map(p => (
            <div key={p.id} className="hip-card mb-3">
              <div className="hip-card-top">
                <div className="hip-user-row">
                  <div className="hip-avatar">{p.nombre_usuario?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="hip-uname">@{p.nombre_usuario}</div>
                    <div className="hip-utime">#{p.id}</div>
                  </div>
                </div>
                <span className={p.estado==='PUBLICADO'?'b-pub':p.estado==='BLOQUEADO'?'b-bloq':'b-pend'}>
                  {p.estado}
                </span>
              </div>
              {p.imagen_url && <img src={p.imagen_url} alt="" className="hip-card-img" style={{ maxHeight:200 }}/>}
              <div className="hip-card-body">
                {p.descripcion && <p className="hip-desc mb-2">{p.descripcion}</p>}
                <div className="d-flex gap-2 flex-wrap">
                  {filter!=='PUBLICADO' && (
                    <button className="btn btn-sm btn-success rounded-pill" onClick={() => moderate(p.id,'approve')}>
                      <i className="bi bi-check-lg me-1"></i>Aprobar
                    </button>
                  )}
                  <button className="btn btn-sm btn-danger rounded-pill"
                    onClick={() => moderate(p.id, filter==='PUBLICADO'?'block':'reject')}>
                    <i className="bi bi-x-lg me-1"></i>{filter==='PUBLICADO'?'Bloquear':'Rechazar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── USUARIOS ── */}
      {tab==='users' && (
        <div>
          <div className="input-group mb-3">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control" placeholder="Buscar usuario o correo..."
              value={userQ} onChange={e => setUserQ(e.target.value)}
              onKeyDown={e => e.key==='Enter' && loadUsers()} />
            <button className="btn btn-primary" onClick={loadUsers}>Buscar</button>
          </div>
          {loading && <div className="hip-spin"><div className="spinner-border text-primary"/></div>}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><span className="fw-semibold">@{u.nombre_usuario}</span></td>
                    <td><small>{u.correo}</small></td>
                    <td><span className={`badge ${u.rol==='ADMIN'?'bg-danger':'bg-primary'}`}>{u.rol}</span></td>
                    <td>{u.activo ? <span className="b-pub"><i className="bi bi-check-circle me-1"></i>Activo</span>
                                 : <span className="b-bloq"><i className="bi bi-x-circle me-1"></i>Inactivo</span>}</td>
                    <td>
                      <button className={`btn btn-sm rounded-pill ${u.activo?'btn-outline-danger':'btn-outline-success'}`}
                        onClick={() => toggleUser(u.id, u.activo ?? true)}>
                        <i className={`bi ${u.activo?'bi-person-dash':'bi-person-check'} me-1`}></i>
                        {u.activo?'Desactivar':'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && users.length===0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-4">No se encontraron usuarios</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PALABRAS PROHIBIDAS ── */}
      {tab==='words' && (
        <div>
          <p className="text-muted mb-3" style={{ fontSize:'0.9rem' }}>
            <i className="bi bi-info-circle me-1"></i>Filtra hashtags automáticamente. Formato JSON.
          </p>
          <textarea className="form-control mb-3" rows={10}
            style={{ fontFamily:'monospace',fontSize:'0.88rem',borderRadius:12 }}
            value={banned} onChange={e => setBanned(e.target.value)}
            placeholder={'{ "banned": ["spam","nsfw","odio"] }'}/>
          <button className="btn btn-primary rounded-pill px-4" onClick={saveBanned}>
            <i className="bi bi-save me-2"></i>Guardar lista
          </button>
        </div>
      )}

      {/* ── AUDITORÍA ── */}
      {tab==='audit' && (
        <div className="table-responsive">
          {loading && <div className="hip-spin"><div className="spinner-border text-primary"/></div>}
          <table className="table table-hover align-middle" style={{ fontSize:'0.85rem' }}>
            <thead className="table-light">
              <tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Tabla</th><th>IP</th></tr>
            </thead>
            <tbody>
              {audit.map(a => (
                <tr key={a.id}>
                  <td><small>{timeStr(a.fecha_creacion)}</small></td>
                  <td>{a.usuario_id ? `@${a.nombre_usuario ?? a.usuario_id}` : <span className="text-muted">[sistema]</span>}</td>
                  <td><span className="badge bg-secondary">{a.accion}</span></td>
                  <td><small>{a.tabla_afectada ?? '—'}</small></td>
                  <td><small>{a.direccion_ip ?? '—'}</small></td>
                </tr>
              ))}
              {!loading && audit.length===0 && (
                <tr><td colSpan={5} className="text-center text-muted py-4">No hay registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
