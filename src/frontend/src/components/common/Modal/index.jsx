import { createPortal } from 'react-dom'
import { Button } from '../Button'
export function Modal({
  cancelLabel = 'Cancelar',
  children,
  confirmLabel = 'Confirmar',
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  title,
  variant = 'primary',
}) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm px-4 pb-20 pt-4 sm:items-center sm:py-4 animate-fade-in"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-modal="true"
        className="w-full max-w-md min-h-[70vh] sm:min-h-0 max-h-[calc(100svh-6rem)] overflow-y-auto rounded-xl border border-border/50 bg-card/90 backdrop-blur-md p-6 text-left shadow-2xl sm:max-h-[calc(100svh-2rem)] animate-slide-up flex flex-col"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
        <div className="mt-3 text-base leading-6 text-muted-foreground flex-1 flex flex-col">{children}</div>
        <div className="mt-auto pt-5 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isSubmitting}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>,
    document.body
  )
}
