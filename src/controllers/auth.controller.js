import Admin from '../models/adminModel.js';  // Nuevo modelo Cliente con historialPedidos
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../services/twilioService.js';
import dayjs from 'dayjs'; // Recomendado para manejar fechas
import { faker } from '@faker-js/faker';


//FUNCION MODULAR!--case
async function reciveMessage(req, res) {
    const { From: fromWithPrefix, Body: body } = req.body;

    // Validar que los datos lleguen correctamente
    if (!fromWithPrefix || !body) {
        return res.status(400).send('Faltan datos necesarios en la solicitud');
    }

    // Quitar el prefijo 'whatsapp:' del número de teléfono
    const from = fromWithPrefix.replace('whatsapp:', '');

    try {
        // Responder inmediatamente a Twilio para evitar duplicados
        res.status(200).send('<Response></Response>');

        // Determinar el caso según el contenido del mensaje
        switch (true) {
            case /número de tag: \d+/i.test(body):
                // Caso 1: Mensaje contiene un número de tag
                await handleTagMessage(body, from);
                break;

            case /sí|ya lo tengo/i.test(body.toLowerCase()):
                // Caso 2: Mensaje de confirmación de retiro
                await handleConfirmationMessage(from, body);
                break;
            
            case /Baja/i.test(body.toLowerCase()):
                // Caso 2: Mensaje de confirmación de retiro
                await handleBajaRequest(from, body);
                break;    

            default:
                console.log("Mensaje no reconocido. Contenido del mensaje:", body);
                break;
        }

    } catch (error) {
        console.error('Error al procesar el mensaje:', error.message);
        res.status(500).send('Error al procesar el mensaje');
    }
}

// Manejar el mensaje cuando el cliente envía un número de tag
async function handleTagMessage(body, from) {
    const tagNumberMatch = body.match(/número de tag: (\d+)/); // Extraer el número de tag
    const tagNumber = tagNumberMatch ? parseInt(tagNumberMatch[1], 10) : null;
    const fechaPedido = new Date();  // Usar Date para obtener la fecha actual como un objeto de tipo Date

    if (tagNumber !== null) {
        let clienteDoc = await Cliente.findOne({ from });

        const nuevoPedido = {
            tagNumber,
            fechaPedido,            // Guardar la fecha actual como Date
            estadoPorBarra: 'en espera',    
            confirmacionPorCliente: false,  
            mensajes: [{ body, fecha: fechaPedido }],    // Usar la fecha como Date en mensajes
            fechaRetiro: null,             
            tiempoEspera: 0
        };

        if (clienteDoc) {
            // Si ya existe el cliente, agregar el nuevo pedido al historial
            clienteDoc.historialPedidos.push(nuevoPedido);
            await clienteDoc.save();
            console.log("Pedido guardado para el cliente con tag:", tagNumber);
        } else {
            // Si no existe, crea un nuevo cliente con el primer pedido en el historial
            clienteDoc = new Cliente({
                from,
                historialPedidos: [nuevoPedido],  // Guardar el primer pedido
                promedioTiempo: null
            });
            await clienteDoc.save();
            console.log("Nuevo cliente y pedido guardado con tag:", tagNumber);
        }

        // Enviar respuesta automática al cliente
        const responseMessage = '🎉 ¡Hola!\n\nTu pedido está en la lista de espera.🕒\n\nTe avisaremos cuando esté listo.';
        await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
    } else {
        console.log("No se pudo extraer un número de tag del mensaje.");
    }
}

// Manejar el mensaje de confirmación de retiro (cuando el cliente responde "sí, ya lo tengo")
async function handleConfirmationMessage(from, body) {
    const fecha = dayjs().format('HH:mm:ss DD/MM/YYYY');
    
    // Buscar el cliente y su historial de pedidos
    const clienteDoc = await Cliente.findOne({ from });

    if (clienteDoc) {
        // Buscar el pedido en el historial que esté en estado "a confirmar retiro" y que no haya sido confirmado
        const pedido = clienteDoc.historialPedidos.find(p => p.confirmacionPorCliente === false);
        
        if (pedido) {
            // Guardar el mensaje de confirmación y actualizar el estado del pedido
            pedido.mensajes.push({ body, fecha }); // Agregar el mensaje de confirmación
            // pedido.fechaRetiro = fecha;            // Actualizar con la fecha y hora del retiro
            pedido.estadoPorBarra = 'retiro confirmado';  // Cambiar el estado a retiro confirmado
            pedido.confirmacionPorCliente = true;         // Marcar como confirmado por el cliente
            await clienteDoc.save();
            console.log("Pedido confirmado como retirado para el tag:", pedido.tagNumber);

            // Enviar respuesta automática de confirmación
            const confirmationMessage = '🎉 ¡Gracias! Tu pedido ha sido confirmado como retirado.';
            await sendWhatsAppMessage(`whatsapp:${from}`, confirmationMessage);
        } else {
            console.error("No se encontró un pedido en estado 'a confirmar retiro' o ya ha sido confirmado.");
        }
    } else {
        console.error("No se encontró un cliente con el número:", from);
    }
}

async function handleBajaRequest(from) {
    try {
        let clienteDoc = await Cliente.findOne({ from });

        if (clienteDoc) {
            // Actualizar la solicitud de baja a true
            clienteDoc.solicitudBaja = true;
            await clienteDoc.save();
            console.log("Solicitud de baja registrada para el cliente:", from);

            // Enviar una confirmación al cliente
            const responseMessage = '🚨 ¡Tu solicitud de baja ha sido procesada! Si no fue intencionada, contacta al soporte. 📞';
            await sendWhatsAppMessage(`whatsapp:${from}`, responseMessage);
        } else {
            console.log("No se encontró un cliente con este número para registrar la baja.");
        }
    } catch (error) {
        console.error('Error al procesar la solicitud de baja:', error.message);
    }
}

async function notifyUserForPickUp(req, res) {
    const fechaRetiro = new Date();  // Fecha actual cuando el pedido es retirado
    const { tagNumber } = req.body;

    console.log("FETCH DE RETIRO!");
    try {
        // Buscar el cliente que tiene el pedido en espera
        const cliente = await Cliente.findOne({ "historialPedidos.tagNumber": tagNumber, "historialPedidos.estadoPorBarra": 'en espera' });

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
                await cliente.save();

                // Calcular el promedio de tiempo de espera para **todos** los pedidos
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

                // Guardar nuevamente el cliente con el promedio actualizado
                await cliente.save();

                res.json({ message: 'Notificación enviada y estado actualizado' });
            } else {
                res.status(404).json({ error: 'No se encontró el pedido en estado "en espera"' });
            }
        } else {
            res.status(404).json({ error: 'No se encontró el pedido para este número de tag' });
        }
    } catch (error) {
        console.error('Error al notificar al usuario:', error.message);
        res.status(500).json({ error: 'Error al notificar al usuario' });
    }
}

async function notifyUserPickedUp(req, res) {
    const { tagNumber } = req.body;

    try {
        // Buscar el cliente que tiene el pedido en "a confirmar retiro"
        const cliente = await Cliente.findOne({ "historialPedidos.tagNumber": tagNumber, "historialPedidos.estadoPorBarra": 'a confirmar retiro' });

        if (cliente) {
            // Encontrar el pedido dentro del historial de pedidos
            const pedido = cliente.historialPedidos.find(p => p.tagNumber === tagNumber && p.estadoPorBarra === 'a confirmar retiro');

            if (pedido) {
                // Enviar notificación de confirmación al cliente
                await sendWhatsAppTemplateMessage(`whatsapp:${cliente.from}`, ['1', '2', '3']);

                // Actualizar el estado del pedido a "retiro confirmado"
                pedido.estadoPorBarra = 'retiro confirmado';
                await cliente.save();

                res.json({ message: 'Notificación enviada y estado actualizado' });
            }
        } else {
            res.status(404).json({ error: 'No se encontró el pedido para este número de tag' });
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
          localNumber: +23232323,
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
      console.log("Documento antes de la actualización:", admin);  // Verifica el estado antes de la actualización
  
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
      console.log("Documento después de la actualización:", updatedAdmin);  // Verifica el estado después de guardar
  
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
