document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('sidebarToggle');
    const topBar = document.querySelector('.topBar');
    const mainContent = document.querySelector('.main-content');

    // --- Collapse/expand desktop sidebar ---
    if (toggleBtn) {
        const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (collapsed) applySidebarCollapsed(true);

        toggleBtn.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            applySidebarCollapsed(isCollapsed);
        });
    }

    function applySidebarCollapsed(collapsed) {
        const w = collapsed ? '64px' : 'var(--sidebar-width)';
        if (topBar) topBar.style.left = w;
        if (mainContent) mainContent.style.marginLeft = w;
        if (toggleBtn) toggleBtn.style.left = w;
        if (collapsed) {
            sidebar.classList.add('collapsed');
            if (toggleBtn) toggleBtn.querySelector('i').style.transform = 'rotate(180deg)';
        } else {
            sidebar.classList.remove('collapsed');
            if (toggleBtn) toggleBtn.querySelector('i').style.transform = 'rotate(0deg)';
        }
    }

    // --- Navegación entre secciones ---
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const sectionId = this.getAttribute('data-section');

            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });

            const selectedSection = document.getElementById(`section-${sectionId}`);
            if (selectedSection) selectedSection.classList.add('active');

            if (sectionId === 'ventas') {
                // Trigger data load for the currently active option
                if (typeof switchToOption === 'function') {
                    const activeOption = document.querySelector('.option.active');
                    const activeOptionId = activeOption?.id || 'movimientos';
                    switchToOption(activeOptionId);
                } else if (typeof cargarLavadosConFiltros === 'function') {
                    cargarLavadosConFiltros();
                }
            }

            // Cerrar sidebar en mobile al navegar
            closeSidebar();
        });
    });

    // --- Toggle mobile sidebar ---
    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
});
