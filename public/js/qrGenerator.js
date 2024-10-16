// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;  // Si no encuentra la cookie, devuelve null
}
$(document).ready(function() {
    // Obtener el adminId desde la cookie
    const adminId = getCookie('adminId');  // Obtener el valor de la cookie

    // Verifica si el adminId es válido
    if (!adminId) {
        console.error("No se encontró el adminId en las cookies");
        return;  // Evita continuar si no se encuentra la cookie
    }

    console.log("adminId obtenido de la cookie: " + adminId);

    // Generar la URL del QR con el adminId
    const qrCodeUrl = `http://192.168.1.47:3000/api/qrScanUpdate/${adminId}`;

    // Generar el QR con el adminId en la URL
    const qr = new QRious({
        element: document.getElementById('qrcode'),
        value: qrCodeUrl,  // Usar la URL con el adminId
        size: 200
    });
});



