function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getMonthGroups(days) {
  const groups = []

  days.forEach((day) => {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup?.month === day.mes) {
      lastGroup.count += 1
    } else {
      groups.push({ month: day.mes, count: 1 })
    }
  })

  return groups
}

function getRowClass(alertLevel) {
  if (alertLevel === 'rojo') return 'alert-red'
  if (alertLevel === 'amarillo') return 'alert-yellow'
  return ''
}

function getStatusClass(status) {
  if (status === 'P') return 'status-present'
  if (status === 'X') return 'status-absent'
  if (status === '-') return 'status-partial'
  return ''
}

function summaryCells(summary) {
  return `
    <td class="summary present">${summary?.asistencias ?? 0}</td>
    <td class="summary absent">${summary?.faltas ?? 0}</td>
    <td class="summary partial">${summary?.parciales ?? 0}</td>
  `
}

function buildHtml(matriz) {
  const monthGroups = getMonthGroups(matriz.dias)
  const totalColumns = matriz.dias.length + 13

  const monthHeaders = monthGroups
    .map((group) => `<th colspan="${group.count}" class="month">${escapeHtml(group.month)}</th>`)
    .join('')

  const dayHeaders = matriz.dias.map((day) => `<th>${day.dia_mes}</th>`).join('')
  const weekDayHeaders = matriz.dias.map((day) => `<th>${escapeHtml(day.inicial_dia)}</th>`).join('')
  const summaryHeaders = ['P', 'X', '-', 'P', 'X', '-', 'P', 'X', '-', 'X', '-']
    .map((label) => `<th>${label}</th>`)
    .join('')

  const rows = matriz.estudiantes
    .map((student) => {
      const dayCells = matriz.dias
        .map((day) => {
          const status = student.estados_por_fecha?.[day.fecha] ?? ''
          return `<td class="${getStatusClass(status)}">${escapeHtml(status)}</td>`
        })
        .join('')

      return `
        <tr class="${getRowClass(student.nivel_alerta)}">
          <td class="center">${student.numero}</td>
          <td class="student">${escapeHtml(student.nombre_estudiante)}</td>
          ${dayCells}
          ${summaryCells(student.resumen_periodos?.periodo_1)}
          ${summaryCells(student.resumen_periodos?.periodo_2)}
          ${summaryCells(student.resumen_periodos?.periodo_3)}
          <td class="summary absent">${student.total_faltas}</td>
          <td class="summary partial">${student.total_parciales}</td>
        </tr>
      `
    })
    .join('')

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
          th, td { border: 1px solid #333333; padding: 4px; text-align: center; }
          .title { background: #72263a; color: #ffffff; font-weight: bold; font-size: 16px; }
          .subtitle { background: #f5eef0; font-weight: bold; text-align: left; }
          .month { background: #d9e2f3; font-weight: bold; }
          .student { min-width: 260px; text-align: left; font-weight: bold; }
          .center { text-align: center; }
          .status-present { background: #e6f4ea; color: #137333; font-weight: bold; }
          .status-absent { background: #fce8e6; color: #b3261e; font-weight: bold; }
          .status-partial { background: #fff4ce; color: #8a5a00; font-weight: bold; }
          .alert-yellow td { background: #fff4ce; }
          .alert-red td { background: #fce8e6; }
          .alert-yellow .status-present, .alert-red .status-present { background: #d9ead3; }
          .alert-yellow .status-absent, .alert-red .status-absent { background: #f4cccc; }
          .alert-yellow .status-partial, .alert-red .status-partial { background: #ffe599; }
          .summary { font-weight: bold; }
          .present { color: #137333; }
          .absent { color: #b3261e; }
          .partial { color: #8a5a00; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th colspan="${totalColumns}" class="title">
              Matriz anual de asistencia - ${escapeHtml(matriz.paralelo)}
            </th>
          </tr>
          <tr>
            <td colspan="${totalColumns}" class="subtitle">
              Anio lectivo: ${escapeHtml(matriz.anio_lectivo)} | Rango: ${escapeHtml(matriz.fecha_inicio)} a ${escapeHtml(matriz.fecha_fin)}
            </td>
          </tr>
          <tr>
            <th rowspan="3">No.</th>
            <th rowspan="3">Nombre del Alumno</th>
            ${monthHeaders}
            <th colspan="3">Periodo 1</th>
            <th colspan="3">Periodo 2</th>
            <th colspan="3">Periodo 3</th>
            <th colspan="2">Total</th>
          </tr>
          <tr>
            ${dayHeaders}
            ${summaryHeaders}
          </tr>
          <tr>
            ${weekDayHeaders}
            ${summaryHeaders.replaceAll('<th>', '<th class="subtitle">')}
          </tr>
          ${rows || `<tr><td colspan="${totalColumns}">No hay estudiantes activos en este paralelo.</td></tr>`}
        </table>
      </body>
    </html>
  `
}

export function downloadMatrizAsistenciaExcel(matriz) {
  if (!matriz) return

  const html = buildHtml(matriz)
  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeCourse = matriz.paralelo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  link.href = url
  link.download = `matriz-asistencia-${safeCourse || 'paralelo'}-${matriz.anio_lectivo}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
