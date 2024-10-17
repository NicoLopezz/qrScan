import Admin from '../models/adminModel.js';  // Nuevo modelo Cliente con historialPedidos
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../services/twilioService.js';
import dayjs from 'dayjs'; // Recomendado para manejar fechas
import { faker } from '@faker-js/faker';


async function reciveMessage(req, res) {
    const { From: fromWithPrefix, Body: body, To: toWithPrefix } = req.body;

    // Eliminar el prefijo 'whatsapp:' de los números y el '+'
    const from = fromWithPrefix.replace('whatsapp:', '');
    const to = toWithPrefix.replace('whatsapp:', '').replace('+', ''); // Eliminar el '+'

    try {
        // Responder inmediatamente a Twilio
        res.status(200).send('<Response></Response>');

        // Buscar el local en función del número de WhatsApp de destino (To)
        const localAdmin = await Admin.findOne({ localNumber: to });

        if (!localAdmin) {
            console.log(`No se encontró un local para el número de WhatsApp: ${to}`);
            return;
        }

        // Verificar el contenido del mensaje recibido para determinar qué tipo de mensaje es
        if (body.toLowerCase().includes('número de tag')) {
            await handleTagMessage(body, from, localAdmin);
        } else if (body.toLowerCase().includes('ya lo tengo')) {
            await handleConfirmationMessage(from, body);
        } else if (body.toLowerCase().includes('baja')) {
            await handleBajaRequest(from);
        } else {
            console.log('Mensaje no reconocido:', body);
        }

    } catch (error) {
        console.error('Error al procesar el mensaje:', error.message);
        res.status(500).send('Error al procesar el mensaje');
    }
}

// Manejar mensajes de pedidos con tags
async function handleTagMessage(body, from, localAdmin) {
    const tagNumberMatch = body.match(/número de tag: (\d+)/); // Extraer el número de tag del mensaje
    const tagNumber = tagNumberMatch ? parseInt(tagNumberMatch[1], 10) : null;
    const fechaPedido = new Date();  // Fecha actual como un objeto de tipo Date

    if (tagNumber !== null) {
        console.log(`Procesando tag ${tagNumber} para ${from}`);

        // Crear un nuevo pedido
        const nuevoPedido = {
            tagNumber,
            fechaPedido,
            estadoPorBarra: 'en espera',
            confirmacionPorCliente: false,
            mensajes: [{ body, fecha: fechaPedido }],
            fechaRetiro: null,
            tiempoEspera: 0
        };

        // Buscar si el cliente ya existe en el local
        let cliente = localAdmin.clientes.find(c => c.from === from);

        if (!cliente) {
            // Si el cliente no existe, agregarlo
            localAdmin.clientes.push({
                from,
                solicitudBaja: false,
                historialPedidos: [nuevoPedido],
                promedioTiempo: null
            });
            console.log(`Nuevo cliente agregado: ${from}`);
        } else {
            // Si el cliente ya existe, agregar el nuevo pedido a su historial
            cliente.historialPedidos.push(nuevoPedido);
            console.log(`Nuevo pedido agregado para el cliente: ${from}`);
        }

        // Guardar los cambios en la base de datos
        await localAdmin.save();
        
        // Enviar respuesta automática al cliente
        const responseMessage = '🎉 ¡Hola!\n\nTu pedido está en la lista de espera.🕒\n\nTe avisaremos cuando esté listo.';
        await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
    } else {
        console.log('No se encontró un número de tag en el mensaje.');
    }
}

// Manejar confirmación de retiro de pedidos
async function handleConfirmationMessage(from, body) {
    const fecha = new Date();  // Fecha actual como un objeto de tipo Date

    // Buscar al cliente en la base de datos
    const admin = await Admin.findOne({ "clientes.from": from });

    if (admin) {
        // Buscar el cliente y su historial de pedidos
        let cliente = admin.clientes.find(c => c.from === from);

        if (cliente) {
            // Buscar el pedido en espera de confirmación
            const pedido = cliente.historialPedidos.find(p => p.confirmacionPorCliente === false);
            if (pedido) {
                // Confirmar el retiro del pedido
                pedido.mensajes.push({ body, fecha });
                pedido.fechaRetiro = fecha;
                pedido.estadoPorBarra = 'retiro confirmado';
                pedido.confirmacionPorCliente = true;

                await admin.save();
                console.log(`Pedido confirmado como retirado para el cliente: ${from}`);

                // Enviar respuesta automática de confirmación
                const confirmationMessage = '🎉 ¡Gracias! Tu pedido ha sido confirmado como retirado.';
                await sendWhatsAppMessage(`whatsapp:${from}`, confirmationMessage);
            } else {
                console.log('No se encontró un pedido en estado a confirmar retiro.');
            }
        } else {
            console.log('Cliente no encontrado.');
        }
    } else {
        console.log('No se encontró el cliente en la base de datos.');
    }
}

// Manejar solicitudes de baja
async function handleBajaRequest(from) {
    const admin = await Admin.findOne({ "clientes.from": from });

    if (admin) {
        let cliente = admin.clientes.find(c => c.from === from);
        if (cliente) {
            cliente.solicitudBaja = true;
            await admin.save();
            console.log(`Solicitud de baja registrada para el cliente: ${from}`);

            // Enviar una confirmación al cliente
            const responseMessage = '🚨 ¡Tu solicitud de baja ha sido procesada!';
            await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
        } else {
            console.log('No se encontró el cliente para procesar la solicitud de baja.');
        }
    } else {
        console.log('No se encontró el cliente en la base de datos.');
    }
}


async function notifyUserForPickUp(req, res) {
    const fechaRetiro = new Date();  // Fecha actual cuando el pedido es retirado
    const idLocal = req.params.idLocal; // ID del local pasado por la cookie
    const { tagNumber } = req.body;

    console.log("ID Local:", idLocal);  // Verificar si el ID es correcto
    console.log("Tag seleccionado enviado:", tagNumber);  // Verificar si el tag enviado es correcto

    try {
        // Buscar el local en función del idLocal
        const localAdmin = await Admin.findById(idLocal);

        if (!localAdmin) {
            return res.status(404).json({ error: 'No se encontró el local' });
        }

        // Buscar el cliente que tiene el pedido en espera en función del número de tag
        const cliente = localAdmin.clientes.find(cliente => 
            cliente.historialPedidos.some(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'en espera')
        );

        if (cliente) {
            // Encontrar el pedido dentro del historial de pedidos
            const pedido = cliente.historialPedidos.find(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'en espera');

            if (pedido) {
                // Actualizar con la fecha y hora del retiro
                pedido.fechaRetiro = fechaRetiro;

                // Calcular la diferencia en milisegundos
                const diferenciaMs = fechaRetiro - pedido.fechaPedido;

                // Convertir la diferencia en segundos
                const segundos = Math.floor(diferenciaMs / 1000);

                // Almacenar el tiempo de espera en segundos
                pedido.tiempoEspera = segundos;

                console.log("Tiempo de espera en segundos:", pedido.tiempoEspera);

                // Enviar notificación de que el pedido está listo
                await sendWhatsAppMessage(`whatsapp:${cliente.from}`, '🎉 ¡Tu pedido está listo para ser retirado! 😊');

                // Actualizar el estado del pedido a "a confirmar retiro"
                pedido.estadoPorBarra = 'a confirmar retiro';

                // Guardar el estado actualizado del pedido en el cliente
                await localAdmin.save();

                // Calcular el promedio de tiempo de espera para todos los pedidos de este cliente
                const totalPedidos = cliente.historialPedidos.length;
                const totalTiempoEspera = cliente.historialPedidos.reduce((total, p) => total + p.tiempoEspera, 0);

                // Calcular el promedio del tiempo de espera
                const promedioTiempo = totalTiempoEspera / totalPedidos;

                // Guardar el promedio en el cliente
                cliente.promedioTiempo = promedioTiempo;

                // Convertir el promedio a horas, minutos y segundos
                const horasPromedio = Math.floor(promedioTiempo / 3600);
                const minutosPromedio = Math.floor((promedioTiempo % 3600) / 60);
                const segundosPromedio = Math.floor(promedioTiempo % 60);

                console.log(`Promedio de espera: ${horasPromedio} horas, ${minutosPromedio} minutos y ${segundosPromedio} segundos`);

                // Guardar nuevamente el local con el promedio actualizado
                await localAdmin.save();

                res.json({ message: 'Notificación enviada y estado actualizado' });
            } else {
                res.status(404).json({ error: 'No se encontró el pedido en estado "en espera"' });
            }
        } else {
            res.status(404).json({ error: 'No se encontró el cliente con este número de tag en estado "en espera"' });
        }
    } catch (error) {
        console.error('Error al notificar al usuario:', error.message);
        res.status(500).json({ error: 'Error al notificar al usuario' });
    }
}

async function notifyUserPickedUp(req, res) {
    const { tagNumber } = req.body;
    const localNumber = req.cookies.localNumber; // Aquí obtenemos el localNumber desde la cookie

    if (!localNumber) {
        return res.status(400).json({ error: 'No se proporcionó el número de local (localNumber) en la cookie' });
    }

    try {
        // Buscar el admin por su número de local (localNumber)
        const admin = await Admin.findOne({ localNumber });

        if (!admin) {
            return res.status(404).json({ error: 'No se encontró el local/admin con ese número' });
        }

        // Buscar el cliente que tiene un pedido con el estado "a confirmar retiro" y el número de tag correspondiente
        const cliente = admin.clientes.find(c =>
            c.historialPedidos.some(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro')
        );

        if (cliente) {
            // Encontrar el pedido dentro del historial de pedidos
            const pedido = cliente.historialPedidos.find(p =>
                p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro'
            );

            if (pedido) {
                // Enviar notificación de confirmación al cliente
                console.log(`Enviando notificación de retiro confirmado al cliente con el número: ${cliente.from}`);
                await sendWhatsAppTemplateMessage(`whatsapp:${cliente.from}`, ['1', '2', '3']);

                // Actualizar el estado del pedido a "retiro confirmado"
                pedido.estadoPorBarra = 'retiro confirmado';
                await admin.save();

                // Responder con éxito
                res.json({ message: 'Notificación enviada y estado actualizado a "retiro confirmado"' });
            } else {
                res.status(404).json({ error: 'No se encontró un pedido con el estado "a confirmar retiro" para este número de tag' });
            }
        } else {
            res.status(404).json({ error: 'No se encontró un cliente para este número de tag' });
        }
    } catch (error) {
        console.error('Error al notificar al usuario:', error.message);
        res.status(500).json({ error: 'Error al notificar al usuario' });
    }
}


async function newLocal(req, res) {
    const { email, password, localName } = req.body;

    try {
        // Generar datos aleatorios para usuario, cliente y pago
        const randomUser = {
          name: faker.person.fullName(),  // Nombre aleatorio para el usuario
          password: faker.internet.password(),
          permiso: 'user'
        };
    
        const randomClient = {
          solicitudBaja: false,
          from: faker.internet.email(),
          historialPedidos: [{
            tagNumber: faker.number.int({ min: 100, max: 999 }),
            fechaPedido: faker.date.recent(),
            fechaRetiro: faker.date.recent(),
            tiempoEspera: faker.number.int({ min: 5, max: 120 }),  // Tiempo de espera en minutos
            estadoPorBarra: 'completado',
            confirmacionPorCliente: true,
            mensajes: [
              { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() },
              { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() }
            ]
          }],
          promedioTiempo: faker.number.int({ min: 10, max: 60 })
        };
    
        const randomPayment = {
          fecha: faker.date.recent(),
          monto: faker.number.int({ min: 10, max: 1000 }),
          metodo: faker.finance.transactionType()
        };
    
        // Crear el nuevo administrador con un usuario, cliente y pago generados aleatoriamente
        const newAdmin = new Admin({
          email,
          password,
          localName,
          localNumber: 14155238886,
          usuarios: [randomUser],
          clientes: [randomClient],
          pagos: [randomPayment],
          facturacion: {
            cbu: faker.finance.accountNumber(),
            medioDePago: faker.finance.creditCardIssuer(),
            alias: faker.finance.iban()
          },
          tipoDeLicencia: 'premium',  // Tipo de licencia "premium"
          horariosDeOperacion: '8 a 17hs'  // Horario de operación predefinido
        });
    
      

        // // ESTO ES LO REAL!!!!------->
        // // Crear un nuevo administrador con solo los campos iniciales
        // const newAdmin = new Admin({
        //     email,
        //     password,
        //     localName,  // Almacena solo lo necesario por ahora

        // });

        // Guardar en la base de datos
        await newAdmin.save();
        res.status(201).json({ message: 'Administrador agregado con éxito' });
    } catch (error) {
        console.error('Error al agregar administrador:', error.message);
        res.status(500).json({ error: 'Error al agregar administrador' });
    }
}

async function getLocales (req, res) {
    try {
      const locales = await Admin.find();
      res.status(200).json(locales);
    } catch (error) {
      console.error('Error al obtener locales:', error.message);
      res.status(500).json({ error: 'Error al obtener locales' });
    }
  };


  async function cargarLocales() {
    try {
      const response = await fetch(apiUrl);  // Llamada a la API del servidor
      const locales = await response.json();
      const tarjetasContainer = document.getElementById('tarjetas-container');
      tarjetasContainer.innerHTML = '';  // Limpiar tarjetas anteriores
  
      locales.forEach(local => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'card';
        tarjeta.innerHTML = `
          <h2>${local.localName}</h2>
          <p>Email: ${local.email}</p>
          <p>Permiso: ${local.permiso}</p>
          <p>Fecha de Alta: ${new Date(local.fechaDeAlta).toLocaleDateString()}</p>
        `;
        tarjeta.onclick = () => mostrarDetalles(local._id);
        tarjetasContainer.appendChild(tarjeta);
      });
    } catch (error) {
      console.error('Error al cargar los locales:', error);
    }
  }

// Función para obtener los detalles completos de un local
async function getLocalDetails (req, res) {
    const { id } = req.params;
    
    try {
      const local = await Admin.findById(id);  // Buscamos el local por su ID
      if (!local) {
        return res.status(404).json({ error: 'Local no encontrado' });
      }
  
      res.status(200).json(local);  // Devolver los detalles completos del local
    } catch (error) {
      console.error('Error al obtener los detalles del local:', error);
      res.status(500).json({ error: 'Error al obtener los detalles del local' });
    }
  };

  async function login(req, res) {
    const { email, password } = req.body;
  
    // Esto cambia solo si es producción o desarrollo.
    // Por el tema de las cookies y el protocolo HTTPS
    const produccion = false;
  
    try {
      // Buscar si el email corresponde a un admin
      const admin = await Admin.findOne({ email });
  
      if (admin) {
        // Si es un admin, verificamos si la contraseña es válida
        const isPasswordValid = password === admin.password; // Comparación directa, asegúrate de usar hashing en producción
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Contraseña incorrecta" });
        }
  
        // Admin válido, guardar el localNumber y el _id en una cookie
        const localNumber = admin.localNumber;
        const adminId = admin._id; // Obtener el _id del admin
  
        // Guardar cookies
        res.cookie('localNumber', localNumber, { httpOnly: produccion , sameSite: 'Lax' });
        res.cookie('username', email, { httpOnly: produccion , sameSite: 'Lax'});
        res.cookie('adminId', adminId.toString(), { httpOnly: produccion , sameSite: 'Lax'});
  
        return res.status(200).json({ message: "Inicio de sesión exitoso (Admin)", localNumber, permiso: admin.permiso });
      }
  
      // Si no es un admin, buscar si el email corresponde a un usuario dentro de los locales
      const adminConUsuario = await Admin.findOne({
        'usuarios.email': email, // Busca en la lista de usuarios dentro de los locales
      });
  
      if (!adminConUsuario) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }
  
      // Verificamos si la contraseña coincide con el usuario encontrado
      const usuario = adminConUsuario.usuarios.find(u => u.email === email);
      const isPasswordValid = password === usuario.password; // Comparación directa, asegúrate de usar hashing en producción
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }
  
      // Usuario válido, guardar el localNumber y el _id del admin en una cookie
      const localNumber = adminConUsuario.localNumber;
      const adminId = adminConUsuario._id; // Obtener el _id del admin (no cambia)
  
      // Guardar cookies
      res.cookie('localNumber', localNumber, { httpOnly: produccion , sameSite: 'Lax'});
      res.cookie('username', email, { httpOnly: produccion ,sameSite: 'Lax' });
      res.cookie('adminId', adminId.toString(), { httpOnly: produccion , sameSite: 'Lax'}); // Guardar el ID del admin
  
      return res.status(200).json({ message: "Inicio de sesión exitoso (Usuario)", localNumber, user: usuario, permiso: usuario.permiso });
  
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  }
  
  async function updateTagSelected(req, res) {
    console.log("ENTRE DENTRO DE UPDATE!!");
    const idLocal = req.params.idLocal; // ID del local
    const { tagSelected } = req.body; // Nuevo valor del tag
  
    console.log("ID Local:", idLocal);  // Verificar si el ID es correcto
    console.log("Tag seleccionado enviado:", tagSelected);  // Verificar si el tag enviado es el correcto
  
    try {
      // Recuperar el documento antes de la actualización
      const admin = await Admin.findById(idLocal);
      if (!admin) {
        return res.status(404).json({ error: 'Admin/local no encontrado' });
      }
  
      // Actualizar el campo tagSelected
      admin.tagSelected = tagSelected;
      console.log("Tag seleccionado después de la actualización:", admin.tagSelected);  // Verificar si el campo se actualizó
  
      // Guardar el documento actualizado
      await admin.save();
  
      // Verificar si el documento se guardó correctamente
      const updatedAdmin = await Admin.findById(idLocal);  
      res.status(200).json({
        message: "Tag seleccionado actualizado",
        localName: updatedAdmin.localName,
        tagSelected: updatedAdmin.tagSelected
      });
    } catch (error) {
      console.error('Error al actualizar el tag seleccionado:', error);
      res.status(500).json({ error: 'Error al actualizar el tag seleccionado' });
    }
  }

// Función de validación genérica
async function validateUser(req, res, next) {
    const username = req.cookies.username; // Obtenemos el username de la cookie

    if (!username) {
        return res.status(401).send('No estás autorizado para acceder a esta página');
    }

    try {
        // Primero, buscamos si el username (email) es un admin
        const admin = await Admin.findOne({ email: username });

        if (admin) {
            // Si es un admin, continuar
            req.user = admin; // Pasamos la información del admin a req.user
            req.isAdmin = true; // Indicamos que es admin
            return next();
        }

        // Si no es un admin, buscamos si es un usuario dentro de un admin (local)
        const adminConUsuario = await Admin.findOne({
            'usuarios.email': username, // Busca en la lista de usuarios dentro de los locales
        });

        if (!adminConUsuario) {
            return res.status(403).send('Usuario no autorizado o no encontrado');
        }

        // Usuario encontrado dentro de la lista de usuarios de un admin
        const usuario = adminConUsuario.usuarios.find(u => u.email === username);

        if (!usuario) {
            return res.status(403).send('Usuario no autorizado o no encontrado');
        }

        // Si todo está bien, pasamos los datos del usuario a `req.user`
        req.user = usuario; // Datos del usuario dentro del local
        req.admin = adminConUsuario; // También pasamos los datos del admin (local) al que pertenece
        req.isAdmin = false; // No es un admin, es un usuario
        next();

    } catch (error) {
        console.error('Error al validar al usuario:', error);
        res.status(500).send('Error en el servidor');
    }
}

async function qrScanUpdate(req, res) {
    const adminId = req.params.localId;
    console.log("EL ADMIN QUE SE ESTA BUSCANDO CON EL QR ES: " + adminId);

    try {
        const admin = await Admin.findById(adminId);  // Busca el admin en la base de datos
        if (!admin) {
            return res.status(404).send('Admin no encontrado');
        }

        // Obtener el tagSelected y construir la URL de WhatsApp
        const tagSelected = admin.tagSelected;
        const whatsappNumber = 14155238886;  // Número de WhatsApp
        const message = `Ya realicé mi pedido, número de tag: ${tagSelected}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        // Redirigir automáticamente a la URL de WhatsApp
        res.redirect(whatsappUrl);
    } catch (error) {
        console.error('Error al obtener el admin:', error);
        res.status(500).send('Error al procesar el QR');
    }
}



export const methods = {
    reciveMessage,
    notifyUserForPickUp,
    notifyUserPickedUp,
    newLocal,
    login,
    getLocales,
    cargarLocales,
    getLocalDetails,
    updateTagSelected,
    validateUser,
    qrScanUpdate
    // changeDbDashboard,
};
