// Función para renderizar la lista de clientes en `clientList`
let selectedClients = [];
let allClientes = []; // copia completa para filtrar
let currentHandleClientClick = null;

// Render interno — no toca allClientes
function renderClientList(clientes, handleClientClick) {
    const clientList = document.getElementById("clientList");
    clientList.innerHTML = "";

    if (clientes.length === 0) {
        clientList.innerHTML = `
            <li style="
                display:flex;flex-direction:column;align-items:center;
                justify-content:center;gap:10px;padding:40px 20px;
                border:none;cursor:default;
            ">
                <i class="fas fa-search" style="font-size:28px;color:var(--primary);opacity:0.3"></i>
                <span style="font-size:13px;color:var(--text-muted);text-align:center;line-height:1.5">
                    Sin resultados
                </span>
            </li>`;
        return;
    }

    // Ordenar clientes por fechaDeAlta (de más nuevo a más viejo)
    clientes.sort((a, b) => new Date(b.fechaDeAlta) - new Date(a.fechaDeAlta));

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

        // Avatar
        const avatar = document.createElement("img");
        avatar.classList.add("client-avatar");
        const seed = (cliente.from || cliente.nombre || '').replace(/\D/g, '');
        const idx = seed ? (parseInt(seed.slice(-2)) % 70) + 1 : Math.ceil(Math.random() * 70);
        const gender = idx % 2 === 0 ? 'women' : 'men';
        avatar.src = `https://randomuser.me/api/portraits/thumb/${gender}/${idx}.jpg`;
        avatar.alt = cliente.nombre || "";
        avatar.onerror = function() {
            this.style.display = 'none';
        };

        // Agregar el checkbox, avatar y la información del cliente al elemento de la lista
        li.appendChild(checkbox);
        li.appendChild(avatar);
        li.appendChild(clientInfo);

        // Evento para seleccionar y deseleccionar clientes usando el checkbox
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                li.classList.add('selected-client'); // Pintar si está seleccionado
                selectedClients.push(cliente); // Agregar cliente al arreglo
            } else {
                li.classList.remove('selected-client'); // Despintar si no está seleccionado
                selectedClients = selectedClients.filter(c => c !== cliente); // Eliminar cliente del arreglo
            }
            console.log('Clientes seleccionados:', selectedClients); // Mostrar los clientes seleccionados en consola
            updateSelectedCount(); // Actualizar el contador de clientes seleccionados
        });

        // Evento para manejar el clic en el cliente, pero evitar que el checkbox dispare este evento
        li.addEventListener('click', (event) => {
            if (event.target !== checkbox) {
                handleClientClick(cliente); // Cargar el chat y la información del cliente
                mostrarDatosCliente(cliente); // Mostrar los datos del cliente en el HTML
            }
        });

        clientList.appendChild(li);
    });
}

// Wrapper público — guarda la lista completa y renderiza
export function displayClientList(clientes, handleClientClick) {
    allClientes = clientes;
    currentHandleClientClick = handleClientClick;
    renderClientList(clientes, handleClientClick);
}

// Filtro — usa renderClientList para no pisar allClientes
export function filterClients(query, handleClientClick) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderClientList(allClientes, handleClientClick || currentHandleClientClick);
        return;
    }
    const filtered = allClientes.filter(c => {
        return (c.nombre || '').toLowerCase().includes(q) ||
               (c.from   || '').toLowerCase().includes(q);
    });
    renderClientList(filtered, handleClientClick || currentHandleClientClick);
}

// Agregar el MutationObserver
document.addEventListener("DOMContentLoaded", () => {
    const sectionMensajes = document.getElementById("section-mensajes");

    // Observador para detectar cambios en las clases de la sección
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.attributeName === "class") {
                if (sectionMensajes.classList.contains("active")) {
                    // Refrescar la tabla cuando la sección está activa
                    refreshClientList();
                }
            }
        });
    });

    // Configuración del observador
    observer.observe(sectionMensajes, { attributes: true });

    // Función para refrescar la lista de clientes
    function refreshClientList() {
        console.log("Sección activa: refrescando tabla de clientes...");

        displayClientList(clientes, handleClientClick);
    }
});





// Función para mostrar los datos del cliente en el HTML
function mostrarDatosCliente(cliente) {
    // Seleccionar los elementos HTML
    const clientNameElem = document.getElementById('client-name');
    const clientPhoneElem = document.getElementById('client-phone');
    const clientScoreElem = document.getElementById('client-score');
    const clientLoyaltyElem = document.getElementById('client-loyalty');
    const clientLastWashElem = document.getElementById('client-resent'); // Último lavado
    const clientTiempoLavado = document.getElementById('client-resent-tiempooLavado'); // Último mensaje (reutilizado)

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
    clientScoreElem.textContent = cliente.calidad || 'Sin encuesta';


    // Generar autos de fidelidad
    const historialLavados = cliente.historialLavados || []; // Verificar si el arreglo existe
    const cantidadLavados = historialLavados.length; // Obtener el largo del arreglo

    // Crear una cadena con autos 🚗
    const autosHTML = `<span class="cars">${'🚗'.repeat(cantidadLavados)}</span>`;

    // Insertar en el elemento HTML
    clientLoyaltyElem.innerHTML = autosHTML;

    // Último lavado (fecha de ingreso más reciente en historialLavados)
    let ultimoLavado = null;

    if (cliente.historialLavados && cliente.historialLavados.length > 0) {
        // Obtener el lavado con la fecha de ingreso más reciente
        ultimoLavado = cliente.historialLavados.reduce((prev, current) =>
            new Date(prev.fechaIngreso) > new Date(current.fechaIngreso) ? prev : current
        );

        // Formatear y mostrar la fecha del último lavado (fechaIngreso)
        clientLastWashElem.textContent = formatFecha(ultimoLavado.fechaIngreso);

        // Log de validación por cliente
        console.log(`Último lavado registrado (${cliente.nombre}):`, ultimoLavado.fechaIngreso);
    } else {
        clientLastWashElem.textContent = 'Sin registros';
        console.log(`No hay lavados registrados para ${cliente.nombre || 'Cliente desconocido'}.`);
    }


    // Obtener el tiempo de espera más reciente del historial de lavados
    let ultimoHistorial = null;

    if (cliente.historialLavados && cliente.historialLavados.length > 0) {
        // Buscar el historial con la fecha de egreso más reciente
        ultimoHistorial = cliente.historialLavados.reduce((prev, current) =>
            new Date(prev.fechaEgreso) > new Date(current.fechaEgreso) ? prev : current
        );

        // Mostrar el tiempo de espera en el elemento HTML
        clientTiempoLavado.textContent = `${ultimoHistorial.tiempoEspera} minutos`;
    } else {
        clientTiempoLavado.textContent = 'Sin registros de tiempo';
    }

}


// Función para seleccionar todos los clientes
export function selectAllClients() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    const clientsList = document.querySelectorAll('.client-item');

    // Limpiar el arreglo y agregar todos los clientes seleccionados
    selectedClients = [];

    clientsList.forEach(clientItem => {
        const checkbox = clientItem.querySelector('.client-checkbox');
        const cliente = getClientDataFromElement(clientItem); // Función auxiliar para obtener los datos del cliente

        // Seleccionar el cliente solo si está disponible
        if (checkbox && cliente) {
            checkbox.checked = true;
            clientItem.classList.add('selected-client'); // Pintar como seleccionado
            selectedClients.push(cliente); // Agregar al arreglo global
        }
    });

    console.log('Todos los clientes seleccionados:', selectedClients); // Mostrar en consola
    updateSelectedCount(); // Actualizar el contador de seleccionados
}

function getClientDataFromElement(clientElement) {
    const clientName = clientElement.querySelector('.client-name')?.textContent || 'Sin nombre';
    const clientNumber = clientElement.querySelector('.client-number')?.textContent || 'Sin teléfono';

    return { nombre: clientName, from: clientNumber }; // Devuelve un objeto con los datos mínimos
}

// Función para deseleccionar todos los clientes
export function deselectAllClients() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    const clientsList = document.querySelectorAll('.client-item');

    // Vaciar el arreglo global
    selectedClients = [];

    clientsList.forEach(clientItem => {
        const checkbox = clientItem.querySelector('.client-checkbox');

        // Deseleccionar el cliente solo si está disponible
        if (checkbox) {
            checkbox.checked = false;
            clientItem.classList.remove('selected-client'); // Despintar como no seleccionado
        }
    });

    console.log('Ningún cliente seleccionado:', selectedClients); // Mostrar en consola
    updateSelectedCount(); // Actualizar el contador de seleccionados
}


// Función para actualizar el contador de clientes seleccionados y cambiar el botón de enviar
export function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const selectedTotal = selectedCheckboxes.length;

    const sendButton = document.getElementById('sendButton');
    const sendButton2 = document.getElementById('sendButton2');
    sendButton.textContent = `Enviar (${selectedTotal})`;
    sendButton2.textContent = `Enviar (${selectedTotal})`;

    // Cambiar el color del botón de enviar dependiendo del número de clientes seleccionados
    if (selectedTotal > 1) {
        sendButton.classList.add('multiple-selected'); // Cambiar a violeta para difusión
        sendButton.style.backgroundColor = "#6b00ad";
        sendButton2.style.backgroundColor = "#6b00ad";
    } else {
        sendButton.classList.remove('multiple-selected'); // Volver al color verde si no es difusión
        sendButton.style.backgroundColor = "#25D366";
        sendButton2.style.backgroundColor = "#25D366";
    }
}



// LOGICA PARA ENVIAR LAS TEMPLATES DESDE MENSJAES.
// Obtener el mensaje activo
function obtenerMensajeActivo(contenedorId) {
    const contenedor = document.querySelector(`#${contenedorId}`);
    if (!contenedor) {
        console.warn(`No se encontró el contenedor con id ${contenedorId}.`);
        return null;
    }

    // Obtener el mensaje activo dentro del contenedor
    const mensajeActivo = contenedor.querySelector('.message-bubble.active');
    if (!mensajeActivo) {
        console.warn(`No hay ningún mensaje activo en el contenedor ${contenedorId}.`);
        return null;
    }

    // Extraer y formatear el contenido del mensaje activo
    const textoPlano = Array.from(mensajeActivo.children)
        .map(parrafo => {
            let texto = parrafo.innerHTML.trim(); // Extraer contenido HTML del párrafo

            // Manejar enlaces (<a href="URL">Texto</a>) para convertirlos en Texto (URL)
            texto = texto.replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, '$2 ($1)');

            // Reemplazos dinámicos para negritas y emojis
            texto = texto
                .replace(/<strong>(.*?)<\/strong>/g, '*$1*') // Convertir <strong> en negritas (*texto*)
                .replace(/CARWASH PREMIUM/g, '*CARWASH PREMIUM*') // Negrita en "CARWASH PREMIUM"
                .replace(/10% de descuento/g, '*10% de descuento*') // Negrita en promociones
                .replace(/lavado premium gratis/g, '*lavado premium gratis*') // Negrita en recompensas
                .replace(/2x1 en lavados premium/g, '*2x1 en lavados premium*') // Negrita en promociones
                .replace(/Ven cuando quieras/g, '*Ven cuando quieras*') // Negrita en instrucciones importantes
                .replace(/\.\s/g, '.\n'); // Añadir saltos de línea después de puntos finales

            return texto; // Devolver el texto plano ya formateado
        })
        .join('\n\n'); // Unir los párrafos con doble salto de línea

    return textoPlano; // Devuelve el mensaje formateado para WhatsApp
}


// Función para enviar mensajes a clientes seleccionados
const sendButtons = document.querySelectorAll('#sendButton, #sendButton2');

// Agregar el evento de clic a cada botón
sendButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        try {
            // Determinar el contenedor según el botón clicado
            const contenedorId = button.id === 'sendButton' ? 'chatDesktop' : 'chatMovil';

            // Verificar si hay clientes seleccionados
            if (selectedClients.length === 0) {
                showNotification("No hay clientes seleccionados.", "error");
                return;
            }

            // Obtener el mensaje activo del contenedor correspondiente
            const mensajeActivo = obtenerMensajeActivo(contenedorId);
            if (!mensajeActivo) {
                showNotification("No hay ningún mensaje activo para enviar.", "error");
                return;
            }

            // Recorrer el arreglo de clientes seleccionados y enviar los mensajes
            for (const cliente of selectedClients) {
                const response = await fetch(`/api/enviarMensajesTemplates`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        clienteId: cliente._id, // ID del cliente
                        mensaje: mensajeActivo, // Contenido del mensaje activo
                    }),
                });

                const result = await response.json();
                if (result.success) {
                    deselectAllClients()
                    console.log(`Mensaje enviado a ${cliente.nombre} (${cliente.from})`);
                } else {
                    console.error(`Error al enviar mensaje a ${cliente.nombre}: ${result.message}`);
                }
            }

            showNotification("Mensajes enviados exitosamente.");
        } catch (error) {
            console.error("Error al enviar los mensajes:", error);
            showNotification("Ocurrió un error al intentar enviar los mensajes.", "error");
        }
    });
});




