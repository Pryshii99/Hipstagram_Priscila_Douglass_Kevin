import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI }  from '../api/clientes';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menu, setMenu] = useState(false);

  const active = (p: string) => location.pathname === p ? 'active' : '';

  async function handleLogout() {
    try { await authAPI.logout(); } catch {}
    logout();
    showToast('¡Hasta pronto! 👋', 'info');
    navigate('/login');
  }

  const ini = user?.nombre_usuario?.[0]?.toUpperCase() ?? '?';

  return (
    <nav className="hip-navbar">
      <span className="hip-brand" onClick={() => navigate('/feed')}>
        <i className="bi bi-camera-fill"></i> Hipstagram
      </span>

      <div className="hip-nav-links">
        {[
          { path:'/feed',    icon:'bi-house-door-fill',   label:'Inicio'   },
          { path:'/explore', icon:'bi-compass-fill',       label:'Explorar' },
          { path:'/new',     icon:'bi-plus-square-fill',   label:'Publicar' },
          { path:'/search',  icon:'bi-search',             label:'Buscar'   },
        ].map(n => (
          <button key={n.path} className={`hip-nav-btn ${active(n.path)}`}
            onClick={() => navigate(n.path)}>
            <i className={`bi ${n.icon}`}></i>
            <span className="d-none d-md-inline">{n.label}</span>
          </button>
        ))}

        {isAdmin && (
          <button className={`hip-nav-btn ${active('/admin')}`}
            onClick={() => navigate('/admin')}>
            <i className="bi bi-shield-lock-fill"></i>
            <span className="d-none d-md-inline">Admin</span>
          </button>
        )}
      </div>


      <div style={{ position:'relative' }}>
        <div className="hip-nav-avatar" onClick={() => setMenu(o => !o)}>
          {ini}
        </div>

        {menu && (
          <div onClick={() => setMenu(false)} style={{
            position:'absolute', right:0, top:46,
            background:'#fff', borderRadius:12,
            boxShadow:'0 6px 24px rgba(0,0,0,0.15)',
            minWidth:180, zIndex:9999, overflow:'hidden',
          }}>
            <div style={{ padding:'13px 16px', background:'#fafbfc', borderBottom:'1px solid #f0f0f0' }}>
              <div style={{ fontWeight:700, fontSize:'0.9rem' }}>@{user?.nombre_usuario}</div>
              <div style={{ fontSize:'0.76rem', color:'#999' }}>{user?.rol}</div>
            </div>
            {[
              { icon:'bi-person-circle',  label:'Mi perfil',    action: () => navigate('/profile') },
              { icon:'bi-cloud-upload',   label:'Nueva foto',   action: () => navigate('/new') },
            ].map(i => (
              <button key={i.label} className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                onClick={i.action}>
                <i className={`bi ${i.icon}`}></i>{i.label}
              </button>
            ))}
            <div style={{ borderTop:'1px solid #f0f0f0', margin:'4px 0' }} />
            <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger"
              onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
