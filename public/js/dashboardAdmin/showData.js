// Función para obtener cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Función para obtener información del local desde la API
async function fetchUserInfo(adminId) {
  try {
      const response = await fetch(`/api/locales/${encodeURIComponent(adminId)}`);
      
      if (!response.ok) {
          console.error('Error al obtener información del local:', response.statusText);
          return {};
      }
      
      return await response.json();
      displayUserInfo(adminId)
  } catch (error) {

      console.error('Error en la solicitud:', error);
      return {};
  }
}

// Función para mostrar el nombre del local en el elemento correspondiente
function displayUserInfo(userInfo) {
  const localNameElement = document.getElementById("localName");
  if (localNameElement && userInfo.localName) {
      localNameElement.textContent = userInfo.localName;
  }
}

// Evento que se ejecuta al cargar el DOM
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
      if (userInfo && userInfo.localName) {
          displayUserInfo(userInfo);
      } else {
          console.error('No se encontró el nombre del local.');
      }
  } catch (error) {
      console.error('Error al cargar la información del local:', error);
  }
});
