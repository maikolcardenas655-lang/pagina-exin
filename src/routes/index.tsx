import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Banknote, Building2, Home, KeyRound, Search } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { featuredQuery, propertyTypesQuery, settingsQuery, citiesQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "eXIn Grupo — Inmuebles, créditos y leasing" },
      { name: "description", content: "Encuentra inmuebles en venta, solicita asesoría de crédito hipotecario o leasing y vende tu propiedad con eXIn Grupo." },
      { property: "og:title", content: "eXIn Grupo — Inmuebles, créditos y leasing" },
      { property: "og:description", content: "Inmuebles en venta, asesoría en crédito hipotecario y leasing, y captación de propiedades." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(featuredQuery),
      context.queryClient.ensureQueryData(propertyTypesQuery),
      context.queryClient.ensureQueryData(citiesQuery),
    ]),
  component: HomePage,
});

function HomePage() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: featured } = useSuspenseQuery(featuredQuery);
  const { data: types } = useSuspenseQuery(propertyTypesQuery);
  const { data: cities } = useSuspenseQuery(citiesQuery);
  const navigate = useNavigate();
  const h = settings.home;

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        {h.hero_imagen ? (
          <img src={h.hero_imagen} alt="" className="absolute inset-0 size-full object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-ink/80 to-ink" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <p className="text-eyebrow text-primary-light">{settings.empresa.nombre_comercial}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-6xl">{h.hero_titulo}</h1>
          {h.hero_subtitulo ? <p className="mt-4 max-w-2xl text-lg opacity-90">{h.hero_subtitulo}</p> : null}
          {h.hero_descripcion ? <p className="mt-2 max-w-2xl opacity-80">{h.hero_descripcion}</p> : null}

          <form
            className="mt-10 grid gap-3 rounded-xl bg-background p-4 text-foreground shadow-xl md:grid-cols-[1fr_1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const s = (k: string) => (String(fd.get(k) ?? "") || undefined);
              navigate({ to: "/propiedades", search: { tipo: s("tipo"), ciudad: s("ciudad"), codigo: s("codigo") } });
            }}
          >
            <select name="tipo" aria-label="Tipo de inmueble" className="h-11 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Tipo de inmueble</option>
              {types.map((t) => (
                <option key={t.id} value={t.slug}>{t.name}</option>
              ))}
            </select>
            <select name="ciudad" aria-label="Ciudad" className="h-11 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Ciudad</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Input name="codigo" placeholder="Código del inmueble" className="h-11" aria-label="Código" />
            <Button type="submit" size="lg" className="h-11">
              <Search className="size-4" /> Buscar
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow text-primary">Selección</p>
            <h2 className="font-display text-3xl font-bold">Propiedades destacadas</h2>
          </div>
          <Link to="/propiedades" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex">
            Ver todas <ArrowRight className="size-4" />
          </Link>
        </div>
        {featured.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="surface-panel p-10 text-center text-muted-foreground">
            Pronto publicaremos nuevas propiedades.{" "}
            <Link to="/propiedades" className="text-primary underline">Ver catálogo</Link>
          </div>
        )}
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-3 lg:px-8">
          {[
            { icon: Home, title: "Compra tu inmueble", text: "Explora el catálogo de propiedades disponibles.", to: "/propiedades" as const },
            { icon: Banknote, title: settings.creditos.hipotecario_titulo, text: settings.creditos.hipotecario_texto || "Te acompañamos en tu solicitud de crédito hipotecario o leasing.", to: "/creditos" as const },
            { icon: KeyRound, title: "Vende tu propiedad", text: settings.captacion.hero_descripcion || "Registra tu inmueble y un asesor te contactará.", to: "/vende-tu-propiedad" as const },
          ].map((c) => (
            <Link key={c.title} to={c.to} className="surface-panel group p-6 transition-shadow hover:shadow-lg">
              <c.icon className="size-8 text-primary" />
              <h3 className="mt-4 font-display text-xl font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Conocer más <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {h.servicios.length ? (
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <h2 className="font-display text-3xl font-bold">Nuestros servicios</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {h.servicios.map((s) => (
              <div key={s.titulo} className="surface-panel p-6">
                <Building2 className="size-6 text-primary" />
                <h3 className="mt-3 font-display font-bold">{s.titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.texto}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {h.cta_titulo ? (
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center lg:px-8">
            <div>
              <h2 className="font-display text-3xl font-bold">{h.cta_titulo}</h2>
              {h.cta_texto ? <p className="mt-2 opacity-90">{h.cta_texto}</p> : null}
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contacto">Contáctanos</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
