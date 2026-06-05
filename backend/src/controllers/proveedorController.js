const proveedorService = require('../services/proveedorService');
const { proveedorSchema } = require('../validations/proveedorValidation');

const postProveedor = async (req, res) => {
  try {
    const validacion = proveedorSchema.safeParse(req.body);
    if (!validacion.success) return res.status(400).json(validacion.error);

    const proveedor = await proveedorService.registrarProveedor(req.body);
    res.status(201).json(proveedor);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar proveedor', error: error.message });
  }
};

const getProveedores = async (req, res) => {
  try {
    const proveedores = await proveedorService.listarProveedores();
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedores', error: error.message });
  }
};

const getProveedorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await proveedorService.buscarProveedorPorId(id);

    if (!proveedor) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });

    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedor', error: error.message });
  }
};

const putProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const validacion = proveedorSchema.safeParse(req.body);
    if (!validacion.success) return res.status(400).json(validacion.error);

    const proveedor = await proveedorService.editarProveedor(id, req.body);
    if (!proveedor) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });

    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar proveedor', error: error.message });
  }
};

const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await proveedorService.borrarProveedor(id);
    if (!proveedor) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });

    res.json({ mensaje: 'Proveedor eliminado correctamente', proveedor });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar proveedor', error: error.message });
  }
};

module.exports = {
  postProveedor,
  getProveedores,
  getProveedorPorId,
  putProveedor,
  deleteProveedor
};