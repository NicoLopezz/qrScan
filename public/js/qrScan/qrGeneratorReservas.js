function getCookieReservas(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

document.addEventListener('DOMContentLoaded', function () {
    const adminId = getCookieReservas('adminId');
    if (!adminId) {
        console.warn("qrGeneratorReservas: No se encontró adminId en cookies");
        return;
    }

    const canvas = document.getElementById('qrcode');
    if (!canvas) return;

    const qrCodeUrl = `http://localhost:4000/api/qrScanUpdateReservas/${adminId}`;

    new QRious({
        element: canvas,
        value: qrCodeUrl,
        size: 200
    });
});
