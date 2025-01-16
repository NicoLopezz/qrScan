async function cargarMovimientos(cajaTipo, arqueoId) {
    try {
      const response = await fetch(`/movimientos?cajaTipo=${cajaTipo}&arqueoId=${arqueoId}`);
      const data = await response.json();
  
      if (!data.success) {
        console.error("Error al cargar movimientos:", data.message);
        return;
      }
  
      const movimientos = data.data;
      const tbody = document.querySelector(".tabla-movimientos tbody");
      const tfoot = document.querySelector(".tabla-movimientos tfoot");
  
      // Limpiar la tabla antes de cargar nuevos movimientos
      tbody.innerHTML = "";
  
      let saldoInicial = 140000; // Este saldo podría venir de otra consulta
      let subtotalParcial = saldoInicial;
  
      movimientos.forEach(mov => {
        // Calcular subtotales
        if (mov.tipo === "Ingreso") {
          subtotalParcial += mov.monto;
        } else if (mov.tipo === "Egreso") {
          subtotalParcial -= mov.monto;
        }
  
        // Insertar fila en la tabla
        const fila = `
          <tr>
            <td>${new Date(mov.fecha).toLocaleString()}</td>
            <td>${mov.tipo}</td>
            <td>${mov.tipo === "Ingreso" ? `$${mov.monto.toFixed(2)}` : "—"}</td>
            <td>${mov.tipo === "Egreso" ? `$${mov.monto.toFixed(2)}` : "—"}</td>
            <td>$${subtotalParcial.toFixed(2)}</td>
            <td>${mov.medioPago}</td>
            <td>${mov.descripcion}</td>
          </tr>
        `;
        tbody.innerHTML += fila;
      });
  
      // Actualizar el total del sistema
      tfoot.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: right;"><strong>Total Sistema:</strong></td>
          <td><strong>$${subtotalParcial.toFixed(2)}</strong></td>
          <td colspan="2"></td>
        </tr>
      `;
  
      // Agregar lógica para descargar PDF
      const downloadPdfButton = document.getElementById("downloadPdfButton");
      if (downloadPdfButton) {
        downloadPdfButton.addEventListener("click", () => {
          generarPDF(movimientos, saldoInicial, subtotalParcial);
        });
      }
  
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    }
  }

  function generarPDF(movimientos, saldoInicial, subtotalParcial) {
    const { jsPDF } = window.jspdf; // Asegúrate de tener jsPDF cargado en tu proyecto
    const doc = new jsPDF();
  
    // Título
    doc.setFontSize(16);
    doc.text("Resumen de Arqueo", 10, 10);
    doc.setFontSize(12);
    doc.text(`Saldo Inicial: $${saldoInicial.toFixed(2)}`, 10, 20);
  
    // Tabla
    const tableData = movimientos.map(mov => ([
      new Date(mov.fecha).toLocaleString(),
      mov.tipo,
      mov.tipo === "Ingreso" ? `$${mov.monto.toFixed(2)}` : "—",
      mov.tipo === "Egreso" ? `$${mov.monto.toFixed(2)}` : "—",
      `$${subtotalParcial.toFixed(2)}`,
      mov.medioPago,
      mov.descripcion
    ]));
  
    const tableHeaders = ["Fecha", "Tipo", "Ingreso", "Egreso", "Subtotal", "Medio de Pago", "Descripción"];
  
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10 },
    });
  
    // Total final
    doc.setFontSize(12);
    doc.text(`Total Sistema: $${subtotalParcial.toFixed(2)}`, 10, doc.previousAutoTable.finalY + 10);
  
    // Guardar PDF
    doc.save("resumen-arqueo.pdf");
  }
  
  