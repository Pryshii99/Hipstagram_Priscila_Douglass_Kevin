const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  // Aumentamos a 10 segundos porque la conexión a la nube es más lenta que la local
  connectionTimeoutMillis: 10000, 
  // AWS RDS requiere SSL para conexiones cifradas
  ssl: {
    rejectUnauthorized: false
  }
});

// Prueba de conexión mejorada
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error crítico conectando a PostgreSQL en AWS:', err.message);
    console.error('   Si el error es "Connection Timeout", revisa el Security Group de AWS.');
    return;
  }
  console.log('✅ PostgreSQL conectado exitosamente a AWS RDS');
  release();
});

async function query(text, params) {
  const start = Date.now();
  const res   = await pool.query(text, params);
  const dur   = Date.now() - start;
  // Solo loguear en desarrollo para mantener la consola limpia en producción
  if (process.env.NODE_ENV === 'development') {
    console.log(` 🔵 Query (${dur}ms):`, text.substring(0, 60));
  }
  return res;
}

async function audit(usuarioId, accion, tabla, detalles, ip) {
  try {
    await query(
      `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, detalles, direccion_ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuarioId || null, accion, tabla || null,
       detalles ? JSON.stringify(detalles) : null, ip || null]
    );
  } catch (e) {
    console.error('Error en auditoría:', e.message);
  }
}

module.exports = { pool, query, audit };