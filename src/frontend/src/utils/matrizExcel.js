import * as XLSX from 'xlsx-js-style'

const CHECK = '✓'

const monthColors = [
  'A6A6A6',
  '6FA8DC',
  'A6A6A6',
  '6FA8DC',
  'D996D6',
  'D996D6',
  'A6A6A6',
  '6FA8DC',
  'A6A6A6',
  '6FA8DC',
]

const borderThin = {
  top: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
}

const headerStyle = {
  font: { bold: true, sz: 14, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: borderThin,
}

const dayHeaderStyle = {
  font: { bold: true, sz: 8, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: borderThin,
}

const bodyStyle = {
  font: { sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: 'D9D9D9' } },
    right: { style: 'thin', color: { rgb: 'D9D9D9' } },
    bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
    left: { style: 'thin', color: { rgb: 'D9D9D9' } },
  },
}

const emptyStyle = {
  border: {
    top: { style: 'thin', color: { rgb: 'D9D9D9' } },
    right: { style: 'thin', color: { rgb: 'D9D9D9' } },
    bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
    left: { style: 'thin', color: { rgb: 'D9D9D9' } },
  },
}

function getMonthGroups(days) {
  const groups = []

  days.forEach((day, index) => {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup?.month === day.mes) {
      lastGroup.count += 1
    } else {
      groups.push({ month: day.mes, startIndex: index, count: 1 })
    }
  })

  return groups
}

function getStatusValue(status) {
  if (status === 'P') return CHECK
  if (status === 'X') return 'X'
  if (status === '-') return '-'
  return ''
}

function buildRows(matriz) {
  const totalJustificadasColumn = 2 + matriz.dias.length
  const totalInjustificadasColumn = totalJustificadasColumn + 1
  const columnCount = totalInjustificadasColumn + 1

  const rows = [
    Array.from({ length: columnCount }, () => ''),
    Array.from({ length: columnCount }, () => ''),
    Array.from({ length: columnCount }, () => ''),
  ]

  rows[0][0] = 'No'
  rows[0][1] = 'Nombre del Alumno'

  getMonthGroups(matriz.dias).forEach((group) => {
    rows[0][2 + group.startIndex] = `Mes: ${group.month}`
  })

  matriz.dias.forEach((day, index) => {
    rows[1][2 + index] = day.dia_mes
    rows[2][2 + index] = day.inicial_dia
  })

  rows[0][totalJustificadasColumn] = 'TOTAL FALTAS'
  rows[1][totalJustificadasColumn] = 'FALTAS JUSTIFICADAS'
  rows[1][totalInjustificadasColumn] = 'FALTAS INJUSTIFICADAS'

  matriz.estudiantes.forEach((student) => {
    const row = Array.from({ length: columnCount }, () => '')
    row[0] = student.numero
    row[1] = student.nombre_estudiante

    matriz.dias.forEach((day, index) => {
      row[2 + index] = getStatusValue(student.estados_por_fecha?.[day.fecha] ?? '')
    })

    row[totalJustificadasColumn] = 0
    row[totalInjustificadasColumn] = student.total_faltas ?? 0
    rows.push(row)
  })

  return rows
}

function buildMerges(matriz) {
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } },
  ]

  getMonthGroups(matriz.dias).forEach((group) => {
    merges.push({
      s: { r: 0, c: 2 + group.startIndex },
      e: { r: 0, c: 2 + group.startIndex + group.count - 1 },
    })
  })

  const totalStart = 2 + matriz.dias.length
  merges.push({ s: { r: 0, c: totalStart }, e: { r: 0, c: totalStart + 1 } })
  merges.push({ s: { r: 1, c: totalStart }, e: { r: 2, c: totalStart } })
  merges.push({ s: { r: 1, c: totalStart + 1 }, e: { r: 2, c: totalStart + 1 } })

  return merges
}

function setSheetMetadata(sheet, matriz) {
  sheet['!merges'] = buildMerges(matriz)
  sheet['!cols'] = [
    { wch: 5 },
    { wch: 42 },
    ...matriz.dias.map(() => ({ wch: 3 })),
    { wch: 19 },
    { wch: 21 },
  ]
  sheet['!rows'] = [
    { hpt: 24 },
    { hpt: 16 },
    { hpt: 16 },
    ...matriz.estudiantes.map(() => ({ hpt: 15 })),
  ]
  sheet['!freeze'] = { xSplit: 2, ySplit: 3 }
}

function styleCell(sheet, row, col, style) {
  const address = XLSX.utils.encode_cell({ r: row, c: col })
  if (!sheet[address]) sheet[address] = { t: 's', v: '' }
  sheet[address].s = style
}

function applyStyles(sheet, matriz) {
  const range = XLSX.utils.decode_range(sheet['!ref'])
  const totalStart = 2 + matriz.dias.length

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      styleCell(sheet, row, col, row <= 2 ? dayHeaderStyle : bodyStyle)
    }
  }

  styleCell(sheet, 0, 0, { ...headerStyle, font: { bold: true, sz: 13 } })
  styleCell(sheet, 0, 1, { ...headerStyle, font: { bold: true, sz: 13 } })

  getMonthGroups(matriz.dias).forEach((group, index) => {
    const start = 2 + group.startIndex
    const end = start + group.count - 1
    const fillColor = monthColors[index % monthColors.length]

    for (let col = start; col <= end; col += 1) {
      styleCell(sheet, 0, col, {
        ...headerStyle,
        font: { bold: true, sz: 15, color: { rgb: '000000' } },
        fill: { fgColor: { rgb: fillColor } },
      })
    }
  })

  for (let col = totalStart; col <= totalStart + 1; col += 1) {
    styleCell(sheet, 0, col, {
      ...headerStyle,
      font: { bold: true, sz: 11 },
    })
    styleCell(sheet, 1, col, {
      ...headerStyle,
      font: { bold: true, sz: 10 },
    })
    styleCell(sheet, 2, col, {
      ...headerStyle,
      font: { bold: true, sz: 10 },
    })
  }

  for (let row = 3; row <= range.e.r; row += 1) {
    const student = matriz.estudiantes[row - 3]
    const fill =
      student?.nivel_alerta === 'rojo'
        ? 'F4CCCC'
        : student?.nivel_alerta === 'amarillo'
          ? 'FFF2CC'
          : null

    for (let col = 0; col <= range.e.c; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col })
      const current = sheet[address]?.s ?? {}
      sheet[address].s = {
        ...current,
        alignment: {
          horizontal: col === 1 ? 'left' : 'center',
          vertical: 'center',
        },
        fill: fill ? { fgColor: { rgb: fill } } : undefined,
      }
    }
  }

  for (let row = range.e.r + 1; row <= 237; row += 1) {
    for (let col = 0; col <= range.e.c; col += 1) {
      styleCell(sheet, row, col, emptyStyle)
    }
  }
}

function getSafeFileName(matriz) {
  const safeCourse = matriz.paralelo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `matriz-asistencia-${safeCourse || 'paralelo'}-${matriz.anio_lectivo}.xlsx`
}

export function downloadMatrizAsistenciaExcel(matriz) {
  if (!matriz) return

  const rows = buildRows(matriz)
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  setSheetMetadata(sheet, matriz)
  applyStyles(sheet, matriz)

  const workbook = XLSX.utils.book_new()
  workbook.Props = {
    Title: `Matriz de asistencia ${matriz.paralelo}`,
    Subject: `Anio lectivo ${matriz.anio_lectivo}`,
    Author: 'PresenTech',
  }

  XLSX.utils.book_append_sheet(workbook, sheet, 'Hoja1')
  XLSX.writeFile(workbook, getSafeFileName(matriz), {
    bookType: 'xlsx',
    cellStyles: true,
    compression: true,
  })
}
