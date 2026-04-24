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
  const [expanded, setExpanded] = useState(false);
  
  // 🚀 ESTADO PARA EL MODAL DE CONFIRMACIÓN 🚀
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const active = (p: string) => location.pathname === p ? 'active' : '';

  async function handleLogout() {
    try { await authAPI.logout(); } catch {}
    logout();
    showToast('¡Hasta pronto! 👋', 'info');
    navigate('/login');
  }

  const ini = user?.nombre_usuario?.[0]?.toUpperCase() ?? '?';
  
  const rawName = (user as any)?.nombre || user?.nombre_usuario || 'Perfil';
  const firstName = rawName.split(' ')[0];

  return (
    <>
      <nav className={`hip-sidebar ${expanded ? 'expanded' : ''}`}>
        
        {/* --- LOGO Y BOTÓN DE EXPANSIÓN --- */}
        <div className="sidebar-brand mb-4 d-none d-md-flex align-items-center" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
           <i className="bi bi-camera-fill text-warning fs-2 hip-logo-glow"></i>
           {expanded && <span className="text-warning fw-bold fs-4 ms-3 hip-logo-glow" style={{letterSpacing: '-1px'}}>Hipstagram</span>}
        </div>

        {/* --- LINKS DE NAVEGACIÓN --- */}
        <div className="sidebar-nav-links flex-grow-1">
          {[
            { path:'/feed',    icon:'bi-house-door',       iconFill:'bi-house-door-fill',       label:'Inicio'   },
            { path:'/explore', icon:'bi-compass',          iconFill:'bi-compass-fill',          label:'Explorar' },
            { path:'/new',     icon:'bi-plus-square',      iconFill:'bi-plus-square-fill',      label:'Publicar' },
            { path:'/search',  icon:'bi-search',           iconFill:'bi-search',                label:'Buscar'   },
          ].map(n => (
            <div key={n.path} className={`nav-item-container ${active(n.path)}`} onClick={() => navigate(n.path)}>
              <i className={`bi ${location.pathname === n.path ? n.iconFill : n.icon}`}></i>
              {expanded && <span className="nav-label">{n.label}</span>}
            </div>
          ))}

          {isAdmin && (
            <div className={`nav-item-container ${active('/admin')}`} onClick={() => navigate('/admin')}>
              <i className={`bi ${location.pathname === '/admin' ? 'bi-shield-lock-fill' : 'bi-shield-lock'}`}></i>
              {expanded && <span className="nav-label">Admin</span>}
            </div>
          )}
        </div>

        {/* --- ÁREA DEL USUARIO Y CERRAR SESIÓN --- */}
        <div className="sidebar-footer">
          <div className={`nav-item-container ${active('/profile')}`} onClick={() => navigate('/profile')}>
             <div style={{ minWidth: '30px', display: 'flex', justifyContent: 'center' }}>
               <div className="d-flex justify-content-center align-items-center rounded-circle bg-warning text-dark fw-bold" style={{ width: 28, height: 28, fontSize: '0.9rem' }}>
                  {ini}
               </div>
             </div>
             {expanded && <span className="nav-label ms-1">{firstName}</span>}
          </div>

          {/* 🚀 AHORA ABRE EL MODAL EN LUGAR DE CERRAR DIRECTO 🚀 */}
          <div className="nav-item-container logout-btn mt-2" onClick={() => setShowLogoutModal(true)}>
             <i className="bi bi-box-arrow-right"></i>
             {expanded && <span className="nav-label">Cerrar sesión</span>}
          </div>
        </div>
      </nav>

      {/* 🚀 MODAL DE CONFIRMACIÓN 🚀 */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
            <h4 className="fw-bold text-white">¿Cerrar sesión?</h4>
            <p className="text-secondary">Tendrás que ingresar tus credenciales nuevamente para acceder a tu cuenta.</p>
            
            <div className="d-flex flex-column gap-2 w-100 mt-3">
              <button className="btn btn-danger fw-bold rounded-pill" onClick={handleLogout}>
                Cerrar sesión
              </button>
              <button className="btn btn-outline-secondary fw-bold rounded-pill" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --sidebar-collapsed-width: 80px;
          --sidebar-expanded-width: 250px;
          --sidebar-bg: #121212; 
          --sidebar-border: #333;
          --accent-color: #ffc107; 
        }

        /* --- ESTILOS DEL MODAL --- */
        .logout-modal-overlay {
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

        .logout-modal-content {
          background: #1a1a1a;
          border: 1px solid var(--accent-color);
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          max-width: 350px;
          width: 90%;
          box-shadow: 0 0 30px rgba(255, 193, 7, 0.2);
        }

        .hip-logo-glow {
          text-shadow: 0 0 10px rgba(255, 193, 7, 0.6), 0 0 20px rgba(255, 193, 7, 0.4);
        }

        .logout-btn { color: #dc3545 !important; }
        .logout-btn:hover {
          background-color: rgba(220, 53, 69, 0.1) !important;
          border-color: #dc3545 !important;
        }

       @media (min-width: 769px) {
          .hip-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: var(--sidebar-collapsed-width);
            
            /* 🚀 EFECTO GLASSMORPHISM AQUÍ 🚀 */
            background-color: rgba(18, 18, 18, 0.4); /* Negro transparente */
            backdrop-filter: blur(12px) saturate(160%); /* Desenfoque esmerilado */
            -webkit-backdrop-filter: blur(12px) saturate(160%); /* Soporte Safari */
            
            /* Borde brillante más sutil para simular el canto del cristal */
            border-right: 1px solid rgba(255, 193, 7, 0.3); 
            
            padding: 20px 10px;
            display: flex;
            flex-direction: column;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
          }

          .hip-sidebar.expanded {
            width: var(--sidebar-expanded-width);
            padding: 20px 10px;
          }

          .sidebar-brand { justify-content: center; width: 100%; }
          .hip-sidebar.expanded .sidebar-brand { justify-content: flex-start; padding-left: 16px; }

          .nav-item-container {
            display: flex;
            align-items: center;
            padding: 10px;
            margin: 6px 4px; 
            border-radius: 10px; 
            cursor: pointer;
            color: #d1d5db; 
            border: 1px solid transparent; 
            transition: all 0.2s ease-in-out;
            justify-content: center; 
          }

          .hip-sidebar.expanded .nav-item-container { justify-content: flex-start; padding-left: 16px; }

          .nav-item-container:hover,
          .nav-item-container.active {
            color: var(--accent-color);
            background-color: rgba(255, 193, 7, 0.08); 
            border: 1px solid var(--accent-color); 
          }

          .logout-btn.active {
            border-color: #dc3545 !important;
            background-color: rgba(220, 53, 69, 0.1) !important;
          }

          .nav-item-container:active { transform: scale(0.96); }

          .nav-item-container i {
            font-size: 1.5rem;
            min-width: 30px; 
            text-align: center;
          }

          .nav-label {
            margin-left: 12px;
            font-size: 1.05rem;
            white-space: nowrap;
            text-transform: capitalize; 
            animation: fadeIn 0.3s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }

        @media (max-width: 768px) {
          .hip-sidebar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px;
            background-color: rgba(18, 18, 18, 0.6); 
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            
            border-top: 1px solid rgba(255, 193, 7, 0.3);
            border-top: 2px solid var(--accent-color); 
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 0;
            z-index: 1000;
          }

          .sidebar-nav-links, .sidebar-footer { display: contents; }

          .nav-item-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6px;
            margin: 2px;
            border-radius: 8px;
            color: #d1d5db; 
            cursor: pointer;
            flex-grow: 1;
            transition: all 0.2s;
          }

          .nav-item-container:hover, .nav-item-container.active { color: var(--accent-color); background-color: rgba(255, 193, 7, 0.08); }
          .nav-item-container i { font-size: 1.5rem; }
          .nav-label, .sidebar-brand { display: none !important; }
        }
      `}</style>
    </>
  );
}