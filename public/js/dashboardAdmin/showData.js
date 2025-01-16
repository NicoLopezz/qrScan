// ========================== VARIABLES GLOBALES ==========================
let lavadosCargados = [];
let saldoCajaChica = 0

// ========================== EVENTOS PRINCIPALES ==========================
document.addEventListener("DOMContentLoaded", async () => {
    const adminId = getCookie('adminId');
    if (!adminId) {

        console.error('No se encontró el adminId en las cookies.');
        return;
    }

    // Obtener datos desde la API
    const userInfo = await fetchUserInfo2(adminId);

    if (userInfo && Array.isArray(userInfo)) {
        lavadosCargados = userInfo;
        displayUserInfo(userInfo);        // Mostrar el nombre del local y total de clientes
        mostrarClientesDelDia(userInfo);  // Mostrar clientes del día
        calcularTiempoPromedio(userInfo); // Calcular el tiempo promedio de lavado
        calcularCalificacionPromedio(userInfo); // Calcula la calificación promedio
        calcularServicioMasPedido(userInfo); // Calcula el servicio más pedido
        actualizarCajaChica();
        // displayClientList(lavadosCargados, handleClientClick); // Mostrar lavados
    } else {
        console.error("No se pudo obtener la información del usuario.");
    }
});

// ========================== FUNCIONES DE LA TARJETA ==========================
async function fetchUserInfo2(adminId) {
    try {
        const response = await fetch(`/api/admins/${adminId}/lavados`);
        if (!response.ok) throw new Error('Error al obtener la información del usuario.');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        return null;
    }
}


// Función para obtener información del local desde la API
async function fetchUserInfo(adminId) {
    try {
        const response = await fetch(`/api/locales/${encodeURIComponent(adminId)}`);

        if (!response.ok) {
            console.error('Error al obtener información del local:', response.statusText);
            return {};
        }

        return await response.json();
        displayUserInfo(adminId)
    } catch (error) {

        console.error('Error en la solicitud:', error);
        return {};
    }
}

// Función para obtener cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}



// Función para mostrar el nombre del local en el elemento correspondiente
function displayUserInfo(userInfo) {
    const localNameElement = document.getElementById("localName");
    if (localNameElement && userInfo.localName) {
        localNameElement.textContent = userInfo.localName;
    }
}

// Evento que se ejecuta al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    let userAdminId = getCookie('adminId');

    if (!userAdminId) {
        console.error('No se encontró el adminId en las cookies. El usuario debe iniciar sesión.');
        return;
    }

    userAdminId = decodeURIComponent(userAdminId);
    // console.log('adminId desde la cookie:', userAdminId);

    try {
        const userInfo = await fetchUserInfo(userAdminId);
        if (userInfo && userInfo.localName) {
            displayUserInfo(userInfo);
        } else {
            console.error('No se encontró el nombre del local.');
        }
    } catch (error) {
        console.error('Error al cargar la información del local:', error);
    }
});



function displayUserInfo(userInfo) {
    const localNameElement = document.getElementById("localName");
    const totalPedidosElem = document.getElementById('totalPedidos');

    if (Array.isArray(userInfo) && userInfo.length > 0) {
        const totalLavados = userInfo.length;

        if (localNameElement) {
            localNameElement.textContent = "Nombre del Local"; // Nombre estático o dinámico si existe
        }

        if (totalPedidosElem) {
            totalPedidosElem.textContent = totalLavados;
        }
    } else {
        console.warn('No hay datos de lavados en userInfo.');
        totalPedidosElem.textContent = '0';
    }
}

function mostrarClientesDelDia(lavados) {
    const clientCountElem = document.getElementById('clientCount');

    const hoy = new Date();
    const fechaActualLocal = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    const clientesDelDia = lavados.filter(lavado => {
        if (lavado.fechaDeAlta) {
            const fechaAlta = new Date(lavado.fechaDeAlta);
            const fechaAltaLocal = `${fechaAlta.getFullYear()}-${(fechaAlta.getMonth() + 1).toString().padStart(2, '0')}-${fechaAlta.getDate().toString().padStart(2, '0')}`;
            return fechaAltaLocal === fechaActualLocal;
        }
        return false;
    });
    if (clientCountElem) {
        clientCountElem.textContent = clientesDelDia.length;
    } else {
        console.warn('Elemento clientCount no encontrado en el DOM.');
    }
}

function calcularServicioMasPedido(lavados) {
    const servicioElem = document.getElementById('ServicioMasPedido');

    if (!Array.isArray(lavados) || lavados.length === 0) {
        console.warn('No hay lavados disponibles para calcular el servicio más pedido.');
        servicioElem.textContent = 'N/A';
        return;
    }

    // Contador de tipos de lavado
    const contadorServicios = lavados.reduce((contador, lavado) => {
        const tipo = lavado.tipoDeLavado || 'Desconocido';
        contador[tipo] = (contador[tipo] || 0) + 1;
        return contador;
    }, {});

    // Encontrar el tipo de lavado con mayor frecuencia
    const servicioMasPedido = Object.keys(contadorServicios).reduce((max, tipo) => {
        return contadorServicios[tipo] > contadorServicios[max] ? tipo : max;
    }, Object.keys(contadorServicios)[0]);
    // Actualizar el elemento en el DOM
    if (servicioElem) {
        servicioElem.textContent = servicioMasPedido;
    } else {
        console.warn('Elemento con id="ServicioMasPedido" no encontrado.');
    }
}


async function actualizarCajaChica() {

    // console.log("EJECUNTADO LA FUNCION PARA LAS CARDS!!")
    try {
      // Realizar el fetch al endpoint de balances
      const response = await fetch("http://localhost:3000/api/arqueosBalances?cajaTipo=CajaChica");
      const data = await response.json();
  
      if (data.success) {
        // Obtener los balances de efectivo y mercado-pago
        const efectivo = data.data.efectivo;
        const mercadoPago = data.data.mercadoPago;
  
        // Calcular el monto a reflejar: balance actual - saldo inicial
        const montoEfectivo = efectivo.balanceActual - efectivo.saldoInicial;
        const montoMercadoPago = mercadoPago.balanceActual - mercadoPago.saldoInicial;
  
        // Actualizar los elementos HTML
        document.getElementById("cajaChicaActualEfectivo").textContent = `$${montoEfectivo.toLocaleString()}`;
        document.getElementById("cajaChicaActualMp").textContent = `$${montoMercadoPago.toLocaleString()}`;
      } else {
        console.error("Error al obtener los balances:", data.message);
      }
    } catch (error) {
      console.error("Error al realizar el fetch:", error);
    }
  }
  
  // Llamar a la función para actualizar los valores al cargar la página
  document.addEventListener("DOMContentLoaded", actualizarCajaChica);
  












function displayUserInfo(userInfo) {
    const localNameElement = document.getElementById("localName");
    const totalPedidosElem = document.getElementById('totalPedidos');

    if (Array.isArray(userInfo) && userInfo.length > 0) {
        const totalLavados = userInfo.length;

        if (localNameElement) {
            localNameElement.textContent = "Nombre del Local"; // Nombre estático o dinámico si existe
        }

        if (totalPedidosElem) {
            totalPedidosElem.textContent = totalLavados;
        }
    } else {
        console.warn('No hay datos de lavados en userInfo.');
        totalPedidosElem.textContent = '0';
    }
}

function mostrarClientesDelDia(lavados) {
    const clientCountElem = document.getElementById('clientCount');

    const hoy = new Date();
    const fechaActualLocal = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    const clientesDelDia = lavados.filter(lavado => {
        if (lavado.fechaDeAlta) {
            const fechaAlta = new Date(lavado.fechaDeAlta);
            const fechaAltaLocal = `${fechaAlta.getFullYear()}-${(fechaAlta.getMonth() + 1).toString().padStart(2, '0')}-${fechaAlta.getDate().toString().padStart(2, '0')}`;
            return fechaAltaLocal === fechaActualLocal;
        }
        return false;
    });
    if (clientCountElem) {
        clientCountElem.textContent = clientesDelDia.length;
    } else {
        console.warn('Elemento clientCount no encontrado en el DOM.');
    }
}

function calcularServicioMasPedido(lavados) {
    const servicioElem = document.getElementById('ServicioMasPedido');

    if (!Array.isArray(lavados) || lavados.length === 0) {
        console.warn('No hay lavados disponibles para calcular el servicio más pedido.');
        servicioElem.textContent = 'N/A';
        return;
    }

    // Contador de tipos de lavado
    const contadorServicios = lavados.reduce((contador, lavado) => {
        const tipo = lavado.tipoDeLavado || 'Desconocido';
        contador[tipo] = (contador[tipo] || 0) + 1;
        return contador;
    }, {});

    // Encontrar el tipo de lavado con mayor frecuencia
    const servicioMasPedido = Object.keys(contadorServicios).reduce((max, tipo) => {
        return contadorServicios[tipo] > contadorServicios[max] ? tipo : max;
    }, Object.keys(contadorServicios)[0]);
    // Actualizar el elemento en el DOM
    if (servicioElem) {
        servicioElem.textContent = servicioMasPedido;
    } else {
        console.warn('Elemento con id="ServicioMasPedido" no encontrado.');
    }
}

function calcularTiempoPromedio(lavados) {
    const tiempoLavadoElem = document.getElementById('tiempoPromedio');

    if (!Array.isArray(lavados) || lavados.length === 0) {
        console.warn('No hay lavados disponibles para calcular el tiempo promedio.');
        tiempoLavadoElem.textContent = '0"0\'';
        return;
    }

    // Sumar todos los tiempos de espera del historial de lavados
    const totalTiempo = lavados.reduce((total, lavado) => {
        if (lavado.historialLavados && Array.isArray(lavado.historialLavados)) {
            const tiempoPorHistorial = lavado.historialLavados.reduce((acc, historial) => {
                return acc + (historial.tiempoEspera || 0);
            }, 0);
            return total + tiempoPorHistorial;
        }
        return total;
    }, 0);

    // Calcular el promedio
    const promedioTiempo = Math.floor(totalTiempo / lavados.length);

    // Convertir el tiempo en formato horas"minutos'
    const horas = Math.floor(promedioTiempo / 60);
    const minutos = promedioTiempo % 60;

    // Mostrar el tiempo promedio en el formato correcto
    const tiempoFormateado = `${horas}"${minutos}'`;
    if (tiempoLavadoElem) {
        tiempoLavadoElem.textContent = tiempoFormateado;
    } else {
        console.warn('Elemento con id="tiempoPromedio" no encontrado.');
    }
}

function calcularCalificacionPromedio(lavados) {
    const calificacionElem = document.getElementById('calificacionPromedio');

    if (!Array.isArray(lavados) || lavados.length === 0) {
        console.warn('No hay lavados disponibles para calcular la calificación promedio.');
        calificacionElem.textContent = 'N/A';
        return;
    }

    // Sumar todas las puntuaciones de calidad
    const totalPuntuacion = lavados.reduce((total, lavado) => {
        return total + (lavado.puntuacionCalidad || 0);
    }, 0);
    // Calcular el promedio
    const promedioPuntuacion = (totalPuntuacion / lavados.length).toFixed(1); // Redondear a un decimal
    // Actualizar el elemento en el DOM
    if (calificacionElem) {
        calificacionElem.textContent = promedioPuntuacion;
    } else {
        console.warn('Elemento con id="calificacionPromedio" no encontrado.');
    }
}
