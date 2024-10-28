import { filterClients, selectAllClients, deselectAllClients, displayClientList } from './clients.js';
import { loadChat, sendMessage, setCurrentClient } from './chat.js';
import { updateSelectedCount } from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Obtener el ID del admin desde las cookies
    const adminId = getCookie('adminId');
    if (!adminId) {
        console.error('No se encontró el adminId en las cookies. El usuario debe iniciar sesión.');
        return;
    }

    // Obtener información del usuario desde la base de datos
    const userInfo = await fetchUserInfo(adminId);
    if (userInfo && userInfo.clientes) {
        displayClientList(userInfo.clientes, handleClientClick);
    } else {
        console.error("No se pudieron obtener los datos de los clientes.");
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
        displayClientList(userInfo.clientes, handleClientClick); // Volver a renderizar la lista completa
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
});

// Función para obtener la cookie del adminId
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Función para obtener la información del usuario desde la base de datos
async function fetchUserInfo(adminId) {
    try {
        const response = await fetch(`/api/locales/${encodeURIComponent(adminId)}`);
        if (!response.ok) {
            console.error('Error al obtener información del usuario:', response.statusText);
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return {};
    }
}

// Función para manejar el clic en un cliente, cargar chat e información del cliente
function handleClientClick(client) {
    setCurrentClient(client); // Establecer el cliente actual
    loadChat(client); // Cargar el historial de chat del cliente
    loadClientData(client); // Cargar la información del cliente en la caja de datos
}

// Función para cargar la información del cliente en la caja de datos
function loadClientData(client) {
    document.getElementById('client-name').textContent = "No Disponible"; // Nombre fijo por ahora
    document.getElementById('client-phone').textContent = client.from || "Número no disponible";
    document.getElementById('client-score').textContent = client.promedioTiempo || 'N/A';
    document.getElementById('client-loyalty').innerHTML = generateStars(client.visits || 3);
    document.getElementById('client-address').textContent = client.address || '123 Calle Falsa';
    document.getElementById('client-local').textContent = client.local || 'Bar de Juan';
    document.getElementById('client-resent').textContent = client.resent || '25/11/2024';
}

// Función para generar estrellas de fidelidad
function generateStars(visits) {
    let stars = '⭐'.repeat(visits) + '☆'.repeat(5 - visits);
    return `<span class="stars">${stars}</span>`;
}
