document.addEventListener("DOMContentLoaded", () => {
    const clients = [
        { id: 1, name: 'Cliente 1', number: '+1 (555) 123-4567', messages: [ /* mensajes */ ] },
        { id: 2, name: 'Cliente 2', number: '+1 (555) 987-6543', messages: [ /* mensajes */ ] },
        { id: 3, name: 'Cliente 3', number: '+1 (555) 555-5555', messages: [ /* mensajes */ ] }
    ];

    const clientList = document.getElementById('clientList');
    const chatHistory = document.getElementById('chatHistory');
    const phoneNumber = document.getElementById('phoneNumber');
    const messageInput = document.getElementById('messageInput');

    // Renderizar la lista de clientes
    function renderClientList() {
        clientList.innerHTML = '';
        clients.forEach(client => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="client-info">
                    <span class="client-name">${client.name}</span>
                    <span class="client-number">${client.number}</span>
                </div>
            `;
            li.addEventListener('click', () => loadChat(client));
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

    // Enviar mensaje
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const messageText = messageInput.value;
            const currentTime = new Date().toLocaleString('es-ES');

            if (messageText.trim() !== '') {
                const newMessage = { text: messageText, type: 'sent', time: currentTime };
                const responseMessage = { text: 'Mensaje recibido', type: 'received', time: currentTime };

                const currentClientNumber = phoneNumber.textContent;
                const currentClient = clients.find(client => client.number === currentClientNumber);

                if (currentClient) {
                    currentClient.messages.push(newMessage, responseMessage);

                    loadChat(currentClient);
                    messageInput.value = '';
                }
            }
        }
    });

    // Inicializar la lista de clientes
    renderClientList();
});
