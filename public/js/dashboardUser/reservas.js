const clientes = [
    { id: 1, nombre: "Cliente 1", comensales: 4, observacion: "Observación A" },
    { id: 2, nombre: "Cliente 2", comensales: 2, observacion: "Observación B" },
    { id: 3, nombre: "Cliente 3", comensales: 3, observacion: "Observación C" },
    { id: 4, nombre: "Cliente 4", comensales: 5, observacion: "Observación D" },
    { id: 5, nombre: "Cliente 5", comensales: 2, observacion: "Observación E" },
    { id: 6, nombre: "Cliente 6", comensales: 6, observacion: "Observación F" },
    { id: 7, nombre: "Cliente 7", comensales: 3, observacion: "Observación G" },
    { id: 8, nombre: "Cliente 8", comensales: 4, observacion: "Observación H" },
    { id: 9, nombre: "Cliente 9", comensales: 2, observacion: "Observación I" },
    { id: 10, nombre: "Cliente 10", comensales: 5, observacion: "Observación J" }
];

const tablaClientes = document.getElementById('tablaClientes');
const nombreCliente = document.getElementById('nombreCliente');
const comensales = document.getElementById('comensales');
const observacion = document.getElementById('observacion');
const tiempoRestanteElem = document.getElementById('tiempoRestante');

let intervalos = {};
let clienteSeleccionado = null; // Guardará el ID del cliente seleccionado

// Inicializar filas de la tabla y temporizadores de cada cliente
clientes.forEach(cliente => {
    const row = document.createElement('tr');
    row.id = `cliente-row-${cliente.id}`;
    row.innerHTML = `<td>${cliente.nombre}</td>
                     <td>${cliente.comensales}</td>
                     <td>${cliente.observacion}</td>
                     <td id="tiempo-cliente-${cliente.id}">5:00</td>`;
    row.addEventListener('click', () => seleccionarCliente(cliente.id));
    tablaClientes.appendChild(row);

    const tiempoGuardado = localStorage.getItem(`cliente-${cliente.id}-tiempoRestante`);
    intervalos[cliente.id] = { 
        tiempoRestante: tiempoGuardado ? parseInt(tiempoGuardado) : 300,
        intervalo: null 
    };

    if (tiempoGuardado) actualizarTiempoTabla(cliente.id, intervalos[cliente.id].tiempoRestante);
});

function seleccionarCliente(clienteId) {
    clienteSeleccionado = clienteId;
    const cliente = clientes.find(c => c.id === clienteId);
    nombreCliente.textContent = cliente.nombre;
    comensales.textContent = `Comensales: ${cliente.comensales}`;
    observacion.textContent = `Observación: ${cliente.observacion}`;
    actualizarTiempoVisual(intervalos[clienteId].tiempoRestante);

    document.querySelectorAll('.selected').forEach(row => row.classList.remove('selected'));
    document.getElementById(`cliente-row-${clienteId}`).classList.add('selected');
}

function iniciarCuentaRegresiva() {
    const clienteId = clienteSeleccionado;
    if (!clienteId) return;

    if (intervalos[clienteId].intervalo) return;

    intervalos[clienteId].intervalo = setInterval(() => {
        if (intervalos[clienteId].tiempoRestante > 0) {
            intervalos[clienteId].tiempoRestante--;
            localStorage.setItem(`cliente-${clienteId}-tiempoRestante`, intervalos[clienteId].tiempoRestante);
            actualizarTiempoVisual(intervalos[clienteId].tiempoRestante);
            actualizarTiempoTabla(clienteId, intervalos[clienteId].tiempoRestante);
        } else {
            clearInterval(intervalos[clienteId].intervalo);
            intervalos[clienteId].intervalo = null;
            localStorage.removeItem(`cliente-${clienteId}-tiempoRestante`);
        }
    }, 1000);
}

function reiniciarCuentaRegresiva() {
    const clienteId = clienteSeleccionado;
    if (!clienteId) return;

    if (intervalos[clienteId].intervalo) {
        clearInterval(intervalos[clienteId].intervalo);
        intervalos[clienteId].intervalo = null;
    }

    intervalos[clienteId].tiempoRestante = 300;
    localStorage.setItem(`cliente-${clienteId}-tiempoRestante`, 300);
    actualizarTiempoVisual(300);
    actualizarTiempoTabla(clienteId, 300);
}

function actualizarTiempoVisual(tiempo) {
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    tiempoRestanteElem.textContent = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
}

function actualizarTiempoTabla(clienteId, tiempo) {
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    const tiempoElem = document.getElementById(`tiempo-cliente-${clienteId}`);
    tiempoElem.textContent = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
}

window.addEventListener('load', () => {
    clientes.forEach(cliente => {
        const tiempoGuardado = localStorage.getItem(`cliente-${cliente.id}-tiempoRestante`);
        if (tiempoGuardado) {
            intervalos[cliente.id].tiempoRestante = parseInt(tiempoGuardado);

            actualizarTiempoTabla(cliente.id, intervalos[cliente.id].tiempoRestante);

            if (intervalos[cliente.id].tiempoRestante > 0) {
                iniciarCuentaRegresiva(cliente.id);
            }
        }
    });
});
