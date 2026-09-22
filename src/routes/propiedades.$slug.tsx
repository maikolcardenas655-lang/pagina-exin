import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bath, BedDouble, Car, Check, MapPin, MessageCircle, Ruler } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { AppointmentForm, ContactForm, CreditForm } from "@/components/site/forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCOP, formatNumber, OPERATION_LABEL, whatsappLink } from "@/lib/format";
import { propertyQuery, settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/propiedades/$slug")({
  loader: async ({ context, params }) => {
    const [p] = await Promise.all([
      context.queryClient.ensureQueryData(propertyQuery(params.slug)),
      context.queryClient.ensureQueryData(settingsQuery),
    ]);
    if (!p) throw notFound();
    return { title: p.seo_title || `${p.name} — eXIn Grupo`, description: p.seo_description || (p.description ?? "").slice(0, 155), image: p.cover_url };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Inmueble no disponible — eXIn Grupo" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        ...(loaderData.image ? [{ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image }] : []),
      ],
    };
  },
  notFoundComponent: PropertyNotFound,
  component: PropertyDetail,
});

function PropertyNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Este inmueble no está disponible</h1>
      <Link to="/propiedades" className="mt-4 inline-block text-primary underline">Ver otras propiedades</Link>
    </div>
  );
}

function PropertyDetail() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(propertyQuery(slug));
  const { data: settings } = useSuspenseQuery(settingsQuery);
  if (!p) return <PropertyNotFound />;
  const wa = whatsappLink(settings.contacto.whatsapp || settings.contacto.telefono, `${settings.propiedades.whatsapp_mensaje} ${p.name} (código ${p.verification_code}).`);
  const specs = [
    { icon: Ruler, label: "Área", value: formatNumber(p.area_m2, " m²") },
    { icon: BedDouble, label: "Habitaciones", value: formatNumber(p.bedrooms) },
    { icon: Bath, label: "Baños", value: formatNumber(p.bathrooms) },
    { icon: Car, label: "Parqueaderos", value: formatNumber(p.parking) },
  ];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/propiedades" className="hover:text-primary">Propiedades</Link> / {p.name}
        </nav>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            <PropertyGallery images={p.gallery.length ? p.gallery : p.cover_url ? [{ url: p.cover_url, alt: p.name }] : []} title={p.name} />
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{OPERATION_LABEL[p.operation]}</Badge>
                {p.type_name ? <Badge variant="secondary">{p.type_name}</Badge> : null}
                <Badge variant="outline">Código {p.verification_code}</Badge>
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold">{p.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-4" /> {[p.zone, p.city].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((s) => (
                <div key={s.label} className="surface-panel p-4">
                  <s.icon className="size-5 text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
            {p.description ? (
              <section>
                <h2 className="font-display text-xl font-bold">Descripción</h2>
                <p className="mt-2 whitespace-pre-line text-muted-foreground">{p.description}</p>
              </section>
            ) : null}
            {p.amenities.length ? (
              <section>
                <h2 className="font-display text-xl font-bold">Características</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {p.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm"><Check className="size-4 text-primary" /> {a}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {p.stratum ? <p className="text-sm text-muted-foreground">Estrato {p.stratum}</p> : null}
          </div>

          <aside className="space-y-4">
            <div className="surface-panel sticky top-24 space-y-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">Precio</p>
                <p className="text-price text-3xl">{formatCOP(p.price, p.currency)}</p>
                {p.admin_fee ? <p className="text-sm text-muted-foreground">Administración: {formatCOP(p.admin_fee)}</p> : null}
              </div>
              <Button asChild size="lg" className="w-full">
                <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Escribir por WhatsApp</a>
              </Button>
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="visita">Visita</TabsTrigger>
                  <TabsTrigger value="credito">Financiar</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="pt-3"><ContactForm propertyCode={p.verification_code} source="propiedad" /></TabsContent>
                <TabsContent value="visita" className="pt-3"><AppointmentForm propertyCode={p.verification_code} /></TabsContent>
                <TabsContent value="credito" className="pt-3"><CreditForm propertyCode={p.verification_code} /></TabsContent>
              </Tabs>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
