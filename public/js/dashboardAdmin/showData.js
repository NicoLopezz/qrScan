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






// function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
//     return null;
//   }
  
//   async function fetchUserInfo(adminId) {
//     try {
//       const response = await fetch(`/api/locales/${encodeURIComponent(adminId)}`);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Error al obtener información del usuario:', response.statusText);
//         console.error('Respuesta del servidor:', errorText);
//         return {};
//       }
      
//       return await response.json();
  
//     } catch (error) {
//       // displayUserInfo()
//       console.error('Error en la solicitud:', error);
//       return {};
//     }
//   }
  
//   // document.addEventListener('DOMContentLoaded', async () => {
//   //   let userAdminId = getCookie('adminId');
  
//   //   if (!userAdminId) {
//   //     console.error('No se encontró el adminId en las cookies. El usuario debe iniciar sesión.');
//   //     return;
//   //   }
  
//   //   userAdminId = decodeURIComponent(userAdminId);
//   //   console.log('adminId desde la cookie:', userAdminId);
  
//   //   try {
//   //     const userInfo = await fetchUserInfo(userAdminId);
  
//   //     if (userInfo && Object.keys(userInfo).length > 0) {
//   //       displayUserInfo(userInfo);
//   //     } else {
//   //       console.error('Error al obtener información del usuario:', userInfo);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error en la solicitud:', error);
//   //   }
//   // });
  

//   function displayUserInfo(userInfo) {
//     console.log("Mostrando información del usuario:", userInfo);
    
//     // Mostrar localName
//     const localNameElement = document.getElementById("localName");
//     if (localNameElement && userInfo.localName) {
//         localNameElement.textContent = userInfo.localName;
//     }

//     // // Mostrar cantidad de clientes
//     // const clientCountElement = document.getElementById("clientCount");
//     // if (clientCountElement && Array.isArray(userInfo.clientes)) {
//     //     clientCountElement.textContent = userInfo.clientes.length;
//     // }

//     // // Cargar clientes en la tabla
//     // const clientTableBody = document.getElementById("clientTableBody");
//     // clientTableBody.innerHTML = ""; // Limpiar el contenido previo

//     // if (Array.isArray(userInfo.clientes)) {
//     //     userInfo.clientes.forEach(cliente => {
//     //         const row = document.createElement("tr");

//     //         // Nombre
//     //         const nameCell = document.createElement("td");
//     //         nameCell.textContent = cliente.nombre || "No-Disponible";
//     //         row.appendChild(nameCell);

//     //         // Teléfono
//     //         const phoneCell = document.createElement("td");
//     //         phoneCell.textContent = cliente.from || "No-Disponible";
//     //         row.appendChild(phoneCell);

//     //         // Pedidos (número de elementos en historialPedidos)
//     //         const messagesCell = document.createElement("td");
//     //         messagesCell.textContent = cliente.historialPedidos ? cliente.historialPedidos.length : 0;
//     //         row.appendChild(messagesCell);

//     //         // Puntuación
//     //         const scoreCell = document.createElement("td");
//     //         scoreCell.textContent = cliente.from || "No-Disponible";
//     //         row.appendChild(scoreCell);

//     //         clientTableBody.appendChild(row);
//     //     });
//     // } else {
//     //     console.error("El listado de clientes no es un array.");
//     // }
// }

// // // Generar filas de ejemplo en la tabla de Reservas
// // document.addEventListener("DOMContentLoaded", () => {
// //   const clientTableBodyReservas = document.getElementById('clientTableBodyReservas');

// //   // Lista de comentarios aleatorios
// //   const comments = [
// //       "Me gustó pero...",
// //       "¡Excelente!",
// //       "Hermoso lugar",
// //       "La comida picante",
// //       "Muy buen servicio",
// //       "Habitaciones limpias",
// //       "Perfecto para vacaciones",
// //       "Ambiente relajante",
// //       "El personal muy amable",
// //       "Desayuno delicioso",
// //       "Camas cómodas",
// //       "Buena ubicación",
// //       "Mejorable en algunos aspectos",
// //       "Experiencia inolvidable",
// //       "Volvería sin dudar",
// //       "Un poco ruidoso",
// //       "Ideal para familia",
// //       "Muy recomendable",
// //       "Precio justo",
// //       "Decoración elegante"
// //   ];

// //   // Datos de ejemplo para 20 clientes
// //   const clients = Array.from({ length: 20 }, (_, i) => ({
// //       nombre: `Cliente ${i + 1}`,
// //       telefono: `+54 9 11 1234 56${String(i).padStart(2, '0')}`,
// //       calificacion: generateRandomStars(), // Generar calificación aleatoria en estrellas
// //       puntuacion: comments[Math.floor(Math.random() * comments.length)] // Comentario aleatorio
// //   }));

// //   // Crear filas con los datos de cada cliente
// //   clients.forEach(client => {
// //       const tr = document.createElement('tr');

// //       const nombreTd = document.createElement('td');
// //       nombreTd.textContent = client.nombre;

// //       // const telefonoTd = document.createElement('td');
// //       // telefonoTd.textContent = client.telefono;

// //       const calificacionTd = document.createElement('td');
// //       calificacionTd.innerHTML = `<span class="stars">${client.calificacion}</span>`;

// //       const puntuacionTd = document.createElement('td');
// //       puntuacionTd.textContent = client.puntuacion;

// //       tr.appendChild(nombreTd);
// //       // tr.appendChild(telefonoTd);
// //       tr.appendChild(calificacionTd);
// //       tr.appendChild(puntuacionTd);

// //       clientTableBodyReservas.appendChild(tr);
// //   });
// // });

// // // Función para generar una calificación aleatoria en estrellas
// // function generateRandomStars() {
// //   const totalStars = 5;
// //   const brightStars = Math.floor(Math.random() * (totalStars + 1)); // Número aleatorio de estrellas brillantes
// //   const darkStars = totalStars - brightStars; // Estrellas oscuras para completar 5 estrellas
// //   return '⭐'.repeat(brightStars) + '☆'.repeat(darkStars);
// // }
