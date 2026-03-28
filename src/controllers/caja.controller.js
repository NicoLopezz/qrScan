import Admin from '../models/adminModel.js';
import CajaMayor from '../models/cajaMayorSchema.js';
import CajaChica from '../models/cajaChicaSchema.js';
import ArqueoMayor from '../models/arqueoMayorSchema.js';
import ArqueoChica from '../models/arqueoChicaSchema.js';
import Movimiento from '../models/Movimientos.js';

async function crearArqueo(req, res) {
  const { cajaTipo, saldoInicial, horaApertura, tipoArqueo } = req.body;
  const adminId = req.cookies.adminId; // Admin desde la cookie
  console.log("Datos recibidos en crearArqueo:", req.body);

  if (!['efectivo', 'mercado-pago'].includes(req.body.tipoArqueo)) {
    return res.status(400).json({ success: false, message: 'Tipo de arqueo inválido.' });
  }

  try {
    // Verificar Admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin no encontrado.' });
    }

    let cajaMayor, cajaChica, arqueo;

    // Define la hora de apertura: usa la proporcionada o la hora actual
    const fechaApertura = horaApertura ? new Date(horaApertura) : new Date();

    if (cajaTipo === 'CajaMayor') {
      console.log("Procesando CajaMayor...");
      // Buscar o Crear CajaMayor
      cajaMayor = await CajaMayor.findOne({ adminId: admin._id });
      if (!cajaMayor) {
        cajaMayor = new CajaMayor({
          adminId: admin._id,
          saldoInicial,
          saldoActual: saldoInicial,
          estado: 'abierta',
        });
        await cajaMayor.save();
      }

      // Crear ArqueoMayor
      arqueo = new ArqueoMayor({
        cajaId: cajaMayor._id,
        saldoInicial,
        usuarioId: admin._id,
        fechaApertura,
        tipo: tipoArqueo,
      });

      await arqueo.save();
      cajaMayor.arqueos.push(arqueo._id);
      await cajaMayor.save();

    } else if (cajaTipo === 'CajaChica') {
      console.log("Procesando CajaChica...");
      // Buscar o Crear CajaMayor para la CajaChica
      cajaMayor = await CajaMayor.findOne({ adminId: admin._id });
      if (!cajaMayor) {
        return res.status(404).json({ success: false, message: 'Debe crear primero una Caja Mayor.' });
      }

      // Buscar o Crear CajaChica
      cajaChica = await CajaChica.findOne({ adminId: admin._id });
      if (!cajaChica) {
        cajaChica = new CajaChica({
          adminId: admin._id,
          cajaMayorId: cajaMayor._id,
          saldoInicial,
          saldoActual: saldoInicial,
          estado: 'abierta',
        });
        await cajaChica.save();
      }

      // Crear ArqueoChica
      arqueo = new ArqueoChica({
        cajaId: cajaChica._id,
        saldoInicial,
        usuarioId: admin._id,
        fechaApertura, // Asignamos la fecha de apertura
        tipo: req.body.tipoArqueo
      });

      await arqueo.save();
      cajaChica.arqueos.push(arqueo._id);
      await cajaChica.save();
    } else {
      return res.status(400).json({ success: false, message: 'Tipo de caja inválido.' });
    }

    res.status(201).json({ success: true, message: 'Arqueo creado con éxito.', arqueo });
  } catch (error) {
    console.error('Error al crear arqueo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear arqueo.',
      details: error.message,
    });
  }
}

async function getArqueos(req, res) {
  const adminId = req.cookies.adminId; // Obtener adminId de las cookies
  const { cajaTipo } = req.query; // Tipo de caja enviado en la query (CajaMayor o CajaChica)

  console.log(`${adminId} el admin que llega para el getArqueos es....`);

  // Validar parámetros
  if (!adminId || !cajaTipo) {
    return res
      .status(400)
      .json({ success: false, message: "Faltan parámetros requeridos (adminId o cajaTipo)." });
  }

  try {
    let arqueos = [];

    if (cajaTipo === "CajaMayor") {
      // Buscar la CajaMayor y sus arqueos
      const cajaMayor = await CajaMayor.findOne({ adminId }).populate({
        path: "arqueos",
        populate: { path: "movimientos", model: "Movimiento" }, // Traer los movimientos completos
      });

      if (cajaMayor) {
        arqueos = cajaMayor.arqueos;
      }
    } else if (cajaTipo === "CajaChica") {
      // Buscar la CajaChica y sus arqueos
      const cajaChica = await CajaChica.findOne({ adminId }).populate({
        path: "arqueos",
        populate: { path: "movimientos", model: "Movimiento" }, // Traer los movimientos completos
      });

      if (cajaChica) {
        arqueos = cajaChica.arqueos;
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Tipo de caja inválido. Use CajaMayor o CajaChica." });
    }

    // Procesar cada arqueo para calcular su estado
    const arqueosConEstado = arqueos.map((arqueo) => {
      const ingresos = arqueo.movimientos
        .filter((mov) => mov.tipo === "ingreso")
        .reduce((sum, mov) => sum + mov.monto, 0);

      const egresos = arqueo.movimientos
        .filter((mov) => mov.tipo === "egreso")
        .reduce((sum, mov) => sum + mov.monto, 0);

      const saldoFinalSistema = arqueo.saldoInicial + ingresos - egresos;

      return {
        ...arqueo._doc, // Copiar los datos originales del arqueo
        ingresos,
        egresos,
        saldoFinalSistema,
      };
    });

    // Devolver los arqueos con el estado calculado
    res.status(200).json({ success: true, data: arqueosConEstado });

  } catch (error) {
    console.error("Error al obtener arqueos:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor.", details: error.message });
  }
}

// FUNCION PARA CERRAR UN ARQUEO
async function cerrarArqueo(req, res) {
  const adminId = req.cookies.adminId; // Obtener adminId desde las cookies
  const { cajaTipo, totalUsuario, observacion } = req.body; // Recibe el tipo de caja, totalUsuario y observación desde el body
  const { arqueoId } = req.params; // Recibe el ID del arqueo desde la URL

  console.log("CERRANDO EL ARQUEO! El admin id es:", adminId);
  console.log("Datos recibidos:", req.params, req.body);

  // Validar parámetros
  if (!adminId || !cajaTipo || !arqueoId || totalUsuario == null) {
    console.log("Valores recibidos:");
    console.log("adminId:", adminId);
    console.log("cajaTipo:", cajaTipo);
    console.log("arqueoId:", arqueoId);
    console.log("totalUsuario:", totalUsuario);
    return res.status(400).json({
      success: false,
      message: "Faltan parámetros requeridos (adminId, cajaTipo, arqueoId o totalUsuario).",
    });
  }

  try {
    let arqueo, caja;

    // Buscar arqueo y caja según el tipo
    if (cajaTipo === "CajaMayor") {
      arqueo = await ArqueoMayor.findById(arqueoId).populate("movimientos");
      if (!arqueo) {
        return res.status(404).json({
          success: false,
          message: "Arqueo no encontrado para CajaMayor.",
        });
      }
      caja = await CajaMayor.findById(arqueo.cajaId);
    } else if (cajaTipo === "CajaChica") {
      arqueo = await ArqueoChica.findById(arqueoId).populate("movimientos");
      if (!arqueo) {
        return res.status(404).json({
          success: false,
          message: "Arqueo no encontrado para CajaChica.",
        });
      }
      caja = await CajaChica.findById(arqueo.cajaId);
    } else {
      return res.status(400).json({
        success: false,
        message: "Tipo de caja inválido. Use CajaMayor o CajaChica.",
      });
    }

    // Calcular saldo final del sistema
    const ingresos = arqueo.movimientos
      .filter((mov) => mov.tipo === "ingreso")
      .reduce((sum, mov) => sum + mov.monto, 0);
    const egresos = arqueo.movimientos
      .filter((mov) => mov.tipo === "egreso")
      .reduce((sum, mov) => sum + mov.monto, 0);
    const saldoFinalSistema = arqueo.saldoInicial + ingresos - egresos;

    // Calcular la diferencia correctamente
    const diferencia = totalUsuario - saldoFinalSistema;

    // Registrar la diferencia con su signo en el arqueo
    arqueo.saldoFinalSistema = saldoFinalSistema;
    arqueo.saldoFinalReal = totalUsuario; // Registrar el valor enviado desde el front
    arqueo.diferencia = diferencia; // Aquí se guarda con su signo
    arqueo.observacion = observacion || "Sin observación"; // Guardar la observación

    // Actualizar el estado del arqueo y su fecha de cierre
    arqueo.estado = "cerrado";
    arqueo.fechaCierre = new Date();
    await arqueo.save();

    // Actualizar el estado de la caja
    caja.estado = "cerrada";
    await caja.save();

    return res.status(200).json({
      success: true,
      message: `Arqueo cerrado correctamente. ${diferencia !== 0
        ? `Nota: Hay una diferencia de $${diferencia.toFixed(2)}.`
        : ""
        }`,
      data: {
        arqueoId: arqueo._id,
        saldoFinalSistema,
        saldoFinalReal: totalUsuario,
        diferencia,
        fechaCierre: arqueo.fechaCierre,
        observacion: arqueo.observacion,
      },
    });
  } catch (error) {
    console.error("Error al cerrar arqueo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      details: error.message,
    });
  }
}

async function getArqueosBalances(req, res) {
  const adminId = req.cookies.adminId; // Obtener adminId desde las cookies
  const { cajaTipo } = req.query; // Obtener cajaTipo desde la query

  // Validar que adminId y cajaTipo existan
  if (!adminId || !cajaTipo) {
    return res.status(400).json({ success: false, message: "Faltan parámetros requeridos (adminId, cajaTipo)." });
  }

  try {
    let arqueosAbiertos = [];

    // Obtener arqueos abiertos según el tipo de caja
    if (cajaTipo === "CajaMayor") {
      const cajaMayor = await CajaMayor.findOne({ adminId });
      if (!cajaMayor) {
        return res.status(404).json({ success: false, message: "No se encontró CajaMayor para este admin." });
      }
      arqueosAbiertos = await ArqueoMayor.find({ cajaId: cajaMayor._id, estado: "abierto" }).populate("movimientos").exec();
    } else if (cajaTipo === "CajaChica") {
      const cajaChica = await CajaChica.findOne({ adminId });
      if (!cajaChica) {
        return res.status(404).json({ success: false, message: "No se encontró CajaChica para este admin." });
      }
      arqueosAbiertos = await ArqueoChica.find({ cajaId: cajaChica._id, estado: "abierto" }).populate("movimientos").exec();
    } else {
      return res.status(400).json({ success: false, message: "Tipo de caja inválido. Use CajaMayor o CajaChica." });
    }

    // Variables para acumular los datos
    const resultado = {
      efectivo: {
        saldoInicial: 0,
        ingresos: 0,
        egresos: 0,
        balanceActual: 0,
        movimientosIngresos: [],
        movimientosEgresos: [],
      },
      mercadoPago: {
        saldoInicial: 0,
        ingresos: 0,
        egresos: 0,
        balanceActual: 0,
        movimientosIngresos: [],
        movimientosEgresos: [],
      },
    };

    // Procesar arqueos y clasificar movimientos
    arqueosAbiertos.forEach((arqueo) => {
      // Sumar el saldo inicial al tipo de pago correspondiente
      if (arqueo.tipo === "efectivo") {
        resultado.efectivo.saldoInicial += arqueo.saldoInicial;
      } else if (arqueo.tipo === "mercado-pago") {
        resultado.mercadoPago.saldoInicial += arqueo.saldoInicial;
      }

      // Clasificar movimientos
      arqueo.movimientos.forEach((mov) => {
        if (mov.medioPago === "efectivo") {
          if (mov.tipo === "ingreso") {
            resultado.efectivo.ingresos += mov.monto;
            resultado.efectivo.movimientosIngresos.push(mov);
          } else if (mov.tipo === "egreso") {
            resultado.efectivo.egresos += mov.monto;
            resultado.efectivo.movimientosEgresos.push(mov);
          }
        } else if (mov.medioPago === "mercado-pago") {
          if (mov.tipo === "ingreso") {
            resultado.mercadoPago.ingresos += mov.monto;
            resultado.mercadoPago.movimientosIngresos.push(mov);
          } else if (mov.tipo === "egreso") {
            resultado.mercadoPago.egresos += mov.monto;
            resultado.mercadoPago.movimientosEgresos.push(mov);
          }
        }
      });
    });

    // Calcular balances finales
    resultado.efectivo.balanceActual =
      resultado.efectivo.saldoInicial + resultado.efectivo.ingresos - resultado.efectivo.egresos;
    resultado.mercadoPago.balanceActual =
      resultado.mercadoPago.saldoInicial +
      resultado.mercadoPago.ingresos -
      resultado.mercadoPago.egresos;

    // Devolver la respuesta
    res.status(200).json({ success: true, data: resultado });
  } catch (error) {
    console.error("Error al obtener balances:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      details: error.message,
    });
  }
}

// Crear un nuevo movimiento
async function crearMovimiento(req, res) {
  const { cajaTipo, tipo, monto, descripcion, medioPago, estadoPago } = req.body;
  const adminId = req.cookies.adminId;

  try {
    console.log('Datos recibidos:', req.body);

    // Validar entrada
    if (!adminId || !cajaTipo || !tipo || !monto || !medioPago || !estadoPago) {
      console.log('Faltan parámetros requeridos:', { adminId, cajaTipo, tipo, monto, medioPago, estadoPago });
      return res.status(400).json({ success: false, message: "Faltan parámetros requeridos." });
    }

    console.log('Validación inicial superada.');

    // Validar estadoPago
    const estadosValidos = ["abonado", "no-abonado", "pendiente"];
    if (!estadosValidos.includes(estadoPago)) {
      console.log('Estado de pago inválido:', estadoPago);
      return res.status(400).json({ success: false, message: "Estado de pago inválido." });
    }

    // Buscar arqueos abiertos
    let arqueosAbiertos = [];
    if (cajaTipo === "CajaMayor") {
      const cajaMayor = await CajaMayor.findOne({ adminId });
      if (!cajaMayor) {
        console.log('Caja mayor no encontrada para adminId:', adminId);
        return res.status(404).json({ success: false, message: "Caja mayor no encontrada." });
      }

      arqueosAbiertos = await ArqueoMayor.find({ cajaId: cajaMayor._id, estado: "abierto" });
    } else if (cajaTipo === "CajaChica") {
      const cajaChica = await CajaChica.findOne({ adminId });
      if (!cajaChica) {
        console.log('Caja chica no encontrada para adminId:', adminId);
        return res.status(404).json({ success: false, message: "Caja chica no encontrada." });
      }

      arqueosAbiertos = await ArqueoChica.find({ cajaId: cajaChica._id, estado: "abierto" });
    } else {
      console.log('Tipo de caja inválido:', cajaTipo);
      return res.status(400).json({ success: false, message: "Tipo de caja inválido. Use CajaMayor o CajaChica." });
    }

    console.log('Arqueos abiertos:', arqueosAbiertos);

    if (arqueosAbiertos.length === 0) {
      console.log(`No hay arqueos abiertos para ${cajaTipo}`);
      return res.status(400).json({
        success: false,
        message: `No hay arqueos abiertos para ${cajaTipo}. Por favor, cree un arqueo antes de continuar.`,
      });
    }

    const arqueoAbierto = arqueosAbiertos.find(arqueo => arqueo.tipo === medioPago);
    if (!arqueoAbierto) {
      console.log('No hay arqueos abiertos con el medio de pago especificado:', medioPago);
      return res.status(400).json({
        success: false,
        message: `No hay arqueos abiertos en ${cajaTipo} para el medio de pago ${medioPago}.`,
      });
    }

    const nuevoMovimiento = new Movimiento({
      cajaId: arqueoAbierto.cajaId,
      cajaTipo,
      tipo,
      monto,
      descripcion,
      medioPago,
      estadoPago,
    });

    console.log('Nuevo movimiento:', nuevoMovimiento);

    await nuevoMovimiento.save();

    arqueoAbierto.movimientos.push(nuevoMovimiento._id);
    await arqueoAbierto.save();

    console.log('Movimiento creado y asociado exitosamente.');

    res.status(201).json({
      success: true,
      message: "Movimiento creado y asociado con éxito al arqueo.",
      movimiento: nuevoMovimiento,
      arqueoActualizado: arqueoAbierto,
    });
  } catch (error) {
    console.error("Error al crear movimiento:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor.", details: error.message });
  }
}

// Obtener los movimientos de un arqueo abierto
async function getMovimientos(req, res) {
  const adminId = req.cookies.adminId; // Obtener adminId desde las cookies
  const { cajaTipo, arqueoId } = req.query; // Obtener cajaTipo y arqueoId desde la query

  console.log("DATOS DEL backend por donde va el fetch: " + cajaTipo, +" " + arqueoId + " " + adminId)
  // Validar que adminId, cajaTipo y arqueoId existan
  if (!adminId || !cajaTipo || !arqueoId) {
    return res.status(400).json({ success: false, message: "Faltan parámetros requeridos (adminId, cajaTipo, arqueoId)." });
  }

  try {
    let arqueo;

    // Buscar el arqueo dependiendo del tipo de caja
    if (cajaTipo === "CajaMayor") {
      const cajaMayor = await CajaMayor.findOne({ adminId });
      if (!cajaMayor) {
        return res.status(404).json({ success: false, message: "No se encontró CajaMayor para este admin." });
      }

      arqueo = await ArqueoMayor.findOne({ _id: arqueoId, cajaId: cajaMayor._id }).populate("movimientos").exec();
    } else if (cajaTipo === "CajaChica") {
      const cajaChica = await CajaChica.findOne({ adminId });
      if (!cajaChica) {
        return res.status(404).json({ success: false, message: "No se encontró CajaChica para este admin." });
      }

      arqueo = await ArqueoChica.findOne({ _id: arqueoId, cajaId: cajaChica._id }).populate("movimientos").exec();
    } else {
      return res.status(400).json({ success: false, message: "Tipo de caja inválido. Use CajaMayor o CajaChica." });
    }

    // Verificar si se encontró un arqueo
    if (!arqueo) {
      return res.status(404).json({ success: false, message: "No se encontró un arqueo con el ID proporcionado." });
    }

    // Devolver los movimientos relacionados al arqueo
    res.status(200).json({ success: true, data: arqueo.movimientos });
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      details: error.message,
    });
  }
}

// Obtener todos los movimientos de las cajas abiertas
async function getMovimientosAbiertos(req, res) {
  const adminId = req.cookies.adminId; // Obtener adminId desde las cookies
  const { cajaTipo } = req.query; // Obtener cajaTipo desde la query

  // Validar que adminId y cajaTipo existan
  if (!adminId || !cajaTipo) {
    return res.status(400).json({ success: false, message: "Faltan parámetros requeridos (adminId, cajaTipo)." });
  }

  try {
    let movimientos = [];

    // Buscar movimientos dependiendo del tipo de caja
    if (cajaTipo === "CajaMayor") {
      const cajaMayor = await CajaMayor.findOne({ adminId });
      if (!cajaMayor) {
        return res.status(404).json({ success: false, message: "No se encontró CajaMayor para este admin." });
      }

      // Buscar arqueos abiertos de CajaMayor
      const arqueosAbiertos = await ArqueoMayor.find({ cajaId: cajaMayor._id, estado: "abierto" }).populate("movimientos").exec();

      // Recopilar todos los movimientos
      arqueosAbiertos.forEach((arqueo) => {
        movimientos = movimientos.concat(arqueo.movimientos);
      });

    } else if (cajaTipo === "CajaChica") {
      const cajaChica = await CajaChica.findOne({ adminId });
      if (!cajaChica) {
        return res.status(404).json({ success: false, message: "No se encontró CajaChica para este admin." });
      }

      // Buscar arqueos abiertos de CajaChica
      const arqueosAbiertos = await ArqueoChica.find({ cajaId: cajaChica._id, estado: "abierto" }).populate("movimientos").exec();

      // Recopilar todos los movimientos
      arqueosAbiertos.forEach((arqueo) => {
        movimientos = movimientos.concat(arqueo.movimientos);
      });

    } else {
      return res.status(400).json({ success: false, message: "Tipo de caja inválido. Use CajaMayor o CajaChica." });
    }

    // Verificar si hay movimientos
    if (movimientos.length === 0) {
      return res.status(404).json({ success: false, message: "No se encontraron movimientos en cajas abiertas." });
    }

    // Devolver los movimientos relacionados a cajas abiertas
    res.status(200).json({ success: true, data: movimientos });
  } catch (error) {
    console.error("Error al obtener movimientos de cajas abiertas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      details: error.message,
    });
  }
}

// ELIMINAR MOVIMIENTO
async function eliminarMovimiento(req, res) {
  const { movimientoId, cajaId } = req.body; // Obtener movimientoId y cajaId del cuerpo

  // Validar que los parámetros requeridos estén presentes
  if (!movimientoId || !cajaId) {
    return res.status(400).json({
      success: false,
      message: "Faltan parámetros requeridos (movimientoId, cajaId).",
    });
  }

  try {
    // Buscar el movimiento en la colección "movimientos"
    const movimiento = await Movimiento.findOne({ _id: movimientoId, cajaId });

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: "Movimiento no encontrado.",
      });
    }

    // Eliminar el movimiento
    await Movimiento.deleteOne({ _id: movimientoId, cajaId });

    res.status(200).json({
      success: true,
      message: "Movimiento eliminado con éxito.",
    });
  } catch (error) {
    console.error("Error al eliminar el movimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      details: error.message,
    });
  }
}

// ENDPOINT: Modificar movimiento
async function modificarMovimiento(req, res) {
  const { movimientoId, cajaId, descripcion, monto, estadoPago } = req.body; // Cambiado a estadoPago

  // Agregar console.log para verificar los datos recibidos
  console.log("Datos recibidos en el backend:");
  console.log("Movimiento ID:", movimientoId);
  console.log("Caja ID:", cajaId);
  console.log("Descripción:", descripcion);
  console.log("Monto:", monto);
  console.log("Estado Pago:", estadoPago); // Ahora imprime estadoPago

  // Validar que los parámetros requeridos estén presentes
  if (!movimientoId || !cajaId || !descripcion || !monto || !estadoPago) {
    return res.status(400).json({
      success: false,
      message: "Faltan parámetros requeridos (movimientoId, cajaId, descripcion, monto, estadoPago).",
    });
  }

  try {
    // Buscar y actualizar el movimiento
    const movimiento = await Movimiento.findOneAndUpdate(
      { _id: movimientoId, cajaId }, // Filtro por ID de movimiento y ID de caja
      { descripcion, monto: parseFloat(monto), estadoPago }, // Actualizar descripción, monto y estadoPago
      { new: true } // Retorna el documento actualizado
    );

    // Validar si el movimiento fue encontrado
    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: "Movimiento no encontrado.",
      });
    }

    // Enviar respuesta con éxito y datos actualizados
    res.status(200).json({
      success: true,
      message: "Movimiento modificado con éxito.",
      data: movimiento,
    });
  } catch (error) {
    console.error("Error al modificar el movimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      details: error.message,
    });
  }
}

export const methods = {
  crearArqueo,
  getArqueos,
  cerrarArqueo,
  getArqueosBalances,
  crearMovimiento,
  getMovimientos,
  getMovimientosAbiertos,
  eliminarMovimiento,
  modificarMovimiento
};
