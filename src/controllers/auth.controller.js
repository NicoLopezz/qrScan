import Cliente from '../models/clienteModel.js';  // Nuevo modelo Cliente con historialPedidos
import Admin from '../models/adminModel.js';  // Nuevo modelo Cliente con historialPedidos
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../services/twilioService.js';
import dayjs from 'dayjs'; // Recomendado para manejar fechas
import { faker } from '@faker-js/faker';

// import connectToLocalDB from '../database.js';



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

//--------------> funcion para el mensaje final!
// Notificar que el pedido fue confirmado como retirado
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
    //     // Generar datos aleatorios para usuario, cliente y pago
    //     const randomUser = {
    //       name: faker.person.fullName(),  // Nombre aleatorio para el usuario
    //       password: faker.internet.password(),
    //       permiso: 'user'
    //     };
    
    //     const randomClient = {
    //       solicitudBaja: false,
    //       from: faker.internet.email(),
    //       historialPedidos: [{
    //         tagNumber: faker.number.int({ min: 100, max: 999 }),
    //         fechaPedido: faker.date.recent(),
    //         fechaRetiro: faker.date.recent(),
    //         tiempoEspera: faker.number.int({ min: 5, max: 120 }),  // Tiempo de espera en minutos
    //         estadoPorBarra: 'completado',
    //         confirmacionPorCliente: true,
    //         mensajes: [
    //           { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() },
    //           { body: faker.lorem.sentence(), fecha: faker.date.recent().toISOString() }
    //         ]
    //       }],
    //       promedioTiempo: faker.number.int({ min: 10, max: 60 })
    //     };
    
    //     const randomPayment = {
    //       fecha: faker.date.recent(),
    //       monto: faker.number.int({ min: 10, max: 1000 }),
    //       metodo: faker.finance.transactionType()
    //     };
    
    //     // Crear el nuevo administrador con un usuario, cliente y pago generados aleatoriamente
    //     const newAdmin = new Admin({
    //       email,
    //       password,
    //       localName,
    //       localNumber: +54112312333,
    //       usuarios: [randomUser],
    //       clientes: [randomClient],
    //       pagos: [randomPayment],
    //       facturacion: {
    //         cbu: faker.finance.accountNumber(),
    //         medioDePago: faker.finance.creditCardIssuer(),
    //         alias: faker.finance.iban()
    //       },
    //       tipoDeLicencia: 'premium',  // Tipo de licencia "premium"
    //       horariosDeOperacion: '8 a 17hs'  // Horario de operación predefinido
    //     });
    
      

        // ESTO ES LO REAL!!!!------->
        // Crear un nuevo administrador con solo los campos iniciales
        const newAdmin = new Admin({
            email,
            password,
            localName,  // Almacena solo lo necesario por ahora

        });

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

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const isPasswordValid = password === admin.password; // Comparación directa
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Guardar el localNumber en una cookie
        const localNumber = admin.localNumber;
        res.cookie('localNumber', localNumber, { httpOnly: true });

        res.status(200).json({ message: "Inicio de sesión exitoso", localNumber });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
}


// async function changeDbDashboard(req, res) {
//     // Leer el localNumber desde la cookie
//     console.log(req.cookies); // Para verificar si localNumber está presente

//     const localNumber = req.cookies.localNumber;

//     if (!localNumber) {
//     return res.status(400).json({ error: "No se encontró el número de local" });
// }

//     if (!localNumber) {
//         return res.status(403).json({ error: 'No autorizado. Faltan credenciales.' });
//     }

//     try {
//         // Cambiar la conexión a la base de datos específica del local
//         const dbName = `Local_${localNumber}`;
//         const newDbConnection = mongoose.connection.useDb(dbName); // Cambia la base de datos

//         // Ahora puedes hacer consultas a la base de datos de ese local
//         const clientes = await newDbConnection.collection('clientes').find().toArray();
//         // res.status(200).json({ message: `Conectado a la base de datos ${dbName}`, clientes });
//         console.log('Database is connected to:' , newDbConnection.dbName);

//     } catch (error) {
//         console.error('Error al acceder al dashboard:', error);
//         res.status(500).json({ error: 'Error al acceder al dashboard' });
//     }
// }





//funcion para un nuevo local:


// Exportar los métodos
export const methods = {
    reciveMessage,
    notifyUserForPickUp,
    notifyUserPickedUp,
    newLocal,
    login,
    getLocales,
    cargarLocales,
    getLocalDetails
    // changeDbDashboard,
};
