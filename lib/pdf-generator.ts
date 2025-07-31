// Generador de PDF simplificado usando jsPDF
import jsPDF from "jspdf"

export const generateAttendanceReportPDF = (
  materia: any,
  profesor: any,
  reporteData: any[],
  fechaInicio: string,
  fechaFin: string,
  estadisticas: any,
) => {
  try {
    // Crear nuevo documento PDF en formato carta
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter", // 8.5" x 11" = 215.9mm x 279.4mm
    })

    // Colores institucionales AUNAR
    const colors = {
      navy: [45, 55, 72] as [number, number, number],
      gold: [246, 213, 92] as [number, number, number],
      lightNavy: [74, 85, 104] as [number, number, number],
      darkNavy: [26, 32, 44] as [number, number, number],
      green: [34, 84, 61] as [number, number, number],
      yellow: [116, 66, 16] as [number, number, number],
      red: [116, 42, 42] as [number, number, number],
      lightGray: [247, 250, 252] as [number, number, number],
      gray: [226, 232, 240] as [number, number, number],
    }

    let yPosition = 20

    // HEADER - Logo y títulos institucionales
    const drawHeader = () => {
      // Logo circular AUNAR
      doc.setFillColor(...colors.navy)
      doc.circle(107.5, yPosition + 10, 8, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("AUNAR", 107.5, yPosition + 12, { align: "center" })

      yPosition += 25

      // Título institucional
      doc.setTextColor(...colors.navy)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("UNIVERSIDAD AUTÓNOMA DE NARIÑO", 107.5, yPosition, { align: "center" })

      yPosition += 6
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Sistema de Gestión de Asistencia Académica", 107.5, yPosition, { align: "center" })

      yPosition += 8
      // Badge del título del reporte
      doc.setFillColor(...colors.gold)
      doc.roundedRect(70, yPosition - 3, 75, 8, 4, 4, "F")
      doc.setTextColor(...colors.navy)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("REPORTE DE ASISTENCIA", 107.5, yPosition + 2, { align: "center" })

      yPosition += 15

      // Línea separadora
      doc.setDrawColor(...colors.gold)
      doc.setLineWidth(1)
      doc.line(20, yPosition, 195, yPosition)
      yPosition += 10
    }

    // INFORMACIÓN DE LA MATERIA Y PROFESOR
    const drawInfo = () => {
      doc.setFillColor(...colors.lightGray)
      doc.rect(20, yPosition, 80, 25, "F")
      doc.rect(115, yPosition, 80, 25, "F")

      // Borde izquierdo dorado
      doc.setFillColor(...colors.gold)
      doc.rect(20, yPosition, 2, 25, "F")
      doc.rect(115, yPosition, 2, 25, "F")

      doc.setTextColor(...colors.navy)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")

      // Columna izquierda
      let leftY = yPosition + 6
      doc.text("Materia:", 25, leftY)
      doc.setFont("helvetica", "normal")
      doc.text(materia.nombre, 45, leftY)

      leftY += 6
      doc.setFont("helvetica", "bold")
      doc.text("Código:", 25, leftY)
      doc.setFont("helvetica", "normal")
      doc.text(materia.codigo, 45, leftY)

      leftY += 6
      doc.setFont("helvetica", "bold")
      doc.text("Profesor:", 25, leftY)
      doc.setFont("helvetica", "normal")
      doc.text(`${profesor.nombre} ${profesor.apellido}`, 45, leftY)

      // Columna derecha
      let rightY = yPosition + 6
      doc.setFont("helvetica", "bold")
      doc.text("Departamento:", 120, rightY)
      doc.setFont("helvetica", "normal")
      doc.text(profesor.departamento, 150, rightY)

      rightY += 6
      doc.setFont("helvetica", "bold")
      doc.text("Período:", 120, rightY)
      doc.setFont("helvetica", "normal")
      doc.text(`${fechaInicio} - ${fechaFin}`, 140, rightY)

      rightY += 6
      doc.setFont("helvetica", "bold")
      doc.text("Generado:", 120, rightY)
      doc.setFont("helvetica", "normal")
      doc.text(new Date().toLocaleDateString(), 145, rightY)

      yPosition += 35
    }

    // ESTADÍSTICAS
    const drawStats = () => {
      doc.setFillColor(...colors.lightGray)
      doc.rect(20, yPosition, 175, 30, "F")
      doc.setDrawColor(...colors.gray)
      doc.setLineWidth(0.5)
      doc.rect(20, yPosition, 175, 30)

      doc.setTextColor(...colors.navy)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("RESUMEN ESTADÍSTICO", 107.5, yPosition + 8, { align: "center" })

      // Tarjetas de estadísticas
      const cardWidth = 40
      const cardHeight = 15
      const startX = 25
      const cardY = yPosition + 12

      const stats = [
        {
          label: "Promedio\nGeneral",
          value: `${estadisticas.promedioAsistencia.toFixed(1)}%`,
          color: colors.navy,
        },
        {
          label: "Excelentes\n(≥80%)",
          value: estadisticas.estudiantesExcelentes.toString(),
          color: colors.green,
        },
        {
          label: "Regulares\n(60-79%)",
          value: estadisticas.estudiantesRegulares.toString(),
          color: colors.yellow,
        },
        {
          label: "Deficientes\n(<60%)",
          value: estadisticas.estudiantesDeficientes.toString(),
          color: colors.red,
        },
      ]

      stats.forEach((stat, index) => {
        const x = startX + index * 42

        // Fondo de la tarjeta
        doc.setFillColor(255, 255, 255)
        doc.rect(x, cardY, cardWidth, cardHeight, "F")
        doc.setDrawColor(...colors.gray)
        doc.rect(x, cardY, cardWidth, cardHeight)

        // Número
        doc.setTextColor(...stat.color)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(stat.value, x + cardWidth / 2, cardY + 8, { align: "center" })

        // Etiqueta
        doc.setTextColor(...colors.lightNavy)
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        const lines = stat.label.split("\n")
        lines.forEach((line, lineIndex) => {
          doc.text(line, x + cardWidth / 2, cardY + 12 + lineIndex * 3, { align: "center" })
        })
      })

      yPosition += 40
    }

    // TABLA DE ESTUDIANTES (versión simplificada sin autoTable)
    const drawTable = () => {
      doc.setTextColor(...colors.navy)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("DETALLE DE ASISTENCIA POR ESTUDIANTE", 20, yPosition)
      yPosition += 10

      // Encabezados de la tabla
      const headers = ["Cédula", "Nombre Completo", "Total", "Pres.", "Aus.", "Just.", "% Asist.", "Estado"]
      const colWidths = [25, 50, 15, 15, 15, 15, 20, 20]
      let xPos = 20

      // Dibujar encabezados
      doc.setFillColor(...colors.lightNavy)
      doc.rect(20, yPosition, 185, 8, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")

      headers.forEach((header, index) => {
        doc.text(header, xPos + colWidths[index] / 2, yPosition + 5, { align: "center" })
        xPos += colWidths[index]
      })

      yPosition += 8

      // Dibujar filas de datos
      doc.setTextColor(...colors.navy)
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")

      reporteData.forEach((item, rowIndex) => {
        const getBadgeText = (porcentaje: number) => {
          if (porcentaje >= 80) return "Excelente"
          if (porcentaje >= 60) return "Regular"
          return "Deficiente"
        }

        const getBadgeColor = (porcentaje: number): [number, number, number] => {
          if (porcentaje >= 80) return colors.green
          if (porcentaje >= 60) return colors.yellow
          return colors.red
        }

        // Alternar color de fondo
        if (rowIndex % 2 === 0) {
          doc.setFillColor(...colors.lightGray)
          doc.rect(20, yPosition, 185, 6, "F")
        }

        const rowData = [
          item.estudiante.cedula,
          item.estudiante.nombreCompleto,
          item.totalClases.toString(),
          item.presentes.toString(),
          item.ausentes.toString(),
          item.justificados.toString(),
          `${item.porcentajeAsistencia.toFixed(1)}%`,
          getBadgeText(item.porcentajeAsistencia)
        ]

        xPos = 20
        rowData.forEach((data, colIndex) => {
          if (colIndex === 6) { // Porcentaje
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...getBadgeColor(item.porcentajeAsistencia))
          } else if (colIndex === 7) { // Estado
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...getBadgeColor(item.porcentajeAsistencia))
          } else {
            doc.setFont("helvetica", "normal")
            doc.setTextColor(...colors.navy)
          }

          // Truncar texto si es muy largo
          let displayText = data || ""
          if (colIndex === 1 && displayText.length > 20) { // Nombre completo
            displayText = displayText.substring(0, 20) + "..."
          }

          doc.text(displayText, xPos + colWidths[colIndex] / 2, yPosition + 4, { align: "center" })
          xPos += colWidths[colIndex]
        })

        yPosition += 6

        // Verificar si necesitamos una nueva página
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
      })

      yPosition += 10
    }

    // FOOTER CON FIRMAS
    const drawFooter = () => {
      // Línea separadora
      doc.setDrawColor(...colors.gray)
      doc.setLineWidth(0.5)
      doc.line(20, yPosition, 195, yPosition)
      yPosition += 10

      // Espacios para firmas
      const signatureWidth = 50
      const signatureY = yPosition + 20

      // Tres columnas de firmas
      const signatures = [
        { title: `${profesor.nombre} ${profesor.apellido}`, subtitle: "Docente", x: 30 },
        { title: "Coordinador Académico", subtitle: "Departamento", x: 107.5 },
        { title: "Director de Programa", subtitle: "Visto Bueno", x: 165 },
      ]

      signatures.forEach((sig) => {
        // Línea para firma
        doc.setDrawColor(...colors.navy)
        doc.setLineWidth(0.5)
        doc.line(sig.x - 25, signatureY, sig.x + 25, signatureY)

        // Nombre y cargo
        doc.setTextColor(...colors.navy)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text(sig.title, sig.x, signatureY + 5, { align: "center" })

        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.text(sig.subtitle, sig.x, signatureY + 9, { align: "center" })
      })

      // Información institucional final
      yPosition = signatureY + 20
      doc.setTextColor(...colors.lightNavy)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("UNIVERSIDAD AUTÓNOMA DE NARIÑO", 107.5, yPosition, { align: "center" })

      yPosition += 4
      doc.setFont("helvetica", "normal")
      doc.text("Sistema de Gestión de Asistencia Académica", 107.5, yPosition, { align: "center" })

      yPosition += 4
      doc.text(
        `Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
        107.5,
        yPosition,
        { align: "center" },
      )

      yPosition += 4
      doc.setFont("helvetica", "italic")
      doc.text("Este reporte es válido únicamente con las firmas correspondientes", 107.5, yPosition, { align: "center" })
    }

    // Generar el documento
    drawHeader()
    drawInfo()
    drawStats()
    drawTable()
    drawFooter()

    // Descargar el PDF
    const fileName = `Reporte_Asistencia_${materia.codigo}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)

    // Mensaje de confirmación
    setTimeout(() => {
      alert(`✅ REPORTE PDF GENERADO EXITOSAMENTE

📄 Archivo: ${fileName}
📊 Estudiantes incluidos: ${reporteData.length}
📈 Promedio de asistencia: ${estadisticas.promedioAsistencia.toFixed(1)}%

El archivo PDF se ha descargado automáticamente y está listo para imprimir en papel tamaño carta.`)
    }, 500)

  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error al generar el reporte PDF. Por favor, intenta nuevamente.')
  }
}
