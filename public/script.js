$(document).ready(function () {
    const socket = io(); // Conexión al servidor de WebSockets
  
    // Función para generar el QR con el número de tag en el mensaje
    function generateQRCode(tagNumber) {
      const whatsappNumber = '14155238886'; // Cambia esto por tu número de Twilio
      const message = `Ya realicé mi pedido, número de tag: ${tagNumber}`;
      const qrCodeUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      console.log("El numero presionado es el: " + tagNumber)

      document.getElementById('numeroPedido').innerText = "QR con el pedido N: " + tagNumber
  
      const qr = new QRious({
        element: document.getElementById('qrcode'),
        value: qrCodeUrl, // Actualiza solo el contenido del QR
        size: 200
      });
    }
  
    // Escuchar el evento 'updateQRCode' desde el servidor
    socket.on('updateQRCode', function (tagNumber) {
      // Llamar a la función para generar el QR con el nuevo tag recibido
      generateQRCode(tagNumber);
    });
  
    // Inicialmente generar el QR sin un tag (opcional)
    generateQRCode(''); // Genera un QR vacío o genérico al inicio
  });
  