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
          <div className="hip-dropdown-menu" onClick={() => setMenu(false)} style={{
            position:'absolute', right:0, top:46,
            borderRadius:12,
            boxShadow:'0 6px 24px rgba(0,0,0,0.5)',
            minWidth:180, zIndex:9999, overflow:'hidden',
          }}>
            <div style={{ padding:'13px 16px', borderBottom:'1px solid #333' }}>
              <div className="user-info" style={{ fontWeight:700, fontSize:'0.9rem' }}>@{user?.nombre_usuario}</div>
              <div className="user-role" style={{ fontSize:'0.76rem' }}>{user?.rol}</div>
            </div>
            {[
              { icon:'bi-person-circle',  label:'Mi perfil',    action: () => navigate('/profile') },
              { icon:'bi-cloud-upload',   label:'Nueva foto',   action: () => navigate('/new') },
            ].map(i => (
              <button key={i.label} className="dropdown-item custom-item d-flex align-items-center gap-2 py-2 px-3"
                onClick={i.action}>
                <i className={`bi ${i.icon}`}></i>{i.label}
              </button>
            ))}
            <div style={{ borderTop:'1px solid #333', margin:'4px 0' }} />
            <button className="dropdown-item text-danger custom-danger d-flex align-items-center gap-2 py-2 px-3"
              onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* BLOQUE DE ESTILOS PARA EL TEMA OSCURO/AMARILLO */}
      <style>{`
        .hip-dropdown-menu {
          background-color: #1a1a1a !important; /* Fondo negro/gris muy oscuro */
          border: 1px solid #ffc107 !important; /* Borde amarillo */
        }
        
        .hip-dropdown-menu .user-info {
          color: #ffc107; /* Nombre de usuario en amarillo */
        }
        
        .hip-dropdown-menu .user-role {
          color: #adb5bd; /* Rol en gris claro para mantener jerarquía visual */
        }
        
        .hip-dropdown-menu .custom-item {
          color: #ffc107 !important; /* Opciones en amarillo */
          transition: background-color 0.2s;
        }
        
        .hip-dropdown-menu .custom-item:hover {
          background-color: #333 !important; /* Fondo ligeramente más claro al pasar el mouse */
          color: #fff !important; /* Letra blanca al hacer hover para destacar */
        }
        
        .hip-dropdown-menu .custom-danger {
          color: #dc3545 !important; /* Rojo estándar de Bootstrap */
          font-weight: 600;
        }
        
        .hip-dropdown-menu .custom-danger:hover {
          background-color: #4a1515 !important; /* Fondo rojizo al hacer hover */
          color: #ff8787 !important;
        }
      `}</style>
    </nav>
  );
}