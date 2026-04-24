import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/clientes';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Usuario } from '../types';

export default function LoginPage() {
  const { login }     = useAuth();
  const { showToast } = useToast();
  const navigate      = useNavigate();

  const [correo,   setCorreo]   = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!correo || !password) { setError('Completa todos los campos.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await authAPI.login({ correo, password });
      login(data.user as Usuario, data.accessToken as string);
      showToast(`¡Bienvenido/a, @${(data.user as Usuario).nombre_usuario}! 🎉`);
      navigate((data.user as Usuario).rol === 'ADMIN' ? '/admin' : '/feed');
    } catch (err: any) {
      const s = err.response?.status;
      if (s === 401) setError('Correo o contraseña incorrectos.');
      else if (s === 403) setError('Tu cuenta está desactivada.');
      else setError('Error de conexión.');
    } finally { setLoading(false); }
  }

  return (
    <div className="hip-auth-bg">
      
      <div className="yellow-sparkle s1"></div>
      <div className="yellow-sparkle s2"></div>
      <div className="yellow-sparkle s3"></div>

      <div className="hip-auth-card">
        <div className="text-center mb-4">
          <div className="hip-logo-icon hip-logo-glow"><i className="bi bi-camera2"></i></div>
          <h1 className="hip-logo-title hip-logo-glow">Hipstagram</h1>
          <p className="hip-logo-sub text-white-50">Comparte tu mundo en imágenes</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-3 d-flex align-items-center gap-2" style={{ borderRadius:10, fontSize:'0.88rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>{error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-semibold text-white-50">Correo electrónico</label>
            <div className="hip-input-wrap">
              <i className="bi bi-envelope i-left"></i>
              <input type="email" className="form-control" placeholder="tucorreo@email.com"
                value={correo} onChange={e => setCorreo(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="mb-4 text-start">
            <label className="form-label fw-semibold text-white-50">Contraseña</label>
            <div className="hip-input-wrap">
              <i className="bi bi-lock i-left"></i>
              <input type={showPwd?'text':'password'} className="form-control"
                placeholder="Tu contraseña" value={password}
                onChange={e => setPassword(e.target.value)} disabled={loading} />
              <button type="button" className="btn-eye" onClick={() => setShowPwd(!showPwd)}>
                <i className={`bi ${showPwd?'bi-eye-slash':'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="hip-btn-main mb-3" disabled={!correo||!password||loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center mb-0 text-white-50" style={{ fontSize:'0.9rem' }}>
          ¿No tienes cuenta? <Link to="/register" className="fw-bold" style={{ color:'var(--hip-yellow)' }}>Regístrate gratis</Link>
        </p>
      </div>

      <style>{`
        .hip-auth-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          position: relative;
          overflow: hidden;
        }

        .hip-logo-glow {
          color: var(--hip-yellow) !important;
          text-shadow: 0 0 10px rgba(255, 193, 7, 0.7), 
                       0 0 20px rgba(255, 193, 7, 0.5);
        }

        /* 🚀 AJUSTE FINAL: Velocidad 6.9s | Intensidad 0.65 🚀 */
        .yellow-sparkle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,193,7,0.65) 0%, rgba(255,193,7,0) 70%);
          filter: blur(50px);
          animation: float 6.9s infinite ease-in-out;
          z-index: 1;
        }
        .s1 { width: 320px; height: 320px; top: -5%; left: -10%; }
        .s2 { width: 480px; height: 480px; bottom: -10%; right: -5%; animation-delay: -1.2s; }
        .s3 { width: 300px; height: 300px; top: 35%; right: 15%; animation-delay: -3s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(50px, -70px) scale(1.35); opacity: 1.0; }
        }

        .hip-auth-card {
          position: relative;
          z-index: 10;
          width: 92%;
          max-width: 420px;
          padding: 45px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 193, 7, 0.25);
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
        }

        .hip-btn-main {
          background: var(--hip-yellow) !important;
          color: #000 !important;
          font-weight: bold;
          border-radius: 14px;
          padding: 12px;
          width: 100%;
          border: none;
          transition: all 0.3s ease;
        }

        .hip-btn-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(255, 193, 7, 0.65), 0 0 50px rgba(255, 193, 7, 0.25);
          filter: brightness(1.1);
        }

        .hip-input-wrap .form-control {
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: white !important;
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}