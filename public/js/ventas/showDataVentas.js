// *** VARIABLES GLOBALES ***
let cajaTipoActivo = 'CajaMayor'; // Caja activa por defecto
let currentArqueoId = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueDiferencia = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoEstado = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoObservacion = null
let currentFiltroMovimiento = "todos"; // Variable global para almacenar el ID del arqueo 
let currentMovimiento = null; // Variable global para almacenar el ID del arqueo 
let currentMovimientoCajaId = null; // Variable global para almacenar el ID del arqueo 
let currentLavadoId = null; // Variable global para almacenar el ID del 
// let currentMovimientoCajaId = null; // Variable global para almacenar el ID del 





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




// *** FUNCIONES: Mostrar/Ocultar Elementos ***
function hideAllFormsAndButtons() {
    document.querySelectorAll('#buttons-container .action-btn').forEach((button) => (button.style.display = 'none'));
    document.querySelectorAll('#formularios-container form').forEach((form) => (form.style.display = 'none'));
    document.querySelector('.details-section').style.display = 'none';
    document.getElementById('details').style.display = 'none';
}









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
    console.trace(); // Muestra el stack trace en la consola
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
            <div class="btn-container">
            <button id="downloadPdfButton" class="btn-descargar">
                <i class="icon-pdf"></i>
                Descargar PDF
                </button>
            </div>
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

    // Agregar evento al botón de Descargar PDF
    const downloadPdfButton = document.getElementById("downloadPdfButton");
    if (downloadPdfButton) {
        downloadPdfButton.addEventListener("click", async () => {
            cargarMovimientos(cajaTipoActivo, currentArqueoId); // Carga los movimientos
        });
    }


    // Agregar evento al botón de Cerrar Arqueo si no está cerrado
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
                    ${movimiento.medioPago === "efectivo"
                    ? '<img src="../img/cashLogo2.svg" alt="Efectivo" style="width: 30px; height: auto;" class="icon">'
                    : movimiento.medioPago === "mercado-pago"
                        ? '<img src="../img/logoMp.svg" alt="Mercado Pago" style="width: 30px; height: auto;" class="icon">'
                        : "---"
                }
                </td>
                <td>${movimiento.descripcion || "---"}</td>
                <td class="${movimiento.estadoPago === "abonado" ? "estado-abonado" : movimiento.estadoPago === "no-abonado" ? "estado-no-abonado" : ""}">
                    ${movimiento.estadoPago || "---"}
                </td>
            `;
            tableBody.appendChild(row);

            // Evento al hacer clic en la fila para seleccionar
            row.addEventListener('click', () => {
                // Quitar la clase "selected" de todas las filas
                document.querySelectorAll('#table-movimientos tbody tr').forEach((r) => {
                    r.classList.remove('selected');
                    r.style.fontWeight = 'normal'; // Resetear el estilo
                });

                // Agregar la clase "selected" a la fila clicada
                row.classList.add('selected');
                currentMovimiento = movimiento._id
                currentMovimientoCajaId = movimiento.cajaId;
                row.style.fontWeight = 'bold'; // Cambiar a negrita para destacar

                // Actualizar los detalles editables
                actualizarDetallesMovimiento(movimiento);
            });
        });
    } else {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = '<td colspan="6" class="no-data">No hay movimientos disponibles.</td>'; // Ajustar colspan a 6
        tableBody.appendChild(noDataRow);
    }
}


function actualizarDetallesMovimiento(movimiento) {
    // Actualizar los campos editables en el detalle de movimientos
    const descripcion = document.getElementById('descripcion-detalle');
    const monto = document.getElementById('monto-detalle');
    const estado = document.getElementById('estado-detalle');

    // Actualizar el contenido de los detalles con la información del movimiento
    descripcion.innerHTML = `${movimiento.descripcion || "---"} <i class="fas fa-pencil-alt edit-icon" onclick="editarDetalle('descripcion-detalle')"></i>`;
    monto.innerHTML = `$${movimiento.monto || "---"} <i class="fas fa-pencil-alt edit-icon" onclick="editarDetalle('monto-detalle')"></i>`;

    // Actualizar el valor del select para estado
    if (estado && estado.tagName === "SELECT") {
        estado.value = movimiento.estadoPago || "pendiente"; // Asegurarte de que coincida con las opciones disponibles
    } else {
        console.error("Elemento de estado no encontrado o no es un select.");
    }
}


function handleConfirm(button, actionType, event) {
    // Prevenir comportamiento predeterminado
    if (event) event.preventDefault();

    // Cambiar el texto del botón a "seguro?"
    if (!button.classList.contains('confirm')) {
        button.textContent = `seguro?`;
        button.classList.add('confirm');

        // Agregar evento para volver al estado original si no se confirma
        setTimeout(() => {
            if (button.classList.contains('confirm')) {
                resetButton(button, actionType);
            }
        }, 3000); // Tiempo para cancelar (3 segundos)
    } else {
        // Acción confirmada
        if (actionType === 'Eliminar') {
            eliminarMovimiento(); // Ejecutar lógica de eliminación
        } else if (actionType === 'Modificar') {
            guardarCambios(); // Ejecutar lógica de modificación
        }
        resetButton(button, actionType);
    }
}


let isDeleting = false; // Bandera para evitar múltiples ejecucione

async function eliminarMovimiento() {
    try {
        // Validar que los valores existan
        if (!currentMovimiento || !currentMovimientoCajaId) {
            alert("No se seleccionó un movimiento para eliminar.");
            return;
        }

        // Llamar al backend para eliminar el movimiento
        const response = await fetch(`/api/movimientosEliminar`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                movimientoId: currentMovimiento,
                cajaId: currentMovimientoCajaId,
            }),
        });

        const data = await response.json();

        // Manejar la respuesta del backend
        if (response.ok && data.success) {
            alert("Movimiento eliminado con éxito.");
            // Llamar a fetchMovimientos para actualizar la tabla con datos actualizados
            await fetchMovimientos();
        } else {
            console.error(`Error al eliminar el movimiento: ${data.message}`);
            alert(`Error al eliminar el movimiento: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al intentar eliminar el movimiento:", error);
        alert("Error al intentar eliminar el movimiento.");
    }
}

async function guardarCambios() {
    try {
        // Validar que los valores existan
        if (!currentMovimiento || !currentMovimientoCajaId) {
            alert("No se seleccionó un movimiento para modificar.");
            return;
        }

        // Obtener los valores actuales de los campos editables
        const descripcion = document.getElementById("descripcion-detalle").textContent.trim();
        const monto = document.getElementById("monto-detalle").textContent.replace("$", "").trim();
        const estadoPago = document.getElementById("estado-detalle").value; // Ahora usamos estadoPago desde el <select>

        // Validar que al menos un campo tenga cambios
        if (!descripcion || !monto || !estadoPago) {
            alert("Todos los campos deben estar completos.");
            return;
        }

        // Llamar al backend para modificar el movimiento
        const response = await fetch(`/api/movimientosModificar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                movimientoId: currentMovimiento,
                cajaId: currentMovimientoCajaId,
                descripcion,
                monto: parseFloat(monto), // Convertir a número
                estadoPago, // Enviar el campo corregido
            }),
        });

        const data = await response.json();

        // Manejar la respuesta del backend
        if (data.success) {
            showNotification('Movimiento modificado con éxito.', 'success');
            // Lógica para actualizar la tabla o la vista (si es necesario)
            fetchMovimientos(); // Refrescar los movimientos después de modificar
        } else {
            alert(`Error al modificar el movimiento: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al intentar modificar el movimiento:", error);
        showNotification(`Error al modificar el movimiento: ${data.error || 'Error desconocido'}`, 'error');
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



function resetButton(button, actionType) {
    button.textContent = actionType;
    button.classList.remove('confirm');
}




//--------------LAVADOS DE LA SECTION DE SALON
//MovimientoDisplay
// *** Llamar a la función al cargar la página ***
document.addEventListener("DOMContentLoaded", fetchAndRenderLavados);
// *** Función para renderizar lavados en la tabla ***
function renderLavadosTable(lavados) {
    const tableBody = document.querySelector("#table-ventas tbody");

    // Limpia las filas existentes
    tableBody.innerHTML = "";

    if (lavados.length > 0) {
        // Ordenar los lavados por fecha/hora descendente
        lavados.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

        lavados.forEach((lavado, index) => {
            // Crear una nueva fila
            const row = document.createElement("tr");

            // Convertir patente a mayúsculas (si existe)
            const patenteMayuscula = lavado.patente ? lavado.patente.toUpperCase() : "---";

            // Asignar contenido HTML a la fila
            row.innerHTML = `
                <td>${lavado.nombre || "---"}</td>
                <td>${patenteMayuscula}</td>
                <td>${lavado.empresa || "---"}</td>
                <td>${new Date(lavado.fechaDeAlta).toLocaleString() || "---"}</td>
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
            row.setAttribute("data-id", lavadoId);

            // Agregar evento de clic a la fila
            row.addEventListener("click", () => {
                // Quitar la clase "selected" de todas las filas
                document.querySelectorAll("#table-ventas tbody tr").forEach((r) => {
                    r.classList.remove("selected");
                    r.style.fontWeight = "normal"; // Restablecer el estilo
                });

                // Agregar la clase "selected" a la fila clicada
                row.classList.add("selected");
                row.style.fontWeight = "bold"; // Destacar la fila seleccionada

                // Actualizar `currentLavadoId` con el ID del lavado seleccionado
                currentLavadoId = lavado._id;

                // Actualizar los detalles editables
                actualizarDetallesLavado(lavado);
            });

            // Agregar la fila al cuerpo de la tabla
            tableBody.appendChild(row);
        });
    } else {
        // Mostrar un mensaje si no hay lavados disponibles
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML =
            '<td colspan="6" class="no-data">No hay lavados disponibles.</td>';
        tableBody.appendChild(noDataRow);
    }
}

function editarDetalle(id) {
    const elemento = document.getElementById(id);
    const contenido = elemento.textContent.trim();
    const input = document.createElement('input');
    input.type = id === 'monto-detalle' ? 'number' : 'text';
    input.value = contenido;
    input.className = 'editable-input';
    elemento.innerHTML = '';
    elemento.appendChild(input);
    input.focus();

    input.addEventListener('blur', () => {
        elemento.innerHTML = input.value + ' <i class="fas fa-pencil-alt edit-icon" onclick="editarDetalle(\'' + id + '\')"></i>';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Aquí llamas a la función con el ID que deseas editar automáticamente
    editarDetalle('descripcion-detalle');
});

// Obtener referencia al formulario de lavados
const formLavado = document.getElementById('form-lavado');

// Manejar el evento submit del formulario de lavados
formLavado.addEventListener('submit', async (event) => {
    event.preventDefault(); // Previene el envío tradicional del formulario

    // Obtén los valores de los campos del formulario
    const medioPago = document.getElementById('medio-pago-lavado').value;
    const monto = parseFloat(document.getElementById('monto-lavado').value);
    const patente = document.getElementById('patente-lavado').value;
    const estadoPago = document.querySelector('input[name="estado-pago-lavado"]:checked');

    // Valida los campos
    if (!currentLavadoId || !medioPago || !estadoPago || isNaN(monto)) {
        showNotification("Por favor, complete todos los campos requeridos.", "error");
        return;
    }

    try {
        // Datos que se enviarán al backend
        const payload = {
            lavadoId: currentLavadoId, // ID del lavado que se desea modificar
            medioPago,
            monto,
            patente,
            estado: estadoPago.value, // Incluye el estado de pago en la solicitud
        };
        // Realiza el PUT al backend
        const response = await fetch('/api/lavadosModificar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showNotification('Lavado modificado con éxito.', 'success');

            // Llama a la función para crear un movimiento
            await crearMovimientoDesdeLavado({
                monto,
                medioPago,
                descripcion: `Lavado: ${patente}`, // Descripción incluye el ID o la patente
                estadoPago: 'abonado', // Siempre será abonado
                tipo: 'ingreso', // Tipo siempre será ingreso
            });

            // Obtener y renderizar la tabla actualizada
            cargarLavadosConFiltros(); // Llama a la función para refrescar la tabla

            // Limpia los campos del formulario después de enviar
            formLavado.reset();
        } else {
            showNotification(`Error al modificar el lavado: ${data.error || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        console.error('Error al enviar el formulario de lavado:', error);
        showNotification('Error al conectarse con el servidor.', 'error');
    }
});

// Función para crear un movimiento desde un lavado
async function crearMovimientoDesdeLavado({ monto, medioPago, descripcion, estadoPago, tipo }) {
    try {
        const cajaTipo = 'CajaChica'; // O puedes obtenerlo dinámicamente si es necesario

        // Realiza el POST al backend para crear el movimiento
        const response = await fetch('/api/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                monto,
                tipo,
                medioPago,
                descripcion,
                cajaTipo,
                estadoPago, // Incluye el estado de pago en la solicitud
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showNotification('Movimiento creado con éxito.', 'success');
        } else {
            showNotification(`Error al crear el movimiento: ${data.error || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        console.error('Error al crear el movimiento desde lavado:', error);
        showNotification('Error al conectarse con el servidor.', 'error');
    }
}







async function actualizarLavadosTable() {
    try {
        // Hacer una solicitud al backend para obtener la lista de lavados actualizada
        const response = await fetch('/api/lavados'); // Cambia la ruta si es necesario
        const data = await response.json();

        if (response.ok && data.success) {
            // Reutilizar la función renderLavadosTable para renderizar la tabla actualizada
            renderLavadosTable(data.lavados);
        } else {
            console.error('Error al obtener la lista de lavados:', data.error || 'Error desconocido');
            showNotification('Error al actualizar la tabla de lavados.', 'error');
        }
    } catch (error) {
        console.error('Error al actualizar la tabla de lavados:', error);
        showNotification('Error al conectarse con el servidor.', 'error');
    }
}
// *** Llamar a la función al cargar la página ***
document.addEventListener("DOMContentLoaded", fetchAndRenderLavados);


function actualizarDetallesLavado(lavado) {
    // Actualizar los campos editables en el detalle de lavados
    const usuario = document.getElementById('usuario-lavado');
    const patente = document.getElementById('patente-lavado');
    const empresa = document.getElementById('empresa-lavado');
    const fecha = document.getElementById('fecha-lavado');
    const medioPago = document.getElementById('medio-pago-lavado');
    const estadoRadios = document.querySelectorAll('input[name="estado-pago-lavado"]');
    const descripcion = document.getElementById('descripcion-lavado');
    const monto = document.getElementById('monto-lavado');

    // Convertir la fecha al formato deseado
    let fechaFormateada = "";
    if (lavado.fechaDeAlta) {
        const fechaObj = new Date(lavado.fechaDeAlta);
        const dia = String(fechaObj.getDate()).padStart(2, '0');
        const mes = String(fechaObj.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
        const anio = String(fechaObj.getFullYear()).slice(-2); // Últimos dos dígitos del año
        const horas = String(fechaObj.getHours()).padStart(2, '0');
        const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
        fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }

    // Actualizar los valores del formulario con los datos del lavado
    usuario.value = lavado.nombre || "---";
    patente.value = lavado.patente || "---";
    empresa.value = lavado.empresa || "---";
    fecha.value = fechaFormateada || "---";

    // Actualizar el select para medio de pago
    if (medioPago) {
        medioPago.value = lavado.medioPago || ""; // Asegurarte de que coincida con las opciones disponibles
    }

    // Actualizar los radios para estado de pago
    if (estadoRadios) {
        estadoRadios.forEach((radio) => {
            radio.checked = radio.value === lavado.estadoPago;
        });
    }

    // Actualizar descripción
    descripcion.value = lavado.descripcion || "";

    // Actualizar monto
    monto.value = lavado.monto || "";
}
// Función para habilitar la edición de un campo específico
// function editarDetalle(campoId) {
//     const campo = document.getElementById(campoId);
//     if (campo) {
//         const valorActual = campo.value.trim();
//         const input = document.createElement('input');
//         input.type = 'text';
//         input.value = valorActual;
//         input.onblur = () => {
//             campo.value = input.value;
//             input.remove();
//         };
//         campo.parentNode.appendChild(input);
//         input.focus();
//     }
// }

async function fetchAndRenderLavados() {
    try {
        const response = await fetch("http://localhost:3000/api/admins/6760a78e7f72b5a2c6b67e34/lavados");
        const lavados = await response.json();

        renderLavadosTable(lavados);
    } catch (error) {
        console.error("Error al obtener los lavados:", error);
    }
}
// -------------






























