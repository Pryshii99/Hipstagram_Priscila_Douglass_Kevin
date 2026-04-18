const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'hipstagram_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 10,                  
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


pool.connect((err, client, release) => {
  if (err) {
    console.error(' Error conectando a PostgreSQL:', err.message);
    console.error('   Verifica tu archivo .env y que PostgreSQL esté corriendo.');
    return;
  }
  release();
  console.log(' PostgreSQL conectado correctamente');
});


async function query(text, params) {
  const start = Date.now();
  const res   = await pool.query(text, params);
  const dur   = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`  🔵 Query (${dur}ms):`, text.substring(0, 60));
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
