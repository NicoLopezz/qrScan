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

    // Manejar el clic en cada cliente para cargar el chat
    function handleClientClick(client) {
        setCurrentClient(client);
        loadChat(client);
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
