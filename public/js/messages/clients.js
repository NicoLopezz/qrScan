// clients.js

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
                <span class="client-name">${client.name || "No Disponible"}</span>
                <span class="client-number">${client.from || "Número no disponible"}</span>
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
function updateSelectedCount() {
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

// Función para renderizar la lista de clientes en `clientList`
export function displayClientList(clientes, handleClientClick) {
    const clientList = document.getElementById("clientList");
    clientList.innerHTML = ""; // Limpiar la lista antes de llenarla

    clientes.forEach(cliente => {
        const li = document.createElement("li");
        li.classList.add("client-item");

        // Crear checkbox para seleccionar el cliente
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("client-checkbox");

        // Crear el contenedor de la información del cliente
        const clientInfo = document.createElement("div");
        clientInfo.classList.add("client-info");

        // Nombre del cliente
        const clientName = document.createElement("span");
        clientName.classList.add("client-name");
        clientName.textContent = cliente.name || "No Disponible";

        // Número de cliente
        const clientNumber = document.createElement("span");
        clientNumber.classList.add("client-number");
        clientNumber.textContent = cliente.from || "Número no disponible";

        // Agregar el nombre y número a la información del cliente
        clientInfo.appendChild(clientName);
        clientInfo.appendChild(clientNumber);

        // Agregar el checkbox y la información del cliente al elemento de la lista
        li.appendChild(checkbox);
        li.appendChild(clientInfo);

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
                handleClientClick(cliente); // Cargar el chat y la información del cliente
            }
        });

        clientList.appendChild(li); // Agregar cada cliente a la lista en el DOM
    });
}

export { updateSelectedCount };
