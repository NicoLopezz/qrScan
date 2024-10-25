document.addEventListener("DOMContentLoaded", () => {
    const clients = [
        { id: 1, name: 'Cliente 1', number: '+1 (555) 123-4567', score: '8.5/10', visits: 3, address: '123 Calle Falsa', local: 'Bar de Juan', resent: '25/11/2024', messages: [] },
        { id: 2, name: 'Cliente 2', number: '+1 (555) 987-6543', score: '7.5/10', visits: 5, address: '456 Avenida Siempreviva', local: 'Café Central', resent: '30/11/2024', messages: [] },
        { id: 3, name: 'Cliente 3', number: '+1 (555) 555-5555', score: '9.2/10', visits: 4, address: '789 Boulevard Sol', local: 'Restaurante La Plaza', resent: '20/11/2024', messages: [] }
    ];

    const clientList = document.getElementById('clientList');
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const chatHistory = document.getElementById('chatHistory');
    const phoneNumber = document.getElementById('phoneNumber');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const selectedCount = document.getElementById('selectedCount');
    const selectAllButton = document.getElementById('selectAllButton');
    const deselectAllButton = document.getElementById('deselectAllButton');

    let currentClient = null;

    // Mostrar la lista completa de clientes al cargar la página
    renderClientList(clients);

    // Filtrar y renderizar la lista de clientes según el valor del input de búsqueda
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        if (query) {
            clearSearch.style.display = 'inline'; // Mostrar la cruz si hay texto
        } else {
            clearSearch.style.display = 'none'; // Ocultar la cruz si no hay texto
        }
        filterClients(query);
    });

    // Limpiar el campo de búsqueda cuando se toca la cruz
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none'; // Ocultar la cruz
        renderClientList(clients); // Volver a mostrar todos los clientes
    });

    // Función para filtrar los clientes
    function filterClients(query) {
        if (!query) {
            renderClientList(clients); // Si no hay búsqueda, mostrar todos los clientes
            return;
        }
        const filteredClients = clients.filter(client => {
            return client.name.toLowerCase().includes(query) || client.number.includes(query);
        });
        renderClientList(filteredClients); // Renderizar solo los clientes filtrados
    }

    // Función para renderizar la lista de clientes (general o filtrada)
    function renderClientList(clientListData) {
        clientList.innerHTML = '';
        if (clientListData.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No se encontraron clientes';
            clientList.appendChild(li);
            return;
        }

        clientListData.forEach(client => {
            const li = document.createElement('li');
            li.classList.add('client-item');
            li.innerHTML = `
                <input type="checkbox" class="client-checkbox">
                <div class="client-info">
                    <span class="client-name">${client.name}</span>
                    <span class="client-number">${client.number}</span>
                </div>
            `;

            li.addEventListener('click', () => {
                currentClient = client;
                loadChat(client); // Cargar el historial de chat
                loadClientData(client); // Cargar los datos del cliente en el cuadro de datos
            });

            clientList.appendChild(li);
        });
    }

    // Cargar el historial de chat
    function loadChat(client) {
        chatHistory.innerHTML = '';
        phoneNumber.textContent = client.number;

        client.messages.forEach(message => {
            const div = document.createElement('div');
            div.classList.add('whatsapp-message', message.type === 'sent' ? 'whatsapp-sent' : 'whatsapp-received');
            div.innerHTML = `
                ${message.text}
                <span class="whatsapp-message-time">${message.time}</span>
            `;
            chatHistory.appendChild(div);
        });
    }

    // Cargar los datos del cliente en el cuadro de "Datos Clientes"
    function loadClientData(client) {
        document.getElementById('client-name').textContent = client.name;
        document.getElementById('client-phone').textContent = client.number;
        document.getElementById('client-score').textContent = client.score || '8.5/10'; // Puntuación predeterminada
        document.getElementById('client-loyalty').innerHTML = generateStars(client.visits || 3); // 3 estrellas por defecto
        document.getElementById('client-address').textContent = client.address || '123 Calle Falsa';
        document.getElementById('client-local').textContent = client.local || 'Bar de Juan';
        document.getElementById('client-resent').textContent = client.resent || '25/11/2024'; // Fecha por defecto
    }

    // Generar estrellas de fidelidad según las visitas del cliente
    function generateStars(visits) {
        let stars = '⭐'.repeat(visits) + '☆'.repeat(5 - visits); // Generar estrellas basadas en visitas
        return `<span class="stars">${stars}</span>`;
    }

    // Función para actualizar el conteo de clientes seleccionados
    function updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
        const selectedTotal = selectedCheckboxes.length;
        selectedCount.textContent = selectedTotal; // Actualizar el número en el botón

        // Cambiar el color del botón según el número de clientes seleccionados
        if (selectedTotal > 1) {
            sendButton.classList.add('multiple-selected');
        } else {
            sendButton.classList.remove('multiple-selected');
        }
    }

    // Enviar mensaje a un cliente o a múltiples clientes seleccionados
    function sendMessage() {
        const messageText = messageInput.value;
        const currentTime = new Date().toLocaleString('es-ES');

        if (messageText.trim() === '') {
            return; // No hacer nada si el mensaje está vacío
        }

        const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
        const selectedTotal = selectedCheckboxes.length;

        if (selectedTotal === 0 && currentClient) {
            // Si no hay clientes seleccionados, enviar al cliente actual
            const newMessage = { text: messageText, type: 'sent', time: currentTime };
            currentClient.messages.push(newMessage);
            loadChat(currentClient); // Recargar el historial de chat
            messageInput.value = ''; // Limpiar el campo de entrada
        } else if (selectedTotal >= 1) {
            // Si hay uno o más clientes seleccionados, enviar el mensaje a ellos
            selectedCheckboxes.forEach(checkbox => {
                const selectedClientNumber = checkbox.nextElementSibling.querySelector('.client-number').textContent;
                const selectedClient = clients.find(client => client.number === selectedClientNumber);

                if (selectedClient) {
                    const newMessage = { text: messageText, type: 'sent', time: currentTime };
                    selectedClient.messages.push(newMessage);
                }
            });

            if (selectedTotal === 1 && currentClient) {
                // Si el cliente seleccionado es el mismo que el cliente activo, recargar el chat
                loadChat(currentClient);
            }

            messageInput.value = ''; // Limpiar el campo de entrada
        }

        updateSelectedCount(); // Actualizar el conteo después de enviar
    }

    // Enviar mensaje al hacer clic en el botón
    sendButton.addEventListener('click', sendMessage);

    // Enviar mensaje al presionar Enter
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Función para seleccionar todos los clientes
    selectAllButton.addEventListener('click', () => {
        document.querySelectorAll('.client-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            checkbox.closest('li').classList.add('selected-client');
        });
        updateSelectedCount(); // Actualizar el conteo y el estilo del botón
    });

    // Función para deseleccionar todos los clientes
    deselectAllButton.addEventListener('click', () => {
        document.querySelectorAll('.client-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('li').classList.remove('selected-client');
        });
        updateSelectedCount(); // Actualizar el conteo y el estilo del botón
    });
});
