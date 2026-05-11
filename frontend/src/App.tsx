import React, { ReactNode, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider }        from './context/ToastContext';

import LoginPage    from './pages/Login';
import RegisterPage from './pages/Register';
import FeedPage     from './pages/Feed';
import ExplorePage  from './pages/Explore';
import PostPage     from './pages/Post';
import NewPostPage  from './pages/NewPost';
import ProfilePage  from './pages/Perfil';
import SearchPage   from './pages/Buscar';
import AdminPage    from './pages/Admin';
import Navbar       from './componentes/Navbar';
import AnimatedBackground from './componentes/AnimatedBackground';
// 🚀 Importamos el Splash Screen
import SplashScreen       from './componentes/SplashScreen';

const Spinner = () => (
  <div className="hip-spin">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

function Private({ children }: { children: ReactNode }) {
  const { isAuth, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuth)  return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/feed"  replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/feed" replace /> : <>{children}</>;
}

function AppRoutes() {
  const { isAuth } = useAuth();
  
  // 🚀 LÓGICA DE ANIMACIÓN: Leemos si venimos del login
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem('hip_splash') === 'true');

  useEffect(() => {
    if (showSplash) {
      // Borramos la bandera para que no se repita si el usuario presiona F5
      sessionStorage.removeItem('hip_splash');
      const timer = setTimeout(() => setShowSplash(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Si la animación está activa, la mostramos y ocultamos la UI (Navbar y Rutas)
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      {isAuth && <Navbar />}
      <Routes>
        <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/feed"     element={<Private><FeedPage /></Private>} />
        <Route path="/explore"  element={<Private><ExplorePage /></Private>} />
        <Route path="/post/:id" element={<Private><PostPage /></Private>} />
        <Route path="/new"      element={<Private><NewPostPage /></Private>} />
        <Route path="/profile"  element={<Private><ProfilePage /></Private>} />
        <Route path="/search"   element={<Private><SearchPage /></Private>} />
        <Route path="/admin"    element={<AdminOnly><AdminPage /></AdminOnly>} />
        <Route path="/"         element={<Navigate to="/feed" replace />} />
        <Route path="*"         element={<Navigate to="/feed" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AnimatedBackground />
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}