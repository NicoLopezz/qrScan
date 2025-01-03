// Variables globales para los filtros

let currentFiltroIngreso = "todos"; // Para "Tipo de Ingreso"
let currentFiltroEstado = "todos"; // Para "Estado"
let currentFiltroFecha = { tipo: "hoy", desde: null, hasta: null }; // Para Fecha
let currentFiltroMedioPago = "todos"; // Para "Medio de Pago"

// Variables globales para los filtros de arqueos
let currentFiltroTipoArqueo = "todos"; // Para "Tipo de Arqueo"
let currentFiltroEstadoArqueo = "todos"; // Para "Estado"
let currentFiltroHoraApertura = { desde: null, hasta: null }; // Para "Hora de Apertura"
let currentFiltroHoraCierre = { desde: null, hasta: null }; // Para "Hora de Cierre"


// *** Evento para manejar el cambio en el filtro Tipo de Caja ***
document.getElementById("tipo-caja").addEventListener("change", function (event) {
    const selectedValue = event.target.value;

    if (selectedValue === "efectivo") {
        currentFiltroMovimiento = "efectivo";
    } else if (selectedValue === "mercado-pago") {
        currentFiltroMovimiento = "mercado-pago";
    } else {
        currentFiltroMovimiento = "todos";
    }

    console.log("Filtro Tipo de Caja cambiado a:", currentFiltroMovimiento);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Evento para manejar el cambio en el filtro Tipo de Ingreso ***
document.getElementById("tipo-ingreso").addEventListener("change", function (event) {
    currentFiltroIngreso = event.target.value;
    console.log("Filtro Tipo de Ingreso cambiado a:", currentFiltroIngreso);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Evento para manejar el cambio en el filtro Estado ***
document.getElementById("estado").addEventListener("change", function (event) {
    currentFiltroEstado = event.target.value;
    console.log("Filtro Estado cambiado a:", currentFiltroEstado);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Evento para manejar el cambio en el filtro Fecha ***
document.getElementById("filtro-fecha").addEventListener("change", function (event) {
    const selectedValue = event.target.value;

    if (selectedValue === "hoy") {
        currentFiltroFecha = { tipo: "hoy", desde: null, hasta: null };
        document.getElementById("fecha-personalizada").classList.add("hidden");
    } else if (selectedValue === "determinar") {
        currentFiltroFecha = { tipo: "determinar", desde: null, hasta: null };
        document.getElementById("fecha-personalizada").classList.remove("hidden");
    }

    console.log("Filtro Fecha cambiado a:", currentFiltroFecha);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Eventos para los inputs de Fecha Personalizada ***
document.getElementById("fecha-desde").addEventListener("change", function (event) {
    currentFiltroFecha.desde = event.target.value;
    console.log("Fecha Desde cambiada a:", currentFiltroFecha.desde);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

document.getElementById("fecha-hasta").addEventListener("change", function (event) {
    currentFiltroFecha.hasta = event.target.value;
    console.log("Fecha Hasta cambiada a:", currentFiltroFecha.hasta);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Evento para manejar el cambio en el filtro Medio de Pago ***
document.getElementById("medio-de-pago").addEventListener("change", function (event) {
    currentFiltroMedioPago = event.target.value;
    console.log("Filtro Medio de Pago cambiado a:", currentFiltroMedioPago);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Función para obtener y renderizar movimientos según el filtro ***
async function fetchMovimientos() {
    console.log("Filtros seleccionados:");
    console.log("Tipo de Caja:", currentFiltroMovimiento);
    console.log("Tipo de Ingreso:", currentFiltroIngreso);
    console.log("Estado:", currentFiltroEstado);
    console.log("Fecha:", currentFiltroFecha);
    console.log("Medio de Pago:", currentFiltroMedioPago);
    console.log("Tipo de caja activa:", cajaTipoActivo);

    try {
        // Construir la URL base
        let url = `/api/movimientosAbiertos?cajaTipo=${cajaTipoActivo}`;
        console.log("URL generada:", url);

        // Hacer la solicitud
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log("Datos obtenidos desde el backend:", data);

        if (response.ok && data.success) {
            let movimientos = data.data;

            // Aplicar filtros
            if (currentFiltroMovimiento !== "todos") {
                movimientos = movimientos.filter(mov => mov.medioPago === currentFiltroMovimiento);
                console.log("Después de filtrar por Tipo de Caja:", movimientos);
            }

            if (currentFiltroIngreso !== "todos") {
                movimientos = movimientos.filter(mov => mov.tipo === currentFiltroIngreso);
                console.log("Después de filtrar por Tipo de Ingreso:", movimientos);
            }

            if (currentFiltroEstado === "todos") {
                movimientos = movimientos.filter(mov =>
                    mov.estadoPago === "abonado" || mov.estadoPago === "no-abonado" || mov.estadoPago === "pendiente"
                );
                console.log("Después de filtrar por Estado (Todos):", movimientos);
            } else {
                movimientos = movimientos.filter(mov => mov.estadoPago === currentFiltroEstado);
                console.log("Después de filtrar por Estado Específico:", movimientos);
            }

            if (currentFiltroMedioPago !== "todos") {
                movimientos = movimientos.filter(mov => mov.medioPago === currentFiltroMedioPago);
                console.log("Después de filtrar por Medio de Pago:", movimientos);
            }

            if (currentFiltroFecha.tipo === "hoy") {
                const hoy = new Date().toISOString().split("T")[0];
                movimientos = movimientos.filter(mov => mov.fecha.startsWith(hoy));
                console.log("Después de filtrar por Fecha (Hoy):", movimientos);
            } else if (currentFiltroFecha.tipo === "determinar") {
                const { desde, hasta } = currentFiltroFecha;
                movimientos = movimientos.filter(mov => {
                    const fechaMov = new Date(mov.fecha).toISOString().split("T")[0];
                    return (!desde || fechaMov >= desde) && (!hasta || fechaMov <= hasta);
                });
                console.log("Después de filtrar por Fecha (Rango):", movimientos);
            }

            console.log("Movimientos después de aplicar todos los filtros:", movimientos);

            // Renderizar los movimientos en la tabla
            renderMovimientosTable(movimientos);
        } else {
            console.error("Error al obtener movimientos:", data.message);
            showNotification(`Error al obtener movimientos: ${data.message}`, "error");
        }
    } catch (error) {
        console.error("Error al realizar el fetch:", error);
        showNotification("Error al conectarse con el servidor.", "error");
    }
}



//FILTROS DE ARQEIOS---->


// *** Eventos para los filtros ***
document.getElementById("tipo-arqueo").addEventListener("change", (event) => {
    currentFiltroTipoArqueo = event.target.value;
    console.log("Filtro Tipo de Arqueo cambiado a:", currentFiltroTipoArqueo);
    fetchArqueosFilter();
});

document.getElementById("estado-arqueo").addEventListener("change", (event) => {
    currentFiltroEstadoArqueo = event.target.value;
    console.log("Filtro Estado cambiado a:", currentFiltroEstadoArqueo);
    fetchArqueosFilter();
});

document.getElementById("hora-apertura").addEventListener("change", (event) => {
    currentFiltroHoraApertura = event.target.value;
    console.log("Filtro Hora de Apertura cambiado a:", currentFiltroHoraApertura);
    fetchArqueosFilter();
});

document.getElementById("hora-cierre").addEventListener("change", (event) => {
    currentFiltroHoraCierre = event.target.value;
    console.log("Filtro Hora de Cierre cambiado a:", currentFiltroHoraCierre);
    fetchArqueosFilter();
});

// *** Función para obtener y filtrar arqueos según los filtros seleccionados ***
// *** FETCH: Obtener y renderizar arqueos según los filtros ***
// *** Función para obtener y filtrar arqueos según los filtros seleccionados ***
async function fetchArqueosFilter() {
    console.log("Filtros seleccionados:");
    console.log("Tipo de Arqueo:", currentFiltroTipoArqueo);
    console.log("Estado:", currentFiltroEstadoArqueo);
    console.log("Hora de Apertura:", currentFiltroHoraApertura);
    console.log("Hora de Cierre:", currentFiltroHoraCierre);

    try {
        // Obtener todos los arqueos desde el backend
        const response = await fetch(`/api/arqueos?cajaTipo=${cajaTipoActivo}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        console.log("Datos obtenidos desde el backend:", data);

        if (response.ok && data.success) {
            let arqueos = data.data;

            // Aplicar filtros
            if (currentFiltroTipoArqueo !== "todos") {
                arqueos = arqueos.filter((arq) => arq.tipo === currentFiltroTipoArqueo);
                console.log("Después de filtrar por Tipo de Arqueo:", arqueos);
            }

            if (currentFiltroEstadoArqueo !== "todos") {
                arqueos = arqueos.filter((arq) => arq.estado === currentFiltroEstadoArqueo);
                console.log("Después de filtrar por Estado:", arqueos);
            }

            if (currentFiltroHoraApertura) {
                const aperturaFiltro = new Date(currentFiltroHoraApertura).getTime();
                arqueos = arqueos.filter((arq) => {
                    const aperturaArqueo = new Date(arq.fechaApertura).getTime();
                    return aperturaArqueo >= aperturaFiltro;
                });
                console.log("Después de filtrar por Hora de Apertura:", arqueos);
            }

            if (currentFiltroHoraCierre) {
                const cierreFiltro = new Date(currentFiltroHoraCierre).getTime();
                arqueos = arqueos.filter((arq) => {
                    if (arq.fechaCierre) {
                        const cierreArqueo = new Date(arq.fechaCierre).getTime();
                        return cierreArqueo <= cierreFiltro;
                    }
                    return false; // Si no tiene fecha de cierre, lo excluye
                });
                console.log("Después de filtrar por Hora de Cierre:", arqueos);
            }

            console.log("Arqueos después de aplicar todos los filtros:", arqueos);

            // Renderizar los arqueos en la tabla
            renderArqueosTable(arqueos);
        } else {
            console.error("Error al obtener arqueos:", data.message);
            showNotification(`Error al obtener arqueos: ${data.message}`, "error");
        }
    } catch (error) {
        console.error("Error al realizar el fetch:", error);
        showNotification("Error al conectarse con el servidor.", "error");
    }
}

// *** Función para limpiar filtros ***
// *** Función para reiniciar filtros y activar opción por defecto ***
document.addEventListener("DOMContentLoaded", () => {
    const resetFiltersButton = document.getElementById("reset-filters-arqueos");
    const arqueoOption = document.getElementById("arqueo"); // Referencia al botón de "arqueo"

    if (resetFiltersButton && arqueoOption) {
        resetFiltersButton.addEventListener("click", () => {
            console.log("Reiniciando filtros y seleccionando la opción 'Arqueos'...");

            // Reiniciar valores globales de filtros
            currentFiltroTipoArqueo = "todos";
            currentFiltroEstadoArqueo = "todos";
            currentFiltroHoraApertura = { desde: null, hasta: null };
            currentFiltroHoraCierre = { desde: null, hasta: null };

            // Reiniciar los valores de los elementos de entrada visual
            const tipoArqueo = document.getElementById("tipo-arqueo");
            const estadoArqueo = document.getElementById("estado-arqueo");
            const horaApertura = document.getElementById("hora-apertura");
            const horaCierre = document.getElementById("hora-cierre");

            if (tipoArqueo) tipoArqueo.value = "todos";
            if (estadoArqueo) estadoArqueo.value = "todos";
            if (horaApertura) horaApertura.value = ""; // Vaciar el campo de fecha de apertura
            if (horaCierre) horaCierre.value = "";   // Vaciar el campo de fecha de cierre

            console.log("Filtros limpiados. Valores reiniciados a predeterminados.");

            // Simular un clic en la opción "arqueo"
            arqueoOption.click(); // Esto ejecutará toda la lógica asociada al clic de "arqueo"
        });
    } else {
        console.error("El botón 'reset-filters-arqueos' o la opción 'arqueo' no se encontró en el DOM.");
    }
});


// *** Función para reiniciar filtros de movimientos ***
document.addEventListener("DOMContentLoaded", () => {
    const resetFiltersMovimientosButton = document.getElementById("reset-filters-movimientos");

    if (resetFiltersMovimientosButton) {
        resetFiltersMovimientosButton.addEventListener("click", () => {
            console.log("Reiniciando filtros de movimientos...");

            // Reiniciar valores globales de filtros
            currentFiltroMovimiento = "todos";
            currentFiltroIngreso = "todos";
            currentFiltroEstado = "todos";
            currentFiltroMedioPago = "todos";
            currentFiltroFecha = { tipo: "hoy", desde: null, hasta: null };

            // Reiniciar los valores de los elementos de entrada visual
            const tipoCaja = document.getElementById("tipo-caja");
            const tipoIngreso = document.getElementById("tipo-ingreso");
            const medioPago = document.getElementById("medio-de-pago");
            const estado = document.getElementById("estado");
            const filtroFecha = document.getElementById("filtro-fecha");
            const fechaDesde = document.getElementById("fecha-desde");
            const fechaHasta = document.getElementById("fecha-hasta");
            const fechaPersonalizada = document.getElementById("fecha-personalizada");

            if (tipoCaja) tipoCaja.value = "todos";
            if (tipoIngreso) tipoIngreso.value = "todos";
            if (medioPago) medioPago.value = "todos";
            if (estado) estado.value = "todos";
            if (filtroFecha) filtroFecha.value = "hoy";
            if (fechaDesde) fechaDesde.value = ""; // Vaciar el campo de fecha desde
            if (fechaHasta) fechaHasta.value = ""; // Vaciar el campo de fecha hasta
            if (fechaPersonalizada) fechaPersonalizada.classList.add("hidden"); // Ocultar rango personalizado

            console.log("Filtros de movimientos limpiados. Valores reiniciados a predeterminados.");

            // Ejecutar fetchMovimientos para mostrar todos los movimientos
            fetchMovimientos();
        });
    } else {
        console.error("El botón 'reset-filters-movimientos' no se encontró en el DOM.");
    }
});



// Evento para manejar el clic en el botón de limpiar filtros
document.getElementById("clear-filters").addEventListener("click", clearFilters);
