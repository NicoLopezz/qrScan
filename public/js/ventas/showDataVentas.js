// *** VARIABLES GLOBALES ***
let cajaTipoActivo = 'CajaMayor'; // Caja activa por defecto
let currentArqueoId = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueDiferencia = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoEstado = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoObservacion = null

let currentFiltroMovimiento = "todos"; // Variable global para almacenar el ID del arqueo 



// *** EVENTOS: Selección de Caja Mayor o Chica ***
document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', (event) => {
        const selectedCaja = event.target.id === 'caja-mayor' ? 'CajaMayor' : 'CajaChica';
        cajaTipoActivo = selectedCaja; // Actualizar caja activa

        hideAllFormsAndButtons();
        fetchArqueos(selectedCaja);
    });
});

function toggleDateInputs(value) {
    const fechaPersonalizada = document.getElementById('fecha-personalizada');
    if (value === 'determinar') {
        fechaPersonalizada.classList.remove('hidden');
    } else {
        fechaPersonalizada.classList.add('hidden');
    }
}


// Asegurar que solo un checkbox pueda estar seleccionado a la vez
document.querySelectorAll('input[name="estado-pago"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            document.querySelectorAll('input[name="estado-pago"]').forEach((cb) => {
                if (cb !== event.target) cb.checked = false; // Desmarcar los otros
            });
        }
    });
});

//FUNCIONES PARA TRAER LOS LAVADOS A VENTAS.
// *** Función para obtener y renderizar los lavados ***

async function fetchAndRenderLavados() {
    try {
        const response = await fetch("http://localhost:3000/api/admins/6760a78e7f72b5a2c6b67e34/lavados");
        const lavados = await response.json();

        renderLavadosTable(lavados);
    } catch (error) {
        console.error("Error al obtener los lavados:", error);
    }
}
// *** FUNCIONES: Mostrar/Ocultar Elementos ***
function hideAllFormsAndButtons() {
    document.querySelectorAll('#buttons-container .action-btn').forEach((button) => (button.style.display = 'none'));
    document.querySelectorAll('#formularios-container form').forEach((form) => (form.style.display = 'none'));
    document.querySelector('.details-section').style.display = 'none';
    document.getElementById('details').style.display = 'none';
}



//--------------

// *** Llamar a la función al cargar la página ***
document.addEventListener("DOMContentLoaded", fetchAndRenderLavados);
// *** Función para renderizar lavados en la tabla ***
function renderLavadosTable(lavados) {
    const tableBody = document.querySelector("#table-ventas tbody");
    tableBody.innerHTML = "";

    if (lavados.length > 0) {
        lavados.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)); // Ordenar por fecha/hora descendente

        lavados.forEach(lavado => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${lavado.nombre || "---"}</td>
                <td>${lavado.patente || "---"}</td>
                <td>${lavado.empresa || "---"}</td>
                <td>${new Date(lavado.fechaDeAlta).toLocaleString() || "---"}</td>
                <td>$${lavado.monto || "---"}</td>
                <td>${lavado.estado || "---"}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = '<td colspan="6" class="no-data">No hay lavados disponibles.</td>';
        tableBody.appendChild(noDataRow);
    }
}
// -------------








// *** FETCH: Obtener Arqueos por Caja ***
async function fetchArqueos(cajaTipo) {
    try {
        const response = await fetch(`/api/arqueos?cajaTipo=${cajaTipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (response.ok && data.success) {
            renderArqueosTable(data.data);
        } else {
            console.error('Error al obtener los arqueos:', data.message);
            showNotification(`Error al obtener los arqueos: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al realizar el fetch:', error);
        showNotification('Error al conectarse con el servidor.', 'error');
    }
}
// *** FUNCIONES: Renderizar Tablas de Arqueos ***
function renderArqueosTable(arqueos) {
    const tableBody = document.querySelector('#table-arqueo tbody');
    tableBody.innerHTML = ''; // Limpiar tabla

    // Ordenar arqueos por fecha de apertura (de más reciente a más antigua)
    arqueos.sort((a, b) => new Date(b.fechaApertura) - new Date(a.fechaApertura));

    arqueos.forEach((arqueo) => {
        const row = document.createElement('tr');

        // Formatear valores con símbolo de pesos y formato correcto
        const formatCurrency = (value) => value != null
            ? `$${parseFloat(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '---';

        const saldoFinalSistema = formatCurrency(arqueo.saldoFinalSistema);
        const saldoFinalReal = formatCurrency(arqueo.saldoFinalReal);
        const diferencia = formatCurrency(arqueo.diferencia || 0);

        // Determinar la imagen según el tipo de arqueo
        const icono = arqueo.tipo === 'efectivo' ? '../img/cashLogo2.svg' : '../img/logoMp.svg';

        row.innerHTML = `
            <td>${new Date(arqueo.fechaApertura).toLocaleString()}</td>
            <td>${arqueo.fechaCierre ? new Date(arqueo.fechaCierre).toLocaleString() : '---'}</td>
            <td>
                <img src="${icono}" alt="Detalle" style="width: 30px; height: auto;">
            </td>
            <td>${saldoFinalSistema}</td>
            <td>${saldoFinalReal}</td>
            <td style="${arqueo.diferencia > 0 
                ? 'color: #55a834 !important;' // Verde oscuro si es positiva
                : arqueo.diferencia < 0 
                    ? 'color: #f54335 !important;' // Rojo oscuro si es negativa
                    : 'color: #383d41 !important;'}">${diferencia}</td>
            <td style="${arqueo.estado === 'cerrado' 
                ? 'color: #f54335 !important; font-weight: bold !important;' // Rojo oscuro si está cerrado
                : 'color: #55a834 !important; font-weight: bold !important;'}">${arqueo.estado}</td>
        `;

        row.addEventListener('click', () => displayArqueoDetails(arqueo));
        document.querySelector('.details-section').dataset.arqueoId = arqueo._id; // Almacena el arqueoId

        tableBody.appendChild(row);

        // Evento al hacer clic en la fila para seleccionar
        row.addEventListener('click', () => {
            // Quitar la clase "selected" de todas las filas
            document.querySelectorAll('#table-arqueo tbody tr').forEach((r) => {
                r.classList.remove('selected');
                r.style.fontWeight = 'normal'; // Resetear el estilo
            });

            // Agregar la clase "selected" a la fila clicada
            row.classList.add('selected');
            row.style.fontWeight = 'bold'; // Cambiar a negrita para destacar
        });
    });

    document.getElementById('table-arqueo').classList.remove('hidden');
    document.getElementById('table-movimientos').classList.add('hidden');
}
// *** FUNCIONES: Mostrar Detalles de Arqueo ***
function displayArqueoDetails(arqueo) {
    hideAllFormsAndButtons();

    const ingresos = arqueo.movimientos.filter((m) => m.tipo === 'ingreso');
    const egresos = arqueo.movimientos.filter((m) => m.tipo === 'egreso');

    const ingresosPorMedio = calcularTotalesPorMedioPago(ingresos);
    const egresosPorMedio = calcularTotalesPorMedioPago(egresos);

    const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
    const totalEgresos = egresos.reduce((sum, m) => sum + m.monto, 0);
    const totalSistema = arqueo.saldoInicial + totalIngresos - totalEgresos;

    const detailsSection = document.querySelector('.details-section');
    detailsSection.style.display = 'block';

    detailsSection.innerHTML = `
        <div class="arqueo-details">
            <h3>ARQUEO DE CAJA</h3>
            <p><strong>Hora de apertura:</strong> ${new Date(arqueo.fechaApertura).toLocaleString()}</p>
            <p><strong>Monto inicial:</strong> $${arqueo.saldoInicial.toFixed(2)}</p>

            <h4>Según Sistema</h4>
            <table class="summary-table detalle-arqueo">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Detalle</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateDynamicRowWithClick('ingresos', 'Ingresos', totalIngresos, ingresosPorMedio)}
                    ${generateDynamicRowWithClick('egresos', 'Egresos', totalEgresos, egresosPorMedio)}
                    <tr>
                        <td><strong>Total:</strong></td>
                        <td></td>
                        <td><strong>$${totalSistema.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>

            <h4>Según Usuario</h4>
            <table class="summary-table usuario-arqueo">
                <thead>
                    <tr>
                        <th>Medio de Pago</th>
                        <th>Monto Ingresado</th>
                    </tr>
                </thead>
                <tbody id="usuario-arqueo-body">
                    ${generateUsuarioRows(ingresosPorMedio, egresosPorMedio)}
                    <tr>
                        <td><strong>Total Usuario:</strong></td>
                        <td id="total-usuario"><strong>$0.00</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    document.querySelectorAll('.usuario-input').forEach((input) => {
        input.addEventListener('input', () => {
            updateTotalUsuario();
            updateDiferencia(totalSistema);
        });
    });
    // console.log("ARQUEOID DESDE LA FUNCION DISPLAY" + arqueo._id)
    currentArqueoId = arqueo._id
    currentArqueoEstado = arqueo.estado
    currentArqueoDiferencia = arqueo.diferencia
    currentArqueoObservacion = arqueo.observacion
    renderDiferenciaCard(totalSistema, arqueo._id);
}
// *** Función para Generar Fila Principal con Evento de Clic ***
function generateDynamicRowWithClick(tipo, concepto, total, detallesPorMedio) {
    const row = `
        <tr class="${tipo}-row" data-tipo="${tipo}">
            <td>${concepto}</td>
            <td></td>
            <td>$${total.toFixed(2)}</td>
        </tr>
    `;

    setTimeout(() => {
        const targetRow = document.querySelector(`.${tipo}-row`);
        if (targetRow) {
            targetRow.addEventListener('click', () => {
                toggleDetails(tipo, detallesPorMedio);
            });
        }
    }, 0);

    return row;
}
// *** Función para Alternar Detalles de Filas ***
function toggleDetails(tipo, detalles) {
    const targetRow = document.querySelector(`.${tipo}-row`);
    if (!targetRow) {
        return;
    }

    const detalleRows = document.querySelectorAll(`.${tipo}-detalle-row`);
    if (detalleRows.length) {
        detalleRows.forEach((row) => row.remove());
    } else {
        Object.entries(detalles).forEach(([medio, monto]) => {
            const detalleRow = document.createElement('tr');
            detalleRow.classList.add(`${tipo}-detalle-row`);
            detalleRow.innerHTML = `
                <td></td>
                <td>${medio}</td>
                <td>$${monto.toFixed(2)}</td>
            `;
            targetRow.after(detalleRow);
        });
    }
}
// *** Función para Calcular Totales por Medio de Pago ***
function calcularTotalesPorMedioPago(movimientos) {
    return movimientos.reduce((totales, movimiento) => {
        totales[movimiento.medioPago] = (totales[movimiento.medioPago] || 0) + movimiento.monto;
        return totales;
    }, {});
}
// *** Función para Generar Filas de "Según Usuario" ***
function generateUsuarioRows(ingresosPorMedio, egresosPorMedio) {
    const medios = { ...ingresosPorMedio, ...egresosPorMedio };

    return Object.entries(medios)
        .map(
            ([medio]) => `
        <tr>
            <td>${medio}</td>
            <td>
                <input type="text" class="usuario-input" data-medio="${medio}" placeholder="$0.00" onfocus="this.select()">
            </td>
        </tr>
    `
        )
        .join('');
}
// *** Función para Actualizar el Total Usuario ***
function updateTotalUsuario() {
    let totalUsuario = 0;

    document.querySelectorAll('.usuario-input').forEach((input) => {
        const value = parseFloat(input.value.replace('$', '').replace(',', '')) || 0;
        totalUsuario += value;
    });

    const totalUsuarioElement = document.getElementById('total-usuario');
    if (totalUsuarioElement) {
        totalUsuarioElement.innerHTML = `<strong>$${totalUsuario.toFixed(2)}</strong>`;
    }
}
// FUNCION PARA MOSTRAR LA SECCION DE CERRAR ARQUEO
function renderDiferenciaCard(totalSistema) {
    if (!currentArqueoId) {
        console.error('Error: currentArqueoId no encontrado en renderDiferenciaCard.');
        return;
    }

    console.log("currentArqueoId desde renderDiferenciaCard:", currentArqueoId);
    console.log("y su estado es....", currentArqueoEstado);

    const totalUsuarioElement = document.getElementById("total-usuario");
    const totalUsuario = parseFloat(
        totalUsuarioElement.textContent.replace("$", "").replace(",", "")
    ) || 0;

    let diferencia;
    let diferenciaFormateada;

    if (currentArqueoEstado === "cerrado") {
        diferencia = currentArqueoDiferencia;
    } else {
        diferencia = totalUsuario - totalSistema;
    }

    // Formatear diferencia
    diferenciaFormateada = `${diferencia > 0 ? '+' : ''}${diferencia.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Crear contenedor principal
    const diferenciaCard = document.createElement("div");
    diferenciaCard.classList.add("diferencia-card");

    // Contenido de la tarjeta
    let leftColumn = `
        <div class="diferencia-card-left">
            <div>
                <p class="diferencia-titulo">Diferencia</p>
                <p id="diferencia-valor" class="diferencia-valor">$${diferenciaFormateada}</p>
            </div>
    `;

    if (currentArqueoEstado === "cerrado") {
        leftColumn += `
            <p class="observacion-texto" style="font-style: italic; font-size: 13px !important">${currentArqueoObservacion || "Sin observación registrada"}</p>
        `;
    } else {
        leftColumn += `
            <button id="btn-cerrar-arqueo" class="btn-cerrar-arqueo">Cerrar Arqueo</button>
        `;
    }

    leftColumn += `</div>`;

    const rightColumn = currentArqueoEstado !== "cerrado" ? `
        <div class="diferencia-card-right">
            <p class="observacion-titulo">Observación</p>
            <input 
                id="observacion2" 
                type="text" 
                class="observacion-input" 
                placeholder="Ej: Sobró efectivo">
        </div>
    ` : '';

    diferenciaCard.innerHTML = leftColumn + rightColumn;

    const detailsSection = document.querySelector('.details-section');
    detailsSection.appendChild(diferenciaCard);

    // Cambiar color dinámicamente según la diferencia
    const diferenciaValor = diferenciaCard.querySelector("#diferencia-valor");
    if (diferencia > 0) {
        diferenciaValor.style.setProperty("color", "#55a834", "important"); // Verde
    } else if (diferencia < 0) {
        diferenciaValor.style.setProperty("color", "#f54335", "important"); // Rojo
    } else {
        diferenciaValor.style.setProperty("color", "#383d41", "important"); // Gris
    }

    // Ocultar o mostrar la tabla según el estado
    const usuarioArqueoBody = document.getElementById("usuario-arqueo-body");
    if (currentArqueoEstado === "cerrado" && usuarioArqueoBody) {
        usuarioArqueoBody.parentElement.style.display = "none"; // Ocultar tabla
    } else if (usuarioArqueoBody) {
        usuarioArqueoBody.parentElement.style.display = ""; // Mostrar tabla
    }

    // Agregar evento al botón solo si el estado no es "cerrado"
    if (currentArqueoEstado !== "cerrado") {
        const cerrarArqueoBtn = diferenciaCard.querySelector("#btn-cerrar-arqueo");
        cerrarArqueoBtn.addEventListener("click", () => {
            const observacionInput = document.getElementById("observacion2");
            if (!observacionInput) {
                console.error("El campo de observación no existe en el DOM.");
                return;
            }
            const observacion = observacionInput.value.trim() || "Sin observación";
            cerrarArqueo(currentArqueoId, totalSistema, totalUsuario, observacion);
        });
    }
}
// *** Función para manejar el cierre del arqueo ***
function cerrarArqueo(currentArqueoId, totalSistema, totalUsuario, observacion) {
    console.log("El currentArqueoId es desde el front:", currentArqueoId);
    console.log("El SALDO FINAL ENVIADO POR EL USUARIO ES", totalUsuario);
    console.log("Observación enviada al backend:", observacion);

    const diferencia = totalSistema - totalUsuario;

    if (diferencia !== 0) {
        const confirmacion = confirm(
            `El arqueo tiene una diferencia de $${diferencia.toFixed(
                2
            )}. ¿Deseas continuar con el cierre del arqueo?`
        );
        if (!confirmacion) return;
    }

    if (!currentArqueoId) {
        console.error('Error: currentArqueoId no definido.');
        showNotification('No se puede cerrar el arqueo. ID no válido.', 'error');
        return;
    }

    const url = `/api/cerrarArqueo/${currentArqueoId}`;
    console.log('Llamando al endpoint con la observación:', observacion);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cajaTipo: cajaTipoActivo,
            totalUsuario: totalUsuario,
            observacion: observacion // Enviar observación al backend
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw new Error(err.message || 'Error desconocido al cerrar el arqueo');
                });
            }
            return response.json();
        })
        .then((data) => {
            showNotification('Arqueo cerrado correctamente.', 'success');
            console.log('Arqueo cerrado exitosamente:', data);
            
            fetchArqueos(cajaTipoActivo);
        })
        .catch((error) => {
            console.error('Error al cerrar el arqueo:', error);
            showNotification(`Error al realizar el cierre del arqueo: ${error.message}`, 'error');
        });
}
// *** Función para Actualizar Dinámicamente la Tarjeta ***
function updateDiferencia(totalSistema) {
    const diferenciaCard = document.querySelector(".diferencia-card");
    if (diferenciaCard) diferenciaCard.remove(); // Eliminar tarjeta anterior
    renderDiferenciaCard(totalSistema); // Crear y agregar tarjeta actualizada
}










// Variables globales para los filtros

let currentFiltroIngreso = "todos"; // Para "Tipo de Ingreso"
let currentFiltroEstado = "todos"; // Para "Estado"
let currentFiltroFecha = { tipo: "hoy", desde: null, hasta: null }; // Para Fecha
let currentFiltroMedioPago = "todos"; // Para "Medio de Pago"

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








// *** Función para renderizar movimientos en la tabla ***
function renderMovimientosTable(movimientos) {
    const tableBody = document.querySelector("#table-movimientos tbody");
    tableBody.innerHTML = "";

    if (movimientos.length > 0) {
        movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha descendente

        movimientos.forEach(movimiento => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${new Date(movimiento.fecha).toLocaleString()}</td>
                <td>$${movimiento.monto || "---"}</td>
                <td>${movimiento.tipo || "---"}</td>
                <td>
                    ${
                        movimiento.medioPago === "efectivo"
                            ? '<img src="../img/cashLogo2.svg" alt="Efectivo" style="width: 30px; height: auto;" class="icon">'
                            : movimiento.medioPago === "mercado-pago"
                            ? '<img src="../img/logoMp.svg" alt="Mercado Pago" style="width: 30px; height: auto;" class="icon">'
                            : "---"
                    }
                </td>
                <td>${movimiento.descripcion || "---"}</td>
                <td>${movimiento.estadoPago || "---"}</td> <!-- Nueva columna para Estado -->
            `;
            tableBody.appendChild(row);
        });
    } else {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = '<td colspan="6" class="no-data">No hay movimientos disponibles.</td>'; // Ajustar colspan a 6
        tableBody.appendChild(noDataRow);
    }
}


// Evento para manejar el envío del formulario de nuevo movimiento
//CREA EL NUEVO MOV
const formMovimiento = document.getElementById('form-movimiento'); 

//CREAR MOVIMIENTO
formMovimiento.addEventListener('submit', async (event) => {
    event.preventDefault(); // Previene el envío tradicional del formulario

    // Obtén los valores de los campos del formulario
    const monto = parseFloat(document.getElementById('monto-movimiento').value);
    const tipo = document.getElementById('tipo-movimiento').value;
    const medioPago = document.getElementById('medio-pago').value;
    const descripcion = document.getElementById('descripcion-movimiento').value;
    const cajaTipo = document.querySelector('.tab.active').id === 'caja-mayor' ? 'CajaMayor' : 'CajaChica';

    // Obtén el estado de pago seleccionado
    const estadoPago = document.querySelector('input[name="estado-pago"]:checked');

    // Valida los campos
    if (!monto || isNaN(monto) || !tipo || !medioPago || !estadoPago) {
        showNotification("Por favor, complete todos los campos requeridos, incluido el estado de pago.", "error");
        return;
    }

    try {
        // Realiza el POST al backend
        const response = await fetch('/api/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                monto,
                tipo,
                medioPago,
                descripcion,
                cajaTipo,
                estadoPago: estadoPago.value, // Incluye el estado de pago en la solicitud
                // currentArqueoId (agregar si es necesario)
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showNotification('Movimiento creado con éxito.', 'success');

            // Limpia los campos del formulario después de enviar
            formMovimiento.reset();
            await fetchMovimientos(cajaTipo);
        } else {
            showNotification(`Error al crear el movimiento: ${data.error || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        console.error('Error al enviar el formulario de movimiento:', error);
        showNotification('Error al conectarse con el servidor.', 'error');
    }
});






















