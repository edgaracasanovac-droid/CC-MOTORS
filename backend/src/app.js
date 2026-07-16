const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { globalLimiter, bannedIpMiddleware, requestLogger } = require('./middlewares/rateLimiters');

const vehiculoRoutes = require('./routes/vehiculoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const planRoutes = require('./routes/planFinanciamientoRoutes');
const cuotaRoutes = require('./routes/cuotaRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const modeloRoutes = require('./routes/modeloRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Trust proxy (necesario para leer IP real detrás de Render/Cloudflare/Nginx)
app.set('trust proxy', 1);

// Headers de seguridad HTTP
app.use(helmet());

const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:4322',
  'https://fabulous-lolly-0db08b.netlify.app',
  process.env.FRONTEND_URL,
  process.env.WEBSITE_URL,
  process.env.ADMIN_PANEL_URL,
].filter(Boolean);

const isNetlifyOrigin = (origin) => /^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isNetlifyOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

//app.options('*', cors());

app.use(express.json());

// Logging de requests
app.use(requestLogger);

// Verificar IP baneada/bloqueada antes de cualquier ruta
app.use(bannedIpMiddleware);

// Rate limit global
app.use(globalLimiter);

app.get('/', (req, res) => {
  res.send('API RESTful de concesionaria funcionando');
});

app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/planes-financiamiento', planRoutes);
app.use('/api/cuotas', cuotaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/modelos', modeloRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;