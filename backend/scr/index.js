require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');
const rateLimit    = require('express-rate-limit');

const authRoutes  = require('./routes/auth');
const postRoutes  = require('./routes/posts');
const userRoutes  = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin:      ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true, 
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max:      100,
  message:  { error: 'Demasiadas solicitudes. Espera un momento.' }
}));


app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/users', userRoutes);


app.use('/api/v1/admin', userRoutes);


app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo supera el tamaño máximo de 5 MB.' });
  }
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// ── Iniciar servidor ──
app.listen(PORT, () => {
  console.log(`\n Hipstagram Backend corriendo en http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API base:     http://localhost:${PORT}/api/v1\n`);
});
