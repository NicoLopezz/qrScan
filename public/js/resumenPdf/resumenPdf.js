let movimientosGlobales = []; // Variable global para guardar movimientos


async function cargarMovimientos(
    cajaTipo,
    arqueoId,
    currentArqueoSaldoIncial,
    currentArqueoSaldoSistema,
    currentArqueoDiferencia,
    currentArqueoObservacion,
    currentArqueoCierre,
    currentArqueoApertura,
    currentArqueoReal) {



    console.log("Valores de las variables:");
    console.log("cajaTipo:", cajaTipo);
    console.log("arqueoId:", arqueoId);
    console.log("currentArqueoSaldoIncial:", currentArqueoSaldoIncial);
    console.log("currentArqueoSaldoSistema:", currentArqueoSaldoSistema);
    console.log("currentArqueoDiferencia:", currentArqueoDiferencia);
    console.log("currentArqueoObservacion:", currentArqueoObservacion);
    console.log("currentArqueoCierre:", currentArqueoCierre);
    console.log("currentArqueoApertura:", currentArqueoApertura);
    console.log("currentArqueoReal:", currentArqueoReal);


    try {
        const response = await fetch(`/api/movimientos?cajaTipo=${cajaTipo}&arqueoId=${arqueoId}`);
        const data = await response.json();

        if (!data.success) {
            console.error("Error al cargar movimientos:", data.message);
            return;
        }

        const movimientos = data.data;
        console.log("Movimientos cargados:", movimientos);

        const saldoInicial = currentArqueoSaldoIncial;
        let totalSistema = currentArqueoSaldoSistema;

        movimientos.forEach(mov => {
            totalSistema += mov.tipo === "Ingreso" ? mov.monto : -mov.monto;
        });

        const diferencia = currentArqueoDiferencia
        abrirVistaPrevia
            (movimientos,
                saldoInicial,
                totalSistema,
                diferencia,
                currentArqueoDiferencia,
                currentArqueoObservacion,
                currentArqueoCierre,
                currentArqueoApertura,
                currentArqueoReal
            );
    } catch (error) {
        console.error("Error al cargar movimientos:", error);
    }
}

async function abrirVistaPrevia(
    movimientos,
    saldoInicial,
    totalSistema,
    diferencia,
    currentArqueoDiferencia,
    currentArqueoObservacion,
    currentArqueoCierre,
    currentArqueoApertura,
    currentArqueoReal
) {
    const response = await fetch('/pages/resumen-arqueo.html');
    const plantillaHTML = await response.text();

    // Crear una nueva ventana
    const nuevaVentana = window.open("", "_blank");
    if (!nuevaVentana) {
        console.error("Error: El navegador bloqueó la apertura de la ventana.");
        return;
    }

    // Insertar el HTML dinámico
    const template = document.createElement('div');
    template.innerHTML = plantillaHTML;

    // Formatear fecha en el formato "DD-MM-YY HH:mm"
    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const dia = fecha.getDate().toString().padStart(2, "0");
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0"); // Los meses empiezan desde 0
        const anio = fecha.getFullYear().toString().slice(-2); // Obtener los últimos 2 dígitos del año
        const horas = fecha.getHours().toString().padStart(2, "0");
        const minutos = fecha.getMinutes().toString().padStart(2, "0");

        return `${dia}-${mes}-${anio} ${horas}:${minutos}`;
    }

    // Insertar fechas formateadas
    template.querySelector("#hora-apertura").textContent += ` ${formatearFecha(currentArqueoApertura)}`;
    template.querySelector("#hora-cierre").textContent += ` ${formatearFecha(currentArqueoCierre)}`; 
    template.querySelector("#saldo-inicial").textContent += ` $${saldoInicial}`;
    template.querySelector("#total-sistema").textContent = `$${totalSistema}`;
    template.querySelector("#saldo-final").textContent += ` $${diferencia}`;
    template.querySelector("#saldo-usuario").textContent += ` $${currentArqueoReal}`;
    template.querySelector("#observacion-usuario").textContent += ` ${currentArqueoObservacion}`;

    // Calcular totales de ingresos y egresos
    let totalIngresos = 0;
    let totalEgresos = 0;

    movimientos.forEach(mov => {
        if (mov.tipo.toLowerCase() === "ingreso") {
            totalIngresos += mov.monto;
        } else if (mov.tipo.toLowerCase() === "egreso") {
            totalEgresos += mov.monto;
        }
    });

    // Completar la tabla-arqueo
    template.querySelector("#total-ingresos").textContent = `$${totalIngresos.toFixed(2)}`;
    template.querySelector("#total-egresos").textContent = `$${totalEgresos.toFixed(2)}`;
    template.querySelector("#total-sistema").textContent = `$${(totalIngresos - totalEgresos + saldoInicial).toFixed(2)}`;

    // Completar la tabla de movimientos
    const tablaMovimientos = template.querySelector("#tabla-movimientos-body");
    if (!tablaMovimientos) {
        console.error("Error: No se encontró la tabla de movimientos en la plantilla.");
        return;
    }

    let parcialAcumulado = 0; // Variable para calcular el subtotal acumulado

    movimientos.forEach(mov => {
        const ingreso = mov.tipo.toLowerCase() === "ingreso" ? mov.monto : 0;
        const egreso = mov.tipo.toLowerCase() === "egreso" ? mov.monto : 0;
        parcialAcumulado += ingreso - egreso;

        // Crear fila con los datos procesados
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${new Date(mov.fecha).toLocaleString()}</td>
            <td>${mov.descripcion}</td>
            <td>${ingreso > 0 ? `$${ingreso.toFixed(2)}` : "—"}</td>
            <td>${egreso > 0 ? `$${egreso.toFixed(2)}` : "—"}</td>
            <td>$${parcialAcumulado.toFixed(2)}</td>
        `;
        tablaMovimientos.appendChild(fila);
    });

    // Generar el contenido dinámico en la nueva ventana
    nuevaVentana.document.open();
    nuevaVentana.document.write(`
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vista Previa de Arqueo</title>
    <link rel="stylesheet" href="/style/resumenPDF/resumenPDF.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  </head>
  <body>
    ${template.innerHTML}
    <button id="descargarPDF">Descargar PDF</button>
    <script>
      // Configurar el evento para descargar el PDF llamando a generarPDFDesdePlantilla
      const movimientos = ${JSON.stringify(movimientos)};
      const saldoInicial = ${saldoInicial};
      const totalSistema = ${totalSistema};
      const diferencia = ${diferencia};

      document.getElementById("descargarPDF").addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        const template = document.body;

        doc.html(template, {
          callback: function (doc) {
            doc.save('resumen-arqueo.pdf');
          },
          x: 5,
          y: 10,
          html2canvas: {
            scale: 0.2, // Ajustar escala para usar más espacio
          },
        });
      });
    </script>
  </body>
  </html>
`);
    nuevaVentana.document.close();
}







