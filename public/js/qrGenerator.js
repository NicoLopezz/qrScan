$(document).ready(function () {
    const socket = io(); // Conexión al servidor de WebSockets

    // Función para obtener el valor de una cookie por su nombre
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Obtener el número de WhatsApp (localNumber) desde la cookie
    const whatsappNumber = getCookie('localNumber'); // El número de WhatsApp del local

    if (!whatsappNumber) {
        console.error("No se encontró el número de WhatsApp del local en las cookies");
        return;
    }

    // Crear una única instancia de QRious al cargar la página
    let qr;  // Definir la variable aquí fuera
    const qrCodeUrl = `https://wa.me/${whatsappNumber}`;  // URL base de WhatsApp
    qr = new QRious({
        element: document.getElementById('qrcode'),
        value: qrCodeUrl, // Genera el QR con la URL base sin mensaje
        size: 200
    });

    // Función para actualizar el mensaje dinámicamente con el número de tag
    function updateMessage(tagNumber) {
        const message = `Ya realicé mi pedido, número de tag: ${tagNumber}`;
        const qrCodeUrlWithMessage = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        console.log("El número presionado es el: " + tagNumber);

        // Actualizar el texto del pedido en el HTML
        document.getElementById('numeroPedido').innerText = "QR con el pedido N: " + tagNumber;

        // Actualizar solo el contenido dinámico del QR, sin regenerar visualmente
        qr.set({
            value: qrCodeUrlWithMessage // Solo se actualiza el valor del mensaje
        });
    }

    // Escuchar el evento 'updateQRCode' desde el servidor con el nuevo tag
    socket.on('updateQRCode', function (tagNumber) {
        // Llamar a la función para actualizar el mensaje con el nuevo tag
        updateMessage(tagNumber);
    });

    // Inicialmente mostrar un mensaje genérico o vacío en el QR
    updateMessage(''); // El QR permanece igual, pero sin mensaje hasta que se toque un número
});
