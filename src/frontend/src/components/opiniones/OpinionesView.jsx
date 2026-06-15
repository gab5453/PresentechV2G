import { useState } from 'react'
import { CheckCircle2, MessageSquareText, Send } from 'lucide-react'
import { Button } from '../common'
import { getApiErrorMessage } from '../../services/api'
import { registrarOpinion } from '../../services/opinionesService'

const initialForm = {
  utilizaria_siguiente_anio: null,
  aspecto_mas_util: '',
  aspectos_por_mejorar: '',
}

export function OpinionesView() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field, value) => {
    setError('')
    setSuccess('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validate = () => {
    if (form.utilizaria_siguiente_anio === null) {
      return 'Seleccione Sí o No en la primera pregunta.'
    }
    if (!form.aspecto_mas_util.trim()) {
      return 'Cuéntenos qué le pareció más útil.'
    }
    if (!form.aspectos_por_mejorar.trim()) {
      return 'Cuéntenos qué podríamos mejorar.'
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await registrarOpinion({
        utilizaria_siguiente_anio: form.utilizaria_siguiente_anio,
        aspecto_mas_util: form.aspecto_mas_util.trim(),
        aspectos_por_mejorar: form.aspectos_por_mejorar.trim(),
      })
      setForm(initialForm)
      setSuccess('Gracias. Su opinión y recomendaciones fueron registradas correctamente.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <MessageSquareText className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-medium text-foreground">
            Opiniones y recomendaciones
          </h2>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Su experiencia nos ayuda a mejorar PresentTech para los próximos años lectivos.
        </p>
      </div>

      <form
        className="space-y-6 rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm sm:p-6"
        onSubmit={handleSubmit}
      >
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            ¿Utilizaría esta aplicación para el siguiente año lectivo?
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <OpinionChoice
              checked={form.utilizaria_siguiente_anio === true}
              label="Sí"
              onClick={() => updateField('utilizaria_siguiente_anio', true)}
            />
            <OpinionChoice
              checked={form.utilizaria_siguiente_anio === false}
              label="No"
              onClick={() => updateField('utilizaria_siguiente_anio', false)}
            />
          </div>
        </fieldset>

        <TextAreaField
          label="¿Qué es lo que más le pareció útil?"
          maxLength={2000}
          placeholder="Describa las funciones o características que más le ayudaron..."
          value={form.aspecto_mas_util}
          onChange={(value) => updateField('aspecto_mas_util', value)}
        />

        <TextAreaField
          label="¿Qué podríamos mejorar?"
          maxLength={2000}
          placeholder="Comparta cambios o nuevas ideas que mejorarían su experiencia..."
          value={form.aspectos_por_mejorar}
          onChange={(value) => updateField('aspectos_por_mejorar', value)}
        />

        {error ? (
          <p className="rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        {success ? (
          <div className="flex items-start gap-2 rounded-md border border-success/25 bg-success-bg px-3 py-2 text-sm text-success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{success}</p>
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button isLoading={isSubmitting} type="submit">
            <Send className="h-4 w-4" />
            Enviar opinión
          </Button>
        </div>
      </form>
    </div>
  )
}

function OpinionChoice({ checked, label, onClick }) {
  return (
    <button
      aria-pressed={checked}
      className={`min-h-12 rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
        checked
          ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/15'
          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function TextAreaField({ label, maxLength, onChange, placeholder, value }) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <textarea
        className="mt-2 min-h-32 w-full resize-y rounded-lg border border-input-border bg-background px-4 py-3 text-base font-normal text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="mt-1 block text-right text-xs font-normal text-muted-foreground">
        {value.length}/{maxLength}
      </span>
    </label>
  )
}
