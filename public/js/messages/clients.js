// Exportar el array de clientes
export const clients = [
    { id: 1, name: 'Cliente 1', number: '+1 (555) 123-4567', score: '8.5/10', visits: 3, address: '123 Calle Falsa', local: 'Bar de Juan', resent: '25/11/2024', messages: [] },
    { id: 2, name: 'Cliente 2', number: '+1 (555) 987-6543', score: '7.5/10', visits: 5, address: '456 Avenida Siempreviva', local: 'Café Central', resent: '30/11/2024', messages: [] },
    { id: 3, name: 'Cliente 3', number: '+1 (555) 555-5555', score: '9.2/10', visits: 4, address: '789 Boulevard Sol', local: 'Restaurante La Plaza', resent: '20/11/2024', messages: [] }
];

// Función para renderizar la lista de clientes
export function renderClientList(clientListData, handleClientClick) {
    const clientList = document.getElementById('clientList');
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

        // Obtener el checkbox
        const checkbox = li.querySelector('.client-checkbox');

        // Evento `click` para gestionar la selección y deselección
        checkbox.addEventListener('click', () => {
            if (checkbox.checked) {
                li.classList.add('selected-client'); // Agregar clase si está seleccionado
            } else {
                li.classList.remove('selected-client'); // Eliminar clase si no está seleccionado
            }
            updateSelectedCount(); // Actualizamos el conteo de clientes seleccionados
        });

        li.addEventListener('click', () => handleClientClick(client));
        clientList.appendChild(li);
    });
}

// Función para filtrar clientes
export function filterClients(query, handleClientClick) {
    const filteredClients = clients.filter(client => {
        return client.name.toLowerCase().includes(query) || client.number.includes(query);
    });
    renderClientList(filteredClients, handleClientClick);
}

// Función para actualizar el conteo de clientes seleccionados
export function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const selectedTotal = selectedCheckboxes.length;
    
    // Actualizar el número en el botón
    const sendButton = document.getElementById('sendButton');
    sendButton.textContent = `Enviar (${selectedTotal})`;

    // Cambiar el color del botón según el número de clientes seleccionados
    if (selectedTotal > 1) {
        sendButton.classList.add('multiple-selected'); // Aplicar estilo de difusión
        sendButton.style.backgroundColor = "#6b00ad"; // Cambiar el botón a violeta para difusión
    } else {
        sendButton.classList.remove('multiple-selected'); // Mantener estilo normal
        sendButton.style.backgroundColor = "#25D366"; // Cambiar el botón a verde
    }
}

// Función para seleccionar todos los clientes
export function selectAllClients() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true; // Marcar el checkbox
        checkbox.closest('li').classList.add('selected-client'); // Agregar la clase visual
    });
    updateSelectedCount();
}

// Función para deseleccionar todos los clientes
export function deselectAllClients() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false; // Desmarcar el checkbox
        checkbox.closest('li').classList.remove('selected-client'); // Quitar la clase visual
    });
    updateSelectedCount();
}

