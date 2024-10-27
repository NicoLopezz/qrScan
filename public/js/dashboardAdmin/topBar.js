document.addEventListener("DOMContentLoaded", () => {
    // Manejar la visibilidad de la topBar al hacer scroll
    window.addEventListener('scroll', function() {
        const topBar = document.querySelector('.topBar');
        if (window.scrollY > 10) {
            topBar.style.opacity = '0.0'; // Oculta la barra cuando scroll > 10px
        } else {
            topBar.style.opacity = '1'; // Muestra la barra cuando scroll <= 10px
        }
    });
});
