import { Mail, MapPin, Phone } from 'lucide-react'
import { institutionConfig } from '../../../config/institution'

const contactItems = [
  {
    icon: MapPin,
    label: 'Dirección',
    value: institutionConfig.address,
  },
  {
    href: institutionConfig.phoneHref,
    icon: Phone,
    label: 'Teléfono',
    value: institutionConfig.phone,
  },
  {
    href: `mailto:${institutionConfig.email}`,
    icon: Mail,
    label: 'Email',
    value: institutionConfig.email,
  },
  {
    href: institutionConfig.facebookUrl,
    iconClass: 'fa-brands fa-facebook-f',
    label: 'Facebook',
    value: 'Fe y Alegría La Dolorosa',
  },
]

export function Footer({ withMobileNavSpacing = false }) {
  return (
    <footer
      className={`relative z-0 border-t border-border/70 bg-card/80 backdrop-blur-md ${
        withMobileNavSpacing ? 'pb-16 md:pb-0' : ''
      }`}
    >
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-7 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)] md:items-center">
        <div className="flex items-center gap-4">
          <img
            alt="Logo de Fe y Alegría"
            className="h-16 w-28 shrink-0 rounded-md bg-white object-contain p-1 shadow-sm"
            loading="lazy"
            src={institutionConfig.logoUrl}
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              PresenTech
            </p>
            <h2 className="mt-1 text-base font-semibold leading-snug text-foreground">
              {institutionConfig.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Innovación al servicio de la educación.
            </p>
          </div>
        </div>

        <address className="grid gap-3 text-sm not-italic sm:grid-cols-2">
          {contactItems.map(({ href, icon: Icon, iconClass, label, value }) => {
            const content = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {Icon ? (
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <i aria-hidden="true" className={iconClass} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="mt-0.5 block break-words text-foreground">
                    {value}
                  </span>
                </span>
              </>
            )

            return href ? (
              <a
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-primary/5 hover:text-primary"
                href={href}
                key={label}
                rel={label === 'Facebook' ? 'noreferrer' : undefined}
                target={label === 'Facebook' ? '_blank' : undefined}
              >
                {content}
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-lg p-2" key={label}>
                {content}
              </div>
            )
          })}
        </address>
      </div>

      <div className="border-t border-border/60 bg-primary-dark px-4 py-3 text-center text-xs text-white/80">
        © {new Date().getFullYear()} PresentTech · Unidad Educativa Fiscomisional Fe y Alegría La Dolorosa
      </div>
    </footer>
  )
}
