// *** VARIABLES GLOBALES ***
let cajaTipoActivo = 'CajaMayor'; // Caja activa por defecto
let currentArqueoId = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueDiferencia = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoEstado = null; // Variable global para almacenar el ID del arqueo actual
let currentArqueoObservacion = null

// Evento para manejar el envío del formulario de nuevo movimiento
const formMovimiento = document.getElementById('form-movimiento');







// *** EVENTOS: Selección de Caja Mayor o Chica ***
document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', (event) => {
        const selectedCaja = event.target.id === 'caja-mayor' ? 'CajaMayor' : 'CajaChica';
        cajaTipoActivo = selectedCaja; // Actualizar caja activa

        hideAllFormsAndButtons();
        fetchArqueos(selectedCaja);
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




let currentFiltroMovimiento = "Todos"; // Variable global para almacenar el ID del arqueo 

// *** Función para obtener y renderizar movimientos según el filtro ***
async function fetchMovimientos() {
    console.log("Filtro seleccionado:", currentFiltroMovimiento);
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

            // Aplicar el filtro según el tipo seleccionado
            if (currentFiltroMovimiento === "efectivo") {
                movimientos = movimientos.filter(mov => mov.medioPago === "efectivo");
            } else if (currentFiltroMovimiento === "mercado-pago") {
                movimientos = movimientos.filter(mov => mov.medioPago === "mercado-pago");
            }

            console.log("Movimientos después del filtro:", movimientos);

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
            `;
            tableBody.appendChild(row);
        });
    } else {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = '<td colspan="5" class="no-data">No hay movimientos disponibles.</td>';
        tableBody.appendChild(noDataRow);
    }
}

// *** Evento para manejar el cambio en el filtro ***
document.getElementById("tipo-caja").addEventListener("change", function (event) {
    const selectedValue = event.target.value;

    if (selectedValue === "efectivo") {
        currentFiltroMovimiento = "efectivo";
    } else if (selectedValue === "mercado-pago") {
        currentFiltroMovimiento = "mercado-pago";
    } else {
        currentFiltroMovimiento = "Todos";
    }

    console.log("Filtro cambiado a:", currentFiltroMovimiento);
    fetchMovimientos(); // Ejecutar fetchMovimientos después de cambiar el filtro
});





formMovimiento.addEventListener('submit', async (event) => {
    event.preventDefault(); // Previene el envío tradicional del formulario

    // Obtén los valores de los campos del formulario
    const monto = parseFloat(document.getElementById('monto-movimiento').value);
    const tipo = document.getElementById('tipo-movimiento').value;
    const medioPago = document.getElementById('medio-pago').value;
    const descripcion = document.getElementById('descripcion-movimiento').value;
    const cajaTipo = document.querySelector('.tab.active').id === 'caja-mayor' ? 'CajaMayor' : 'CajaChica';

    // Valida los campos
    if (!monto || isNaN(monto) || !tipo || !medioPago) {
        showNotification("Por favor, complete todos los campos requeridos.", "error");
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
                currentArqueoId
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



//MOVIMIENTO FILTRO:

// // *** Función para obtener arqueos abiertos y actualizar el select ***
// async function updateTipoArqueoOptions() {
//     try {
//         // Realizar el fetch para obtener arqueos abiertos
//         const response = await fetch(`/api/arqueosAbiertos`, {
//             method: 'GET',
//             headers: { 'Content-Type': 'application/json' },
//         });

//         const data = await response.json();

//         if (response.ok && data.success) {
//             const arqueosAbiertos = data.data;

//             // Extraer tipos únicos de arqueos con estado "abierto"
//             const tiposUnicos = [...new Set(arqueosAbiertos.map(arqueo => arqueo.tipo))];

//             // Seleccionar el elemento <select>
//             const tipoArqueoSelect = document.getElementById('tipo-arqueo');
//             tipoArqueoSelect.innerHTML = ''; // Limpiar las opciones anteriores

//             // Crear opciones dinámicamente
//             tiposUnicos.forEach(tipo => {
//                 const option = document.createElement('option');
//                 option.value = tipo;
//                 option.textContent = tipo === 'efectivo' ? 'Efectivo' : 'Mercado Pago'; // Opcional: transformar nombres
//                 tipoArqueoSelect.appendChild(option);
//             });

//             console.log('Opciones actualizadas:', tiposUnicos);
//         } else {
//             console.error('Error al obtener arqueos abiertos:', data.message);
//         }
//     } catch (error) {
//         console.error('Error al realizar el fetch para arqueos abiertos:', error);
//     }
// }

// // Llamar a la función al cargar la página o en eventos específicos
// updateTipoArqueoOptions();
