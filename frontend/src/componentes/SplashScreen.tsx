import React from 'react';

export default function SplashScreen() {
  return (
    <div className="hip-splash-screen">
      <div className="hip-splash-content">
        <div className="hip-splash-icon">
          <i className="bi bi-camera2"></i>
        </div>
        <h1 className="hip-splash-text">Hipstagram</h1>
      </div>

     
      <style>{`
        /* 1. Definimos una animación fluida que NUNCA excede el tamaño original */
        @keyframes splashFadeZoom {
          0% {
            opacity: 0;
            transform: scale(0.6); /* Empieza al 60% del tamaño (garantiza que quepa en pantalla) */
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(1); /* Termina exactamente en el tamaño definido por el clamp() */
          }
        }

        .hip-splash-screen {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #000;
          overflow: hidden;
        }

        /* 2. Aplicamos la animación al contenedor principal */
        .hip-splash-content {
          text-align: center;
          width: 100%;
          padding: 0 1.5rem;
          /* Ejecuta la animación en 1.5 segundos con un efecto de desaceleración suave */
          animation: splashFadeZoom 1.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; 
        }

        .hip-splash-icon i {
          color: #ffc107;
          font-size: clamp(5rem, 25vw, 10rem); 
          text-shadow: 0 0 30px rgba(255, 193, 7, 0.4);
        }

        .hip-splash-text {
          margin-top: 0.5rem;
          font-weight: 900;
          color: #ffc107;
          letter-spacing: -2px;
          /* La regla de oro que ya habíamos calculado */
          font-size: clamp(2.5rem, 13vw, 7rem); 
          line-height: 1;
        }
      `}</style>
    </div>
  );
}