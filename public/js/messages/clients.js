// Definir el array de clientes
export const clients = [
    { id: 1, name: 'Cliente 1', number: '+1 (555) 123-4567', score: '8.5/10', visits: 3, address: '123 Calle Falsa', local: 'Bar de Juan', resent: '25/11/2024', messages: [] },
    { id: 2, name: 'Cliente 2', number: '+1 (555) 987-6543', score: '7.5/10', visits: 5, address: '456 Avenida Siempreviva', local: 'Café Central', resent: '30/11/2024', messages: [] },
    { id: 3, name: 'Cliente 3', number: '+1 (555) 555-5555', score: '9.2/10', visits: 4, address: '789 Boulevard Sol', local: 'Restaurante La Plaza', resent: '20/11/2024', messages: [] }
];

// Función para renderizar la lista de clientes
export function renderClientList(clientListData, handleClientClick) {
    const clientList = document.getElementById('clientList');
    clientList.innerHTML = ''; // Limpiar la lista actual

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

        const checkbox = li.querySelector('.client-checkbox');

        // Evento para seleccionar y deseleccionar clientes usando el checkbox
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                li.classList.add('selected-client'); // Pintar si está seleccionado
            } else {
                li.classList.remove('selected-client'); // Despintar si no está seleccionado
            }
            updateSelectedCount(); // Actualizar el contador de clientes seleccionados
        });

        // Evento para manejar el clic en el cliente, pero evitar que el checkbox dispare este evento
        li.addEventListener('click', (event) => {
            if (event.target !== checkbox) {
                handleClientClick(client); // Cargar el chat y la información del cliente
            }
        });

        clientList.appendChild(li); // Agregar cada cliente a la lista en el DOM
    });
}

// Función para filtrar los clientes en base a la búsqueda
export function filterClients(query, handleClientClick) {
    const filteredClients = clients.filter(client => {
        return client.name.toLowerCase().includes(query) || client.number.includes(query);
    });
    renderClientList(filteredClients, handleClientClick); // Renderizar solo los clientes filtrados
}

// Función para seleccionar todos los clientes
export function selectAllClients() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.closest('li').classList.add('selected-client'); // Pintar como seleccionado
    });
    updateSelectedCount(); // Actualizar el contador de seleccionados
}

// Función para deseleccionar todos los clientes
export function deselectAllClients() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('li').classList.remove('selected-client'); // Despintar como no seleccionado
    });
    updateSelectedCount(); // Actualizar el contador de seleccionados
}

// Función para actualizar el contador de clientes seleccionados y cambiar el botón de enviar
export function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const selectedTotal = selectedCheckboxes.length;

    const sendButton = document.getElementById('sendButton');
    sendButton.textContent = `Enviar (${selectedTotal})`;

    // Cambiar el color del botón de enviar dependiendo del número de clientes seleccionados
    if (selectedTotal > 1) {
        sendButton.classList.add('multiple-selected'); // Cambiar a violeta para difusión
        sendButton.style.backgroundColor = "#6b00ad";
    } else {
        sendButton.classList.remove('multiple-selected'); // Volver al color verde si no es difusión
        sendButton.style.backgroundColor = "#25D366";
    }
}
