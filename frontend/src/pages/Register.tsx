import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/clientes';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombreUsuario || !correo || !password || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nombreUsuario.length < 3 || nombreUsuario.length > 50) {
      setError('El nombre de usuario debe tener entre 3 y 50 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('El correo no tiene un formato válido.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.register({ nombre_usuario: nombreUsuario, correo, password });
      showToast('¡Cuenta creada exitosamente! Ahora inicia sesión. 🎉');
      navigate('/login');
    } catch (err: any) {
      const s = err.response?.status;
      if (s === 409) setError('El correo o nombre de usuario ya están en uso.');
      else setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hip-auth-bg">
   
      <div className="yellow-sparkle s1"></div>
      <div className="yellow-sparkle s2"></div>
      <div className="yellow-sparkle s3"></div>

      <div className="hip-auth-card">
        {/* Logo con Resplandor Neón */}
        <div className="text-center mb-4">
          <div className="hip-logo-icon hip-logo-glow"><i className="bi bi-camera2"></i></div>
          <h1 className="hip-logo-title hip-logo-glow">Hipstagram</h1>
          <p className="hip-logo-sub text-white-50">Comparte tu mundo en imágenes</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3"
            style={{ borderRadius: 10, fontSize: '0.88rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>{error}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-3 text-start">
            <label className="form-label fw-semibold text-white-50">Nombre de usuario</label>
            <div className="hip-input-wrap">
              <i className="bi bi-person i-left"></i>
              <input type="text" className="form-control" placeholder="Tu nombre de usuario"
                value={nombreUsuario} onChange={e => { setNombreUsuario(e.target.value); setError(''); }}
                autoComplete="username" disabled={loading} />
            </div>
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-semibold text-white-50">Correo electrónico</label>
            <div className="hip-input-wrap">
              <i className="bi bi-envelope i-left"></i>
              <input type="email" className="form-control" placeholder="tucorreo@email.com"
                value={correo} onChange={e => { setCorreo(e.target.value); setError(''); }}
                autoComplete="email" disabled={loading} />
            </div>
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-semibold text-white-50">Contraseña</label>
            <div className="hip-input-wrap">
              <i className="bi bi-lock i-left"></i>
              <input type={showPwd ? 'text' : 'password'} className="form-control"
                placeholder="Mínimo 8 caracteres" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="new-password" disabled={loading} />
              <button type="button" className="btn-eye" onClick={() => setShowPwd(v => !v)}>
                <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-4 text-start">
            <label className="form-label fw-semibold text-white-50">Confirmar contraseña</label>
            <div className="hip-input-wrap">
              <i className="bi bi-lock i-left"></i>
              <input type={showPwd ? 'text' : 'password'} className="form-control"
                placeholder="Repite tu contraseña" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                autoComplete="new-password" disabled={loading} />
            </div>
          </div>

          <button type="submit" className="hip-btn-main mb-3"
            disabled={!nombreUsuario || !correo || !password || !confirmPassword || loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center mb-0 text-white-50" style={{ fontSize: '0.9rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="fw-bold" style={{ color: 'var(--hip-yellow)' }}>
            Inicia sesión
          </Link>
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
          max-width: 440px; /* Un poco más ancho para el registro */
          padding: 40px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 193, 7, 0.25);
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
          text-align: center;
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