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



// Seleccionar el botón de la solapa, contenedores de filtros y opciones
const toggleFiltersButton = document.getElementById("toggle-filters");
const filtersMovs = document.getElementById("filtersMovs");
const filtersArqueos = document.getElementById("filtersArqueos");

// Función para ocultar todos los filtros
function hideAllFilters() {
    filtersMovs.classList.add("hidden");
    filtersArqueos.classList.add("hidden");
    filtersLavados.classList.add("hidden");
}

// Función para identificar y mostrar dinámicamente el filtro activo
function updateActiveFilters() {
    const activeOption = document.querySelector(".option.active"); // Identificar opción activa
    const currentText = toggleFiltersButton.textContent.trim();

    if (currentText === "Ocultar Filtros") {
        // Mostrar dinámicamente el filtro correspondiente
        if (activeOption.id === "movimientos") {
            filtersMovs.classList.remove("hidden");
            filtersArqueos.classList.add("hidden");
            filtersLavados?.classList.add("hidden");
            console.log("Mostrando filtros de Movimientos.");
        } else if (activeOption.id === "arqueo") {
            filtersArqueos.classList.remove("hidden");
            filtersMovs.classList.add("hidden");
            filtersLavados?.classList.add("hidden");
            console.log("Mostrando filtros de Arqueos.");
        } else if (activeOption.id === "ventas") {
            filtersLavados.classList.remove("hidden");
            filtersMovs.classList.add("hidden");
            filtersArqueos.classList.add("hidden");
            console.log("Mostrando filtros de Ventas.");
        }
    } else {
        // Si el botón está en "Mostrar Filtros", asegurarse de que todo esté oculto
        hideAllFilters();
    }
}



// Manejar el clic en el botón de la solapa
toggleFiltersButton.addEventListener("click", () => {
    const currentText = toggleFiltersButton.textContent.trim();

    if (currentText === "Mostrar Filtros") {
        toggleFiltersButton.textContent = "Ocultar Filtros";
        updateActiveFilters(); // Mostrar el filtro activo según la opción activa
    } else {
        toggleFiltersButton.textContent = "Mostrar Filtros";
        hideAllFilters(); // Ocultar todos los filtros
        console.log("Ocultando todos los filtros.");
    }
});


// // *** Evento para manejar el cambio en el filtro Tipo de Caja ***
// document.getElementById("tipo-arqueo-movimiento").addEventListener("change", function (event) {
//     const selectedValue = event.target.value;

//     if (selectedValue === "abierto") {
//         currentFiltroMovimiento = "abierto";
//     } else if (selectedValue === "cerrado") {
//         currentFiltroMovimiento = "cerrado";
//     } else {
//         currentFiltroMovimiento = "abierto";
//     }
//     console.log("CAMBIO DE TIPO DE ARQUEO:", currentFiltroMovimiento);
//     fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
// });

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
    console.log("Movimientos en Arqueos estado: ", currentFiltroMovimiento);
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
            console.log(currentFiltroMovimiento + "12312313-------MOSTRNADO LA FUNCION DE if (currentFiltroMovimiento)")
            if (currentFiltroMovimiento !== "todos") {
                console.log("MOSTRNADO LA FUNCION DE if (currentFiltroMovimiento)")
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
            // Renderizar los movimientos en la tabla
            renderMovimientosTable(movimientos);
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
            currentFiltroMovimiento = "abiertos";
            currentFiltroIngreso = "todos";
            currentFiltroEstado = "todos";
            currentFiltroMedioPago = "todos";
            currentFiltroFecha = { tipo: "hoy", desde: null, hasta: null };

            // Reiniciar los valores de los elementos de entrada visual
            const tipoCaja = document.getElementById("tipo-arqueo-movimiento");
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







//FILTROS DE LAVADOS----->
// Variables globales para filtros de Lavados
let filtroPatenteLavados = "";
let filtroEmpresaLavados = "";
let filtroEstadoLavados = "todos";
let filtroFechaLavados = { tipo: "hoy", desde: null, hasta: null };

let tbodyVentas = document.querySelector("#table-ventas tbody");

// *** Evento para manejar el filtro de Patente (en vivo) ***
document.getElementById("patente-lavados").addEventListener("input", function (event) {
    filtroPatenteLavados = event.target.value.toLowerCase().trim();
    console.log("Filtro Patente cambiado a:", filtroPatenteLavados);
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

// *** Evento para manejar el filtro de Empresa (en vivo) ***
document.getElementById("empresa-lavados").addEventListener("input", function (event) {
    filtroEmpresaLavados = event.target.value.toLowerCase().trim();
    console.log("Filtro Empresa cambiado a:", filtroEmpresaLavados);
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});




// *** Evento para manejar el cambio en el filtro Estado ***
document.getElementById("estado-lavados").addEventListener("change", function (event) {
    filtroEstadoLavados = event.target.value;
    console.log("Filtro Estado cambiado a:", filtroEstadoLavados);
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

// *** Evento para manejar el cambio en el filtro Fecha ***
document.getElementById("filtro-fecha-lavados").addEventListener("change", function (event) {
    const selectedValue = event.target.value;

    if (selectedValue === "hoy") {
        filtroFechaLavados = { tipo: "hoy", desde: null, hasta: null };
        document.getElementById("fecha-personalizada-lavados").classList.add("hidden");
    } else if (selectedValue === "determinar") {
        filtroFechaLavados = { tipo: "determinar", desde: null, hasta: null };
        document.getElementById("fecha-personalizada-lavados").classList.remove("hidden");
    }

    console.log("Filtro Fecha cambiado a:", filtroFechaLavados);
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

// *** Eventos para los inputs de Fecha Personalizada ***
document.getElementById("fecha-desde-lavados").addEventListener("change", function (event) {
    filtroFechaLavados.desde = event.target.value;
    console.log("Fecha Desde cambiada a:", filtroFechaLavados.desde);
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

document.getElementById("fecha-hasta-lavados").addEventListener("change", function (event) {
    filtroFechaLavados.hasta = event.target.value;
    console.log("Fecha Hasta cambiada a:", filtroFechaLavados.hasta);
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

// *** Función para cargar lavados desde la base de datos con filtros ***
async function cargarLavadosConFiltros() {
    const adminId = getCookie('adminId'); // Obtén el adminId de la cookie

    try {
        const response = await fetch(`/api/admins/${adminId}/lavados`);
        if (!response.ok) throw new Error("No se pudo cargar los lavaderos");

        const data = await response.json();
        console.log("Respuesta del servidor:", data); // Verifica los datos recibidos
        let lavados = data;

        if (!lavados.length) {
            console.warn("No se encontraron lavaderos asociados al administrador.");
            limpiarTablaLavados(); // Limpia la tabla si no hay resultados
            return;
        }

        // Ordenar los lavados por fechaDeAlta (más reciente primero)
        lavados.sort((a, b) => new Date(b.fechaDeAlta).getTime() - new Date(a.fechaDeAlta).getTime());

        // Aplicar filtros
        lavados = aplicarFiltrosLavados(lavados);

        // Actualizar la tabla
        actualizarTabla(lavados, tbodyVentas);
    } catch (error) {
        console.error("Error al cargar lavaderos:", error);
    }
}

// // Función para aplicar filtros a los lavados
function aplicarFiltrosLavados(lavados) {
    console.log("Aplicando filtros:");
    console.log("Patente:", filtroPatenteLavados);
    console.log("Estado:", filtroEstadoLavados);
    console.log("Fecha:", filtroFechaLavados);
    console.log("Empresa:", filtroEmpresaLavados);

    // Filtrar por patente
    if (filtroPatenteLavados) {
        lavados = lavados.filter((lavado) =>
            lavado.patente && lavado.patente.toLowerCase().includes(filtroPatenteLavados)
        );
        console.log("Después de filtrar por Patente:", lavados);
    }

    // Filtrar por estado
    if (filtroEstadoLavados !== "todos") {
        lavados = lavados.filter((lavado) => lavado.estado === filtroEstadoLavados);
        console.log("Después de filtrar por Estado:", lavados);
    }

    // Filtrar por fecha
    if (filtroFechaLavados.tipo === "hoy") {
        const hoy = new Date().toISOString().split("T")[0];
        lavados = lavados.filter((lavado) => lavado.fechaDeAlta.startsWith(hoy));
        console.log("Después de filtrar por Fecha (Hoy):", lavados);
    } else if (filtroFechaLavados.tipo === "determinar") {
        const { desde, hasta } = filtroFechaLavados;
        lavados = lavados.filter((lavado) => {
            const fechaLavado = new Date(lavado.fechaDeAlta).toISOString().split("T")[0];
            return (!desde || fechaLavado >= desde) && (!hasta || fechaLavado <= hasta);
        });
        console.log("Después de filtrar por Fecha (Rango):", lavados);
    }

    // Filtrar por empresa
    if (filtroEmpresaLavados) {
        lavados = lavados.filter((lavado) =>
            lavado.empresa && lavado.empresa.toLowerCase().includes(filtroEmpresaLavados)
        );
        console.log("Después de filtrar por Empresa:", lavados);
    }

    console.log("Lavados después de aplicar filtros:", lavados);
    return lavados;
}


// // Función para limpiar la tabla de lavados
function limpiarTablaLavados() {
    const tableBody = document.querySelector("#table-ventas tbody");
    if (!tableBody) {
        console.error("El tbody de la tabla no existe en el DOM.");
        return;
    }
    tableBody.innerHTML = ""; // Limpia la tabla
}

function actualizarTabla(lavados, tbody) {
    if (!tbody) {
        console.error("El tbody de la tabla no existe en el DOM.");
        return;
    }

    // Limpia la tabla antes de agregar las filas
    tbody.innerHTML = "";

    // Verifica si hay datos para mostrar
    if (!lavados.length) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="6" class="no-data">No se encontraron resultados.</td>`;
        tbody.appendChild(fila);
        return;
    }

    // Iterar sobre los lavados filtrados y agregarlos a la tabla
    lavados.forEach((lavado) => {
        agregarFilaTabla(lavado, tbody);
    });
}

function agregarFilaTabla(lavado, tbody) {
    if (!tbody) {
        console.error("El tbody de la tabla no existe en el DOM.");
        return;
    }

    const fila = document.createElement("tr");

    // Determina las columnas de la tabla según el tbody
    if (tbody === tbodyVentas) {
        // Para la tabla de ventas
        fila.innerHTML = `
            <td>${lavado.nombre || "---"}</td>
            <td>${lavado.patente || "---"}</td>
            <td>${lavado.empresa || "---"}</td>
            <td>${lavado.fechaDeAlta ? new Date(lavado.fechaDeAlta).toLocaleDateString() : "---"}</td>
            <td>${lavado.medioDePago || "---"}</td>
            <td>${lavado.estado || "---"}</td>
        `;
    } else {
        // Para otras tablas (por ejemplo, tabla de lavados)
        fila.innerHTML = `
            <td>${lavado.nombre || "---"}</td>
            <td>${lavado.modelo || "---"}</td>
            <td>${lavado.patente || "---"}</td>
            <td>${lavado.lavado || "---"}</td>
            <td>${lavado.observacion || "---"}</td>
        `;
    }

    tbody.appendChild(fila);
}


actualizarTabla(ventas, tbodyVentas);


// // *** Función para limpiar los filtros de Lavados ***
document.getElementById("reset-filters-lavados").addEventListener("click", function () {
    console.log("Reiniciando filtros de Lavados...");

    // Reiniciar valores globales
    filtroPatenteLavados = "";
    filtroEstadoLavados = "todos";
    filtroFechaLavados = { tipo: "hoy", desde: null, hasta: null };

    // Reiniciar los valores visuales
    document.getElementById("patente-lavados").value = "";
    document.getElementById("estado-lavados").value = "todos";
    document.getElementById("filtro-fecha-lavados").value = "hoy";
    document.getElementById("fecha-desde-lavados").value = "";
    document.getElementById("fecha-hasta-lavados").value = "";
    document.getElementById("fecha-personalizada-lavados").classList.add("hidden");

    console.log("Filtros de Lavados reiniciados.");
    cargarLavadosConFiltros(); // Cargar los datos nuevamente sin filtros
});
