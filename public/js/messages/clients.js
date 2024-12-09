// Función para renderizar la lista de clientes en `clientList`
export function displayClientList(clientes, handleClientClick) {
    const clientList = document.getElementById("clientList");
    clientList.innerHTML = ""; // Limpiar la lista antes de llenarla

    if (clientes.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No se encontraron clientes';
        clientList.appendChild(li);
        return;
    }

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
        clientName.textContent = cliente.nombre || "No Disponible";

        // Número de cliente
        const clientNumber = document.createElement("span");
        clientNumber.classList.add("client-number");
        clientNumber.textContent = cliente.from || "No disponible";

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
                mostrarDatosCliente(cliente); // Mostrar los datos del cliente en el HTML
            }
        });

        clientList.appendChild(li); // Agregar cada cliente a la lista en el DOM
    });
}

// Función para mostrar los datos del cliente en el HTML
// Función para mostrar los datos del cliente en el HTML
// Función para mostrar los datos del cliente en el HTML
function mostrarDatosCliente(cliente) {
    // Seleccionar los elementos HTML
    const clientNameElem = document.getElementById('client-name');
    const clientPhoneElem = document.getElementById('client-phone');
    const clientScoreElem = document.getElementById('client-score');
    const clientLoyaltyElem = document.getElementById('client-loyalty');
    const clientLastWashElem = document.getElementById('client-resent'); // Último lavado
    const clientLastMessageElem = document.getElementById('client-resent-mensaje'); // Último mensaje (reutilizado)

    // Función para formatear una fecha al formato deseado
    function formatFecha(fecha) {
        if (!fecha) return 'No disponible';

        const date = new Date(fecha);
        if (isNaN(date)) return 'No disponible';

        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
        const anio = date.getFullYear();
        const hora = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        const segundos = String(date.getSeconds()).padStart(2, '0');

        return `${dia}/${mes}/${anio} ${hora}:${minutos}:${segundos}`;
    }

    // Asignar valores al HTML
    clientNameElem.textContent = cliente.nombre || 'Sin nombre';
    clientPhoneElem.textContent = cliente.from || 'Sin teléfono';
    clientScoreElem.textContent = cliente.puntuacionPromedio 
        ? `${cliente.puntuacionPromedio}/5` 
        : 'Sin calificación';

    // Generar estrellas de fidelidad
    const fidelidad = cliente.lavadosAcumulados || 0;
    clientLoyaltyElem.innerHTML = `<span class="stars">${'⭐'.repeat(fidelidad)}${'☆'.repeat(5 - fidelidad)}</span>`;

    // Último lavado (fecha más reciente en historialLavados)
    let ultimoLavado = null;
    if (cliente.historialLavados && cliente.historialLavados.length > 0) {
        // Obtener el lavado con la fecha de egreso más reciente
        ultimoLavado = cliente.historialLavados.reduce((prev, current) => 
            new Date(prev.fechaEgreso) > new Date(current.fechaEgreso) ? prev : current
        );

        // Formatear y mostrar la fecha del último lavado
        clientLastWashElem.textContent = formatFecha(ultimoLavado.fechaEgreso);

        // Log de validación por cliente
        console.log(`Último lavado registrado (${cliente.nombre}):`, ultimoLavado.fechaEgreso);
    } else {
        clientLastWashElem.textContent = 'Sin registros';
        console.log(`No hay lavados registrados para ${cliente.nombre || 'Cliente desconocido'}.`);
    }

    // Último mensaje (fecha más reciente en mensajesEnviados)
    let ultimoMensaje = null;
    if (cliente.mensajesEnviados && cliente.mensajesEnviados.length > 0) {
        ultimoMensaje = cliente.mensajesEnviados.reduce((prev, current) => 
            new Date(prev.fecha) > new Date(current.fecha) ? prev : current
        );
        clientLastMessageElem.textContent = formatFecha(ultimoMensaje.fecha);
    } else {
        clientLastMessageElem.textContent = 'Sin mensajes';
    }

    console.log('Datos del cliente mostrados en el HTML:', cliente);
}



// Función para formatear fechas en formato dd/mm/yyyy
function formatFecha(fecha) {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
}


// Función para filtrar los clientes en base a la búsqueda
export function filterClients(query, handleClientClick) {
    const filteredClients = clients.filter(client => {
        return client.name.toLowerCase().includes(query) || client.number.includes(query);
    });
    displayClientList(filteredClients, handleClientClick); // Renderizar solo los clientes filtrados
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




