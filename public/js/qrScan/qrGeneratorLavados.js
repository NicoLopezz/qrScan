function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

document.addEventListener('DOMContentLoaded', function () {
    const adminId = getCookie('adminId');
    if (!adminId) {
        console.warn("qrGeneratorLavados: No se encontró adminId en cookies");
        return;
    }

    const canvas = document.getElementById('qrcode2');
    if (!canvas) return;

    const qrCodeUrl = `http://localhost:4000/api/qrScanUpdateLavados/${adminId}`;

    new QRious({
        element: canvas,
        value: qrCodeUrl,
        size: 200
    });
});
