import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Banknote, KeyRound, MessageCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { CreditForm } from "@/components/site/forms";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/format";
import { banksQuery, settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/creditos")({
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(settingsQuery), context.queryClient.ensureQueryData(banksQuery)]),
  head: () => ({
    meta: [
      { title: "Crédito hipotecario y leasing — eXIn Grupo" },
      { name: "description", content: "Solicita asesoría para crédito hipotecario o leasing habitacional con eXIn Grupo." },
      { property: "og:title", content: "Crédito hipotecario y leasing — eXIn Grupo" },
      { property: "og:description", content: "Te acompañamos en la solicitud de tu crédito hipotecario o leasing." },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: banks } = useSuspenseQuery(banksQuery);
  const c = settings.creditos;
  const wa = whatsappLink(settings.contacto.whatsapp || settings.contacto.telefono, c.whatsapp_mensaje);

  return (
    <SiteLayout>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <p className="text-eyebrow text-primary-light">Financiación</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">{c.hero_titulo}</h1>
          {c.hero_descripcion ? <p className="mt-3 max-w-2xl opacity-85">{c.hero_descripcion}</p> : null}
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_440px] lg:px-8">
        <div className="space-y-6">
          {[
            { icon: Banknote, t: c.hipotecario_titulo, d: c.hipotecario_texto },
            { icon: KeyRound, t: c.leasing_titulo, d: c.leasing_texto },
          ].map((x) => (
            <div key={x.t} className="surface-panel p-6">
              <x.icon className="size-8 text-primary" />
              <h2 className="mt-3 font-display text-2xl font-bold">{x.t}</h2>
              {x.d ? <p className="mt-2 whitespace-pre-line text-muted-foreground">{x.d}</p> : null}
            </div>
          ))}
          {banks.length ? (
            <div>
              <h2 className="font-display text-xl font-bold">Entidades aliadas</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {banks.map((b) => (
                  <div key={b.id} className="surface-panel flex h-20 items-center justify-center p-3">
                    {b.logo_url ? <img src={b.logo_url} alt={b.name} loading="lazy" className="max-h-12 w-auto object-contain" /> : <span className="text-sm font-semibold">{b.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="surface-panel h-fit space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">Solicita tu asesoría</h2>
          <CreditForm />
          <Button asChild variant="outline" className="w-full">
            <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Hablar por WhatsApp</a>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
