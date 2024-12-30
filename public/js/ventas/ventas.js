// Elementos DOM
const tabs = document.querySelectorAll('.tab');
const options = document.querySelectorAll('.option');
const tables = document.querySelectorAll('.data-table');
const actionButton = document.getElementById('action-button'); // Botón dinámico

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

// Seleccionar elementos
const btnNuevoArqueo = document.getElementById('btn-nuevo-arqueo');
const btnNuevoMovimiento = document.getElementById('btn-nuevo-movimiento');
const btnNuevaVenta = document.getElementById('btn-nueva-venta');

// Función para actualizar botones según la opción seleccionada
function actualizarBotones(opcionSeleccionada) {
    // Ocultar todos los botones
    btnNuevoArqueo.classList.add('hidden');
    btnNuevoMovimiento.classList.add('hidden');
    btnNuevaVenta.classList.add('hidden');

    // Mostrar el botón correspondiente
    if (opcionSeleccionada === 'arqueo') {
        btnNuevoArqueo.classList.remove('hidden');
    } else if (opcionSeleccionada === 'movimientos') {
        btnNuevoMovimiento.classList.remove('hidden');
    } else if (opcionSeleccionada === 'ventas') {
        btnNuevaVenta.classList.remove('hidden');
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



// *** EVENTOS: Opciones de Movimientos, Ventas, Arqueos ***
document.querySelectorAll('.option').forEach((option) => {
    option.addEventListener('click', (event) => {
        const selectedOption = event.target.id; // 'movimientos', 'ventas', 'arqueo'

        if (selectedOption === 'movimientos') {
            showFormsAndButtons('btn-nuevo-movimiento'); // Mostrar solo el botón y formulario de movimientos
            document.querySelector('.details-section').style.display = 'none';
            document.getElementById('details').style.display = 'none';

            fetchMovimientos(cajaTipoActivo); // Mostrar movimientos
        } else if (selectedOption === 'arqueo') {
            showFormsAndButtons('btn-nuevo-arqueo'); // Mostrar solo el botón y formulario de arqueo
            document.querySelector('.details-section').style.display = 'none';
            document.getElementById('details').style.display = 'none';
            fetchArqueos(cajaTipoActivo); // Mostrar arqueos
        } else if (selectedOption === 'ventas') {
            showFormsAndButtons('btn-nueva-venta'); // Mostrar solo el botón y formulario de ventas
            document.querySelector('.details-section').style.display = 'none';
            document.getElementById('details').style.display = 'none';
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
        { btnId: 'btn-nueva-venta', formId: 'form-venta' },
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

        options.forEach((o) => o.classList.remove('active'));
        option.classList.add('active');

        tables.forEach((table) => table.classList.add('hidden'));
        if (option.id === 'ventas') {
            document.getElementById('table-ventas').classList.remove('hidden');
        } else if (option.id === 'movimientos') {
            document.getElementById('table-movimientos').classList.remove('hidden');
        } else if (option.id === 'arqueo') {
            document.getElementById('table-arqueo').classList.remove('hidden');
        }

        // Actualizar el botón dinámico
        // updateActionButton(option.id);
    });
});



// Obtén la referencia al formulario de arqueo
const formArqueo = document.getElementById("form-arqueo");




// CREAR ARQUEO NUEVO
// Evento para manejar el envío del formulario
formArqueo.addEventListener("submit", async (event) => {
    event.preventDefault(); // Previene el envío tradicional del formulario

    // Obtén los valores de los campos del formulario
    const horaApertura = document.getElementById("hora-apertura").value;
    const saldoInicial = parseFloat(document.getElementById("monto-inicial").value); // Renombrado como saldoInicial
    const cajaTipo = document.querySelector(".tab.active").id === "caja-mayor" ? "CajaMayor" : "CajaChica";

    // Nuevo campo: tipoArqueo
    const tipoArqueo = document.getElementById("tipo-arqueo").value;
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



