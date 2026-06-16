import { useCallback, useMemo, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { AlertTriangle, Camera, CheckCircle2, FileText, RotateCcw, X } from 'lucide-react'
import { Button, Modal } from '../common'
import { getApiErrorMessage } from '../../services/api'
import { extraerEstudiantesDesdeImagen } from '../../services/ocrService'
import { crearEstudiante } from '../../services/adminService'

const videoConstraints = {
  width: 1280,
  height: 1920,
  aspectRatio: 0.6666667,
  facingMode: 'environment',
}

const OCR_MAX_IMAGE_SIDE = 2600
const OCR_IMAGE_QUALITY = 0.88

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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen.'))
    }
    image.src = url
  })
}

async function prepareImageForOcr(file) {
  const image = await loadImageFromFile(file)
  const scale = Math.min(1, OCR_MAX_IMAGE_SIDE / Math.max(image.width, image.height))
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo preparar la imagen para OCR.'))
          return
        }

        resolve(
          new File([blob], file.name.replace(/\.[^.]+$/, '') + '-ocr.jpg', {
            type: 'image/jpeg',
          }),
        )
      },
      'image/jpeg',
      OCR_IMAGE_QUALITY,
    )
  })
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
  const fileInputRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [capturedFile, setCapturedFile] = useState(null)
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState([])
  const [detectedText, setDetectedText] = useState('')
  const [reviewRows, setReviewRows] = useState([])
  const [importSummary, setImportSummary] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showInlineCamera, setShowInlineCamera] = useState(false)

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
    setCapturedFile(dataUrlToFile(imageSrc, `lista-estudiantes-${Date.now()}.jpg`))
    setImgSrc(imageSrc)
  }, [])

  const handleNativeFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Seleccione una imagen valida para procesar con OCR.')
      return
    }

    try {
      const preview = await readFileAsDataUrl(file)
      setError('')
      setWarnings([])
      setDetectedText('')
      setReviewRows([])
      setImportSummary(null)
      setCapturedFile(file)
      setImgSrc(preview)
      setShowInlineCamera(false)
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar la imagen seleccionada.')
    }
  }

  const retake = () => {
    setImgSrc(null)
    setCapturedFile(null)
    setError('')
    setWarnings([])
    setDetectedText('')
    setReviewRows([])
    setImportSummary(null)
    setShowInlineCamera(false)
  }

  const closeModal = () => {
    setIsOpen(false)
    setImgSrc(null)
    setCapturedFile(null)
    setError('')
    setWarnings([])
    setDetectedText('')
    setReviewRows([])
    setImportSummary(null)
    setIsProcessing(false)
    setIsImporting(false)
    setShowInlineCamera(false)
  }

  const handleProcessDocument = async () => {
    if (!imgSrc && !capturedFile) {
      fileInputRef.current?.click()
      return
    }

    setIsProcessing(true)
    setError('')
    setWarnings([])
    setDetectedText('')

    try {
      const rawFile = capturedFile ?? dataUrlToFile(imgSrc, `lista-estudiantes-${Date.now()}.jpg`)
      const file = await prepareImageForOcr(rawFile)
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

  const openNativeCamera = () => {
    fileInputRef.current?.click()
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
        : 'Abrir camara'
  const onConfirm = hasImportSummary
    ? closeModal
    : hasResults
      ? handleImportSelected
      : imgSrc
        ? handleProcessDocument
        : openNativeCamera

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeFileChange}
      />

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
        maxWidth="max-w-md sm:max-w-2xl"
        onClose={hasImportSummary ? retake : closeModal}
        onConfirm={onConfirm}
      >
        <div className="flex w-full flex-col items-center space-y-4">
          <div className="flex w-full items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3 text-sm text-foreground">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Ubica la hoja completa dentro del marco, con buena luz y sin inclinarla. El OCR
              mostrara los estudiantes para revision antes de importar.
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

          {!imgSrc && !showInlineCamera ? (
            <div className="w-full rounded-2xl border border-border/60 bg-muted/30 p-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">Usar camara del celular</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta opcion abre la camara nativa y suele guardar una foto con mejor calidad para
                OCR.
              </p>
              <Button
                onClick={openNativeCamera}
                className="mt-4 w-full"
                variant="primary"
              >
                <Camera className="mr-2 h-4 w-4" />
                Abrir camara
              </Button>
            </div>
          ) : null}

          {imgSrc || showInlineCamera ? (
            <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-foreground/90 p-3 shadow-inner sm:max-w-xl">
              <div className="relative mx-auto aspect-[3/4] max-h-[58svh] w-full overflow-hidden rounded-xl bg-black sm:aspect-[4/3] sm:max-h-[60vh]">
                {!imgSrc ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={1}
                    minScreenshotWidth={1600}
                    minScreenshotHeight={2200}
                    videoConstraints={videoConstraints}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={imgSrc}
                    alt="Documento capturado"
                    className="h-full w-full bg-black object-contain"
                  />
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/20" />
                <div className="pointer-events-none absolute inset-x-[10%] inset-y-[4%] rounded-xl border-[3px] border-dashed border-white/70 shadow-[0_0_0_999px_rgba(0,0,0,0.18)] sm:inset-x-[18%] sm:inset-y-[6%]">
                  <span className="absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded bg-black/60 px-3 py-1 text-center text-xs text-white/90 backdrop-blur-sm">
                    Coloca la hoja dentro de este marco
                  </span>
                </div>

                {!imgSrc ? (
                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 px-3 py-2 text-center text-xs text-white/85 backdrop-blur-sm">
                    Captura la hoja vertical, completa y enfocada.
                  </div>
                ) : (
                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 px-3 py-2 text-center text-xs text-white/85 backdrop-blur-sm">
                    Si el texto se ve borroso, toma otra foto con la camara del celular.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {!imgSrc ? (
            <div className="grid w-full gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground sm:grid-cols-3">
              <span>Manten la hoja recta.</span>
              <span>Evita sombras sobre la tabla.</span>
              <span>Que se lean numeros, apellidos y nombres.</span>
            </div>
          ) : null}

          {!hasResults ? (
            <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
              {!imgSrc ? (
                <>
                  {showInlineCamera ? (
                    <Button onClick={capture} className="w-full sm:w-auto" variant="primary">
                      <Camera className="mr-2 h-4 w-4" />
                      Capturar documento
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => setShowInlineCamera((current) => !current)}
                    className="w-full sm:w-auto"
                    variant="secondary"
                  >
                    {showInlineCamera ? 'Ocultar camara en pantalla' : 'Usar camara en pantalla'}
                  </Button>
                </>
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
