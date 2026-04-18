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
      else setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
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
            style={{ borderRadius: 10, fontSize: '0.88rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>{error}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-person me-1" style={{ color: 'var(--hip-yellow)' }}></i>Nombre de usuario
            </label>
            <div className="hip-input-wrap">
              <i className="bi bi-person i-left"></i>
              <input type="text" className="form-control" placeholder="Tu nombre de usuario"
                value={nombreUsuario} onChange={e => { setNombreUsuario(e.target.value); setError(''); }}
                autoComplete="username" disabled={loading} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-envelope me-1" style={{ color: 'var(--hip-yellow)' }}></i>Correo
            </label>
            <div className="hip-input-wrap">
              <i className="bi bi-envelope i-left"></i>
              <input type="email" className="form-control" placeholder="tucorreo@email.com"
                value={correo} onChange={e => { setCorreo(e.target.value); setError(''); }}
                autoComplete="email" disabled={loading} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-lock me-1" style={{ color: 'var(--hip-yellow)' }}></i>Contraseña
            </label>
            <div className="hip-input-wrap">
              <i className="bi bi-lock i-left"></i>
              <input type={showPwd ? 'text' : 'password'} className="form-control"
                placeholder="Tu contraseña" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="new-password" disabled={loading} />
              <button type="button" className="btn-eye" onClick={() => setShowPwd(v => !v)}>
                <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-lock me-1" style={{ color: 'var(--hip-yellow)' }}></i>Confirmar contraseña
            </label>
            <div className="hip-input-wrap">
              <i className="bi bi-lock i-left"></i>
              <input type={showPwd ? 'text' : 'password'} className="form-control"
                placeholder="Confirma tu contraseña" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                autoComplete="new-password" disabled={loading} />
            </div>
          </div>

          <button type="submit" className="hip-btn-main mb-3"
            disabled={!nombreUsuario || !correo || !password || !confirmPassword || loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm"></span>Creando cuenta...</>
              : <><i className="bi bi-person-plus"></i>Crear cuenta</>}
          </button>
        </form>

        <p className="text-center mb-0" style={{ fontSize: '0.9rem', color: 'var(--hip-text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--hip-yellow)', fontWeight: 700 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}