import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { citiesQuery, propertiesQuery, propertyTypesQuery, settingsQuery } from "@/lib/queries";
import type { PropertyFilters } from "@/lib/public.functions";

type Search = {
  operacion?: "venta" | "arriendo" | undefined;
  tipo?: string | undefined;
  ciudad?: string | undefined;
  codigo?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  hab?: number | undefined;
  banos?: number | undefined;
  q?: string | undefined;
  pagina?: number | undefined;
};

const n = (v: unknown) => {
  const x = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(x) && x >= 0 ? x : undefined;
};
const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 120) : undefined);

function toFilters(q: Search): PropertyFilters {
  const f: PropertyFilters = {};
  if (q.operacion) f.operation = q.operacion;
  if (q.tipo) f.typeSlug = q.tipo;
  if (q.ciudad) f.city = q.ciudad;
  if (q.codigo) f.code = q.codigo;
  if (q.min !== undefined) f.minPrice = q.min;
  if (q.max !== undefined) f.maxPrice = q.max;
  if (q.hab !== undefined) f.bedrooms = Math.floor(q.hab);
  if (q.banos !== undefined) f.bathrooms = Math.floor(q.banos);
  if (q.q) f.q = q.q;
  if (q.pagina) f.page = Math.max(1, Math.floor(q.pagina));
  return f;
}

export const Route = createFileRoute("/propiedades/")({
  validateSearch: (r: Record<string, unknown>): Search => ({
    operacion: r["operacion"] === "venta" || r["operacion"] === "arriendo" ? r["operacion"] : undefined,
    tipo: s(r["tipo"]),
    ciudad: s(r["ciudad"]),
    codigo: s(r["codigo"]),
    min: n(r["min"]),
    max: n(r["max"]),
    hab: n(r["hab"]),
    banos: n(r["banos"]),
    q: s(r["q"]),
    pagina: n(r["pagina"]),
  }),
  loaderDeps: ({ search }) => toFilters(search),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(propertiesQuery(deps)),
      context.queryClient.ensureQueryData(propertyTypesQuery),
      context.queryClient.ensureQueryData(citiesQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]),
  head: () => ({
    meta: [
      { title: "Propiedades en venta — eXIn Grupo" },
      { name: "description", content: "Catálogo de inmuebles disponibles con eXIn Grupo. Filtra por tipo, ciudad, precio, habitaciones y código." },
      { property: "og:title", content: "Propiedades en venta — eXIn Grupo" },
      { property: "og:description", content: "Explora casas, apartamentos y más inmuebles disponibles." },
    ],
  }),
  component: PropertiesPage,
});

const selectCls = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

function PropertiesPage() {
  const search = Route.useSearch();
  const filters = toFilters(search);
  const { data } = useSuspenseQuery(propertiesQuery(filters));
  const { data: types } = useSuspenseQuery(propertyTypesQuery);
  const { data: cities } = useSuspenseQuery(citiesQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const navigate = useNavigate({ from: "/propiedades/" });
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">Propiedades</h1>
          <p className="mt-1 text-muted-foreground">{data.total} inmuebles encontrados</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside>
          <form
            key={JSON.stringify(search)}
            className="surface-panel sticky top-24 space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const g = (k: string) => String(fd.get(k) ?? "");
              navigate({
                search: {
                  operacion: (g("operacion") || undefined) as Search["operacion"],
                  tipo: s(g("tipo")),
                  ciudad: s(g("ciudad")),
                  codigo: s(g("codigo")),
                  min: n(g("min")),
                  max: n(g("max")),
                  hab: n(g("hab")),
                  banos: n(g("banos")),
                  q: s(g("q")),
                },
              });
            }}
          >
            <p className="flex items-center gap-2 font-display font-bold">
              <SlidersHorizontal className="size-4" /> Filtros
            </p>
            <Input name="q" placeholder="Buscar por nombre o zona" defaultValue={search.q} aria-label="Buscar" />
            <Input name="codigo" placeholder="Código del inmueble" defaultValue={search.codigo} aria-label="Código" />
            {settings.propiedades.arriendo_activo ? (
              <select name="operacion" defaultValue={search.operacion ?? ""} className={selectCls} aria-label="Operación">
                <option value="">Venta y arriendo</option>
                <option value="venta">Venta</option>
                <option value="arriendo">Arriendo</option>
              </select>
            ) : null}
            <select name="tipo" defaultValue={search.tipo ?? ""} className={selectCls} aria-label="Tipo">
              <option value="">Todos los tipos</option>
              {types.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
            </select>
            <select name="ciudad" defaultValue={search.ciudad ?? ""} className={selectCls} aria-label="Ciudad">
              <option value="">Todas las ciudades</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input name="min" type="number" placeholder="Precio mín." defaultValue={search.min} aria-label="Precio mínimo" />
              <Input name="max" type="number" placeholder="Precio máx." defaultValue={search.max} aria-label="Precio máximo" />
              <Input name="hab" type="number" placeholder="Habitaciones" defaultValue={search.hab} aria-label="Habitaciones" />
              <Input name="banos" type="number" placeholder="Baños" defaultValue={search.banos} aria-label="Baños" />
            </div>
            <Button type="submit" className="w-full">Aplicar filtros</Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => navigate({ search: {} })}>
              Limpiar
            </Button>
          </form>
        </aside>
        <div>
          {data.items.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="surface-panel p-10 text-center text-muted-foreground">
              No encontramos inmuebles con esos filtros.
            </div>
          )}
          {pages > 1 ? (
            <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Paginación">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  from="/propiedades/"
                  to="."
                  search={(prev) => ({ ...prev, pagina: p })}
                  className={`flex size-10 items-center justify-center rounded-md border text-sm ${
                    p === data.page ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </SiteLayout>
  );
}
