const socket = io(); // Conexión al servidor de WebSockets

// Función para mover el tag a la sección de "Tags con pedido"
function moveToOrder(element) {
  const orderedContainer = document.getElementById('ordered-tags');
  
  // Clonar el elemento y añadir la clase de animación pop-in
  const clonedElement = element.cloneNode(true);
  clonedElement.classList.add('pop-in');
  
  // Agregar un evento para mover a "Tags pendientes de retiro"
  clonedElement.onclick = function () {
    moveToPending(clonedElement);
  };

  // Eliminar el elemento de la sección de tags libres
  element.remove();

  // Añadir el tag clonado a la lista de "Tags con pedido"
  orderedContainer.appendChild(clonedElement);

  // Enviar el número del tag al servidor a través de WebSockets
  const tagNumber = parseInt(clonedElement.getAttribute('data-number'));
  socket.emit('tagSelected', tagNumber); // Emitir el número del tag al servidor
  
  // Eliminar la clase de animación después de que termine
  setTimeout(() => {
    clonedElement.classList.remove('pop-in');
  }, 500); // Duración de la animación pop-in

  // Reordenar los elementos en la lista de "Tags con pedido"
  sortTags(orderedContainer);
}

// Función para mover el tag a la sección de "Tags pendientes de retiro"
function moveToPending(element) {
  const pendingContainer = document.getElementById('pending-tags');
  console.log("ENTRE ACA2 tag movido a pendiente!!")
  
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
  console.log("Tag movido a 'Tags pendientes de retiro'");

  // Obtener el número de tag para enviarlo al servidor
  const tagNumber = parseInt(clonedElement.getAttribute('data-number'));
  

  // Enviar una solicitud POST al servidor para notificar al usuario que el pedido está listo
  fetch('/api/readyPickUp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tagNumber })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
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
}

// Función para mover el tag de "Tags pendientes de retiro" a "Tags libres"
function moveToFree(element) {
  const freeContainer = document.getElementById('free-tags');
  
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

  // Enviar una solicitud POST al servidor para confirmar que el pedido fue recogido
  fetch('/api/confirmPickedUp', {
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
