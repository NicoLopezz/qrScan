import { clients, renderClientList, filterClients, selectAllClients, deselectAllClients } from './clients.js';
import { loadChat, sendMessage, setCurrentClient } from './chat.js';
import { updateSelectedCount } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
    // Renderizar la lista completa de clientes al cargar la página
    renderClientList(clients, handleClientClick);

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
        renderClientList(clients, handleClientClick);
    });

    // Mostrar u ocultar la cruz de limpiar búsqueda
    searchInput.addEventListener('input', () => {
        clearSearch.style.display = searchInput.value ? 'inline' : 'none';
    });

    // Manejar el clic en cada cliente para cargar el chat y la información
    function handleClientClick(client) {
        setCurrentClient(client); // Establecer el cliente actual
        loadChat(client); // Cargar el historial de chat del cliente
        loadClientData(client); // Cargar la información del cliente en la caja de datos
    }

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
    selectAllButton.addEventListener('click', () => {
        selectAllClients();
    });

    // Deseleccionar todos los clientes al hacer clic en el botón
    const deselectAllButton = document.getElementById('deselectAllButton');
    deselectAllButton.addEventListener('click', () => {
        deselectAllClients();
    });
});

// Función para cargar la información del cliente en la caja de datos
function loadClientData(client) {
    document.getElementById('client-name').textContent = client.name;
    document.getElementById('client-phone').textContent = client.number;
    document.getElementById('client-score').textContent = client.score || '8.5/10';
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
