document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`section-${sectionId}`).classList.add('active');
        });
    });
});
