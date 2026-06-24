import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { institutionConfig } from '../config/institution'

const BURGUNDY = [114, 47, 55]
const DARK_TEXT = [45, 45, 45]
const MUTED_TEXT = [100, 100, 100]
const TOTAL_PAGES_TOKEN = '{total_pages_count_string}'

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function loadImageData(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('No se pudo cargar el logo institucional.')
  return readBlobAsDataUrl(await response.blob())
}

function formatLongDate(value = new Date()) {
  return format(value, "d 'de' MMMM 'de' yyyy", { locale: es })
}

function formatDateTime(value = new Date()) {
  return format(value, "dd/MM/yyyy HH:mm", { locale: es })
}

function formatPeriod(report) {
  return `${format(new Date(`${report.fecha_inicio}T00:00:00`), 'dd/MM/yyyy')} - ${format(
    new Date(`${report.fecha_fin}T00:00:00`),
    'dd/MM/yyyy',
  )}`
}

function drawHeader(doc, logoData, generatedAt) {
  const pageWidth = doc.internal.pageSize.getWidth()

  if (logoData) {
    doc.addImage(logoData, 'PNG', 14, 10, 56, 22, undefined, 'FAST')
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...DARK_TEXT)
  doc.text(institutionConfig.name.toUpperCase(), pageWidth / 2, 18, {
    align: 'center',
    maxWidth: 92,
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED_TEXT)
  const dateLabel = institutionConfig.city
    ? `${institutionConfig.city}, ${formatLongDate(generatedAt)}`
    : formatLongDate(generatedAt)
  doc.text(dateLabel, pageWidth - 14, 29, { align: 'right' })

  doc.setDrawColor(...BURGUNDY)
  doc.setLineWidth(0.8)
  doc.line(14, 36, pageWidth - 14, 36)
}

function drawFooter(doc, generatedAt, pageNumber) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED_TEXT)
  doc.text('Sistema generado por PresentTech', 14, pageHeight - 9)
  doc.text(formatDateTime(generatedAt), pageWidth / 2, pageHeight - 9, {
    align: 'center',
  })
  doc.text(
    `Página ${pageNumber} de ${TOTAL_PAGES_TOKEN}`,
    pageWidth - 14,
    pageHeight - 9,
    { align: 'right' },
  )
}

function drawGeneralInformation(doc, report, generatedAt) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...BURGUNDY)
  doc.text('REPORTE DE CALIFICACIONES', 14, 47)

  doc.setFontSize(10)
  doc.setTextColor(...DARK_TEXT)
  doc.text('Información general', 14, 56)

  autoTable(doc, {
    startY: 59,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 1.6, textColor: DARK_TEXT },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32, textColor: BURGUNDY },
      2: { fontStyle: 'bold', cellWidth: 28, textColor: BURGUNDY },
    },
    body: [
      ['Institución', institutionConfig.name, 'Curso', report.curso],
      ['Docente', report.docente, 'Período', formatPeriod(report)],
      ['Generado', formatDateTime(generatedAt), '', ''],
    ],
  })
}

export async function createReportCalificacionesPdf(report) {
  const generatedAt = new Date()
  let logoData = null

  try {
    logoData = await loadImageData(institutionConfig.logoUrl)
  } catch {
    logoData = null
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  drawHeader(doc, logoData, generatedAt)
  drawGeneralInformation(doc, report, generatedAt)

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    margin: { top: 43, right: 14, bottom: 20, left: 14 },
    head: [['Estudiante', 'Curso', 'Promedio Parcial', 'Promedio Final', 'Estado']],
    body: report.estudiantes.map((student) => [
      student.nombre_estudiante,
      student.curso,
      student.promedio_parcial.toFixed(2),
      student.promedio_final.toFixed(2),
      student.estado,
    ]),
    headStyles: {
      fillColor: BURGUNDY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      lineColor: [225, 225, 225],
      lineWidth: 0.2,
      textColor: DARK_TEXT,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 70 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    alternateRowStyles: { fillColor: [249, 247, 248] },
    didDrawPage: () => {
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
      if (pageNumber > 1) drawHeader(doc, logoData, generatedAt)
      drawFooter(doc, generatedAt, pageNumber)
    },
  })

  let currentY = doc.lastAutoTable.finalY + 8
  const pageHeight = doc.internal.pageSize.getHeight()
  if (currentY > pageHeight - 62) {
    doc.addPage()
    drawHeader(doc, logoData, generatedAt)
    drawFooter(doc, generatedAt, doc.internal.getNumberOfPages())
    currentY = 46
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...DARK_TEXT)
  doc.text('Resumen estadístico', 14, currentY)

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 14, right: 14, bottom: 20 },
    theme: 'grid',
    head: [['Total estudiantes', 'Promedio Curso', 'Aprobados', 'En Riesgo', 'Reprobados']],
    body: [[
      report.resumen.total_estudiantes,
      report.resumen.promedio_curso.toFixed(2),
      report.resumen.aprobados,
      report.resumen.en_riesgo,
      report.resumen.reprobados,
    ]],
    headStyles: { fillColor: [239, 232, 234], textColor: BURGUNDY },
    styles: { halign: 'center', fontSize: 9, cellPadding: 2.4 },
  })

  const alerts = report.alertas.length
    ? report.alertas.map((alert) => `${alert.nombre_estudiante}: ${alert.mensaje}`)
    : ['No se identificaron alertas de riesgo ni reprobados.']

  currentY = doc.lastAutoTable.finalY + 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...DARK_TEXT)
  doc.text('Alertas', 14, currentY)

  autoTable(doc, {
    startY: currentY + 3,
    margin: { top: 43, left: 14, right: 14, bottom: 20 },
    theme: 'plain',
    body: alerts.map((alert) => [`• ${alert}`]),
    styles: {
      fontSize: 9,
      cellPadding: 1.5,
      textColor: MUTED_TEXT,
    },
    didDrawPage: () => {
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
      if (pageNumber > 1) drawHeader(doc, logoData, generatedAt)
      drawFooter(doc, generatedAt, pageNumber)
    },
  })

  doc.putTotalPages(TOTAL_PAGES_TOKEN)
  return doc
}

export function getReportFileName(report) {
  const normalizedCourse = report.curso
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `reporte-calificaciones-${normalizedCourse}-${report.fecha_inicio}-${report.fecha_fin}.pdf`
}
