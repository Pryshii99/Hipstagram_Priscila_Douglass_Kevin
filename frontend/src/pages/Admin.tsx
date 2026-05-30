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
  
  // Estados para filtros
  const [filter,  setFilter]  = useState('PENDIENTE');
  const [userQ,   setUserQ]   = useState('');
  
  // Estados para la paginación de publicaciones
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Estados para los filtros de Auditoría
  const [auditQ, setAuditQ] = useState('');
  const [auditAction, setAuditAction] = useState('ALL');
  const [auditTable, setAuditTable] = useState('ALL');

  // 🚀 NUEVO: Estados para la paginación de Auditoría
  const [auditPage, setAuditPage] = useState(1);
  const [auditHasMore, setAuditHasMore] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'posts') {
      setPage(1);
      setHasMore(true);
      setPosts([]); 
      loadPosts(1, filter);
    }
    if (tab === 'users') loadUsers();
    if (tab === 'audit') {
      // 🚀 Reiniciamos paginación al entrar a la tab de auditoría o cambiar filtros select
      setAuditPage(1);
      setAuditHasMore(true);
      setAudit([]);
      loadAudit(1);
    }
    if (tab === 'words') loadBanned();
  }, [tab, filter, auditAction, auditTable]);

  async function loadPosts(pageNum = 1, currentFilter = filter) {
    setLoading(true);
    try { 
      const response = await adminAPI.getPosts(currentFilter, pageNum); 
      const data = response.data || response;
      const newPosts = data.posts ?? [];
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 9); 
    }
    catch (err) { console.error(err); showToast('Error al cargar publicaciones.','error'); }
    finally { setLoading(false); }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, filter);
  };

  async function loadUsers() {
    setLoading(true);
    try { 
      const response = await adminAPI.getUsers(userQ); 
      const data = response.data || response;
      setUsers(data.users || data.usuarios || []); 
    }
    catch (err) { console.error(err); showToast('Error al cargar usuarios.','error');}
    finally { setLoading(false); }
  }

  // 🚀 ACTUALIZADO: Función adaptada para paginar de 25 en 25
  async function loadAudit(pageNum = 1) {
    setLoading(true);
    try { 
      const params = {
        q: auditQ || undefined,
        action: auditAction === 'ALL' ? undefined : auditAction,
        table: auditTable === 'ALL' ? undefined : auditTable,
        page: pageNum // Pasamos la página actual
      };

      const response = await adminAPI.getAudit(params); 
      const data = response.data || response;
      const newAudit = data.audit_logs || data.registros || data.auditoria || []; 

      if (pageNum === 1) {
        setAudit(newAudit);
      } else {
        setAudit(prev => [...prev, ...newAudit]);
      }

      setAuditHasMore(newAudit.length === 25); 
    }
    catch (err) { console.error(err); showToast('Error al cargar auditoría.','error');}
    finally { setLoading(false); }
  }

  // 🚀 NUEVO: Función para el botón Cargar Más de Auditoría
  const handleAuditLoadMore = () => {
    const nextPage = auditPage + 1;
    setAuditPage(nextPage);
    loadAudit(nextPage);
  };

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
      setPage(1);
      setHasMore(true);
      setPosts([]);
      loadPosts(1, filter); 
    }
    catch { showToast('Error al moderar.','error'); }
  }

  async function handleSetUserStatus(id: number, activate: boolean) {
    if (!activate) {
      const confirmacion = window.confirm("¿Está seguro de desactivar a este usuario?");
      if (!confirmacion) return; 
    }

    try { 
      await adminAPI.setUserStatus(id, activate); 
      showToast(`Usuario ${activate ? 'activado' : 'desactivado'} ✓`); 
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
    <div className="container py-4" style={{ maxWidth:1000 }}>
      <h4 className="fw-bold mb-4" style={{ color:'#ffc107' }}>
        <i className="bi bi-shield-lock-fill me-2"></i>Panel de Administración
      </h4>

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

          {loading && posts.length === 0 && <div className="hip-spin"><div className="spinner-border text-warning"/></div>}
          
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

          {posts.length > 0 && hasMore && (
            <div className="text-center mt-4 mb-5">
              <button 
                className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" 
                onClick={handleLoadMore}
                disabled={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando...</>
                ) : (
                  'Cargar más'
                )}
              </button>
            </div>
          )}
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
            <button className="btn btn-warning fw-bold" onClick={loadUsers}>Buscar</button>
          </div>
          {loading && <div className="hip-spin"><div className="spinner-border text-warning"/></div>}
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th className="text-warning">Usuario</th>
                  <th className="text-warning">Correo</th>
                  <th className="text-warning">Rol</th>
                  <th className="text-warning">Estado</th>
                  <th className="text-warning text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isActive = (u as any).estado === 'Activo';

                  return (
                    <tr key={u.id}>
                      <td><span className="fw-semibold">@{u.nombre_usuario}</span></td>
                      <td><small className="text-light">{u.correo}</small></td>
                      <td><span className={`badge ${u.rol==='ADMIN'?'bg-danger':'bg-warning text-dark'}`}>{u.rol}</span></td>
                      
                      <td>
                        {isActive ? (
                          <span className="text-success"><i className="bi bi-check-circle me-1"></i>Activo</span>
                        ) : (
                          <span className="text-danger"><i className="bi bi-x-circle me-1"></i>Inactivo</span>
                        )}
                      </td>

                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button 
                            className={`btn btn-sm rounded-pill ${!isActive ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => handleSetUserStatus(u.id, true)}
                            disabled={isActive}
                          >
                            <i className="bi bi-person-check me-1"></i>Activar
                          </button>
                          
                          <button 
                            className={`btn btn-sm rounded-pill ${isActive ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleSetUserStatus(u.id, false)}
                            disabled={!isActive}
                          >
                            <i className="bi bi-person-dash me-1"></i>Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          <button className="btn btn-warning rounded-pill px-4 fw-bold" onClick={saveBanned}>
            <i className="bi bi-save me-2"></i>Guardar lista
          </button>
        </div>
      )}

      {/* ── AUDITORÍA ── */}
      {tab==='audit' && (
        <div>
          <div className="hip-card p-3 mb-4" style={{ border: '1px solid var(--hip-border)', borderRadius: '15px', background: 'var(--hip-dark2)' }}>
            <div className="row g-3 align-items-end">
              
              <div className="col-md-5">
                <label className="form-label fw-bold" style={{ fontSize: '0.8rem', color: 'var(--hip-yellow)', letterSpacing: '1px' }}>
                  <i className="bi bi-search me-2"></i>BÚSQUEDA RÁPIDA
                </label>
                <div className="hip-input-wrap">
                  <i className="bi bi-person-badge i-left"></i>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Usuario (ej. Sebastian) o IP..." 
                    value={auditQ} 
                    onChange={(e) => setAuditQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // 🚀 Reinicia paginación si el admin usa la barra de búsqueda libre
                        setAuditPage(1);
                        setAuditHasMore(true);
                        setAudit([]);
                        loadAudit(1);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold" style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '1px' }}>
                  FILTRAR POR ACCIÓN
                </label>
                <select 
                  className="form-control" 
                  style={{ cursor: 'pointer', appearance: 'auto' }}
                  value={auditAction} 
                  onChange={(e) => setAuditAction(e.target.value)}
                >
                  <option value="ALL">Todas las acciones</option>
                  <option value="AUTH">Autenticación (Login/Logout)</option>
                  <option value="POSTS">Publicaciones</option>
                  <option value="MODERATION">Moderación (Aprobar/Bloquear)</option>
                  <option value="INTERACTION">Interacciones (Votos/Comentarios)</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold" style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '1px' }}>
                  FILTRAR POR TABLA
                </label>
                <select 
                  className="form-control" 
                  style={{ cursor: 'pointer', appearance: 'auto' }}
                  value={auditTable} 
                  onChange={(e) => setAuditTable(e.target.value)}
                >
                  <option value="ALL">Todas las tablas</option>
                  <option value="usuarios">Usuarios</option>
                  <option value="publicacion">Publicación</option>
                  <option value="comentarios">Comentarios</option>
                  <option value="votos">Votos</option>
                </select>
              </div>

            </div>
          </div>

          <div className="table-responsive">
            {loading && audit.length === 0 && <div className="hip-spin"><div className="spinner-border text-warning"/></div>}
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

          {/* 🚀 BOTÓN CARGAR MÁS PARA LA AUDITORÍA 🚀 */}
          {audit.length > 0 && auditHasMore && (
            <div className="text-center mt-4 mb-5">
              <button 
                className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" 
                onClick={handleAuditLoadMore}
                disabled={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando...</>
                ) : (
                  'Cargar más'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ESTILOS PERSONALIZADOS TEMA OSCURO/AMARILLO */}
      <style>{`
        .admin-tabs .nav-link {
          color: #ffc107; 
          background-color: transparent;
          transition: all 0.2s ease-in-out;
        }
        .admin-tabs .nav-link:hover {
          background-color: rgba(255, 193, 7, 0.1); 
        }
        .admin-tabs .nav-link.active {
          background-color: #ffc107 !important; 
          color: #000 !important; 
          font-weight: 700;
        }
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