import { createFileRoute } from "@tanstack/react-router";

import { settingsQuery } from "@/lib/queries";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/tratamiento-de-datos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => ({
    meta: [
      { title: "Tratamiento de datos personales — eXIn Grupo" },
      { name: "description", content: "Política de tratamiento de datos personales de eXIn Grupo conforme a la Ley 1581 de 2012." },
      { property: "og:title", content: "Tratamiento de datos personales — eXIn Grupo" },
      { property: "og:description", content: "Política de tratamiento de datos (Ley 1581 de 2012)." },
    ],
  }),
  component: () => <LegalPage title="Política de tratamiento de datos personales" field="tratamiento_datos" />,
});
