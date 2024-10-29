// Variable para almacenar el cliente actual
let currentClient = null;

// Función para establecer el cliente actual
export function setCurrentClient(client) {
    currentClient = client;
}

// Función para cargar el historial de chat del cliente
export function loadChat(client) {
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML = ''; // Limpiar el historial de chat anterior
    const phoneNumber = document.getElementById('phoneNumber');
    phoneNumber.textContent = client.from || "Número no disponible"; // Mostrar el número del cliente

    // Primero, cargar los mensajes de historialPedidos (mensajes recibidos)
    client.historialPedidos.forEach(pedido => {
        pedido.mensajes.forEach(mensaje => {
            const div = document.createElement('div');
            div.classList.add('whatsapp-message', 'whatsapp-received'); // Mensaje recibido en blanco a la izquierda

            // Crear una nueva fecha a partir de la cadena ISO y formatearla sin segundos
            const fechaHora = new Date(mensaje.fecha).toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            div.innerHTML = `
                <div>${mensaje.body}</div>
                <span class="whatsapp-message-time">${fechaHora}</span>
            `;
            chatHistory.appendChild(div);
        });
    });

    // Luego, cargar los mensajes enviados en mensajesEnviados (mensajes enviados)
    client.mensajesEnviados.forEach(mensaje => {
        const div = document.createElement('div');
        div.classList.add('whatsapp-message', 'whatsapp-sent'); // Mensaje enviado en verde a la derecha

        // Crear una nueva fecha a partir de la cadena ISO y formatearla sin segundos
        const fechaHora = new Date(mensaje.fecha).toLocaleString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        div.innerHTML = `
            <div>${mensaje.body}</div>
            <span class="whatsapp-message-time">${fechaHora}</span>
        `;
        chatHistory.appendChild(div);
    });

    // Desplazar hacia abajo el historial de chat para ver los últimos mensajes
    chatHistory.scrollTop = chatHistory.scrollHeight;
}



// Función para enviar mensaje a un cliente o a varios clientes seleccionados (difusión)
export async function sendMessage() {
    const messageText = document.getElementById('messageInput').value;
    const currentTime = new Date();
    const fecha = currentTime.toISOString() // Guardar fecha y hora en formato ISO
    
    if (messageText.trim() === '') {
        return; // No enviar si el mensaje está vacío
    }

    const newMessage = { 
        body: messageText, 
        fecha, 
        to: currentClient ? currentClient.from : null // Agregar el destinatario
};

    // Obtener el `adminId` de la cookie
    const adminId = getCookie('adminId');
    if (!adminId) {
        console.error('No se encontró adminId en las cookies.');
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const selectedTotal = selectedCheckboxes.length;

    if (selectedTotal === 0 && currentClient) {
        // Si no hay clientes seleccionados, enviar al cliente actual
        await saveMessageToDatabase(adminId, newMessage);
        currentClient.mensajesEnviados.push(newMessage); // Actualizar en el cliente localmente
        loadChat(currentClient);
    } else if (selectedTotal >= 1) {
        // Si hay uno o más clientes seleccionados, enviar el mensaje a ellos (difusión)
        selectedCheckboxes.forEach(async (checkbox) => {
            const selectedClientNumber = checkbox.closest('li').querySelector('.client-number').textContent;
            const selectedClient = clients.find(client => client.from === selectedClientNumber);

            if (selectedClient) {
                await saveMessageToDatabase(adminId, newMessage);
                selectedClient.mensajesEnviados.push(newMessage);
            }
        });

        if (currentClient && selectedCheckboxes.length === 1) {
            loadChat(currentClient);
        }
    }

    document.getElementById('messageInput').value = '';
    // updateSelectedCount();
}

// Modificación de la función para guardar el mensaje en la base de datos
async function saveMessageToDatabase(adminId, newMessage) {
    try {
        const response = await fetch(`/api/dashboardLocalAdmin/${adminId}/addMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body: newMessage })  // Enviar el mensaje en el cuerpo
        });

        if (!response.ok) {
            console.error('Error al enviar el mensaje:', response.statusText);
        } else {
            console.log("Mensaje enviado exitosamente.");
        }
    } catch (error) {
        console.error('Error en la solicitud para enviar el mensaje:', error);
    }
}

// Función para obtener el valor de una cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
