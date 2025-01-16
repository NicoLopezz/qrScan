let movimientosGlobales = []; // Variable global para guardar movimientos

async function cargarMovimientos(cajaTipo, arqueoId) {
    try {
        const response = await fetch(`/api/movimientos?cajaTipo=${cajaTipo}&arqueoId=${arqueoId}`);
        const data = await response.json();

        if (!data.success) {
            console.error("Error al cargar movimientos:", data.message);
            return;
        }

        const movimientos = data.data;
        console.log("Movimientos cargados:", movimientos);

        const saldoInicial = 140000;
        let totalSistema = saldoInicial;

        movimientos.forEach(mov => {
            totalSistema += mov.tipo === "Ingreso" ? mov.monto : -mov.monto;
        });

        const diferencia = totalSistema - saldoInicial;
        abrirVistaPrevia(movimientos, saldoInicial, totalSistema, diferencia);
    } catch (error) {
        console.error("Error al cargar movimientos:", error);
    }
}

async function abrirVistaPrevia(movimientos, saldoInicial, totalSistema, diferencia) {
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

    // Insertar datos dinámicos
    template.querySelector("#saldo-inicial").textContent = `$${saldoInicial.toFixed(2)}`;
    template.querySelector("#total-sistema").textContent = `$${totalSistema.toFixed(2)}`;
    template.querySelector("#diferencia").textContent = `$${diferencia.toFixed(2)}`;

    const tablaMovimientos = template.querySelector("#tabla-movimientos-body");
    if (!tablaMovimientos) {
        console.error("Error: No se encontró la tabla de movimientos en la plantilla.");
        return;
    }

    movimientos.forEach(mov => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
        <td>${new Date(mov.fecha).toLocaleString()}</td>
        <td>${mov.tipo}</td>
        <td>${mov.tipo === "Ingreso" ? `$${mov.monto.toFixed(2)}` : "—"}</td>
        <td>${mov.tipo === "Egreso" ? `$${mov.monto.toFixed(2)}` : "—"}</td>
        <td>${mov.medioPago}</td>
        <td>${mov.descripcion}</td>
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
      document.getElementById("descargarPDF").addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Tomar el contenido actual del body de la ventana
        const content = document.body;

        // Generar PDF
        doc.html(content, {
          callback: function (doc) {
            doc.save('resumen-arqueo.pdf');
          },
          x: 10,
          y: 10
        });
      });
    </script>
  </body>
  </html>
`);
    nuevaVentana.document.close();
}



async function generarPDFDesdePlantilla(movimientos, saldoInicial, totalSistema, diferencia) {
    const { jsPDF } = window.jspdf;

    if (!Array.isArray(movimientos)) {
        console.error("Error: 'movimientos' no es un array válido o está vacío.");
        return;
    }

    console.log("DENTRO DE LA FUNCIÓN generarPDFDesdePlantilla:");
    console.log(movimientos);

    try {
        const response = await fetch('/pages/resumen-arqueo.html');
        const plantillaHTML = await response.text();

        const template = document.createElement('div');
        template.innerHTML = plantillaHTML;

        // Rellenar los datos
        template.querySelector("#saldo-inicial").textContent = `$${saldoInicial.toFixed(2)}`;
        template.querySelector("#total-sistema").textContent = `$${totalSistema.toFixed(2)}`;
        template.querySelector("#diferencia").textContent = `$${diferencia.toFixed(2)}`;

        const tablaMovimientos = template.querySelector("#tabla-movimientos-body"); // Selector corregido
        if (!tablaMovimientos) {
            console.error("Error: No se encontró la tabla de movimientos en la plantilla.");
            return;
        }

        movimientos.forEach(mov => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
          <td>${new Date(mov.fecha).toLocaleString()}</td>
          <td>${mov.tipo}</td>
          <td>${mov.tipo === "Ingreso" ? `$${mov.monto.toFixed(2)}` : "—"}</td>
          <td>${mov.tipo === "Egreso" ? `$${mov.monto.toFixed(2)}` : "—"}</td>
          <td>${mov.medioPago}</td>
          <td>${mov.descripcion}</td>
        `;
            tablaMovimientos.appendChild(fila);
        });

        const doc = new jsPDF();
        doc.html(template, {
            callback: function (doc) {
                doc.save('resumen-arqueo.pdf');
            },
            x: 10,
            y: 10
        });
    } catch (error) {
        console.error("Error al generar el PDF:", error);
    }
}






