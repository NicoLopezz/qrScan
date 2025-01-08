// *** VARIABLES GLOBALES ***
let cajaTipoActivo = 'CajaMayor'; // Caja activa por defecto
let currentArqueoId = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueDiferencia = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoEstado = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoObservacion = null
let currentFiltroMovimiento = "todos"; // Variable global para almacenar el ID del arqueo 
let currentMovimiento = null; // Variable global para almacenar el ID del arqueo 
let currentMovimientoCajaId = null; // Variable global para almacenar el ID del arqueo 



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



//--------------LAVADOS DE LA SECTION DE SALON
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
                <td>${movimiento.estadoPago || "---"}</td> <!-- Nueva columna para Estado -->
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
            alert("Movimiento modificado con éxito.");
            // Lógica para actualizar la tabla o la vista (si es necesario)
            fetchMovimientos(); // Refrescar los movimientos después de modificar
        } else {
            alert(`Error al modificar el movimiento: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al intentar modificar el movimiento:", error);
        alert("Error al intentar modificar el movimiento.");
    }
}



function resetButton(button, actionType) {
    button.textContent = actionType;
    button.classList.remove('confirm');
}





//MovimientoDisplay
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






















