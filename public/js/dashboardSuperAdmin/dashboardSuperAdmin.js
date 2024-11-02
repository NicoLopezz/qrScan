const apiUrl = '/api/locales';  // Ruta para obtener los locales
const newLocalUrl = '/api/newLocal';  // Ruta para agregar un nuevo local
const deleteLocalUrl = '/api/deleteLocal'; // Ruta para eliminar un local

// Modificar la función cargarLocales para agregar el evento click a cada tarjeta
async function cargarLocales() {
    try {
        const response = await fetch(apiUrl);  // Llamada a la API del servidor
        const locales = await response.json();
        const tarjetasContainer = document.getElementById('tarjetas-container');
        tarjetasContainer.innerHTML = '';  // Limpiar tarjetas anteriores
    
        locales.forEach(local => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'card';
            tarjeta.innerHTML = `
                <h2>${local.localName}</h2>
                <p>Email: ${local.email}</p>
                <p>Permiso: ${local.permiso}</p>
                <p>Fecha de Alta: ${new Date(local.fechaDeAlta).toLocaleDateString()}</p>
                <p>TagSelected: ${local.tagSelected}</p>
                <p>Local Id: ${local._id}</p>
                <button class="delete-btn" onclick="eliminarLocal('${local._id}')">Eliminar</button>
            `;
            // Al hacer clic en la tarjeta, se llama a la función mostrarDetalles pasando el local._id
            tarjeta.onclick = () => mostrarDetalles(local._id);
            tarjetasContainer.appendChild(tarjeta);
        });
    } catch (error) {
        console.error('Error al cargar los locales:', error);
    }
}

async function mostrarDetalles(localId) {
    try {
        const response = await fetch(`/api/locales/${localId}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        const local = await response.json();

        const detallesContainer = document.getElementById("detalles-container");
        detallesContainer.innerHTML = `
            <h2>Detalles del Local: ${local.localName}</h2>
            <p><strong>Email:</strong> ${local.email}</p>
            <p><strong>Permiso:</strong> ${local.permiso}</p>
            <p><strong>Fecha de Alta:</strong> ${new Date(local.fechaDeAlta).toLocaleDateString()}</p>
            <p><strong>Tipo de Licencia:</strong> ${local.tipoDeLicencia}</p>
            <p><strong>Fecha de Renovación:</strong> ${local.fechaRenovacion ? new Date(local.fechaRenovacion).toLocaleDateString() : 'No definida'}</p>
            <p><strong>Mensajes Restantes:</strong> ${local.mensajesRestantes}</p>
            <p><strong>Horarios de Operación:</strong> ${local.horariosDeOperacion}</p>

            <div class="collapsible-section">
                <h3 onclick="toggleSection(this)">Información de Facturación</h3>
                <div class="collapsible-content">
                    <p><strong>CBU:</strong> ${local.facturacion.cbu || 'No definido'}</p>
                    <p><strong>Medio de Pago:</strong> ${local.facturacion.medioDePago || 'No definido'}</p>
                    <p><strong>Alias:</strong> ${local.facturacion.alias || 'No definido'}</p>
                </div>
            </div>

            <div class="collapsible-section">
                <h3 onclick="toggleSection(this)">Usuarios</h3>
                <div class="collapsible-content">
                    <ul>
                        ${local.usuarios.map(usuario => `<li>Email: ${usuario.email}, Permiso: ${usuario.permiso}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="collapsible-section">
                <h3 onclick="toggleSection(this)">Clientes</h3>
                <div class="collapsible-content">
                    <ul>
                        ${local.clientes.map(cliente => `
                            <li>Teléfono: ${cliente.from}
                                <div class="collapsible-section">
                                    <h4 onclick="toggleSection(this)">Historial de Pedidos</h4>
                                    <div class="collapsible-content">
                                        <ul>
                                            ${cliente.historialPedidos.map(pedido => `
                                                <li>Tag: ${pedido.tagNumber}, Fecha Pedido: ${pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString() : 'No definida'}, Estado: ${pedido.estadoPorBarra}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <div class="collapsible-section">
                <h3 onclick="toggleSection(this)">Reservas</h3>
                <div class="collapsible-content">
                    <ul>
                        ${local.reservas.map(reserva => `<li>Teléfono: ${reserva.from}, Solicitud de Baja: ${reserva.solicitudBaja}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="collapsible-section">
                <h3 onclick="toggleSection(this)">Pagos</h3>
                <div class="collapsible-content">
                    <ul>
                        ${local.pagos.map(pago => `
                            <li>Fecha: ${new Date(pago.fecha).toLocaleDateString()}, Monto: ${pago.monto}, Método: ${pago.metodo}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al obtener los detalles del local:', error);
    }
}


function toggleSection(element) {
    const content = element.nextElementSibling;
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        element.parentElement.classList.add("active");
    } else {
        content.style.display = "none";
        element.parentElement.classList.remove("active");
    }
}


// Función para mostrar y ocultar el formulario de alta de locales
function toggleForm() {
    const form = document.getElementById("alta-local");
    const toggleBtn = document.getElementById("toggleFormBtn");

    if (form.style.display === "none") {
        form.style.display = "block";
        toggleBtn.textContent = "Ocultar Formulario";
    } else {
        form.style.display = "none";
        toggleBtn.textContent = "Mostrar Formulario";
    }
}

// Función para manejar el envío del formulario de alta de nuevo local
async function handleFormSubmit(event) {
    event.preventDefault();  // Evitar el comportamiento por defecto del formulario

    const emailLocal = document.getElementById('emailLocal').value;
    const passwordLocal = document.getElementById('passwordLocal').value;
    const nombreLocal = document.getElementById('nombreLocal').value;

    const newLocalData = {
        email: emailLocal,
        password: passwordLocal,
        localName: nombreLocal
    };

    try {
        const response = await fetch(newLocalUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newLocalData)
        });

        if (response.ok) {
            console.log('Nuevo local agregado con éxito');
            cargarLocales();  // Recargar los locales para mostrar el nuevo
            document.getElementById("form-alta").reset();  // Limpiar el formulario
        } else {
            console.error('Error al agregar el nuevo local');
        }
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
    }
}

// Función para eliminar un local
async function eliminarLocal(localId) {
    try {
        const response = await fetch(`${deleteLocalUrl}/${localId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('Local eliminado con éxito');
            cargarLocales();  // Recargar los locales después de eliminar
        } else {
            console.error('Error al eliminar el local');
        }
    } catch (error) {
        console.error('Error al eliminar el local:', error);
    }
}

// Asignar la función de manejo de envío al formulario
document.getElementById('form-alta').addEventListener('submit', handleFormSubmit);

// Ejecutar la función cargarLocales cuando la página se carga
window.onload = cargarLocales;
