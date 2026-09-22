import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ContactForm } from "@/components/site/forms";
import { whatsappLink } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contacto")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => ({
    meta: [
      { title: "Contacto — eXIn Grupo" },
      { name: "description", content: "Comunícate con eXIn Grupo: escríbenos, llámanos o envíanos un mensaje por WhatsApp." },
      { property: "og:title", content: "Contacto — eXIn Grupo" },
      { property: "og:description", content: "Escríbenos y un asesor te responderá pronto." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const c = settings.contacto;
  const items = [
    c.telefono && { icon: Phone, label: "Teléfono", value: c.telefono, href: `tel:${c.telefono}` },
    c.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: c.whatsapp, href: whatsappLink(c.whatsapp, "Hola, quisiera información.") },
    c.correo && { icon: Mail, label: "Correo", value: c.correo, href: `mailto:${c.correo}` },
    (c.direccion || settings.empresa.direccion) && { icon: MapPin, label: "Dirección", value: c.direccion || settings.empresa.direccion, href: "" },
    settings.empresa.horarios && { icon: Clock, label: "Horario", value: settings.empresa.horarios, href: "" },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href: string }[];

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Contáctanos</h1>
          <p className="mt-2 text-muted-foreground">Déjanos tus datos y te responderemos lo antes posible.</p>
          <ul className="mt-8 space-y-4">
            {items.map((i) => (
              <li key={i.label} className="flex items-start gap-3">
                <i.icon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{i.label}</p>
                  {i.href ? <a href={i.href} className="font-medium hover:text-primary">{i.value}</a> : <p className="whitespace-pre-line font-medium">{i.value}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-panel p-6"><ContactForm /></div>
      </div>
    </SiteLayout>
  );
}
