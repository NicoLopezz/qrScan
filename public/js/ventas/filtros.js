// Variables globales para los filtros

let currentFiltroIngreso = "todos"; // Para "Tipo de Ingreso"
let currentFiltroEstado = "todos"; // Para "Estado"
let currentFiltroFecha = { tipo: "hoy", desde: null, hasta: null }; // Para Fecha
let currentFiltroMedioPago = "todos"; // Para "Medio de Pago"





// Seleccionar el botón de la solapa, contenedores   de filtros y opciones
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
            
        } else if (activeOption.id === "arqueo") {
            filtersArqueos.classList.remove("hidden");
            filtersMovs.classList.add("hidden");
            filtersLavados?.classList.add("hidden");
            
        } else if (activeOption.id === "ventas") {
            filtersLavados.classList.remove("hidden");
            filtersMovs.classList.add("hidden");
            filtersArqueos.classList.add("hidden");
        
        }
    } else {
        hideAllFilters();
    }
}

// Manejar el clic en el botón de la solapa
toggleFiltersButton.addEventListener("click", () => {
    const currentText = toggleFiltersButton.textContent.trim();
    const tableBody = document.querySelector("#table-movimientos tbody"); // Seleccionar correctamente el tbody
    const tableArqueo = document.querySelector("#table-arqueo tbody"); // Seleccionar correctamente el tbody
    const tableVentas = document.querySelector("#table-ventas tbody"); // Seleccionar correctamente el tbody

    if (currentText === "Mostrar Filtros") {
        toggleFiltersButton.textContent = "Ocultar Filtros";
        tableBody.classList.add("filters-visible"); // Agregar clase
        tableArqueo.classList.add("filters-visible"); // Agregar clase
        tableVentas.classList.add("filters-visible"); // Agregar clase
        updateActiveFilters(); // Mostrar el filtro activo según la opción activa
    } else {
        toggleFiltersButton.textContent = "Mostrar Filtros";
        tableBody.classList.remove("filters-visible"); // Quitar clase
        tableArqueo.classList.remove("filters-visible"); // Agregar clase
        tableVentas.classList.remove("filters-visible"); // Agregar clase
        hideAllFilters(); // Ocultar todos los filtros
    }
});




// *** Evento para manejar el cambio en el filtro Tipo de Ingreso ***
document.getElementById("tipo-ingreso").addEventListener("change", function (event) {
    currentFiltroIngreso = event.target.value;
    
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Evento para manejar el cambio en el filtro Estado ***
document.getElementById("estado").addEventListener("change", function (event) {
    currentFiltroEstado = event.target.value;
    
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
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Eventos para los inputs de Fecha Personalizada ***
document.getElementById("fecha-desde").addEventListener("change", function (event) {
    currentFiltroFecha.desde = event.target.value;
    
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

document.getElementById("fecha-hasta").addEventListener("change", function (event) {
    currentFiltroFecha.hasta = event.target.value;
    
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Evento para manejar el cambio en el filtro Medio de Pago ***
document.getElementById("medio-de-pago").addEventListener("change", function (event) {
    currentFiltroMedioPago = event.target.value;
    
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});

// *** Función para obtener y renderizar movimientos según el filtro ***
async function fetchMovimientos() {
    try {
        // Construir la URL base
        let url = `/api/movimientosAbiertos?cajaTipo=${cajaTipoActivo}`;
        

        // Hacer la solicitud
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        

        if (response.ok && data.success) {
            let movimientos = data.data;

            // Aplicar filtros
            
            if (currentFiltroMovimiento !== "todos") {
                
                movimientos = movimientos.filter(mov => mov.medioPago === currentFiltroMovimiento);
                
            }

            if (currentFiltroIngreso !== "todos") {
                movimientos = movimientos.filter(mov => mov.tipo === currentFiltroIngreso);
                
            }

            if (currentFiltroEstado === "todos") {
                movimientos = movimientos.filter(mov =>
                    mov.estadoPago === "abonado" || mov.estadoPago === "no-abonado" || mov.estadoPago === "pendiente"
                );
                ;
            } else {
                movimientos = movimientos.filter(mov => mov.estadoPago === currentFiltroEstado);
                
            }

            if (currentFiltroMedioPago !== "todos") {
                movimientos = movimientos.filter(mov => mov.medioPago === currentFiltroMedioPago);
                
            }

            if (currentFiltroFecha.tipo === "hoy") {
                const hoy = new Date().toISOString().split("T")[0];
                movimientos = movimientos.filter(mov => mov.fecha.startsWith(hoy));
                
            } else if (currentFiltroFecha.tipo === "determinar") {
                const { desde, hasta } = currentFiltroFecha;
                movimientos = movimientos.filter(mov => {
                    const fechaMov = new Date(mov.fecha).toISOString().split("T")[0];
                    return (!desde || fechaMov >= desde) && (!hasta || fechaMov <= hasta);
                });
                
            }

            
            // Renderizar los movimientos en la tabla
            renderMovimientosTable(movimientos);
        } else {
            // console.error("Error al obtener movimientos:", data.message);
            // showNotification(`Error al obtener movimientos: ${data.message}`, "error");
            // Renderizar los movimientos en la tabla
            renderMovimientosTable(movimientos);
        }
    } catch (error) {
        console.error("Error al realizar el fetch:", error);
        showNotification("Error al conectarse con el servidor.", "error");
    }
}



// FILTROS DE ARQUEOS---->
// Variables globales para los filtros de arqueos
let currentFiltroTipoArqueo = "todos"; // Para "Tipo de Arqueo"
let currentFiltroEstadoArqueo = "todos"; // Para "Estado"

// Establecer el filtro de hora de apertura por defecto (inicio del día de hoy)
let currentFiltroHoraApertura = { desde: null, hasta: null };
const hoy = new Date();
const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
currentFiltroHoraApertura.desde = inicioDia.toISOString();

// Convertir a la hora local para mostrar correctamente en el input
const offset = inicioDia.getTimezoneOffset() * 60000; // Obtener el desfase en milisegundos
const localInicioDia = new Date(inicioDia.getTime() - offset);

// Mostrar el valor predeterminado en el input de fecha para la hora de apertura
const inputHoraApertura = document.getElementById("hora-apertura");
if (inputHoraApertura) {
    inputHoraApertura.value = localInicioDia.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
}

let currentFiltroHoraCierre = { desde: null, hasta: null }; // Para "Hora de Cierre"




// Detectar cambios en el filtro de Hora de Apertura
document.getElementById("hora-apertura").addEventListener("change", (event) => {
    currentFiltroHoraApertura.desde = event.target.value
        ? new Date(event.target.value).toISOString()
        : null;
    
    fetchArqueosFilter();
});

// Detectar cambios en el filtro de Hora de Cierre
document.getElementById("hora-cierre").addEventListener("change", (event) => {
    currentFiltroHoraCierre.desde = event.target.value
        ? new Date(event.target.value).toISOString()
        : null;
    
    fetchArqueosFilter();
});

// Detectar cambios en el filtro de Tipo de Arqueo
document.getElementById("tipo-arqueo").addEventListener("change", (event) => {
    currentFiltroTipoArqueo = event.target.value;
    
    fetchArqueosFilter();
});

// Detectar cambios en el filtro de Estado
document.getElementById("estado-arqueo").addEventListener("change", (event) => {
    currentFiltroEstadoArqueo = event.target.value;
    
    fetchArqueosFilter();
});

// *** Función para obtener y filtrar arqueos según los filtros seleccionados ***
async function fetchArqueosFilter() {
    
    
    
    
    

    try {
        // Obtener todos los arqueos desde el backend
        const response = await fetch(`/api/arqueos?cajaTipo=${cajaTipoActivo}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        

        if (response.ok && data.success) {
            let arqueos = data.data;

            // Filtrar por Tipo de Arqueo
            if (currentFiltroTipoArqueo !== "todos") {
                arqueos = arqueos.filter((arq) => arq.tipo === currentFiltroTipoArqueo);
                
                renderArqueosTable(arqueos);
            }

            // Filtrar por Estado
            if (currentFiltroEstadoArqueo !== "todos") {
                arqueos = arqueos.filter((arq) => arq.estado === currentFiltroEstadoArqueo);
                
                renderArqueosTable(arqueos);
            }

            // Filtrar por Hora de Apertura
            if (currentFiltroHoraApertura.desde) {
                arqueos = arqueos.filter((arq) => {
                    const aperturaArqueo = new Date(arq.fechaApertura).getTime();
                    const desdeValido = aperturaArqueo >= new Date(currentFiltroHoraApertura.desde).getTime();
                    return desdeValido;
                });
                
                renderArqueosTable(arqueos);
            }

            // Filtrar por Hora de Cierre
            if (currentFiltroHoraCierre.desde || currentFiltroHoraCierre.hasta) {
                arqueos = arqueos.filter((arq) => {
                    const cierreArqueo = arq.fechaCierre ? new Date(arq.fechaCierre).getTime() : null;
                    const desdeValido = currentFiltroHoraCierre.desde
                        ? cierreArqueo && cierreArqueo >= new Date(currentFiltroHoraCierre.desde).getTime()
                        : true;
                    const hastaValido = currentFiltroHoraCierre.hasta
                        ? cierreArqueo && cierreArqueo <= new Date(currentFiltroHoraCierre.hasta).getTime()
                        : true;
                    return desdeValido && hastaValido;
                });
                
                renderArqueosTable(arqueos);
            }
            
            // renderArqueosTable(arqueos);
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
let filtroFechaLavados = { tipo: "hoy", desde: null, hasta: null }; // Por defecto: "hoy"
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

    
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

// *** Eventos para los inputs de Fecha Personalizada ***
document.getElementById("fecha-desde-lavados").addEventListener("change", function (event) {
    filtroFechaLavados.desde = event.target.value;
    
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

document.getElementById("fecha-hasta-lavados").addEventListener("change", function (event) {
    filtroFechaLavados.hasta = event.target.value;
    
    cargarLavadosConFiltros(); // Ejecutar al cambiar el filtro
});

// *** Función para cargar lavados desde la base de datos con filtros ***
async function cargarLavadosConFiltros() {
    const adminId = getCookie('adminId'); // Obtén el adminId de la cookie

    try {
        const response = await fetch(`/api/admins/${adminId}/lavados`);
        if (!response.ok) throw new Error("No se pudo cargar los lavados");

        const data = await response.json();
        let lavados = data;

        if (!lavados.length) {
            console.warn("No se encontraron lavados asociados al administrador.");
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
        console.error("Error al cargar lavados:", error);
    }
}


// // Función para aplicar filtros a los lavados
function aplicarFiltrosLavados(lavados) {
    

    // Filtrar por patente
    if (filtroPatenteLavados) {
        lavados = lavados.filter((lavado) =>
            lavado.patente && lavado.patente.toLowerCase().includes(filtroPatenteLavados)
        );
        
    }

    // Filtrar por estado
    if (filtroEstadoLavados !== "todos") {
        lavados = lavados.filter((lavado) => lavado.estado === filtroEstadoLavados);
        
    }

    // Filtrar por fecha
    if (filtroFechaLavados.tipo === "hoy") {
        const hoy = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
        lavados = lavados.filter((lavado) => lavado.fechaDeAlta.startsWith(hoy));
    } else if (filtroFechaLavados.tipo === "determinar") {
        const { desde, hasta } = filtroFechaLavados;
        lavados = lavados.filter((lavado) => {
            const fechaLavado = new Date(lavado.fechaDeAlta).toISOString().split("T")[0];
            return (!desde || fechaLavado >= desde) && (!hasta || fechaLavado <= hasta);
        });
        
    }

    // Filtrar por empresa
    if (filtroEmpresaLavados) {
        lavados = lavados.filter((lavado) =>
            lavado.empresa && lavado.empresa.toLowerCase().includes(filtroEmpresaLavados)
        );
    }
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
        // Formatear la fecha en DD/MM/YY HH:mm
        let fechaFormateada = "---";
        if (lavado.fechaDeAlta) {
            const fechaObj = new Date(lavado.fechaDeAlta);
            const dia = String(fechaObj.getDate()).padStart(2, '0');
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
            const anio = String(fechaObj.getFullYear()).slice(-2); // Últimos dos dígitos del año
            const horas = String(fechaObj.getHours()).padStart(2, '0');
            const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
            fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}`;
        }

        // Para la tabla de ventas
        fila.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${lavado.nombre || "---"}</td>
        <td>${lavado.patente || "---"}</td>
        <td>${lavado.empresa || "---"}</td>
        <td>
            ${lavado.medioPago === "efectivo"
                ? '<img src="../img/cashLogo2.svg" alt="Efectivo" style="width: 30px; height: auto;" class="icon">'
                : lavado.medioPago === "mercado-pago"
                    ? '<img src="../img/logoMp.svg" alt="Mercado Pago" style="width: 30px; height: auto;" class="icon">'
                    : "---"
            }
        </td>
        <td>${lavado.estado || "---"}</td>
        `;

        // Agregar atributo data-id para identificar la fila
        const lavadoId = lavado._id || "sin-id";
        fila.setAttribute("data-id", lavadoId);

        // Agregar evento de clic a la fila
        fila.addEventListener("click", () => {
            // Quitar la clase "selected" de todas las filas
            document.querySelectorAll("#table-ventas tbody tr").forEach((r) => {
                r.classList.remove("selected");
                r.style.fontWeight = "normal"; // Restablecer el estilo
            });

            // Agregar la clase "selected" a la fila clicada
            fila.classList.add("selected");
            fila.style.fontWeight = "bold"; // Destacar la fila seleccionada

            // Actualizar `currentLavadoId` con el ID del lavado seleccionado
            currentLavadoId = lavado._id;

            // Actualizar los detalles editables
            actualizarDetallesLavado(lavado);
        });
    }

    tbody.appendChild(fila);
}


actualizarTabla(ventas, tbodyVentas);



// //** Función para limpiar los filtros de Lavados ***
document.getElementById("reset-filters-lavados").addEventListener("click", function () {
    

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
    
    cargarLavadosConFiltros(); // Cargar los datos nuevamente sin filtros
});

document.addEventListener("DOMContentLoaded", function () {
    // Establecer el filtro por defecto en los elementos del DOM
    document.getElementById("filtro-fecha-lavados").value = "hoy"; // Seleccionar "hoy" en el filtro de fecha
    document.getElementById("fecha-personalizada-lavados").classList.add("hidden"); // Ocultar las fechas personalizadas

    // Cargar la tabla con el filtro inicial (fecha: hoy)
    cargarLavadosConFiltros();
});
