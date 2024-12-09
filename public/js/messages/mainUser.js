import { filterClients, selectAllClients, deselectAllClients, displayClientList } from './clients.js';
import { loadChat, sendMessage, setCurrentClient } from './chat.js';
import { updateSelectedCount } from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Variable global para almacenar los lavados cargados
    let lavadosCargados = [];

    // Obtener el ID del admin desde las cookies
    const adminId = getCookie('adminId');
    if (!adminId) {
        console.error('No se encontró el adminId en las cookies. El usuario debe iniciar sesión.');
        return;
    }

    // Cargar lavados en la tabla
    await cargarLavadosEnTabla();

    // Obtener información del usuario desde la base de datos
    const userInfo = await fetchUserInfo(adminId);
    if (userInfo) {
        displayUserInfo(userInfo); // Mostrar el nombre del local
    } else {
        console.error("No se pudo obtener la información del usuario.");
    }

    // Búsqueda dinámica de clientes
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filterClients(query, handleClientClick);
    });

    // Limpiar el campo de búsqueda
    const clearSearch = document.getElementById('clearSearch');
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        displayClientList(lavadosCargados, handleClientClick); // Volver a renderizar la lista completa
    });

    // Mostrar u ocultar la cruz de limpiar búsqueda
    searchInput.addEventListener('input', () => {
        clearSearch.style.display = searchInput.value ? 'inline' : 'none';
    });

    // Enviar mensaje al hacer clic en el botón
    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', sendMessage);

    // Enviar mensaje al presionar Enter
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Seleccionar todos los clientes al hacer clic en el botón
    const selectAllButton = document.getElementById('selectAllButton');
    selectAllButton.addEventListener('click', selectAllClients);

    // Deseleccionar todos los clientes al hacer clic en el botón
    const deselectAllButton = document.getElementById('deselectAllButton');
    deselectAllButton.addEventListener('click', deselectAllClients);

    // Función para mostrar el nombre del local en el elemento correspondiente
    function displayUserInfo(userInfo) {
        const localNameElement = document.getElementById("localName");
        if (localNameElement && userInfo.localName) {
            localNameElement.textContent = userInfo.localName;
        }
    }

    // Función para manejar el clic en un cliente, cargar chat e información del cliente
    function handleClientClick(client) {
        setCurrentClient(client); // Establecer el cliente actual
        // loadChat(client); // Cargar el historial de chat del cliente
        loadClientData(client); // Cargar la información del cliente en la caja de datos
    }

    // Función para cargar la información del cliente en la caja de datos
    function loadClientData(client) {
        document.getElementById('client-name').textContent = client.nombre || "No Disponible"; // Nombre fijo por ahora
        document.getElementById('client-phone').textContent = client.from || "Número no disponible";
        document.getElementById('client-score').textContent = client.promedioTiempo || 'N/A';
        document.getElementById('client-loyalty').innerHTML = generateStars(client.visits || 3);
        document.getElementById('client-address').textContent = client.address || 'A determinar';
        document.getElementById('client-local').textContent = client.local || 'A determinar';
        document.getElementById('client-resent').textContent = client.resent || 'A determinar';
    }

    // Función para generar estrellas de fidelidad
    function generateStars(visits) {
        let stars = '⭐'.repeat(visits) + '☆'.repeat(5 - visits);
        return `<span class="stars">${stars}</span>`;
    }

    // Función para cargar lavados en la tabla
    async function cargarLavadosEnTabla() {
        const adminId = getCookie('adminId'); // Obtén el adminId de la cookie

        try {
            // Hacer la solicitud para obtener los lavados
            const response = await fetch(`/api/admins/${adminId}/lavados`);
            if (!response.ok) throw new Error('No se pudo cargar los lavados');

            lavadosCargados = await response.json();

            // Verifica si hay lavados
            if (!lavadosCargados.length) {
                console.warn('No se encontraron lavados asociados al administrador.');
                return;
            }

            // Renderizar los lavados utilizando `displayClientList`
            displayClientList(lavadosCargados, handleClientClick);

            console.log('Lavados cargados exitosamente en la tabla.', lavadosCargados);
        } catch (error) {
            console.error('Error al cargar los lavados:', error);
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

    // Función para activar un mensaje específico y desactivar los demás
    function activarMensaje(selectedType) {
        // Obtener todos los mensajes
        const messages = document.querySelectorAll('.message-bubble');

        // Desactivar todos los mensajes (quitar clase 'active')
        messages.forEach(message => message.classList.remove('active'));

        // Activar el mensaje seleccionado si existe
        const mensajeSeleccionado = document.querySelector(`.message-type-${selectedType}`);
        if (mensajeSeleccionado) {
            mensajeSeleccionado.classList.add('active');
        } else {
            messages.forEach(message => message.classList.remove('active'));
        }
    }










    // Función para obtener la cookie del adminId
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
});
