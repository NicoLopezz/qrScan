// Elementos DOM — scoped to section-ventas
const ventasSection = document.getElementById('section-ventas');
const tabs = ventasSection ? ventasSection.querySelectorAll('.tab') : [];
const options = ventasSection ? ventasSection.querySelectorAll('.option') : [];
const tables = ventasSection ? ventasSection.querySelectorAll('.data-table') : [];
const horaApertura = document.getElementById("hora-apertura-arqueo");
const btnNuevoArqueo = document.getElementById('btn-nuevo-arqueo');
const btnNuevoMovimiento = document.getElementById('btn-nuevo-movimiento');
const formArqueo = document.getElementById("form-arqueo");

// horaApertura change handler (if needed for future logic)
document.addEventListener("DOMContentLoaded", () => {
    // placeholder for hora-apertura-arqueo change events if needed
});

// CREAR ARQUEO NUEVO
formArqueo?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const horaAperturaVal = document.getElementById("hora-apertura-arqueo")?.value;
    const saldoInicial = parseFloat(document.getElementById("monto-inicial")?.value);
    const cajaTipo = document.querySelector(".tab.active")?.id === "caja-mayor" ? "CajaMayor" : "CajaChica";
    const tipoArqueo = document.getElementById("tipo-arqueo-nuevo")?.value;

    if (!horaAperturaVal || isNaN(saldoInicial) || !tipoArqueo) {
        if (typeof showNotification === 'function') showNotification("Por favor, complete todos los campos requeridos.", "error");
        return;
    }

    try {
        const response = await fetch("/api/arqueos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                horaApertura: horaAperturaVal,
                saldoInicial,
                cajaTipo,
                tipoArqueo
            })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            if (typeof fetchArqueosFilter === 'function') {
                fetchArqueosFilter();
            } else if (typeof fetchArqueos === 'function') {
                fetchArqueos(cajaTipoActivo);
            }
            if (typeof showNotification === 'function') showNotification("Arqueo iniciado con exito.");
            formArqueo.reset();
        } else {
            if (typeof showNotification === 'function') showNotification(`Error al iniciar el arqueo: ${data.message || data.error || "Error desconocido"}`, "error");
        }
    } catch (error) {
        console.error("Error al enviar el formulario de arqueo:", error);
        if (typeof showNotification === 'function') showNotification("Error al conectarse con el servidor.", "error");
    }
});


// Funcion para manejar Tabs (Caja Mayor / Menor)
tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const ventasOption = document.getElementById('ventas');
        if (tab.id === 'caja-mayor') {
            ventasOption?.classList.add('disabled');
            // If ventas was active, switch to movimientos
            if (ventasOption?.classList.contains('active')) {
                ventasOption?.classList.remove('active');
                document.getElementById('movimientos')?.classList.add('active');
            }
        } else {
            ventasOption?.classList.remove('disabled');
        }

        // Determine which option is currently active and reload its data
        const activeOption = document.querySelector('.option.active');
        const activeOptionId = activeOption?.id || 'movimientos';

        // If no option is active, default to movimientos
        if (!activeOption) {
            document.getElementById('movimientos')?.classList.add('active');
        }

        // Trigger the active option's data load
        switchToOption(activeOptionId);
    });
});


// Funcion para actualizar botones segun la opcion seleccionada
function actualizarBotones(opcionSeleccionada) {
    if (btnNuevoArqueo) { btnNuevoArqueo.classList.add('hidden'); btnNuevoArqueo.style.display = 'none'; }
    if (btnNuevoMovimiento) { btnNuevoMovimiento.classList.add('hidden'); btnNuevoMovimiento.style.display = 'none'; }

    if (opcionSeleccionada === 'arqueo' && btnNuevoArqueo) {
        btnNuevoArqueo.classList.remove('hidden');
        btnNuevoArqueo.style.display = 'inline-block';
    } else if (opcionSeleccionada === 'movimientos' && btnNuevoMovimiento) {
        btnNuevoMovimiento.classList.remove('hidden');
        btnNuevoMovimiento.style.display = 'inline-block';
    }
}

// *** SINGLE consolidated handler for option clicks ***
options.forEach((option) => {
    option.addEventListener('click', () => {
        if (option.classList.contains('disabled')) return;
        switchToOption(option.id);
    });
});

// Central function to switch to a given option
function switchToOption(selectedOption) {
    // Update active state on options
    options.forEach((o) => o.classList.remove('active'));
    const targetOption = document.getElementById(selectedOption);
    targetOption?.classList.add('active');

    // Update buttons
    actualizarBotones(selectedOption);

    // Update filters
    if (typeof updateActiveFilters === 'function') {
        updateActiveFilters();
    }

    // Get references
    const movimientoDetails = document.getElementById('movimiento-details');
    const detailsSection = document.querySelector('.details-section');
    const details = document.getElementById('details');

    // Hide all tables first
    tables.forEach((table) => table.classList.add('hidden'));

    // Hide details by default
    if (detailsSection) detailsSection.style.display = 'none';
    if (details) details.style.display = 'none';

    if (selectedOption === 'movimientos') {
        showFormsAndButtons('btn-nuevo-movimiento');
        document.getElementById('table-movimientos')?.classList.remove('hidden');
        document.getElementById('form-lavado')?.classList.add('hidden');
        // Show the movimiento form (always visible on movimientos tab)
        const formMovSection = document.getElementById('form-movimiento-section');
        if (formMovSection) formMovSection.style.display = '';
        const formMov = document.getElementById('form-movimiento');
        if (formMov) { formMov.style.display = ''; formMov.classList.remove('hidden'); }

        // Show movimiento details panel
        if (movimientoDetails) {
            movimientoDetails.classList.remove('hidden');
            movimientoDetails.classList.add('visible');
        }

        // Fetch movimientos data
        if (typeof fetchMovimientos === 'function') {
            fetchMovimientos();
        }

    // Hide inline arqueo button by default
    const btnCrearArqueoInline = document.getElementById('btn-crear-arqueo-inline');
    if (btnCrearArqueoInline) btnCrearArqueoInline.style.display = 'none';

    if (selectedOption === 'arqueo') {
        showFormsAndButtons('btn-nuevo-arqueo');
        document.getElementById('table-arqueo')?.classList.remove('hidden');
        if (btnCrearArqueoInline) btnCrearArqueoInline.style.display = 'inline-block';
        document.getElementById('form-lavado')?.classList.add('hidden');
        // Hide movimiento form when on arqueo tab
        const formMovSection = document.getElementById('form-movimiento-section');
        if (formMovSection) formMovSection.style.display = 'none';

        // Hide movimiento details
        if (movimientoDetails) {
            movimientoDetails.classList.remove('visible');
            movimientoDetails.classList.add('hidden');
        }

        // Fetch arqueos data
        if (typeof fetchArqueosFilter === 'function') {
            fetchArqueosFilter();
        }

    } else if (selectedOption === 'ventas') {
        showFormsAndButtons('btn-nueva-venta');
        document.getElementById('table-ventas')?.classList.remove('hidden');
        document.getElementById('form-lavado')?.classList.remove('hidden');
        // Hide movimiento form when on ventas/lavados tab
        const formMovSection2 = document.getElementById('form-movimiento-section');
        if (formMovSection2) formMovSection2.style.display = 'none';

        // Hide movimiento details
        if (movimientoDetails) {
            movimientoDetails.classList.remove('visible');
            movimientoDetails.classList.add('hidden');
        }
    }
}


// *** FUNCIONES: Mostrar Elementos Ocultos ***
function showFormsAndButtons(clickedButtonId) {
    const botonesYForms = [
        { btnId: 'btn-nuevo-arqueo', formId: 'form-arqueo' },
        { btnId: 'btn-nuevo-movimiento', formId: 'form-movimiento' },
    ];

    botonesYForms.forEach(({ btnId, formId }) => {
        const button = document.getElementById(btnId);
        const form = document.getElementById(formId);

        if (btnId === clickedButtonId) {
            if (button) {
                button.style.display = 'block';
                button.classList.remove('hidden');
            }
            // Don't auto-show forms; the button click should show them
        } else {
            if (button) {
                button.style.display = 'none';
                button.classList.add('hidden');
            }
            if (form) {
                form.style.display = 'none';
                form.classList.add('hidden');
            }
        }
    });

    // Also hide the formularios-container when switching away from arqueo
    if (clickedButtonId !== 'btn-nuevo-arqueo') {
        const formulariosContainer = document.getElementById('formularios-container');
        if (formulariosContainer) formulariosContainer.classList.add('hidden');
    }
}

// Asegurarse de que los filtros esten ocultos al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
    if (typeof hideAllFilters === 'function') {
        hideAllFilters();
    }
    const toggleBtn = document.getElementById("toggle-filters");
    if (toggleBtn) {
        toggleBtn.textContent = "Mostrar Filtros";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const btnNuevoArqueoLocal = document.getElementById("btn-nuevo-arqueo");
    const formArqueoLocal = document.getElementById("form-arqueo");
    const horaAperturaInput = document.getElementById("hora-apertura-arqueo");
    const formulariosContainer = document.getElementById("formularios-container");

    function obtenerFechaHoraActual() {
        const ahora = new Date();
        const year = ahora.getFullYear();
        const month = String(ahora.getMonth() + 1).padStart(2, '0');
        const day = String(ahora.getDate()).padStart(2, '0');
        const hours = String(ahora.getHours()).padStart(2, '0');
        const minutes = String(ahora.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function abrirFormArqueo() {
        formulariosContainer?.classList.remove("hidden");
        if (formulariosContainer) formulariosContainer.style.display = '';
        formArqueoLocal?.classList.remove("hidden");
        if (formArqueoLocal) formArqueoLocal.style.display = 'flex';
        if (horaAperturaInput) {
            horaAperturaInput.value = obtenerFechaHoraActual();
        }
    }

    btnNuevoArqueoLocal?.addEventListener("click", abrirFormArqueo);

    // Botón inline dentro de la left-column
    document.getElementById("btn-crear-arqueo-inline")?.addEventListener("click", abrirFormArqueo);

    // Placeholder to keep original flow
    void(0);
    });

    document.getElementById("cancel-arqueo")?.addEventListener("click", () => {
        formulariosContainer?.classList.add("hidden");
        formArqueoLocal?.classList.add("hidden");
        if (formArqueoLocal) formArqueoLocal.style.display = 'none';
    });
});
