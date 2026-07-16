CREATE TABLE IF NOT EXISTS test_drive (
  id_test_drive SERIAL PRIMARY KEY,
  id_cliente INTEGER NOT NULL REFERENCES cliente(id_cliente) ON DELETE CASCADE,
  id_vehiculo INTEGER NOT NULL REFERENCES vehiculo(id_vehiculo) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora VARCHAR(10) NOT NULL,
  mensaje TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  observaciones TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_drive_cliente ON test_drive(id_cliente);
CREATE INDEX IF NOT EXISTS idx_test_drive_vehiculo ON test_drive(id_vehiculo);
CREATE INDEX IF NOT EXISTS idx_test_drive_estado ON test_drive(estado);
