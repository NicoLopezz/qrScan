const tablaClientes = document.getElementById('tablaClientes');
const nombreCliente = document.getElementById('nombreCliente');
const comensales = document.getElementById('comensales');
const observacion = document.getElementById('observacion');
const tiempoRestanteElem = document.getElementById('tiempoRestante');

let intervalos = {};
let clienteSeleccionado = null;
let lavadoSeleccionado = null;
let reservas = []; // Almacena las reservas desde la base de datos
let lavados = [];
let cuentaRegresivaEnPausa = false; // Variable para controlar el estado de pausa

// Función para cargar reservas desde la base de datos
async function cargarReservas() {
    const adminId = getCookie('adminId'); // Obtén el adminId de la cookie

    try {
        const response = await fetch(`/api/admins/${adminId}/reservas`);
        if (!response.ok) throw new Error('No se pudo cargar las reservas');
        reservas = await response.json();

        // Limpiar la tabla antes de agregar las filas
        tablaClientes.innerHTML = '';

        // Iterar sobre las reservas y agregarlas a la tabla
        reservas.forEach(reserva => {
            agregarFilaTabla(reserva);

            // Cargar tiempo restante desde localStorage
            const tiempoRestante = localStorage.getItem(`cliente-${reserva._id}-tiempoRestante`);
            intervalos[reserva._id] = {
                tiempoRestante: tiempoRestante ? parseInt(tiempoRestante) : 300, // 5 minutos si no está en localStorage
                intervalo: null
            };

            // Mostrar el tiempo actual en la tabla sin iniciar el temporizador
            actualizarTiempoTabla(reserva._id, intervalos[reserva._id].tiempoRestante);
        });
    } catch (error) {
        console.error('Error al cargar reservas:', error);
    }
}

// Función para cargar lavados desde la base de datos
async function cargarLavados() {
    const adminId = getCookie('adminId'); // Obtén el adminId de la cookie

    try {
        const response = await fetch(`/api/admins/${adminId}/lavados`);
        if (!response.ok) throw new Error('No se pudo cargar los lavaderos');

        const data = await response.json();
        console.log('Respuesta del servidor:', data); // Verifica los datos recibidos
        lavados = data;

        if (!lavados.length) {
            console.warn('No se encontraron lavaderos asociados al administrador.');
            return;
        }

        // Ordenar los lavados por fechaDeAlta (más reciente primero)
        lavados.sort((a, b) => new Date(b.fechaDeAlta).getTime() - new Date(a.fechaDeAlta).getTime());

        // Limpiar la tabla antes de agregar las filas
        const tablaLavados = document.getElementById('tablaLavados');
        if (!tablaLavados) {
            console.error('La tabla de lavados no existe en el DOM.');
            return;
        }
        tablaLavados.innerHTML = '';

        // Iterar sobre los lavados ordenados y agregarlos a la tabla
        lavados.forEach(lavado => {
            agregarFilaTablaLavados(lavado);
        });
    } catch (error) {
        console.error('Error al cargar lavaderos:', error);
    }
}



// Función para seleccionar un cliente y mostrar sus detalles en la tarjeta sin iniciar automáticamente la cuenta regresiva
function seleccionarCliente(clienteId) {
    clienteSeleccionado = clienteId;
    const reserva = reservas.find(r => r._id === clienteId); // Encuentra la reserva seleccionada

    if (reserva) {
        nombreCliente.textContent = reserva.nombre;
        comensales.textContent = `Comensales: ${reserva.comensales}`;
        observacion.textContent = `Observación: ${reserva.observacion}`;

        // Mostrar el tiempo actual en la tarjeta sin iniciar el temporizador
        actualizarTiempoVisual(intervalos[clienteId].tiempoRestante);

        // Marcar la fila seleccionada
        document.querySelectorAll('.selected').forEach(row => row.classList.remove('selected'));
        document.getElementById(`cliente-row-${clienteId}`).classList.add('selected');
    }
}


// Función para seleccionar un lavado y mostrar sus detalles en la tarjeta sin iniciar automáticamente la cuenta regresiva
function seleccionarLavado(lavadoId) {
    lavadoSeleccionado = lavadoId;
    const lavado = lavados.find(l => l._id === lavadoId); // Encuentra el lavado seleccionado
    console.log(lavadoSeleccionado)

    if (lavado) {
        // Actualizar detalles en la tarjeta
        document.getElementById('nombreCliente').textContent = `Nombre: ${lavado.nombre}`;
        document.getElementById('patenteCliente').textContent = `Patente: ${lavado.patente}`;
        document.getElementById('modeloCliente').textContent = `Modelo: ${lavado.modelo}`;
        document.getElementById('lavadoCliente').textContent = `Tipo de Lavado: ${lavado.tipoDeLavado}`;
        document.getElementById('observacionCliente').textContent = `Observación: ${lavado.observacion || 'Sin observaciones'}`;

        // Marcar la fila seleccionada
        document.querySelectorAll('.selected').forEach(row => row.classList.remove('selected'));
        const filaSeleccionada = document.getElementById(`lavado-row-${lavadoId}`);
        if (filaSeleccionada) {
            filaSeleccionada.classList.add('selected');
        }
    } else {
        console.error('Lavado no encontrado:', lavadoId);
    }
}


function agregarFilaTabla(reserva) {
    const row = document.createElement('tr');
    row.id = `cliente-row-${reserva._id}`;

    // Verificar si el teléfono está vacío y si el estado de confirmación es true o false
    const telefono = reserva.from
        ? `...${reserva.from.slice(-4)}`  // Mostrar solo los últimos 4 dígitos
        : 'Vacío';
    const confirmo = reserva.textConfirmation ? 'Sí' : 'No';

    row.innerHTML = `
        <td>${reserva.nombre}</td>
        <td>${reserva.comensales}</td>
        <td>${reserva.observacion}</td>
        <td>${confirmo}</td>
        <td id="tiempo-cliente-${reserva._id}">5:00</td>
    `;

    // Agregar evento de clic para cargar datos en la tarjeta
    row.addEventListener('click', () => seleccionarCliente(reserva._id));
    tablaClientes.appendChild(row);
}


// Función para agregar una fila a la tabla de lavados
function agregarFilaTablaLavados(lavado) {
    const row = document.createElement('tr');
    row.id = `lavado-row-${lavado._id}`;

    // Verificar datos opcionales o vacíos
    const estado = lavado.estado ? lavado.estado : 'Pendiente'; // Estado predeterminado
    const observacion = lavado.observacion ? lavado.observacion : 'Sin observaciones';

    row.innerHTML = `
    <td data-modelo="${lavado.modelo}" data-lavado="${lavado.tipoDeLavado}">${lavado.nombre}</td>
    <td>${lavado.modelo}</td>
    <td>${lavado.patente}</td>
    <td>${lavado.tipoDeLavado}</td>
    <td>${observacion}</td>
`;


    // Agregar evento de clic para cargar datos en la tarjeta de lavado
    row.addEventListener('click', () => seleccionarLavado(lavado._id));
    const tablaLavados = document.getElementById('tablaLavados');
    if (tablaLavados) {
        tablaLavados.appendChild(row);
    } else {
        console.error('La tabla de lavados no existe en el DOM.');
    }
}


// Función para agregar un nuevo cliente y actualizar la tabla
function agregarCliente() {
    const nombre = document.getElementById('inputNombre').value;
    const comensales = parseInt(document.getElementById('inputComensales').value);
    const observacion = document.getElementById('inputObservacion').value;

    fetch('/api/admins/agregarCliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, comensales, observacion })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification("Cliente agregado con éxito");
                const nuevoCliente = { _id: data.id, nombre, comensales, observacion };
                reservas.push(nuevoCliente);
                agregarFilaTabla(nuevoCliente);
                // Recargar la página después de agregar el cliente
                window.location.reload();
            } else {
                showNotification("Error al agregar cliente.", "error");
            }
        })
        .catch(error => console.error("Error:", error));
}


function agregarLavado() {
    // Obtener valores del formulario
    const nombre = document.getElementById('inputNombre2').value.trim();
    const modelo = document.getElementById('inputModelo').value.trim();
    const patente = document.getElementById('inputPatente').value.trim();
    const tipoDeLavado = document.getElementById('selectServicio').value;
    const observacion = document.getElementById('inputObservation').value.trim();


    // Verificar si los valores están llegando correctamente
    console.log("Nombre:", nombre);
    console.log("Modelo:", modelo);
    console.log("Patente:", patente);
    console.log("Tipo de Lavado:", tipoDeLavado);
    console.log("Observación:", observacion);




    // Validar los campos del formulario
    if (!nombre || !modelo || !patente || !tipoDeLavado) {
        showNotification("Por favor, completa todos los campos obligatorios para el lavado.", "error");
        return;
    }



    // Enviar solicitud al servidor
    fetch('/api/admins/agregarLavado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'lavado',
            nombre,
            modelo,
            patente,
            tipoDeLavado,
            observacion
        })
    })
        .then(response => {
            if (!response.ok) {

                throw new Error("No se pudo completar la operación.");
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification("Lavado agregado con éxito");

                // Verificar si es versión móvil
                if (window.innerWidth <= 768) {
                    handleOption2("tabla");
                }
                const nuevoLavado = { _id: data.id, nombre, modelo, patente, tipoDeLavado, observacion };
                agregarFilaTablaLavados(nuevoLavado);
                // window.location.reload();
                cargarLavados()
                limpiarFormularioLavado();

            } else {
                showNotification(data.error || "Error al agregar el lavado.", "error");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            // showNotification("Error de red o servidor. Intenta nuevamente.", "error");
        });
}

function handleOption2(option) {


    console.log("Ejecutando handleOption2 con opción:", option);
    // Aquí coloca la lógica necesaria
    // Seleccionamos los elementos necesarios
    const tarjetaYqr = document.querySelector("#tarjetaYqr");
    const tabla = document.querySelector("#tablaLavados2");
    const highlight = document.querySelector('.background-highlight');

    // Lógica para mostrar/ocultar elementos
    if (option === 'reservas') {
        if (tarjetaYqr) {
            tarjetaYqr.style.display = "grid"; // Hace visible tarjetaYqr
        }
        if (tabla) {
            tabla.style.display = "none"; // Oculta tabla
        }

        // Mover el highlight
        if (highlight) {
            highlight.style.transform = 'translateX(0)';
        }
    } else if (option === 'tabla') {
        if (tabla) {
            tabla.style.display = "grid"; // Hace visible tabla
        }
        if (tarjetaYqr) {
            tarjetaYqr.style.display = "none"; // Oculta tarjetaYqr
        }

        // Mover el highlight
        if (highlight) {
            highlight.style.transform = 'translateX(100%)';
        }
    }
}


function limpiarFormularioLavado() {
    // Selecciona los campos del formulario
    const nombre = document.getElementById('inputNombre2');
    const modelo = document.getElementById('inputModelo');
    const patente = document.getElementById('inputPatente');
    const tipoDeLavado = document.getElementById('selectServicio');
    const observacion = document.getElementById('inputObservation');

    // Resetea los valores a vacíos o su estado predeterminado
    if (nombre) nombre.value = '';
    if (modelo) modelo.value = '';
    if (patente) patente.value = '';
    if (tipoDeLavado) tipoDeLavado.selectedIndex = 0; // Selecciona el primer valor
    if (observacion) observacion.value = '';
}



// Función para generar QR y actualizar la reserva seleccionada
async function generarQR() {
    if (!clienteSeleccionado) {
        showNotification("No hay un cliente seleccionado.", "error");
        console.error("No hay un cliente seleccionado.");
        return;
    }

    try {
        const response = await fetch(`/api/reservas/${clienteSeleccionado}/updateSelected`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selected: true })
        });

        const data = await response.json();
        if (data.success) {
            showNotification("Por favor, escanear el qr.", "success");
            console.log("Cliente seleccionado actualizado correctamente.");
        } else {
            showNotification("Error al actualizar el cliente seleccionado.", "error");
            console.error("Error al actualizar el cliente seleccionado.");
        }
    } catch (error) {
        showNotification("Ocurrió un error al intentar actualizar el cliente.", "error");
        console.error("Error en la solicitud:", error);
    }
}


async function generarQRlavado() {
    if (!lavadoSeleccionado) {
        showNotification("No hay un cliente seleccionado.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/lavados/${lavadoSeleccionado}/actualizarSelectedLavado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selected: true })
        });

        const data = await response.json();
        if (data.success) {
            showNotification("Por favor escanee el QR", "success");

            // Agrega la clase visible
            const qrOverlay = document.getElementById("qrOverlay");
            qrOverlay.classList.add("visible");
        } else {
            showNotification("Error al actualizar el cliente seleccionado.", "error");
        }
    } catch (error) {
        showNotification("Ocurrió un error al intentar actualizar el cliente.", "error");
    }
}

// Cerrar el QR al hacer clic en el botón "X"
document.getElementById("closeQR").addEventListener("click", () => {
    const qrOverlay = document.getElementById("qrOverlay");
    qrOverlay.classList.remove("visible");
});




// Función para iniciar la cuenta regresiva del cliente seleccionado
// Función para iniciar o reanudar la cuenta regresiva del cliente seleccionado
function iniciarCuentaRegresiva() {
    const clienteId = clienteSeleccionado;
    if (!clienteId || intervalos[clienteId].intervalo) return; // Solo iniciar si no está en pausa o ya en ejecución

    // Si es una cuenta regresiva nueva (sin tiempo restante guardado), establecemos 5 minutos
    if (intervalos[clienteId].tiempoRestante === undefined) {
        intervalos[clienteId].tiempoRestante = 300;
    }

    // Crear un nuevo intervalo solo para el cliente seleccionado
    intervalos[clienteId].intervalo = setInterval(() => {
        if (intervalos[clienteId].tiempoRestante > 0) {
            intervalos[clienteId].tiempoRestante--;
            localStorage.setItem(`cliente-${clienteId}-tiempoRestante`, intervalos[clienteId].tiempoRestante);
            actualizarTiempoTabla(clienteId, intervalos[clienteId].tiempoRestante);

            // Actualizar visualización en la tarjeta solo si es el cliente seleccionado
            if (clienteSeleccionado === clienteId) {
                actualizarTiempoVisual(intervalos[clienteId].tiempoRestante);
            }
        } else {
            clearInterval(intervalos[clienteId].intervalo);
            intervalos[clienteId].intervalo = null;
            localStorage.removeItem(`cliente-${clienteId}-tiempoRestante`);
        }
    }, 1000);
}


// Función para reiniciar la cuenta regresiva del cliente seleccionado
function reiniciarCuentaRegresiva() {
    const clienteId = clienteSeleccionado;
    if (!clienteId) return;

    // Detener el temporizador actual si existe
    if (intervalos[clienteId].intervalo) {
        clearInterval(intervalos[clienteId].intervalo);
        intervalos[clienteId].intervalo = null;
    }

    // Reiniciar el tiempo restante y guardarlo en localStorage
    intervalos[clienteId].tiempoRestante = 300;
    localStorage.setItem(`cliente-${clienteId}-tiempoRestante`, 300);
    actualizarTiempoVisual(300);
    actualizarTiempoTabla(clienteId, 300);
}

// Función para alternar entre pausa y reanudación de la cuenta regresiva
function togglePausaReanudar() {
    const clienteId = clienteSeleccionado;
    if (!clienteId) return; // Salir si no hay cliente seleccionado

    const btnPararPlay = document.getElementById("btnParar");
    const icono = btnPararPlay.querySelector("i");

    if (cuentaRegresivaEnPausa) {
        // Si la cuenta regresiva estaba en pausa, reanudar
        iniciarCuentaRegresiva(); // Llamar a la función que reanuda la cuenta regresiva
        icono.classList.remove("fa-play");
        icono.classList.add("fa-stop");
        cuentaRegresivaEnPausa = false;
    } else {
        // Si la cuenta regresiva está en marcha, pausar
        clearInterval(intervalos[clienteId].intervalo); // Pausar la cuenta regresiva
        intervalos[clienteId].intervalo = null;
        icono.classList.remove("fa-stop");
        icono.classList.add("fa-play");
        cuentaRegresivaEnPausa = true;
    }
}


// Función para actualizar el tiempo visual en la tarjeta del cliente
function actualizarTiempoVisual(tiempo) {
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    tiempoRestanteElem.textContent = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
}

// Función para actualizar el tiempo visual en la tabla
function actualizarTiempoTabla(clienteId, tiempo) {
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    const tiempoElem = document.getElementById(`tiempo-cliente-${clienteId}`);
    tiempoElem.textContent = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
}



// Función para marcar el cliente como "eliminado" sin borrarlo de la tabla
function eliminarReserva() {
    const clienteId = clienteSeleccionado; // Asegura que tienes el cliente seleccionado

    if (!clienteId) {
        showNotification("No hay ningún cliente seleccionado para eliminar.", "error");
        return;
    }

    // Aplicar el estilo de "eliminado" al cliente
    const filaCliente = document.getElementById(`cliente-row-${clienteId}`);
    if (filaCliente) {
        filaCliente.classList.remove('highlight-row'); // Remover el fondo amarillo
        filaCliente.classList.add('disabled-row'); // Aplicar estilo en cursiva y gris
    }

    showNotification("El cliente ha sido marcado como eliminado.");
}





// Hacer que agregarCliente y generarQR estén disponibles globalmente
window.agregarCliente = agregarCliente;
window.generarQR = generarQR;

// Llamar a la función para cargar las reservas al cargar la página
document.addEventListener('DOMContentLoaded', cargarReservas);
document.addEventListener('DOMContentLoaded', cargarLavados);

// Modificar el evento del botón para iniciar la cuenta regresiva y aplicar el estilo
document.getElementById('btnIniciar').addEventListener('click', async () => {
    try {
        const clienteId = clienteSeleccionado; // Asegura que ya tienes el cliente seleccionado

        // Solicitud al servidor para enviar el mensaje
        const response = await fetch(`/api/enviarMensajeCuentaRegresiva`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clienteId })
        });

        const result = await response.json();
        if (result.success) {
            showNotification("Mensaje enviado al cliente exitosamente.");

            // Inicia la cuenta regresiva solo si el mensaje fue enviado con éxito
            iniciarCuentaRegresiva();

            // Aplicar el estilo de resaltado a la fila del cliente
            const filaCliente = document.getElementById(`cliente-row-${clienteId}`);
            if (filaCliente) {
                filaCliente.classList.add('highlight-row');
            }

            // Cambiar el color de la columna "Tiempo" a rojo
            const tiempoCelda = document.getElementById(`tiempo-cliente-${clienteId}`);
            if (tiempoCelda) {
                tiempoCelda.classList.add('red-text');
            }
        } else {
            showNotification("Hubo un problema al enviar el mensaje.", "error");
        }
    } catch (error) {
        showNotification("Ocurrió un error al intentar enviar el mensaje.", "error");
        console.error('Error al enviar el mensaje:', error);
    }
});

// document.getElementById('btnAvisoLavado').addEventListener('click', async () => {
//     try {
//         const clienteId = lavadoSeleccionado; // Asegura que ya tienes el cliente seleccionado

//         // Solicitud al servidor para enviar el mensaje
//         const response = await fetch(`/api/enviarAvisoRetiroLavado`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ clienteId })
//         });

//         const result = await response.json();
//         if (result.success) {
//             showNotification("Mensaje enviado al cliente exitosamente.");

//             // Inicia la cuenta regresiva solo si el mensaje fue enviado con éxito
//             iniciarCuentaRegresiva();

//             // Aplicar el estilo de resaltado a la fila del cliente
//             const filaCliente = document.getElementById(`cliente-row-${clienteId}`);
//             if (filaCliente) {
//                 filaCliente.classList.add('highlight-row');
//             }

//             // Cambiar el color de la columna "Tiempo" a rojo
//             const tiempoCelda = document.getElementById(`tiempo-cliente-${clienteId}`);
//             if (tiempoCelda) {
//                 tiempoCelda.classList.add('red-text');
//             }
//         } else {
//             showNotification("Hubo un problema al enviar el mensaje.", "error");
//         }
//     } catch (error) {
//         showNotification("Ocurrió un error al intentar enviar el mensaje.", "error");
//         console.error('Error al enviar el mensaje:', error);
//     }
// });

document.getElementById('btnAvisoLavado2').addEventListener('click', async () => {
    try {
        const clienteId = lavadoSeleccionado; // Asegura que ya tienes el cliente seleccionado

        // Solicitud al servidor para enviar el mensaje
        const response = await fetch(`/api/enviarAvisoRetiroLavado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clienteId })
        });

        const result = await response.json();
        if (result.success) {
            showNotification("Mensaje enviado al cliente.");

            // Inicia la cuenta regresiva solo si el mensaje fue enviado con éxito
            iniciarCuentaRegresiva();

            // Aplicar el estilo de resaltado a la fila del cliente
            const filaCliente = document.getElementById(`cliente-row-${clienteId}`);
            if (filaCliente) {
                filaCliente.classList.add('highlight-row');
            }

            // Cambiar el color de la columna "Tiempo" a rojo
            const tiempoCelda = document.getElementById(`tiempo-cliente-${clienteId}`);
            if (tiempoCelda) {
                tiempoCelda.classList.add('red-text');
            }
        } else {
            showNotification("Hubo un problema al enviar el mensaje.", "error");
        }
    } catch (error) {
        showNotification("Ocurrió un error al intentar enviar el mensaje.", "error");
        console.error('Error al enviar el mensaje:', error);
    }
});

document.getElementById('btnAvisoLavado').addEventListener('click', async () => {
    try {
        const clienteId = lavadoSeleccionado; // Asegura que ya tienes el cliente seleccionado

        // Solicitud al servidor para enviar el mensaje
        const response = await fetch(`/api/enviarEncuesta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clienteId })
        });

        const result = await response.json();
        if (result.success) {
            showNotification("Mensaje enviado al cliente.");

            // Inicia la cuenta regresiva solo si el mensaje fue enviado con éxito
            iniciarCuentaRegresiva();

            // Aplicar el estilo de resaltado a la fila del cliente
            const filaCliente = document.getElementById(`cliente-row-${clienteId}`);
            if (filaCliente) {
                filaCliente.classList.add('highlight-row');
            }

            // Cambiar el color de la columna "Tiempo" a rojo
            const tiempoCelda = document.getElementById(`tiempo-cliente-${clienteId}`);
            if (tiempoCelda) {
                tiempoCelda.classList.add('red-text');
            }
        } else {
            showNotification("Hubo un problema al enviar el mensaje.", "error");
        }
    } catch (error) {
        showNotification("Ocurrió un error al intentar enviar el mensaje.", "error");
        console.error('Error al enviar el mensaje:', error);
    }
});






