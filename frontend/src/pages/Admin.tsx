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

  // 🚀 Mejoramos el useEffect para que responda a cambios de pestaña
  useEffect(() => {
    if (tab==='posts') loadPosts();
    if (tab==='users') loadUsers();
    if (tab==='audit') loadAudit();
    if (tab==='words') loadBanned();
  }, [tab, filter]);

  async function loadPosts() {
    setLoading(true);
    try { 
      const response = await adminAPI.getPosts(filter); 
      // Soporte para data.posts o data (si el wrapper ya devuelve el body)
      const data = response.data || response;
      setPosts(data.posts ?? []); 
    }
    catch (err) { console.error(err); showToast('Error al cargar publicaciones.','error'); }
    finally { setLoading(false); }
  }

  async function loadUsers() {
    setLoading(true);
    try { 
      const response = await adminAPI.getUsers(userQ); 
      const data = response.data || response;
      // Buscamos tanto en 'users' como en 'usuarios' (como pusimos en admin.js)
      setUsers(data.users || data.usuarios || []); 
    }
    catch (err) { console.error(err); showToast('Error al cargar usuarios.','error');}
    finally { setLoading(false); }
  }

  async function loadAudit() {
    setLoading(true);
    try { 
      const response = await adminAPI.getAudit(); 
      const data = response.data || response;
      // Buscamos en todas las llaves posibles que configuramos en el backend
      setAudit(data.audit_logs || data.registros || data.auditoria || []); 
    }
    catch (err) { console.error(err); showToast('Error al cargar auditoría.','error');}
    finally { setLoading(false); }
  }

  async function loadBanned() {
    try { 
      const response = await adminAPI.getBanned(); 
      const data = response.data || response;
      setBanned(JSON.stringify(data, null, 2)); 
    }
    catch (err) { console.error(err); showToast('Error al cargar filtro.','error');}
  }

  async function moderate(id: number, action: string) {
    try { 
      await adminAPI.moderatePost(id, action); 
      showToast('Acción realizada ✓'); 
      loadPosts(); 
    }
    catch { showToast('Error al moderar.','error'); }
  }

  async function toggleUser(id: number, activo: boolean) {
    try { 
      await adminAPI.setUserStatus(id, !activo); 
      showToast(`Usuario ${activo?'desactivado':'activado'} ✓`); 
      loadUsers(); 
    }
    catch { showToast('Error al cambiar estado del usuario.','error'); }
  }

  async function saveBanned() {
    try { 
      const json = JSON.parse(banned); 
      await adminAPI.setBanned(json); 
      showToast('Lista actualizada ✓'); 
    }
    catch { showToast('JSON inválido.','error'); }
  }

  function timeStr(d?: string) { return d ? new Date(d).toLocaleString() : '—'; }

  return (
    <div className="container py-4" style={{ maxWidth:900 }}>
      {/* Título en color amarillo */}
      <h4 className="fw-bold mb-4" style={{ color:'#ffc107' }}>
        <i className="bi bi-shield-lock-fill me-2"></i>Panel de Administración
      </h4>

      {/* Navegación principal con clase personalizada 'admin-tabs' */}
      <ul className="nav nav-pills mb-4 gap-2 admin-tabs">
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
              <button key={s} 
                className={`btn btn-sm rounded-pill custom-filter-btn ${filter===s?'active':''}`}
                onClick={() => setFilter(s)}>
                <i className={`bi ${s==='PENDIENTE'?'bi-hourglass-split':s==='BLOQUEADO'?'bi-slash-circle':'bi-check-circle'} me-1`}></i>
                {s}
              </button>
            ))}
          </div>
          {loading && <div className="hip-spin"><div className="spinner-border text-warning"/></div>}
          {!loading && posts.length===0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-check-all" style={{ fontSize:'2.5rem' }}></i>
              <p className="mt-2" style={{ color: '#adb5bd' }}>No hay publicaciones con estado {filter}</p>
            </div>
          )}
          {posts.map(p => (
            <div key={p.id} className="hip-card mb-3" style={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}>
              <div className="hip-card-top">
                <div className="hip-user-row">
                  <div className="hip-avatar" style={{ backgroundColor: '#ffc107', color: '#000' }}>{p.nombre_usuario?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="hip-uname" style={{ color: '#ffc107' }}>@{p.nombre_usuario}</div>
                    <div className="hip-utime">#{p.id}</div>
                  </div>
                </div>
                <span className={p.estado==='PUBLICADO'?'b-pub':p.estado==='BLOQUEADO'?'b-bloq':'b-pend'}>
                  {p.estado}
                </span>
              </div>
              {p.imagen_url && <img src={p.imagen_url} alt="" className="hip-card-img" style={{ maxHeight:200 }}/>}
              <div className="hip-card-body">
                {p.descripcion && <p className="hip-desc mb-2" style={{ color: '#fff' }}>{p.descripcion}</p>}
                <div className="d-flex gap-2 flex-wrap">
                  {p.estado !== 'PUBLICADO' && (
                    <button className="btn btn-sm btn-success rounded-pill" onClick={() => moderate(p.id,'approve')}>
                      <i className="bi bi-check-lg me-1"></i>Aprobar
                    </button>
                  )}
                  <button className="btn btn-sm btn-danger rounded-pill"
                    onClick={() => moderate(p.id, p.estado==='PUBLICADO'?'block':'reject')}>
                    <i className="bi bi-x-lg me-1"></i>{p.estado==='PUBLICADO'?'Bloquear':'Rechazar'}
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
            <span className="input-group-text bg-dark border-secondary text-warning"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="Buscar usuario o correo..."
              value={userQ} onChange={e => setUserQ(e.target.value)}
              onKeyDown={e => e.key==='Enter' && loadUsers()} />
            {/* Botón de búsqueda en amarillo */}
            <button className="btn btn-warning fw-bold" onClick={loadUsers}>Buscar</button>
          </div>
          {loading && <div className="hip-spin"><div className="spinner-border text-warning"/></div>}
          <div className="table-responsive">
            {/* Tabla adaptada a tema oscuro */}
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr><th className="text-warning">Usuario</th><th className="text-warning">Correo</th><th className="text-warning">Rol</th><th className="text-warning">Estado</th><th className="text-warning">Acción</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><span className="fw-semibold">@{u.nombre_usuario}</span></td>
                    <td><small className="text-light">{u.correo}</small></td>
                    <td><span className={`badge ${u.rol==='ADMIN'?'bg-danger':'bg-warning text-dark'}`}>{u.rol}</span></td>
                    <td>{u.activo ? <span className="text-success"><i className="bi bi-check-circle me-1"></i>Activo</span>
                                  : <span className="text-danger"><i className="bi bi-x-circle me-1"></i>Inactivo</span>}</td>
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
          <p className="text-muted mb-3" style={{ fontSize:'0.9rem', color: '#adb5bd' }}>
            <i className="bi bi-info-circle me-1 text-warning"></i>Filtra hashtags automáticamente. Formato JSON.
          </p>
          <textarea className="form-control bg-dark text-white border-secondary mb-3" rows={10}
            style={{ fontFamily:'monospace',fontSize:'0.88rem',borderRadius:12 }}
            value={banned} onChange={e => setBanned(e.target.value)}
            placeholder={'{ "banned": ["spam","nsfw","odio"] }'}/>
          {/* Botón guardar en amarillo */}
          <button className="btn btn-warning rounded-pill px-4 fw-bold" onClick={saveBanned}>
            <i className="bi bi-save me-2"></i>Guardar lista
          </button>
        </div>
      )}

      {/* ── AUDITORÍA ── */}
      {tab==='audit' && (
        <div className="table-responsive">
          {loading && <div className="hip-spin"><div className="spinner-border text-warning"/></div>}
          <table className="table table-dark table-hover align-middle" style={{ fontSize:'0.85rem' }}>
            <thead>
              <tr><th className="text-warning">Fecha</th><th className="text-warning">Usuario</th><th className="text-warning">Acción</th><th className="text-warning">Tabla</th><th className="text-warning">IP</th></tr>
            </thead>
            <tbody>
              {audit.map(a => (
                <tr key={a.id}>
                  <td><small className="text-light">{timeStr(a.fecha_creacion)}</small></td>
                  <td>{a.nombre_usuario ? <span className="fw-semibold">@{a.nombre_usuario}</span> : <span className="text-muted">[sistema]</span>}</td>
                  <td><span className="badge bg-secondary border border-warning text-warning">{a.accion}</span></td>
                  <td><small className="text-light">{a.tabla_afectada ?? '—'}</small></td>
                  <td><small className="text-light">{a.direccion_ip ?? '—'}</small></td>
                </tr>
              ))}
              {!loading && audit.length===0 && (
                <tr><td colSpan={5} className="text-center text-muted py-4">No hay registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ESTILOS PERSONALIZADOS TEMA OSCURO/AMARILLO */}
      <style>{`
        /* Pestañas Principales (Nav-pills) */
        .admin-tabs .nav-link {
          color: #ffc107; /* Texto amarillo por defecto */
          background-color: transparent;
          transition: all 0.2s ease-in-out;
        }
        .admin-tabs .nav-link:hover {
          background-color: rgba(255, 193, 7, 0.1); /* Fondo ligero amarillo al hover */
        }
        .admin-tabs .nav-link.active {
          background-color: #ffc107 !important; /* Fondo amarillo activo */
          color: #000 !important; /* Texto negro para contraste */
          font-weight: 700;
        }

        /* Botones de Filtro (Pendiente, Bloqueado, Publicado) */
        .custom-filter-btn {
          color: #ffc107;
          border: 1px solid #ffc107;
          background-color: transparent;
        }
        .custom-filter-btn:hover {
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }
        .custom-filter-btn.active {
          background-color: #ffc107 !important;
          color: #000 !important;
          font-weight: 700;
          border-color: #ffc107;
        }

        /* Ajustes menores para inputs y placeholders en modo oscuro */
        .form-control::placeholder {
          color: #6c757d;
        }
        .form-control:focus {
          background-color: #212529;
          color: #fff;
          border-color: #ffc107;
          box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25);
        }
      `}</style>
    </div>
  );
}