document.addEventListener("DOMContentLoaded", () => {
    // Seleccionar todos los elementos del menú
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const sectionId = this.getAttribute('data-section'); // Obtener el data-section del ítem clicado
            
            // Remover la clase 'active' de todos los elementos del menú
            menuItems.forEach(i => i.classList.remove('active'));

            // Agregar la clase 'active' solo al ítem clicado
            this.classList.add('active');

            // Mostrar la sección correspondiente
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });

            const selectedSection = document.getElementById(`section-${sectionId}`);
            selectedSection.classList.add('active');

            // Refrescar la tabla de lavados si se selecciona la sección de ventas
            if (sectionId === 'ventas') { // Verifica si la sección activada es ventas
                console.log("Refrescando tabla de lavados en Ventas...");
                cargarLavadosConFiltros(); // Llama a la función para refrescar la tabla
            }
        });
    });
});
