// Elementos DOM
const tabs = document.querySelectorAll('.tab');
const options = document.querySelectorAll('.option');
const tables = document.querySelectorAll('.data-table');
const horaApertura = document.getElementById("hora-apertura-arqueo");
const actionButton = document.getElementById('action-button');
// Seleccionar elementos
const btnNuevoArqueo = document.getElementById('btn-nuevo-arqueo');
const btnNuevoMovimiento = document.getElementById('btn-nuevo-movimiento');
// Obtén la referencia al formulario de arqueo
const formArqueo = document.getElementById("form-arqueo");

document.addEventListener("DOMContentLoaded", () => {
    if (horaApertura) {
        horaApertura.addEventListener("change", (event) => {
        });
    } else {
        console.error("El campo hora-apertura-arqueo no se encontró en el DOM.");
    }

    if (formArqueo) {
        formArqueo.addEventListener("submit", async (event) => {
            event.preventDefault();
            const horaAperturaValue = horaApertura.value;
        });
    } else {
        console.error("El formulario form-arqueo no se encontró en el DOM.");
    }
});

// CREAR ARQUEO NUEVO
formArqueo.addEventListener("submit", async (event) => {
    event.preventDefault(); // Previene el envío tradicional del formulario

    // Obtén los valores de los campos del formulario
    const horaApertura = document.getElementById("hora-apertura-arqueo").value;
    const saldoInicial = parseFloat(document.getElementById("monto-inicial").value); // Renombrado como saldoInicial
    const cajaTipo = document.querySelector(".tab.active").id === "caja-mayor" ? "CajaMayor" : "CajaChica";

    // Nuevo campo: tipoArqueo
    const tipoArqueo = document.getElementById("tipo-arqueo-nuevo").value;

    // Valida los campos
    if (!horaApertura || isNaN(saldoInicial) || !tipoArqueo) {
        showNotification("Por favor, complete todos los campos requeridos.", "error");
        return;
    }



    try {
        // Realiza el POST al backend
        const response = await fetch("/api/arqueos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                horaApertura,
                saldoInicial, // Aquí lo renombramos correctamente
                cajaTipo,
                tipoArqueo // Incluye el nuevo campo
            })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            fetchArqueos(cajaTipoActivo); // Mostrar arqueos
            showNotification("Arqueo iniciado con éxito.");
            // Limpia los campos del formulario después de enviar
            formArqueo.reset();
        } else {
            showNotification(`Error al iniciar el arqueo: ${data.error || "Error desconocido"}`, "error");
        }
    } catch (error) {
        console.error("Error al enviar el formulario de arqueo:", error);
        showNotification("Error al conectarse con el servidor.", "error");
    }
});



// Función para manejar Tabs (Caja Mayor / Menor)
tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.id === 'caja-mayor') {
            document.getElementById('ventas').classList.add('disabled');
            document.getElementById('ventas').classList.remove('active');
            //   updateActionButton('arqueo'); // Por defecto al cambiar a Caja Mayor
        } else {
            document.getElementById('ventas').classList.remove('disabled');
        }

        // Restablecer opción por defecto
        options.forEach((o) => o.classList.remove('active'));
        document.getElementById('movimientos').classList.add('active');
        tables.forEach((table) => table.classList.add('hidden'));
        document.getElementById('table-movimientos').classList.remove('hidden');
        // updateActionButton('movimientos');
    });
});


// Función para actualizar botones según la opción seleccionada
function actualizarBotones(opcionSeleccionada) {
    // Ocultar todos los botones
    btnNuevoArqueo.classList.add('hidden');
    btnNuevoMovimiento.classList.add('hidden');
    // btnNuevaVenta.classList.add('hidden');

    // Mostrar el botón correspondiente
    if (opcionSeleccionada === 'arqueo') {
        btnNuevoArqueo.classList.remove('hidden');
    } else if (opcionSeleccionada === 'movimientos') {
        btnNuevoMovimiento.classList.remove('hidden');
    }
}

// Manejar clics en las opciones (Ventas, Movimientos, Arqueo)
options.forEach((option) => {
    option.addEventListener('click', () => {
        if (option.classList.contains('disabled')) return;
        // Actualizar botones dinámicos
        actualizarBotones(option.id);
    });
});

// Evento para alternar entre opciones dinámicamente
options.forEach((option) => {
    option.addEventListener("click", () => {
        options.forEach((o) => o.classList.remove("active")); // Quitar clase active de todas las opciones
        option.classList.add("active"); // Agregar clase active a la opción seleccionada
        updateActiveFilters(); // Actualizar dinámicamente el filtro visible
    });
});


// Asegurarse de que los filtros estén ocultos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    hideAllFilters(); // Ocultar todos los filtros al cargar
    toggleFiltersButton.textContent = "Mostrar Filtros"; // Texto inicial del botón");
});

// *** EVENTOS: Opciones de Movimientos, Ventas, Arqueos ***
document.querySelectorAll('.option').forEach((option) => {
    option.addEventListener('click', (event) => {
        const selectedOption = event.target.id; // 'movimientos', 'ventas', 'arqueo'

        // Obtener referencias a los elementos necesarios
        const movimientoDetails = document.getElementById('movimiento-details');
        const detailsSection = document.querySelector('.details-section');
        const details = document.getElementById('details');

        if (selectedOption === 'movimientos') {
            showFormsAndButtons('btn-nuevo-movimiento'); // Mostrar botón y formulario de movimientos
            detailsSection.style.display = 'none';
            details.style.display = 'none';

            // Mostrar el detalle de movimiento
            movimientoDetails.classList.add('visible');
            fetchMovimientos(cajaTipoActivo); // Mostrar movimientos
        } else if (selectedOption === 'arqueo') {
            showFormsAndButtons('btn-nuevo-arqueo'); // Mostrar botón y formulario de arqueos
            detailsSection.style.display = 'none';
            details.style.display = 'none';
            fetchArqueosFilter(); // Ejecutar la función de filtros para 
            // fetchArqueos(cajaTipoActivo); // Mostrar arqueos
        } else if (selectedOption === 'ventas') {
            showFormsAndButtons('btn-nueva-venta'); // Mostrar botón y formulario de ventas
            detailsSection.style.display = 'none';
            details.style.display = 'none';

            // Ocultar el detalle de movimiento
            movimientoDetails.classList.remove('visible');
            // Lógica para ventas, si la necesitas
        }
    });
});


// *** FUNCIONES: Mostrar Elementos Ocultos ***
function showFormsAndButtons(clickedButtonId) {
    // Asociar botones y formularios
    const botonesYForms = [
        { btnId: 'btn-nuevo-arqueo', formId: 'form-arqueo' },
        { btnId: 'btn-nuevo-movimiento', formId: 'form-movimiento' },
        // { btnId: 'btn-nueva-venta', formId: 'form-venta' },
    ];

    // Iterar sobre la lista de botones y formularios
    botonesYForms.forEach(({ btnId, formId }) => {
        const button = document.getElementById(btnId);
        const form = document.getElementById(formId);

        if (btnId === clickedButtonId) {
            // Mostrar el botón y formulario asociados al botón clicado
            button.style.display = 'block';
            button.classList.remove('hidden');
            form.style.display = 'flex';
            form.classList.remove('hidden');
        } else {
            // Ocultar los demás botones y formularios
            button.style.display = 'none';
            button.classList.add('hidden');
            form.style.display = 'none';
            form.classList.add('hidden');
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const btnNuevoArqueo = document.getElementById("btn-nuevo-arqueo");
    const formArqueo = document.getElementById("form-arqueo");
    const horaAperturaInput = document.getElementById("hora-apertura");
    const formulariosContainer = document.getElementById("formularios-container");

    // Función para obtener la fecha y hora actual en formato 'YYYY-MM-DDTHH:MM'
    function obtenerFechaHoraActual() {
        const ahora = new Date();
        const year = ahora.getFullYear();
        const month = String(ahora.getMonth() + 1).padStart(2, '0');
        const day = String(ahora.getDate()).padStart(2, '0');
        const hours = String(ahora.getHours()).padStart(2, '0');
        const minutes = String(ahora.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Mostrar formulario con hora por defecto
    btnNuevoArqueo.addEventListener("click", () => {
        formulariosContainer.classList.remove("hidden");
        formArqueo.classList.remove("hidden");
        horaAperturaInput.value = obtenerFechaHoraActual(); // Establece la hora actual
    });

    // Evento para cerrar el formulario
    document.getElementById("cancel-arqueo").addEventListener("click", () => {
        formulariosContainer.classList.add("hidden");
        formArqueo.classList.add("hidden");
    });
});

// Función para manejar Opciones (Ventas, Movimientos, Arqueo)
options.forEach((option) => {
    option.addEventListener('click', () => {
        if (option.classList.contains('disabled')) return;

        // Activar la opción seleccionada
        options.forEach((o) => o.classList.remove('active'));
        option.classList.add('active');

        // Mostrar/Ocultar tablas según la opción seleccionada
        tables.forEach((table) => table.classList.add('hidden'));

        // Obtener el elemento movimiento-details
        const movimientoDetails = document.getElementById('movimiento-details');
        // const agregarLavado = document.getElementById('form-lavado');
        

        // Mostrar/Ocultar según la opción seleccionada
        if (option.id === 'ventas') {
            document.getElementById('table-ventas').classList.remove('hidden');
            document.getElementById('form-lavado').classList.remove('hidden');
            if (movimientoDetails) movimientoDetails.classList.add('hidden');
        } else if (option.id === 'movimientos') {
            document.getElementById('table-movimientos').classList.remove('hidden');
            document.getElementById('form-lavado').classList.add('hidden');
            document.getElementById('table-arqueo').classList.add('hidden');
            if (movimientoDetails) movimientoDetails.classList.remove('hidden');
        } else if (option.id === 'arqueo') {
            document.getElementById('table-arqueo').classList.remove('visible');
            document.getElementById('form-lavado').classList.add('hidden');
            if (movimientoDetails) movimientoDetails.classList.remove('visible');
            if (movimientoDetails) movimientoDetails.classList.add('hidden');
        } else {
            // Por si se selecciona otra opción no contemplada
            if (movimientoDetails) movimientoDetails.classList.add('hidden');
        }
    });
});

























