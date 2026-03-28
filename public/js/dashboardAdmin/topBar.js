document.addEventListener("DOMContentLoaded", () => {
    // Manejar la visibilidad de la topBar al hacer scroll
    cargarNombreLocal();
});



async function cargarNombreLocal() {
    // Obtener el adminId desde las cookies
    const adminId = getCookie('adminId');
    if (!adminId) {
        console.error('No se encontró el adminId en las cookies.');
        return;
    }

    // Obtener la información del usuario
    const userInfo = await fetchUserInfo(adminId);
    if (userInfo && userInfo.localName) {
        const localNameElement = document.getElementById("localName");
        if (!localNameElement) {
            console.error("No se encontró el elemento con id 'localName' en el DOM.");
            return;
        }
        localNameElement.textContent = userInfo.localName;
    } else {
        console.error("No se pudo obtener el nombre del local.");
    }
}

// Función para obtener el valor de una cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        return cookieValue;
    }
    console.error(`La cookie ${name} no existe.`);
    return null;
}

// Función para obtener información del usuario desde la API
async function fetchUserInfo(adminId) {
    try {
        const response = await fetch(`/api/locales/${encodeURIComponent(adminId)}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al obtener información del usuario:', response.statusText);
            console.error('Respuesta del servidor:', errorText);
            return {};
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return {};
    }
}
