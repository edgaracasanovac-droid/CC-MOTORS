const clienteService = require('../services/clienteService');
const { clienteSchema } = require('../validations/clienteValidation');

const getClientes = async (req, res) => {
  try {

    const clientes = await clienteService.listarClientes();

    res.json(clientes);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener clientes',
      error: error.message
    });
  }
};

const getClientePorId = async (req, res) => {
  try {

    const { id } = req.params;

    const cliente = await clienteService.buscarClientePorId(id);

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json(cliente);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener cliente',
      error: error.message
    });
  }
};

const postCliente = async (req, res) => {
  try {

    const validacion = clienteSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const cliente = await clienteService.registrarCliente(req.body);

    res.status(201).json(cliente);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar cliente',
      error: error.message
    });
  }
};

const putCliente = async (req, res) => {
  try {

    const { id } = req.params;

    const validacion = clienteSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json(validacion.error);
    }

    const cliente = await clienteService.editarCliente(id, req.body);

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json(cliente);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

const deleteCliente = async (req, res) => {
  try {

    const { id } = req.params;

    const cliente = await clienteService.borrarCliente(id);

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json({
      mensaje: 'Cliente eliminado correctamente',
      cliente
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar cliente',
      error: error.message
    });
  }
};

module.exports = {
  getClientes,
  getClientePorId,
  postCliente,
  putCliente,
  deleteCliente
};