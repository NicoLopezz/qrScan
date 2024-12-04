// Función para leer cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Función para remover cualquier cuadro de confirmación activo
function removeAllConfirmationBoxes() {
  const activeConfirmationBoxes = document.querySelectorAll('.confirmation-box');
  activeConfirmationBoxes.forEach(box => box.remove());
}

// Función para mostrar el cuadro de confirmación sobre un tag
function showConfirmation(element, action) {
  // Eliminar cualquier cuadro de confirmación activo
  removeAllConfirmationBoxes();

  // Crear el cuadro de confirmación
  const confirmationBox = document.createElement('div');
  confirmationBox.classList.add('confirmation-box');

  // Botón "Sí"
  const yesButton = document.createElement('button');
  yesButton.innerText = 'Sí';
  yesButton.onclick = function () {
    action(); // Realiza la acción que se pase como argumento (mover el tag)
    confirmationBox.remove(); // Elimina el cuadro de confirmación
    document.removeEventListener('click', handleClickOutside); // Eliminamos el listener global
  };

  // Botón "No"
  const noButton = document.createElement('button');
  noButton.innerText = 'No';
  noButton.classList.add('no');
  noButton.onclick = function (event) {
    event.stopPropagation(); // Evitamos que el listener global también se ejecute
    confirmationBox.remove(); // Elimina el cuadro de confirmación sin hacer nada
    document.removeEventListener('click', handleClickOutside); // Eliminamos el listener global
  };

  

  // Añadir los botones al cuadro de confirmación
  confirmationBox.appendChild(yesButton);
  confirmationBox.appendChild(noButton);

  // Posicionar el cuadro sobre el tag
  element.style.position = 'relative'; // Aseguramos que el tag sea el contenedor relativo
  element.appendChild(confirmationBox); // Añadir el cuadro de confirmación al tag

  // Listener global para eliminar el cuadro si haces clic fuera del cuadro o del tag
  const handleClickOutside = (event) => {
    if (!element.contains(event.target) && !confirmationBox.contains(event.target)) {
      confirmationBox.remove(); // Si haces clic fuera del cuadro o el tag, se elimina
      document.removeEventListener('click', handleClickOutside); // Eliminamos el listener
    }
  };

  // Añadimos un listener que detecte clics fuera del cuadro
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0); // Usamos un pequeño delay para evitar que el mismo clic que activa la confirmación la cierre
}

function moveToOrder(element) {
  showConfirmation(element, () => {
    const orderedContainer = document.getElementById('ordered-tags');

    // Clonar el elemento y añadir la clase de animación pop-in
    const clonedElement = element.cloneNode(true);
    clonedElement.classList.add('pop-in');

    // Recuperar el adminId de la cookie
    const adminId = getCookie('adminId');
    if (!adminId) {
      console.error("No se encontró el adminId en la cookie");
      return;
    }
    console.log("Admin ID desde la cookie:", adminId);

    // Añadir el tag clonado a la lista de "Tags con pedido"
    orderedContainer.appendChild(clonedElement);

    // Obtener el número del tag del elemento clonado
    const tagNumber = parseInt(clonedElement.getAttribute('data-number'));
    if (isNaN(tagNumber)) {
      console.error("El número de tag es inválido o undefined");
      return;
    }
    console.log("Tag seleccionado:", tagNumber);

    // Ejecutar el fetch incluyendo el adminId en el body de la petición
    fetch(`/api/updateTagSelected/${adminId}`, { // adminId es el ID del local o admin desde la cookie
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagSelected: tagNumber }) // tagNumber es el tag seleccionado
    })
      .then(response => response.json())
      .then(data => {
        // console.log('Respuesta del servidor:', data);
        // Usar la URL de WhatsApp generada para actualizar el QR
        const whatsappUrl = data.whatsappUrl;
        // Actualizar el QR con la nueva URL
        const qr = new QRious({
          element: document.getElementById('qrcode'),
          value: whatsappUrl,  // Usar la URL generada de WhatsApp
          size: 200
        });
      })
      .catch(error => {
        console.error('Error en la petición:', error);
      });

    // Eliminar cualquier cuadro de confirmación activo
    removeAllConfirmationBoxes();

    // Agregar un evento para mover a "Tags pendientes de retiro"
    clonedElement.onclick = function () {
      moveToPending(clonedElement);
    };

    // Eliminar el elemento de la sección de tags libres
    element.remove();

    // Eliminar la clase de animación después de que termine
    setTimeout(() => {
      clonedElement.classList.remove('pop-in');
    }, 500); // Duración de la animación pop-in

    // Reordenar los elementos en la lista de "Tags con pedido"
    sortTags(orderedContainer);
  });
}

// Función para mover el tag a la sección de "Tags pendientes de retiro"
function moveToPending(element) {
  showConfirmation(element, () => {
    const pendingContainer = document.getElementById('pending-tags');
    
    // Eliminar cualquier cuadro de confirmación activo
    removeAllConfirmationBoxes();
    
    // Clonar el elemento y añadir la clase de animación pop-in
    const clonedElement = element.cloneNode(true);
    clonedElement.classList.add('pop-in');
    
    // Agregar un evento para devolverlo a "Tags libres"
    clonedElement.onclick = function () {
      moveToFree(clonedElement);
    };

    // Eliminar el tag de "Tags con pedido"
    element.remove();

    // Añadir el tag clonado a la lista de "Tags pendientes de retiro"
    pendingContainer.appendChild(clonedElement);

    // Enviar el número de tag al servidor para notificar al usuario que el pedido está listo
    const tagNumber = parseInt(clonedElement.getAttribute('data-number'));


        // Recuperar el adminId de la cookie
        const adminId = getCookie('adminId');
        if (!adminId) {
          console.error("No se encontró el adminId en la cookie");
          return;
        }
        console.log("Admin ID desde la cookie:", adminId);

    fetch(`/api/readyPickUp/${adminId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tagNumber })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.log("MENSAJE ANTES DEL ERROR:" + tagNumber)
        console.error('Error al notificar al usuario:', data.error);
      } else {
        console.log('Notificación enviada:', data.message);
      }
    })
    .catch(error => console.error('Error en la solicitud:', error));

    // Eliminar la clase de animación después de que termine
    setTimeout(() => {
      clonedElement.classList.remove('pop-in');
    }, 500); // Duración de la animación pop-in

    // Reordenar los elementos en la lista de "Tags pendientes de retiro"
    sortTags(pendingContainer);
  });
}

// Función para mover el tag de "Tags pendientes de retiro" a "Tags libres"
function moveToFree(element) {
  showConfirmation(element, () => {
    const freeContainer = document.getElementById('free-tags');
    
    // Eliminar cualquier cuadro de confirmación activo
    removeAllConfirmationBoxes();
    
    // Clonar el elemento y añadir la clase de animación pop-in
    const clonedElement = element.cloneNode(true);
    clonedElement.classList.add('pop-in');

    // Agregar evento para mover de nuevo el tag a "Tags con pedido"
    clonedElement.onclick = function () {
      moveToOrder(clonedElement);
    };

    // Eliminar el tag de "Tags pendientes de retiro"
    element.remove();

    // Insertar el tag clonado en la lista de "Tags libres" en el orden correcto
    const tagNumber = parseInt(clonedElement.getAttribute('data-number'));
    insertInOrder(freeContainer, clonedElement, tagNumber);

    const adminId2 = getCookie('adminId');
    if (!adminId2) {
      console.error("No se encontró el adminId en la cookie");
      return;
    }
    console.log("Admin ID desde la cookie:", adminId2);
    // Enviar una solicitud POST al servidor para confirmar que el pedido fue recogido
    fetch(`/api/confirmPickedUp/${adminId2}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tagNumber })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error al confirmar la recogida del pedido:', data.error);
      } else {
        console.log('Confirmación de recogida enviada:', data.message);
      }
    })
    .catch(error => console.error('Error en la solicitud:', error));

    // Eliminar la clase de animación después de que termine
    setTimeout(() => {
      clonedElement.classList.remove('pop-in');
    }, 500); // Duración de la animación pop-in

    // Reordenar los elementos en la lista de "Tags libres"
    sortTags(freeContainer);
  });
}

// Función para ordenar los tags en el contenedor
function sortTags(container) {
  const tagsArray = Array.from(container.children);
  tagsArray.sort((a, b) => a.getAttribute('data-number') - b.getAttribute('data-number'));
  container.innerHTML = '';
  tagsArray.forEach(tag => container.appendChild(tag));
}

// Función para insertar el tag en el orden correcto en "Tags libres"
function insertInOrder(container, element, tagNumber) {
  const tagsArray = Array.from(container.children);
  let inserted = false;
  for (let i = 0; i < tagsArray.length; i++) {
    const currentTagNumber = parseInt(tagsArray[i].getAttribute('data-number'));
    if (tagNumber < currentTagNumber) {
      container.insertBefore(element, tagsArray[i]);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    container.appendChild(element);
  }
}


function showNotification(message, type = 'success') {
  const notificationContainer = document.getElementById('notification-container');

  const notification = document.createElement('div');
  notification.classList.add('notification');
  if (type === 'error') {
      notification.classList.add('error');
  }

  notification.innerHTML = `
      <span>${message}</span>
      <span class="close-btn" onclick="this.parentElement.remove()">✕</span>
  `;

  notificationContainer.appendChild(notification);

  // Eliminar la notificación automáticamente después de 4 segundos
  setTimeout(() => {
      notification.remove();
  }, 4000);
}


// MANEJO DE BTN VERSIÓN DE MÓVIL

// MANEJO DE BTN VERSIÓN DE MÓVIL
function handleOption(option) {
  const tarjetaYqr = document.querySelector("#tarjetaYqr");
  const tabla = document.querySelector(".tabla");

  if (option === 'reservas') {
    // Muestra tarjetaYqr y oculta tabla
    if (tarjetaYqr) {
      tarjetaYqr.style.display = "grid"; // Hace visible tarjetaYqr
    }
    if (tabla) {
      tabla.style.display = "none"; // Oculta tabla
    }
  } else if (option === 'tabla') {
    // Muestra tabla y oculta tarjetaYqr
    if (tabla) {
      tabla.style.display = "grid"; // Hace visible tabla
    }
    if (tarjetaYqr) {
      tarjetaYqr.style.display = "none"; // Oculta tarjetaYqr
    }
  }
}



