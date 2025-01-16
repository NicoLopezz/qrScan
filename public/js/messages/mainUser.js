import { filterClients, selectAllClients, deselectAllClients, displayClientList } from './clients.js';
import { loadChat, sendMessage, setCurrentClient } from './chat.js';
import { updateSelectedCount } from './utils.js';

// ========================== VARIABLES GLOBALES ==========================
let lavadosCargados = [];

// ========================== EVENTOS PRINCIPALES ==========================
document.addEventListener("DOMContentLoaded", async () => {
    const adminId = getCookie('adminId');
    if (!adminId) {
        
        console.error('No se encontró el adminId en las cookies.');
        return;
    }

    // Obtener datos desde la API
    const userInfo = await fetchUserInfo(adminId);

    if (userInfo && Array.isArray(userInfo)) {
        lavadosCargados = userInfo;
        displayUserInfo(userInfo);        // Mostrar el nombre del local y total de clientes
        mostrarClientesDelDia(userInfo);  // Mostrar clientes del día
        calcularTiempoPromedio(userInfo); // Calcular el tiempo promedio de lavado
        calcularCalificacionPromedio(userInfo); // Calcula la calificación promedio
        calcularServicioMasPedido(userInfo); // Calcula el servicio más pedido
        displayClientList(lavadosCargados, handleClientClick); // Mostrar lavados
    } else {
        console.error("No se pudo obtener la información del usuario.");
    }

    // Inicializar eventos
    inicializarEventosBusqueda();
    inicializarEventosMensajeria();
    inicializarEventosSeleccion();
});

// ========================== FUNCIONES PRINCIPALES ==========================
async function fetchUserInfo(adminId) {
    try {
        const response = await fetch(`/api/admins/${adminId}/lavados`);
        if (!response.ok) throw new Error('Error al obtener la información del usuario.');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        return null;
    }
}

function displayUserInfo(userInfo) {
    const localNameElement = document.getElementById("localName");
    const totalPedidosElem = document.getElementById('totalPedidos');

    if (Array.isArray(userInfo) && userInfo.length > 0) {
        const totalLavados = userInfo.length;

        if (localNameElement) {
            localNameElement.textContent = "Nombre del Local"; // Nombre estático o dinámico si existe
        }

        if (totalPedidosElem) {
            totalPedidosElem.textContent = totalLavados;
        }
    } else {
        console.warn('No hay datos de lavados en userInfo.');
        totalPedidosElem.textContent = '0';
    }
}

function mostrarClientesDelDia(lavados) {
    const clientCountElem = document.getElementById('clientCount');

    const hoy = new Date();
    const fechaActualLocal = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    const clientesDelDia = lavados.filter(lavado => {
        if (lavado.fechaDeAlta) {
            const fechaAlta = new Date(lavado.fechaDeAlta);
            const fechaAltaLocal = `${fechaAlta.getFullYear()}-${(fechaAlta.getMonth() + 1).toString().padStart(2, '0')}-${fechaAlta.getDate().toString().padStart(2, '0')}`;
            return fechaAltaLocal === fechaActualLocal;
        }
        return false;
    });
    if (clientCountElem) {
        clientCountElem.textContent = clientesDelDia.length;
    } else {
        console.warn('Elemento clientCount no encontrado en el DOM.');
    }
}

function calcularServicioMasPedido(lavados) {
    const servicioElem = document.getElementById('ServicioMasPedido');

    if (!Array.isArray(lavados) || lavados.length === 0) {
        console.warn('No hay lavados disponibles para calcular el servicio más pedido.');
        servicioElem.textContent = 'N/A';
        return;
    }

    // Contador de tipos de lavado
    const contadorServicios = lavados.reduce((contador, lavado) => {
        const tipo = lavado.tipoDeLavado || 'Desconocido';
        contador[tipo] = (contador[tipo] || 0) + 1;
        return contador;
    }, {});

    // Encontrar el tipo de lavado con mayor frecuencia
    const servicioMasPedido = Object.keys(contadorServicios).reduce((max, tipo) => {
        return contadorServicios[tipo] > contadorServicios[max] ? tipo : max;
    }, Object.keys(contadorServicios)[0]);
    // Actualizar el elemento en el DOM
    if (servicioElem) {
        servicioElem.textContent = servicioMasPedido;
    } else {
        console.warn('Elemento con id="ServicioMasPedido" no encontrado.');
    }
}



function calcularTiempoPromedio(lavados) {
    const tiempoLavadoElem = document.getElementById('tiempoPromedio');

    if (!Array.isArray(lavados) || lavados.length === 0) {
        console.warn('No hay lavados disponibles para calcular el tiempo promedio.');
        tiempoLavadoElem.textContent = '0"0\'';
        return;
    }

    // Sumar todos los tiempos de espera del historial de lavados
    const totalTiempo = lavados.reduce((total, lavado) => {
        if (lavado.historialLavados && Array.isArray(lavado.historialLavados)) {
            const tiempoPorHistorial = lavado.historialLavados.reduce((acc, historial) => {
                return acc + (historial.tiempoEspera || 0);
            }, 0);
            return total + tiempoPorHistorial;
        }
        return total;
    }, 0);

    // Calcular el promedio
    const promedioTiempo = Math.floor(totalTiempo / lavados.length);

    // Convertir el tiempo en formato horas"minutos'
    const horas = Math.floor(promedioTiempo / 60);
    const minutos = promedioTiempo % 60;

    // Mostrar el tiempo promedio en el formato correcto
    const tiempoFormateado = `${horas}"${minutos}'`;
    if (tiempoLavadoElem) {
        tiempoLavadoElem.textContent = tiempoFormateado;
    } else {
        console.warn('Elemento con id="tiempoPromedio" no encontrado.');
    }
}


function calcularCalificacionPromedio(lavados) {
    const calificacionElem = document.getElementById('calificacionPromedio');

    if (!Array.isArray(lavados) || lavados.length === 0) {
        console.warn('No hay lavados disponibles para calcular la calificación promedio.');
        calificacionElem.textContent = 'N/A';
        return;
    }

    // Sumar todas las puntuaciones de calidad
    const totalPuntuacion = lavados.reduce((total, lavado) => {
        return total + (lavado.puntuacionCalidad || 0);
    }, 0);

    // Calcular el promedio
    const promedioPuntuacion = (totalPuntuacion / lavados.length).toFixed(1); // Redondear a un decimal
    // Actualizar el elemento en el DOM
    if (calificacionElem) {
        calificacionElem.textContent = promedioPuntuacion;
    } else {
        console.warn('Elemento con id="calificacionPromedio" no encontrado.');
    }
}

// Función para manejar filtros de lavados y visibilidad de mensajes
function aplicarFiltro(selectedValue) {
    // Siempre partimos de los datos originales
    let lavadosFiltrados = [...lavadosCargados];

    // Ocultar todos los mensajes antes de aplicar el filtro
    activarMensaje(null);

    // Aplicar el filtro correspondiente
    switch (selectedValue) {
        case 'low-comments':
            // Filtrar lavados con puntuación promedio baja
            lavadosFiltrados = lavadosCargados.filter(lavado => lavado.puntuacionPromedio <= 3);
            activarMensaje(2);
            break;

            case 'no-service-15':
                // Filtrar lavados con más de 15 días desde el último servicio
                lavadosFiltrados = lavadosCargados.filter(lavado => {
                    const hoy = new Date();
            
                    // Validar que 'historialLavados' existe y es un array con elementos
                    if (!lavado.historialLavados || !Array.isArray(lavado.historialLavados) || lavado.historialLavados.length === 0) {
                        console.warn('Lavado sin historial de lavados o vacío:', lavado);
                        return false; // Excluir si no hay historial
                    }
            
                    // Obtener el último lavado (fechaEgreso más reciente)
                    const ultimoHistorial = lavado.historialLavados.reduce((ultimo, actual) => {
                        const fechaEgresoUltimo = new Date(ultimo.fechaEgreso);
                        const fechaEgresoActual = new Date(actual.fechaEgreso);
                        return fechaEgresoActual > fechaEgresoUltimo ? actual : ultimo;
                    });
            
                    const fechaUltimoLavado = new Date(ultimoHistorial.fechaEgreso);
                    if (isNaN(fechaUltimoLavado)) {
                        console.warn('Fecha de egreso inválida:', ultimoHistorial.fechaEgreso);
                        return false; // Excluir si la fecha es inválida
                    }
            
                    // Calcular la diferencia en días
                    const diferenciaDias = (hoy - fechaUltimoLavado) / (1000 * 60 * 60 * 24);
                    return diferenciaDias > 15;
                });
            
                activarMensaje(1); // Activar mensaje tipo 1
                break;
            

        case 'frequent':
            // Filtrar lavados de clientes frecuentes
            lavadosFiltrados = lavadosCargados.filter(lavado => lavado.lavadosAcumulados >= 3);
            activarMensaje(3);
            break;

        case 'promo-1':
            // Mostrar todos los datos
            lavadosFiltrados = [...lavadosCargados]; // Copia completa de los datos originales
            activarMensaje(4);
            break;

        case 'ninguno': // Opción para restablecer todo
            // Mostrar todos los datos
            lavadosFiltrados = [...lavadosCargados]; // Copia completa de los datos originales
            activarMensaje(null); // No activa ningún mensaje
            break;

        default:
            break;
    }

    // Renderizar la tabla con los lavados filtrados
    displayClientList(lavadosFiltrados, handleClientClick);
}



// Manejar el cambio en el filtro
filterSelect.addEventListener('change', () => {
    const selectedValue = filterSelect.value;
    aplicarFiltro(selectedValue);
});

function activarMensaje(selectedType) {
    // Seleccionar todos los contenedores que tienen mensajes (chatDesktop y chatMovil)
    const containers = document.querySelectorAll('#chatDesktop, #chatMovil');

    // Iterar por cada contenedor para aplicar los cambios
    containers.forEach(container => {
        // Obtener todos los mensajes dentro de este contenedor
        const messages = container.querySelectorAll('.message-bubble');
        
        // Desactivar todos los mensajes en este contenedor
        messages.forEach(message => message.classList.remove('active'));

        // Activar el mensaje específico
        const mensajeSeleccionado = container.querySelector(`.message-type-${selectedType}`);
        if (mensajeSeleccionado) {
            mensajeSeleccionado.classList.add('active');
        }
    });
}


// ========================== EVENTOS ==========================
function inicializarEventosBusqueda() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filterClients(query, handleClientClick);
        clearSearch.style.display = searchInput.value ? 'inline' : 'none';
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        displayClientList(lavadosCargados, handleClientClick);
    });
}

function inicializarEventosMensajeria() {
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function inicializarEventosSeleccion() {
    const selectAllButton = document.getElementById('selectAllButton');
    const deselectAllButton = document.getElementById('deselectAllButton');

    selectAllButton.addEventListener('click', selectAllClients);
    deselectAllButton.addEventListener('click', deselectAllClients);
}

// ========================== MANEJADORES ==========================
function handleClientClick(client) {
    setCurrentClient(client);
    loadClientData(client);
}



function loadClientData(client) {
    document.getElementById('client-name').textContent = client.nombre || "No Disponible";
    document.getElementById('client-phone').textContent = client.from || "Número no disponible";
    document.getElementById('client-score').textContent = client.calidad || 'N/A';
    document.getElementById('client-loyalty').innerHTML = generateStars(client.visits || 3);
    document.getElementById('client-resent').textContent = client.resent || 'A determinar';
}

// ========================== UTILIDADES ==========================
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function generateStars(visits) {
    return `<span class="stars">${'⭐'.repeat(visits)}${'☆'.repeat(5 - visits)}</span>`;
}
