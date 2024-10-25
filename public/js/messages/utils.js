// Función para generar estrellas basadas en el número de visitas
export function generateStars(visits) {
    let stars = '⭐'.repeat(visits) + '☆'.repeat(5 - visits);
    return `<span class="stars">${stars}</span>`;
}

// Función para actualizar el conteo de clientes seleccionados
export function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const selectedCount = document.getElementById('selectedCount');
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


