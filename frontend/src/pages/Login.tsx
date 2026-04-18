import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI }  from '../api/clientes';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Usuario }  from '../types';

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
      else if (s === 403) setError('Tu cuenta está desactivada. Contacta al administrador.');
      else setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
    } finally { setLoading(false); }
  }

  return (
    <div className="hip-auth-bg">
      <div className="hip-auth-card">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="hip-logo-icon"><i className="bi bi-camera2"></i></div>
          <h1 className="hip-logo-title">Hipstagram</h1>
          <p className="hip-logo-sub">Comparte tu mundo en imágenes</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3"
            style={{ borderRadius:10, fontSize:'0.88rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>{error}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-envelope me-1" style={{ color:'var(--hip-yellow)' }}></i>Correo
            </label>
            <div className="hip-input-wrap">
              <i className="bi bi-envelope i-left"></i>
              <input type="email" className="form-control" placeholder="tucorreo@email.com"
                value={correo} onChange={e => { setCorreo(e.target.value); setError(''); }}
                autoComplete="email" disabled={loading} />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-lock me-1" style={{ color:'var(--hip-yellow)' }}></i>Contraseña
            </label>
            <div className="hip-input-wrap">
              <i className="bi bi-lock i-left"></i>
              <input type={showPwd?'text':'password'} className="form-control"
                placeholder="Tu contraseña" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password" disabled={loading} />
              <button type="button" className="btn-eye" onClick={() => setShowPwd(v=>!v)}>
                <i className={`bi ${showPwd?'bi-eye-slash':'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="hip-btn-main mb-3"
            disabled={!correo||!password||loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm"></span>Iniciando sesión...</>
              : <><i className="bi bi-box-arrow-in-right"></i>Iniciar sesión</>}
          </button>
        </form>

        <p className="text-center mb-0" style={{ fontSize:'0.9rem', color:'var(--hip-text-muted)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color:'var(--hip-yellow)', fontWeight:700 }}>
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
