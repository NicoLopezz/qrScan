
    const socket = io(); // Conexión al servidor de WebSockets
  
    function moveToOrder(element) {
      const orderedContainer = document.getElementById('ordered-tags');
      
      // Clonar el elemento y añadir la clase de animación pop-in
      const clonedElement = element.cloneNode(true);
      clonedElement.classList.add('pop-in');
      
      // Agregar un evento para devolverlo a "Tags libres"
      clonedElement.onclick = function () {
        moveToFree(clonedElement);
      };
    
      // Eliminar el elemento de la sección de tags libres
      element.remove();
    
      // Añadir el tag clonado a la lista de "Tags con pedido"
      orderedContainer.appendChild(clonedElement);
    
      // Enviar el número del tag al servidor a través de WebSockets
      const tagNumber = parseInt(clonedElement.getAttribute('data-number'));
      console.log("El numero presionado es el: " + tagNumber)
      socket.emit('tagSelected', tagNumber); // Emitir el número del tag al servidor
    
      // Eliminar la clase de animación después de que termine
      setTimeout(() => {
        clonedElement.classList.remove('pop-in');
      }, 500); // Duración de la animación pop-in
    
      // Reordenar los elementos en la lista de "Tags con pedido"
      sortTags(orderedContainer);
    }
  
    function moveToFree(element) {
      const freeContainer = document.getElementById('free-tags');
      
      // Clonar el elemento y añadir la clase de animación pop-in
      const clonedElement = element.cloneNode(true);
      clonedElement.classList.add('pop-in');
    
      clonedElement.onclick = function () {
        moveToOrder(clonedElement);
      };
    
      // Eliminar el tag de "Tags con pedido"
      element.remove();
    
      // Insertar el tag clonado en la lista de "Tags libres" en el orden correcto
      const tagNumber = parseInt(clonedElement.getAttribute('data-number'));
      insertInOrder(freeContainer, clonedElement, tagNumber);
    
      // Eliminar la clase de animación después de que termine
      setTimeout(() => {
        clonedElement.classList.remove('pop-in');
      }, 500); // Duración de la animación pop-in
    }
    
    function sortTags(container) {
      const tagsArray = Array.from(container.children);
      tagsArray.sort((a, b) => a.getAttribute('data-number') - b.getAttribute('data-number'));
      container.innerHTML = '';
      tagsArray.forEach(tag => container.appendChild(tag));
    }
    
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
  
  