let currentClient = null; // Cliente seleccionado actualmente

// Función para cargar el historial de chat
export function loadChat(client) {
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML = '';

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

// Función para enviar un mensaje al cliente seleccionado
export function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value;
    const currentTime = new Date().toLocaleString('es-ES');

    if (!currentClient) {
        alert("Selecciona un cliente primero.");
        return;
    }

    if (messageText.trim() !== '') {
        const newMessage = { text: messageText, type: 'sent', time: currentTime };
        currentClient.messages.push(newMessage);

        loadChat(currentClient); // Recargar el historial de chat
        messageInput.value = ''; // Limpiar el campo de entrada
    }
}

export function setCurrentClient(client) {
    currentClient = client; // Establecer el cliente actual seleccionado
}
