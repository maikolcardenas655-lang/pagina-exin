import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitAcquisition, submitAppointment, submitContact, submitCreditApplication } from "@/lib/forms.functions";

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  textarea,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  defaultValue?: string;
  children?: ReactNode;
}) {
  const id = `f-${name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children ??
        (textarea ? (
          <Textarea id={id} name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} rows={4} />
        ) : (
          <Input id={id} name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} />
        ))}
    </div>
  );
}

export function NativeSelect({ name, options, defaultValue }: { name: string; options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <select
      id={`f-${name}`}
      name={name}
      defaultValue={defaultValue}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        No llenar
        <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function Consent() {
  return (
    <label className="flex items-start gap-2 text-sm text-muted-foreground">
      <input type="checkbox" name="consent" required className="mt-1 size-4 accent-[var(--color-primary)]" />
      <span>
        Autorizo el tratamiento de mis datos personales conforme a la{" "}
        <a href="/tratamiento-de-datos" className="text-primary underline" target="_blank" rel="noreferrer">
          política de tratamiento de datos
        </a>{" "}
        (Ley 1581 de 2012).
      </span>
    </label>
  );
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const v = str(fd, k).replace(/[^\d.]/g, "");
  return v ? Number(v) : null;
};

function useSubmit(fn: (fd: FormData) => Promise<unknown>) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      await fn(new FormData(form));
      form.reset();
      setDone(true);
      toast.success("¡Recibimos tu solicitud! Te contactaremos pronto.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.startsWith("[") ? "Revisa los datos del formulario." : msg || "No se pudo enviar.");
    } finally {
      setLoading(false);
    }
  };
  return { loading, done, onSubmit, reset: () => setDone(false) };
}

function Success({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <CheckCircle2 className="size-12 text-primary" />
      <p className="font-display text-lg font-semibold">¡Solicitud enviada!</p>
      <p className="text-sm text-muted-foreground">Un asesor de eXIn Grupo se comunicará contigo.</p>
      <Button variant="outline" onClick={onReset}>
        Enviar otra
      </Button>
    </div>
  );
}

function Submit({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}

const CONTACT_PREF = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "llamada", label: "Llamada" },
  { value: "correo", label: "Correo" },
];

export function ContactForm({ propertyCode, source = "contacto" }: { propertyCode?: string; source?: "contacto" | "propiedad" }) {
  const s = useSubmit((fd) =>
    submitContact({
      data: {
        honeypot: str(fd, "honeypot"),
        full_name: str(fd, "full_name"),
        email: str(fd, "email"),
        phone: str(fd, "phone"),
        message: str(fd, "message"),
        preferred_contact: str(fd, "preferred_contact"),
        property_code: propertyCode ?? str(fd, "property_code"),
        source,
        consent: fd.get("consent") === "on",
      } as never,
    }),
  );
  if (s.done) return <Success onReset={s.reset} />;
  return (
    <form onSubmit={s.onSubmit} className="relative space-y-4">
      <Honeypot />
      <Field label="Nombre completo" name="full_name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teléfono" name="phone" type="tel" required />
        <Field label="Correo" name="email" type="email" />
      </div>
      <Field label="Medio de contacto preferido" name="preferred_contact">
        <NativeSelect name="preferred_contact" options={CONTACT_PREF} />
      </Field>
      <Field label="Mensaje" name="message" textarea />
      <Consent />
      <Submit loading={s.loading}>Enviar mensaje</Submit>
    </form>
  );
}

export function CreditForm({ propertyCode }: { propertyCode?: string }) {
  const s = useSubmit((fd) =>
    submitCreditApplication({
      data: {
        honeypot: str(fd, "honeypot"),
        full_name: str(fd, "full_name"),
        email: str(fd, "email"),
        phone: str(fd, "phone"),
        city: str(fd, "city"),
        credit_type: str(fd, "credit_type") as "hipotecario" | "leasing",
        property_code: str(fd, "property_code"),
        approx_amount: num(fd, "approx_amount"),
        notes: str(fd, "notes"),
        consent: fd.get("consent") === "on",
      } as never,
    }),
  );
  if (s.done) return <Success onReset={s.reset} />;
  return (
    <form onSubmit={s.onSubmit} className="relative space-y-4">
      <Honeypot />
      <Field label="Nombre completo" name="full_name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teléfono" name="phone" type="tel" required />
        <Field label="Correo" name="email" type="email" />
        <Field label="Ciudad" name="city" />
        <Field label="Tipo de crédito" name="credit_type">
          <NativeSelect
            name="credit_type"
            options={[
              { value: "hipotecario", label: "Crédito hipotecario" },
              { value: "leasing", label: "Leasing habitacional" },
            ]}
          />
        </Field>
        <Field label="Código del inmueble (opcional)" name="property_code" defaultValue={propertyCode} />
        <Field label="Monto aproximado (COP)" name="approx_amount" type="text" />
      </div>
      <Field label="Comentarios" name="notes" textarea />
      <Consent />
      <Submit loading={s.loading}>Solicitar asesoría</Submit>
    </form>
  );
}

export function AppointmentForm({ propertyCode }: { propertyCode?: string }) {
  const s = useSubmit((fd) => {
    const when = str(fd, "scheduled_at");
    return submitAppointment({
      data: {
        honeypot: str(fd, "honeypot"),
        client_name: str(fd, "client_name"),
        client_phone: str(fd, "client_phone"),
        client_email: str(fd, "client_email"),
        property_code: propertyCode,
        scheduled_at: when ? new Date(when).toISOString() : null,
        notes: str(fd, "notes"),
        consent: fd.get("consent") === "on",
      } as never,
    });
  });
  if (s.done) return <Success onReset={s.reset} />;
  return (
    <form onSubmit={s.onSubmit} className="relative space-y-4">
      <Honeypot />
      <Field label="Nombre completo" name="client_name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teléfono" name="client_phone" type="tel" required />
        <Field label="Correo" name="client_email" type="email" />
      </div>
      <Field label="Fecha y hora preferida" name="scheduled_at" type="datetime-local" />
      <Field label="Comentarios" name="notes" textarea />
      <Consent />
      <Submit loading={s.loading}>Agendar visita</Submit>
    </form>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function AcquisitionForm({ propertyTypes, arriendo }: { propertyTypes: { name: string }[]; arriendo: boolean }) {
  const s = useSubmit(async (fd) => {
    const files = (fd.getAll("photos") as File[]).filter((f) => f && f.size > 0).slice(0, 12);
    if (files.some((f) => f.size > 6 * 1024 * 1024)) throw new Error("Cada foto debe pesar menos de 6 MB.");
    const photos = await Promise.all(
      files.map(async (f) => ({ name: f.name, type: f.type as "image/jpeg", dataBase64: await fileToBase64(f) })),
    );
    return submitAcquisition({
      data: {
        honeypot: str(fd, "honeypot"),
        owner_name: str(fd, "owner_name"),
        owner_phone: str(fd, "owner_phone"),
        owner_email: str(fd, "owner_email"),
        preferred_contact: str(fd, "preferred_contact"),
        property_type: str(fd, "property_type"),
        operation: (str(fd, "operation") || "venta") as "venta",
        address: str(fd, "address"),
        city: str(fd, "city"),
        zone: str(fd, "zone"),
        expected_price: num(fd, "expected_price"),
        area_m2: num(fd, "area_m2"),
        bedrooms: num(fd, "bedrooms"),
        bathrooms: num(fd, "bathrooms"),
        parking: num(fd, "parking"),
        notes: str(fd, "notes"),
        consent: fd.get("consent") === "on",
        photos,
      } as never,
    });
  });
  if (s.done) return <Success onReset={s.reset} />;
  return (
    <form onSubmit={s.onSubmit} className="relative space-y-6">
      <Honeypot />
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-semibold">Datos del propietario</legend>
        <Field label="Nombre completo" name="owner_name" required />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Teléfono" name="owner_phone" type="tel" required />
          <Field label="Correo" name="owner_email" type="email" />
          <Field label="Contacto preferido" name="preferred_contact">
            <NativeSelect name="preferred_contact" options={CONTACT_PREF} />
          </Field>
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-semibold">Datos del inmueble</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tipo de inmueble" name="property_type">
            <NativeSelect name="property_type" options={propertyTypes.map((t) => ({ value: t.name, label: t.name }))} />
          </Field>
          <Field label="Operación" name="operation">
            <NativeSelect
              name="operation"
              options={[{ value: "venta", label: "Venta" }, ...(arriendo ? [{ value: "arriendo", label: "Arriendo" }] : [])]}
            />
          </Field>
          <Field label="Precio esperado (COP)" name="expected_price" />
          <Field label="Ciudad" name="city" />
          <Field label="Barrio / zona" name="zone" />
          <Field label="Dirección" name="address" />
          <Field label="Área (m²)" name="area_m2" type="number" />
          <Field label="Habitaciones" name="bedrooms" type="number" />
          <Field label="Baños" name="bathrooms" type="number" />
          <Field label="Parqueaderos" name="parking" type="number" />
        </div>
        <Field label="Descripción / observaciones" name="notes" textarea />
        <Field label="Fotografías (hasta 12, máx. 6 MB c/u)" name="photos">
          <Input id="f-photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        </Field>
      </fieldset>
      <Consent />
      <Submit loading={s.loading}>Enviar mi inmueble</Submit>
    </form>
  );
}
