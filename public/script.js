$(document).ready(function() {
    const whatsappNumber = '14155238886'; // Cambia esto por tu número de Twilio
    const message = 'Ya realicé mi pedido';
    const qrCodeUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const qr = new QRious({
        element: document.getElementById('qrcode'),
        value: qrCodeUrl,
        size: 200
    });
});
