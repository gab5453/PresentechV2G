import { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { AlertTriangle, Camera, FileText, X } from 'lucide-react'
import { Button, Modal } from '../common'

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment',
}

export function EscanearListaButton({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const webcamRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [error, setError] = useState('')

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) {
      setError('No se pudo capturar la imagen. Verifique los permisos de la cámara.')
      return
    }

    setError('')
    setImgSrc(imageSrc)
  }, [])

  const retake = () => {
    setImgSrc(null)
    setError('')
  }

  const handleProcessDocument = () => {
    setError(
      'OCR real pendiente de configuración. No se registraron estudiantes. ' +
        'Cuando el endpoint OCR esté disponible, esta imagen se enviará para extraer nombres reales.',
    )
  }

  const closeModal = () => {
    setIsOpen(false)
    setImgSrc(null)
    setError('')
  }

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
        onClose={closeModal}
        title="Escaneo de documento con OCR"
        confirmLabel="Entendido"
        onConfirm={closeModal}
      >
        <div className="flex w-full flex-col items-center space-y-4">
          <div className="flex w-full items-start gap-3 rounded-lg border border-warning/25 bg-warning-bg px-3 py-3 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              El OCR real aún no está conectado. Puedes capturar una imagen para validar el
              flujo visual, pero no se crearán estudiantes automáticamente.
            </p>
          </div>

          {error ? (
            <div className="w-full rounded-md border border-error bg-error-bg p-3 text-sm text-error">
              {error}
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
                  Alinee el documento aquí
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
            {!imgSrc ? (
              <Button onClick={capture} className="w-full sm:w-auto" variant="primary">
                <Camera className="mr-2 h-4 w-4" />
                Capturar documento
              </Button>
            ) : (
              <>
                <Button onClick={retake} variant="secondary" className="w-full sm:w-auto">
                  <X className="mr-2 h-4 w-4" />
                  Descartar
                </Button>
                <Button
                  onClick={handleProcessDocument}
                  variant="primary"
                  className="w-full border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Extraer nombres
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
