ALTER TABLE vehiculo ADD COLUMN IF NOT EXISTS imagen TEXT;

COMMENT ON COLUMN vehiculo.imagen IS 'URL de la imagen del vehículo';
