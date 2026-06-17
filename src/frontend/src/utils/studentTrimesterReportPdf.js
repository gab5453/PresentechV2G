import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { institutionConfig } from '../config/institution'

const BURGUNDY = [114, 47, 55]
const DARK_TEXT = [45, 45, 45]
const MUTED_TEXT = [100, 100, 100]

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

function formatShortDate(value) {
  return format(new Date(`${value}T00:00:00`), 'dd/MM/yyyy')
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

function drawFooter(doc, generatedAt) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageNumber = doc.internal.getCurrentPageInfo().pageNumber

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED_TEXT)
  doc.text('Sistema generado por PresenTech', 14, pageHeight - 9)
  doc.text(format(generatedAt, 'dd/MM/yyyy HH:mm'), pageWidth / 2, pageHeight - 9, {
    align: 'center',
  })
  doc.text(`Pagina ${pageNumber}`, pageWidth - 14, pageHeight - 9, { align: 'right' })
}

function summaryBlock(summary) {
  return [
    summary?.asistencias ?? 0,
    summary?.faltas ?? 0,
    summary?.parciales ?? 0,
  ]
}

function buildRows(report) {
  return report.materias.map((materia) => [
    materia.materia,
    ...summaryBlock(materia.periodo_1),
    ...summaryBlock(materia.periodo_2),
    ...summaryBlock(materia.periodo_3),
    ...summaryBlock(materia.total),
  ])
}

export async function createStudentTrimesterReportPdf(report) {
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
  drawFooter(doc, generatedAt)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...BURGUNDY)
  doc.text('REPORTE TRIMESTRAL DE ASISTENCIAS POR ESTUDIANTE', 14, 47)

  autoTable(doc, {
    startY: 53,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 1.5, textColor: DARK_TEXT },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30, textColor: BURGUNDY },
      2: { fontStyle: 'bold', cellWidth: 28, textColor: BURGUNDY },
    },
    body: [
      ['Estudiante', report.nombre_estudiante, 'Paralelo', report.paralelo],
      [
        'Anio lectivo',
        report.anio_lectivo,
        'Periodo',
        `${formatShortDate(report.fecha_inicio)} - ${formatShortDate(report.fecha_fin)}`,
      ],
    ],
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    margin: { top: 43, left: 14, right: 14, bottom: 20 },
    head: [[
      'Materia',
      'P1 Asist.',
      'P1 Faltas',
      'P1 Parc.',
      'P2 Asist.',
      'P2 Faltas',
      'P2 Parc.',
      'P3 Asist.',
      'P3 Faltas',
      'P3 Parc.',
      'Total Asist.',
      'Total Faltas',
      'Total Parc.',
    ]],
    body: buildRows(report),
    foot: [[
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      report.resumen.asistencias,
      report.resumen.faltas,
      report.resumen.parciales,
    ]],
    headStyles: {
      fillColor: BURGUNDY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    footStyles: {
      fillColor: [239, 232, 234],
      textColor: BURGUNDY,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [225, 225, 225],
      lineWidth: 0.2,
      textColor: DARK_TEXT,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [249, 247, 248] },
    didDrawPage: () => {
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
      if (pageNumber > 1) drawHeader(doc, logoData, generatedAt)
      drawFooter(doc, generatedAt)
    },
  })

  return doc
}

export function getStudentTrimesterReportFileName(report) {
  const normalizedName = report.nombre_estudiante
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  return `reporte-trimestral-${normalizedName}-${report.anio_lectivo}.pdf`
}
