import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { AcquisitionForm } from "@/components/site/forms";
import { propertyTypesQuery, settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/vende-tu-propiedad")({
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(settingsQuery), context.queryClient.ensureQueryData(propertyTypesQuery)]),
  head: () => ({
    meta: [
      { title: "Vende tu propiedad — eXIn Grupo" },
      { name: "description", content: "Registra tu inmueble con eXIn Grupo y un asesor te contactará para acompañarte en la venta." },
      { property: "og:title", content: "Vende tu propiedad — eXIn Grupo" },
      { property: "og:description", content: "Registra tu inmueble y recibe acompañamiento para venderlo." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: types } = useSuspenseQuery(propertyTypesQuery);
  const c = settings.captacion;
  return (
    <SiteLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h1 className="font-display text-4xl font-extrabold">{c.hero_titulo}</h1>
          {c.hero_descripcion ? <p className="mt-3 opacity-90">{c.hero_descripcion}</p> : null}
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="surface-panel p-6 md:p-8">
          <AcquisitionForm propertyTypes={types} arriendo={settings.propiedades.arriendo_activo} />
          {c.texto_legal ? <p className="mt-6 whitespace-pre-line text-xs text-muted-foreground">{c.texto_legal}</p> : null}
        </div>
      </div>
    </SiteLayout>
  );
}
