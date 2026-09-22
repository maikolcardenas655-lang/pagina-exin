import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Menu, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { settingsQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/format";
import logoExin from "@/assets/logo-exin.png.asset.json";
import logoHabi from "@/assets/logo-habi.png.asset.json";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/propiedades", label: "Propiedades" },
  { to: "/creditos", label: "Créditos" },
  { to: "/vende-tu-propiedad", label: "Vende tu propiedad" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const [open, setOpen] = useState(false);
  const wa = whatsappLink(
    settings.contacto.whatsapp || settings.contacto.telefono,
    "Hola, quisiera recibir información de eXIn Grupo.",
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="eXIn Grupo — inicio">
            <img src={logoExin.url} alt="eXIn Grupo" className="h-9 w-auto shrink-0" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "text-primary bg-accent" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="sm" className="ml-2">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                WhatsApp
              </a>
            </Button>
          </nav>

          <div className="flex items-center justify-end gap-2 lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menú" className="min-h-11 min-w-11">
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="text-left">Menú</SheetTitle>
                <nav className="mt-6 flex flex-col gap-1" aria-label="Navegación móvil">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                      activeProps={{ className: "text-primary bg-accent" }}
                      activeOptions={{ exact: item.to === "/" }}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button asChild className="mt-4">
                    <a href={wa} target="_blank" rel="noopener noreferrer">
                      <MessageCircle aria-hidden="true" />
                      WhatsApp
                    </a>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
          <div>
            <img
              src={logoExin.url}
              alt="eXIn Grupo"
              className="h-10 w-auto rounded-md bg-background p-1"
            />
            <p className="mt-4 text-sm text-ink-foreground/70">
              {settings.empresa.razon_social || settings.empresa.nombre_comercial}
            </p>
            {settings.empresa.nit ? (
              <p className="text-sm text-ink-foreground/70">NIT {settings.empresa.nit}</p>
            ) : null}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs text-ink-foreground/60">Aliados con</span>
              <img
                src={logoHabi.url}
                alt="Habi"
                className="h-7 w-auto rounded bg-background px-1 py-0.5"
              />
            </div>
          </div>

          <nav aria-label="Enlaces del sitio">
            <h2 className="text-eyebrow text-ink-foreground/60">Navegación</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.slice(1).map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-ink-foreground/80 hover:text-ink-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-eyebrow text-ink-foreground/60">Contacto</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-foreground/80">
              {settings.contacto.telefono ? (
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  <a href={`tel:${settings.contacto.telefono.replace(/\s/g, "")}`}>
                    {settings.contacto.telefono}
                  </a>
                </li>
              ) : null}
              {settings.contacto.whatsapp ? (
                <li className="flex items-center gap-2">
                  <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {settings.contacto.correo ? (
                <li className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${settings.contacto.correo}`}>{settings.contacto.correo}</a>
                </li>
              ) : null}
              {settings.contacto.direccion || settings.empresa.direccion ? (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{settings.contacto.direccion || settings.empresa.direccion}</span>
                </li>
              ) : null}
              {settings.empresa.horarios ? (
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{settings.empresa.horarios}</span>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h2 className="text-eyebrow text-ink-foreground/60">Legal y redes</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
              <li>
                <Link to="/privacidad" className="hover:text-ink-foreground">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/tratamiento-de-datos" className="hover:text-ink-foreground">
                  Tratamiento de datos
                </Link>
              </li>
            </ul>
            <ul className="mt-4 flex flex-wrap gap-3 text-sm text-ink-foreground/80">
              {Object.entries(settings.redes)
                .filter(([, url]) => Boolean(url))
                .map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="capitalize hover:text-ink-foreground"
                    >
                      {name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-foreground/10 px-4 py-6 text-center text-xs text-ink-foreground/60 lg:px-8">
          © {new Date().getFullYear()} {settings.empresa.nombre_comercial || "eXIn Grupo"}. Confianza
          en cada paso. · <Link to="/auth">Acceso administrativo</Link>
        </div>
      </footer>

      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 inline-flex min-h-14 min-w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-elevated transition-transform hover:scale-105"
        aria-label="Escríbenos por WhatsApp"
      >
        <MessageCircle className="size-6" aria-hidden="true" />
      </a>
    </div>
  );
}
