// *** VARIABLES GLOBALES ***
let cajaTipoActivo = 'CajaMayor'; // Caja activa por defecto
let currentArqueoId = null; // Variable global para almacenar el ID del arqueo actual


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

// *** FETCH: Movimientos ***
async function fetchMovimientos(cajaTipo) {
    try {
        const response = await fetch(`/api/movimientos?cajaTipo=${cajaTipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (response.ok && data.success) {
            renderMovimientosTable(data.data);
        } else {
            console.error('Error al obtener movimientos:', data.message);
            showNotification(`Error al obtener movimientos: ${data.message}`, 'error');
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

    arqueos.forEach((arqueo) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(arqueo.fechaApertura).toLocaleString()}</td>
            <td>${arqueo.fechaCierre ? new Date(arqueo.fechaCierre).toLocaleString() : '---'}</td>
            <td>${arqueo.saldoFinalSistema || '---'}</td>
            <td>${arqueo.saldoFinalReal || '---'}</td>
            <td>${arqueo.diferencia || '0.00'}</td>
            <td>${arqueo.estado}</td>
        `;
        row.addEventListener('click', () => displayArqueoDetails(arqueo));
        document.querySelector('.details-section').dataset.arqueoId = arqueo._id; // Almacena el arqueoId
        tableBody.appendChild(row);
    });

    document.getElementById('table-arqueo').classList.remove('hidden');
    document.getElementById('table-movimientos').classList.add('hidden');
}

// *** FUNCIONES: Renderizar Tabla de Movimientos ***
function renderMovimientosTable(movimientos) {
    const tableBody = document.querySelector('#table-movimientos tbody');
    tableBody.innerHTML = '';

    movimientos.forEach((movimiento) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(movimiento.fecha).toLocaleString()}</td>
            <td>$${movimiento.monto || '---'}</td>
            <td>${movimiento.tipo || '---'}</td>
            <td>${movimiento.medioPago || '---'}</td>
            <td>${movimiento.descripcion || '---'}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('table-movimientos').classList.remove('hidden');
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
    console.log("ARQUEOID DESDE LA FUNCION DISPLAY" + arqueo._id)
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

function renderDiferenciaCard(totalSistema) {
    const detailsSection = document.querySelector('.details-section');
    const arqueoId = detailsSection.dataset.arqueoId; // Recupera el arqueoId del atributo

    if (!arqueoId) {
        console.error('Error: arqueoId no encontrado en renderDiferenciaCard.');
        return;
    }

    console.log("arqueoId desde renderDiferenciaCard:", arqueoId);

    const totalUsuarioElement = document.getElementById("total-usuario");
    const totalUsuario = parseFloat(
        totalUsuarioElement.textContent.replace("$", "").replace(",", "")
    ) || 0;

    const diferencia = totalSistema - totalUsuario;

    const diferenciaCard = document.createElement("div");
    diferenciaCard.classList.add("diferencia-card");

    diferenciaCard.innerHTML = `
        <div>
            <p id="diferencia" style="font-size: 20px !important; margin-bottom: 0; color: white !important; font-weight: bold;">Diferencia</p>
            <span id="diferencia-valor">$${diferencia.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}</span>
        </div>
        <button id="btn-cerrar-arqueo" style="margin-top: 10px; padding: 8px 16px; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cerrar Arqueo
        </button>
    `;

    if (diferencia > 0) {
        diferenciaCard.classList.add("positivo");
    } else if (diferencia < 0) {
        diferenciaCard.classList.add("negativo");
    } else {
        diferenciaCard.classList.add("igual");
    }

    detailsSection.appendChild(diferenciaCard);

    const cerrarArqueoBtn = diferenciaCard.querySelector("#btn-cerrar-arqueo");
    cerrarArqueoBtn.addEventListener("click", () => {
        cerrarArqueo(arqueoId, totalSistema, totalUsuario);
    });
}


// *** Función para manejar el cierre del arqueo ***

function cerrarArqueo(arqueoId, totalSistema, totalUsuario) {
    arqueoId = arqueoId || currentArqueoId; // Usar el ID almacenado globalmente si no se pasa uno
    console.log("El arqueo ID es desde el front:", arqueoId);

    const diferencia = totalSistema - totalUsuario;

    if (diferencia !== 0) {
        const confirmacion = confirm(
            `El arqueo tiene una diferencia de $${diferencia.toFixed(
                2
            )}. ¿Deseas continuar con el cierre del arqueo?`
        );
        if (!confirmacion) return;
    }

    if (!arqueoId) {
        console.error('Error: arqueoId no definido.');
        showNotification('No se puede cerrar el arqueo. ID no válido.', 'error');
        return;
    }

    const url = `/api/cerrarArqueo/${arqueoId}`;
    console.log('Llamando al endpoint:', url);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cajaTipo: cajaTipoActivo }),
    })
        .then((response) => {
            console.log('Respuesta del servidor:', response);
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
