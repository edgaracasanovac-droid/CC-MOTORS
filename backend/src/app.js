const express = require('express');
const cors = require('cors');



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
const testDriveRoutes = require('./routes/testDriveRoutes');



const app = express();

app.use(cors());
app.use(express.json());

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
app.use('/api/test-drive', testDriveRoutes);


module.exports = app;