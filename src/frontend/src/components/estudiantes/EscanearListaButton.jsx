import { useCallback, useMemo, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { AlertTriangle, Camera, CheckCircle2, FileText, RotateCcw, X } from 'lucide-react'
import { Button, Modal } from '../common'
import { getApiErrorMessage } from '../../services/api'
import { extraerEstudiantesDesdeImagen } from '../../services/ocrService'
import { crearEstudiante } from '../../services/adminService'

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment',
}

function dataUrlToFile(dataUrl, fileName) {
  const [metadata, base64] = dataUrl.split(',')
  const contentType = metadata.match(/data:(.*);base64/)?.[1] ?? 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new File([bytes], fileName, { type: contentType })
}

function createReviewRows(students) {
  return students.map((student, index) => ({
    id: `${student.apellidos}-${student.nombres}-${index}`,
    selected: true,
    apellidos: student.apellidos ?? '',
    nombres: student.nombres ?? '',
    confianza: student.confianza ?? 0,
    observacion: student.observacion ?? '',
  }))
}

export function EscanearListaButton({ children, onImportSuccess }) {
  const [isOpen, setIsOpen] = useState(false)
  const webcamRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState([])
  const [detectedText, setDetectedText] = useState('')
  const [reviewRows, setReviewRows] = useState([])
  const [importSummary, setImportSummary] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const hasResults = reviewRows.length > 0 || detectedText || warnings.length > 0
  const hasImportSummary = Boolean(importSummary)
  const selectedCount = useMemo(
    () => reviewRows.filter((student) => student.selected).length,
    [reviewRows],
  )

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) {
      setError('No se pudo capturar la imagen. Verifique los permisos de la camara.')
      return
    }

    setError('')
    setWarnings([])
    setDetectedText('')
    setReviewRows([])
    setImportSummary(null)
    setImgSrc(imageSrc)
  }, [])

  const retake = () => {
    setImgSrc(null)
    setError('')
    setWarnings([])
    setDetectedText('')
    setReviewRows([])
    setImportSummary(null)
  }

  const closeModal = () => {
    setIsOpen(false)
    setImgSrc(null)
    setError('')
    setWarnings([])
    setDetectedText('')
    setReviewRows([])
    setImportSummary(null)
    setIsProcessing(false)
    setIsImporting(false)
  }

  const handleProcessDocument = async () => {
    if (!imgSrc) {
      capture()
      return
    }

    setIsProcessing(true)
    setError('')
    setWarnings([])
    setDetectedText('')

    try {
      const file = dataUrlToFile(imgSrc, `lista-estudiantes-${Date.now()}.jpg`)
      const result = await extraerEstudiantesDesdeImagen(file)
      const students = result?.estudiantes ?? []

      setReviewRows(createReviewRows(students))
      setImportSummary(null)
      setDetectedText(result?.texto_detectado ?? '')
      setWarnings(result?.advertencias ?? [])

      if (!students.length) {
        setError(
          'El OCR respondio, pero no se pudieron detectar estudiantes. Revise el texto detectado o intente con una foto mas clara.',
        )
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsProcessing(false)
    }
  }

  const updateRow = (id, field, value) => {
    setReviewRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const removeRow = (id) => {
    setReviewRows((currentRows) => currentRows.filter((row) => row.id !== id))
  }

  const handleImportSelected = async () => {
    setError('')
    setIsImporting(true)

    const selectedRows = reviewRows.filter((row) => row.selected)
    const validRows = selectedRows
      .map((row) => ({
        ...row,
        nombres: row.nombres.trim(),
        apellidos: row.apellidos.trim(),
      }))
      .filter((row) => row.nombres && row.apellidos)

    const omittedRows = selectedRows.length - validRows.length

    if (!selectedRows.length) {
      setError('Seleccione al menos un estudiante para importar.')
      setIsImporting(false)
      return
    }

    if (!validRows.length) {
      setError('Las filas seleccionadas deben tener nombres y apellidos antes de importar.')
      setIsImporting(false)
      return
    }

    const errors = []
    let imported = 0

    for (const row of validRows) {
      try {
        await crearEstudiante({
          nombres: row.nombres,
          apellidos: row.apellidos,
        })
        imported += 1
      } catch (requestError) {
        errors.push({
          estudiante: `${row.apellidos}, ${row.nombres}`,
          mensaje: getApiErrorMessage(requestError),
        })
      }
    }

    setImportSummary({
      detectados: reviewRows.length,
      seleccionados: selectedRows.length,
      importados: imported,
      omitidos: omittedRows,
      fallidos: errors.length,
      errores: errors,
    })

    if (imported > 0) {
      await onImportSuccess?.()
    }

    setIsImporting(false)
  }

  const confirmLabel = hasImportSummary
    ? 'Cerrar'
    : hasResults
      ? 'Importar seleccionados'
      : imgSrc
        ? 'Extraer nombres'
        : 'Cerrar'
  const onConfirm = hasImportSummary
    ? closeModal
    : hasResults
      ? handleImportSelected
      : imgSrc
        ? handleProcessDocument
        : closeModal

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
      >
        {children || (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Escanear
          </>
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        title="Escaneo de documento con OCR"
        cancelLabel={hasImportSummary ? 'Nuevo escaneo' : hasResults ? 'Cerrar' : 'Cancelar'}
        confirmLabel={confirmLabel}
        isSubmitting={isProcessing || isImporting}
        onClose={hasImportSummary ? retake : closeModal}
        onConfirm={onConfirm}
      >
        <div className="flex w-full flex-col items-center space-y-4">
          <div className="flex w-full items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3 text-sm text-foreground">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Captura una foto clara de la lista. El OCR detectara estudiantes y los mostrara
              para revision antes de cualquier importacion.
            </p>
          </div>

          {error ? (
            <div className="flex w-full items-start gap-2 rounded-md border border-error bg-error-bg p-3 text-sm text-error">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {warnings.length ? (
            <div className="w-full rounded-md border border-warning/30 bg-warning-bg p-3 text-sm text-warning">
              <p className="font-medium">Advertencias del OCR</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {warnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-border/50 bg-black shadow-inner">
            {!imgSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={imgSrc}
                alt="Documento capturado"
                className="h-full w-full bg-muted/20 object-contain"
              />
            )}

            {!imgSrc ? (
              <div className="pointer-events-none absolute inset-0 m-8 flex items-center justify-center rounded-lg border-[3px] border-dashed border-white/40">
                <span className="rounded bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                  Alinee el documento aqui
                </span>
              </div>
            ) : null}
          </div>

          {!hasResults ? (
            <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
              {!imgSrc ? (
                <Button onClick={capture} className="w-full sm:w-auto" variant="primary">
                  <Camera className="mr-2 h-4 w-4" />
                  Capturar documento
                </Button>
              ) : (
                <>
                  <Button
                    onClick={retake}
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled={isProcessing}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Tomar otra foto
                  </Button>
                  <Button
                    onClick={handleProcessDocument}
                    variant="primary"
                    isLoading={isProcessing}
                    className="w-full border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Extraer nombres
                  </Button>
                </>
              )}
            </div>
          ) : null}

          {reviewRows.length ? (
            <section className="w-full rounded-xl border border-border/70 bg-background/80 p-3">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Revision de estudiantes</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} de {reviewRows.length} estudiantes seleccionados para importar
                    al sistema.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  OCR completado
                </span>
              </div>

              <div className="max-h-72 overflow-auto rounded-lg border border-border/60">
                <table className="min-w-[680px] w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Importar</th>
                      <th className="px-3 py-2">Apellidos</th>
                      <th className="px-3 py-2">Nombres</th>
                      <th className="px-3 py-2">Confianza</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewRows.map((row) => (
                      <tr key={row.id} className="border-t border-border/60">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(event) =>
                              updateRow(row.id, 'selected', event.target.checked)
                            }
                            className="h-4 w-4 accent-primary"
                            aria-label={`Seleccionar ${row.apellidos} ${row.nombres}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={row.apellidos}
                            onChange={(event) =>
                              updateRow(row.id, 'apellidos', event.target.value)
                            }
                            className="w-full rounded-md border border-border bg-background px-2 py-1 text-foreground outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={row.nombres}
                            onChange={(event) => updateRow(row.id, 'nombres', event.target.value)}
                            className="w-full rounded-md border border-border bg-background px-2 py-1 text-foreground outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {Math.round(Number(row.confianza) * 100)}%
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-error hover:bg-error-bg"
                          >
                            <X className="h-3.5 w-3.5" />
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {importSummary ? (
            <section className="w-full rounded-xl border border-success/30 bg-success-bg/60 p-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground">Importacion finalizada</h3>
                    <p className="text-muted-foreground">
                      Se importaron {importSummary.importados} de {importSummary.seleccionados}
                      {' '}estudiantes seleccionados.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-4">
                    <SummaryPill label="Detectados" value={importSummary.detectados} />
                    <SummaryPill label="Importados" value={importSummary.importados} />
                    <SummaryPill label="Omitidos" value={importSummary.omitidos} />
                    <SummaryPill label="Fallidos" value={importSummary.fallidos} />
                  </div>

                  {importSummary.errores.length ? (
                    <div className="rounded-lg border border-error/30 bg-background/80 p-3 text-error">
                      <p className="font-medium">Errores por fila</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {importSummary.errores.map((item, index) => (
                          <li key={`${item.estudiante}-${index}`}>
                            {item.estudiante}: {item.mensaje}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {detectedText ? (
            <details className="w-full rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-foreground">
                Ver texto completo detectado
              </summary>
              <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {detectedText}
              </pre>
            </details>
          ) : null}
        </div>
      </Modal>
    </>
  )
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-lg bg-background/80 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
