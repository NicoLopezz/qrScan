function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  async function fetchUserInfo(adminId) {
    try {
      const response = await fetch(`/api/locales/${encodeURIComponent(adminId)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al obtener información del usuario:', response.statusText);
        console.error('Respuesta del servidor:', errorText);
        return {};
      }
      
      return await response.json();
  
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return {};
    }
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    let userAdminId = getCookie('adminId');
  
    if (!userAdminId) {
      console.error('No se encontró el adminId en las cookies. El usuario debe iniciar sesión.');
      return;
    }
  
    userAdminId = decodeURIComponent(userAdminId);
    console.log('adminId desde la cookie:', userAdminId);
  
    try {
      const userInfo = await fetchUserInfo(userAdminId);
  
      if (userInfo && Object.keys(userInfo).length > 0) {
        displayUserInfo(userInfo);
      } else {
        console.error('Error al obtener información del usuario:', userInfo);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  });
  

  function displayUserInfo(userInfo) {
    console.log("Mostrando información del usuario:", userInfo);
    
    // Mostrar localName
    const localNameElement = document.getElementById("localName");
    if (localNameElement && userInfo.localName) {
        localNameElement.textContent = userInfo.localName;
    }

    // Mostrar cantidad de clientes
    const clientCountElement = document.getElementById("clientCount");
    if (clientCountElement && Array.isArray(userInfo.clientes)) {
        clientCountElement.textContent = userInfo.clientes.length;
    }

    // Calcular y mostrar total de pedidos del día
    const totalPedidosElement = document.getElementById("totalPedidos");
    let totalPedidos = 0;

    if (Array.isArray(userInfo.clientes)) {
        userInfo.clientes.forEach(cliente => {
            if (Array.isArray(cliente.historialPedidos)) {
                totalPedidos += cliente.historialPedidos.length;
            }
        });
    }

    if (totalPedidosElement) {
        totalPedidosElement.textContent = totalPedidos;
    } else {
        console.error("No se encontró el elemento para mostrar el total de pedidos.");
    }

    // Cargar clientes en la tabla
    const clientTableBody = document.getElementById("clientTableBody");
    clientTableBody.innerHTML = ""; // Limpiar el contenido previo

    if (Array.isArray(userInfo.clientes)) {
        userInfo.clientes.forEach(cliente => {
            const row = document.createElement("tr");

            // Nombre
            const nameCell = document.createElement("td");
            nameCell.textContent = cliente.nombre || "No-Disponible";
            row.appendChild(nameCell);

            // Teléfono
            const phoneCell = document.createElement("td");
            phoneCell.textContent = cliente.from || "No-Disponible";
            row.appendChild(phoneCell);

            // Pedidos (número de elementos en historialPedidos)
            const messagesCell = document.createElement("td");
            messagesCell.textContent = cliente.historialPedidos ? cliente.historialPedidos.length : 0;
            row.appendChild(messagesCell);

            // Puntuación
            const scoreCell = document.createElement("td");
            scoreCell.textContent = "N/A";
            row.appendChild(scoreCell);

            clientTableBody.appendChild(row);
        });
    } else {
        console.error("El listado de clientes no es un array.");
    }
}


