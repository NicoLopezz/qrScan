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
    phoneNumber.textContent = client.from || client.number; // Mostrar el número del cliente

    // Recorrer cada pedido en historialPedidos y mostrar todos los mensajes
    client.historialPedidos.forEach(pedido => {
        pedido.mensajes.forEach(message => {
            const div = document.createElement('div');
            div.classList.add(
                'whatsapp-message',
                message.type === 'sent' ? 'whatsapp-sent' : 'whatsapp-received'
            );

            // Formatear la fecha para que sea legible
            const messageDate = new Date(message.fecha).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            div.innerHTML = `
                ${message.body}
                <span class="whatsapp-message-time">${messageDate}</span>
            `;
            chatHistory.appendChild(div);
        });
    });

    // Desplazar hacia abajo el historial de chat para ver los últimos mensajes
    chatHistory.scrollTop = chatHistory.scrollHeight;
}


export function sendMessage() {
    const messageText = document.getElementById('messageInput').value;
    const currentTime = new Date().toISOString();

    if (messageText.trim() === '') {
        return; // No enviar si el mensaje está vacío
    }

    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const selectedTotal = selectedCheckboxes.length;

    if (selectedTotal === 0 && currentClient) {
        // Si no hay clientes seleccionados, enviar al cliente actual
        const newMessage = { body: messageText, fecha: currentTime, type: 'sent' };
        currentClient.historialPedidos[0].mensajes.push(newMessage); // Agregar el mensaje al historial del cliente actual
        loadChat(currentClient); // Recargar el historial de chat del cliente actual
    } else if (selectedTotal >= 1) {
        // Si hay uno o más clientes seleccionados, enviar el mensaje a ellos (difusión)
        selectedCheckboxes.forEach(checkbox => {
            const selectedClientNumber = checkbox.closest('li').querySelector('.client-number').textContent;
            const selectedClient = clients.find(client => client.from === selectedClientNumber);

            if (selectedClient) {
                const newMessage = { body: messageText, fecha: currentTime, type: 'sent' };
                selectedClient.historialPedidos[0].mensajes.push(newMessage); // Agregar el mensaje al historial del cliente seleccionado
            }
        });

        // Si el cliente actual está seleccionado, recargar su chat también
        if (currentClient && selectedCheckboxes.length === 1) {
            loadChat(currentClient);
        }
    }

    // Limpiar el campo de entrada después de enviar el mensaje
    document.getElementById('messageInput').value = '';

    // Actualizar el contador de clientes seleccionados después de enviar el mensaje
    updateSelectedCount();
}
