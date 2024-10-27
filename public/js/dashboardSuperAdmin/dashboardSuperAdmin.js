const apiUrl = '/api/locales';  // Ruta para obtener los locales
const newLocalUrl = 'api/newLocal';  // Ruta para agregar un nuevo local
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

// Función para mostrar los detalles del local seleccionado
async function mostrarDetalles(localId) {
    try {
        console.log(`Obteniendo detalles para el local con ID: ${localId}`);  // Verificar que el ID está siendo pasado correctamente
        const response = await fetch(`/api/locales/${localId}`);  // Llamada a la API para obtener los detalles
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        const local = await response.json();
    
        // Mostrar los detalles del local en un modal o en un contenedor en la página
        const detallesContainer = document.getElementById("detalles-container");
        detallesContainer.innerHTML = `
            <h2>${local.localName}</h2>
            <p>Email: ${local.email}</p>
            <p>Permiso: ${local.permiso}</p>
            <p>Fecha de Alta: ${new Date(local.fechaDeAlta).toLocaleDateString()}</p>
            <p>Usuarios: ${local.usuarios.length}</p>
            <p>Clientes: ${local.clientes.length}</p>
            <p>Pagos: ${local.pagos.length}</p>
        `;
    } catch (error) {
        console.error('Error al obtener los detalles del local:', error);
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
        const response = await fetch('/api/newLocal', {
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
