document.addEventListener("DOMContentLoaded", () => {
    // Seleccionar todos los elementos del menú
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Remover la clase 'active' de todos los elementos del menú
            menuItems.forEach(i => i.classList.remove('active'));

            // Agregar la clase 'active' solo al ítem clicado
            this.classList.add('active');

            // Mostrar la sección correspondiente
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`section-${sectionId}`).classList.add('active');
        });
    });
});
