const tablaClientes = document.getElementById('tablaClientes');
const nombreCliente = document.getElementById('nombreCliente');
const comensales = document.getElementById('comensales');
const observacion = document.getElementById('observacion');
const tiempoRestanteElem = document.getElementById('tiempoRestante');

let intervalos = {};
let clienteSeleccionado = null;
let reservas = []; // Almacena las reservas desde la base de datos

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

            // Cargar tiempo restante desde localStorage o asignar 5 minutos por defecto
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

// Función para agregar una fila en la tabla para cada reserva
function agregarFilaTabla(reserva) {
    const row = document.createElement('tr');
    row.id = `cliente-row-${reserva._id}`;
    row.innerHTML = `
        <td>${reserva.nombre}</td>
        <td>${reserva.comensales}</td>
        <td>${reserva.observacion}</td>
        <td id="tiempo-cliente-${reserva._id}">5:00</td>
    `;
    
    // Agregar evento de clic para cargar datos en la tarjeta
    row.addEventListener('click', () => seleccionarCliente(reserva._id));
    tablaClientes.appendChild(row);

    // Inicializar el temporizador en el objeto intervalos si no existe
    if (!intervalos[reserva._id]) {
        intervalos[reserva._id] = {
            tiempoRestante: 300,
            intervalo: null
        };
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

// Función para iniciar la cuenta regresiva del cliente seleccionado
function iniciarCuentaRegresiva() {
    const clienteId = clienteSeleccionado;
    if (!clienteId || intervalos[clienteId].intervalo) return; // Solo iniciar si no está ya en ejecución

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
            alert("Cliente agregado con éxito");

            // Guardar la sección actual en localStorage antes de recargar
            localStorage.setItem('currentSection', 'section-mensajes'); // Cambia 'section-mensajes' a la sección deseada

            // Recargar la página
            location.reload();
        } else {
            alert("Error al agregar cliente");
        }
    })
    .catch(error => console.error("Error:", error));
}

// Restaurar la sección activa al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const currentSection = localStorage.getItem('currentSection');
    if (currentSection) {
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(currentSection).classList.add('active');
        localStorage.removeItem('currentSection'); // Limpiar para futuras cargas
    }
});


function generarQR() {
    // Obtener el cliente seleccionado (asegúrate de tener su ID guardado de alguna manera, por ejemplo en `clienteSeleccionado`)
    if (!clienteSeleccionado) {
        console.error("No hay un cliente seleccionado.");
        return;
    }

    // Enviar solicitud al servidor para actualizar el campo `selected` a true
    fetch(`/api/reservas/${clienteSeleccionado}/updateSelected`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected: true })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Cliente seleccionado actualizado correctamente.");
            // Aquí puedes también proceder a generar el QR, si es necesario
        } else {
            console.error("Error al actualizar el cliente seleccionado.");
        }
    })
    .catch(error => console.error("Error en la solicitud:", error));
}



// Llamar a la función para cargar las reservas al cargar la página
document.addEventListener('DOMContentLoaded', cargarReservas);

// Hacer que agregarCliente esté disponible globalmente
window.agregarCliente = agregarCliente;