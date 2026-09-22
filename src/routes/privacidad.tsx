import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/privacidad")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => ({
    meta: [
      { title: "Política de privacidad — eXIn Grupo" },
      { name: "description", content: "Política de privacidad de eXIn Grupo." },
      { property: "og:title", content: "Política de privacidad — eXIn Grupo" },
      { property: "og:description", content: "Conoce cómo eXIn Grupo protege tu información." },
    ],
  }),
  component: () => <LegalPage title="Política de privacidad" field="politica_privacidad" />,
});

export function LegalPage({ title, field }: { title: string; field: "politica_privacidad" | "tratamiento_datos" }) {
  const { data } = useSuspenseQuery(settingsQuery);
  const text = data.legal[field];
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="font-display text-3xl font-extrabold">{title}</h1>
        <div className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">
          {text || "Este documento está en preparación. Para más información contáctanos."}
        </div>
      </article>
    </SiteLayout>
  );
}
