import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Envíos públicos de formularios.
 * Validación en servidor + honeypot + límite de envíos por huella (IP/UA).
 * Las inserciones se hacen del lado del servidor: las tablas no permiten
 * escritura desde el navegador.
 */

const antiSpam = {
  honeypot: z.string().max(0).optional().or(z.literal("")),
};

const texto = (max: number) => z.string().trim().min(1).max(max);
const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));
const telefono = z.string().trim().min(7).max(25).regex(/^[0-9+()\s-]+$/, "Teléfono no válido");
const correo = z.string().trim().email().max(180);

const contactSchema = z.object({
  ...antiSpam,
  full_name: texto(120),
  email: correo.optional().or(z.literal("")).transform((v) => (v ? v : null)),
  phone: telefono,
  message: opcional(1500),
  preferred_contact: opcional(40),
  property_code: opcional(40),
  source: z.enum(["contacto", "propiedad", "cita", "otro"]).default("contacto"),
  consent: z.literal(true),
});

const creditSchema = z.object({
  ...antiSpam,
  full_name: texto(120),
  email: correo.optional().or(z.literal("")).transform((v) => (v ? v : null)),
  phone: telefono,
  city: opcional(80),
  credit_type: z.enum(["hipotecario", "leasing"]),
  property_code: opcional(40),
  approx_amount: z.number().nonnegative().max(1e12).nullish().transform((v) => v ?? null),
  notes: opcional(1500),
  consent: z.literal(true),
});

const acquisitionSchema = z.object({
  ...antiSpam,
  owner_name: texto(120),
  owner_phone: telefono,
  owner_email: correo.optional().or(z.literal("")).transform((v) => (v ? v : null)),
  preferred_contact: opcional(40),
  property_type: opcional(60),
  operation: z.enum(["venta", "arriendo"]),
  address: opcional(180),
  city: opcional(80),
  zone: opcional(80),
  expected_price: z.number().nonnegative().max(1e12).nullish().transform((v) => v ?? null),
  area_m2: z.number().nonnegative().max(1e6).nullish().transform((v) => v ?? null),
  bedrooms: z.number().int().min(0).max(50).nullish().transform((v) => v ?? null),
  bathrooms: z.number().int().min(0).max(50).nullish().transform((v) => v ?? null),
  parking: z.number().int().min(0).max(50).nullish().transform((v) => v ?? null),
  notes: opcional(2000),
  consent: z.literal(true),
  photos: z
    .array(
      z.object({
        name: z.string().max(180),
        type: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]),
        dataBase64: z.string().max(9_000_000),
      }),
    )
    .max(12)
    .optional(),
});

const appointmentSchema = z.object({
  ...antiSpam,
  client_name: texto(120),
  client_phone: telefono,
  client_email: correo.optional().or(z.literal("")).transform((v) => (v ? v : null)),
  property_code: opcional(40),
  scheduled_at: z.string().datetime().nullish().transform((v) => v ?? null),
  notes: opcional(800),
  consent: z.literal(true),
});

function fingerprint(): string {
  try {
    const request = getRequest();
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "sin-ip";
    const ua = request.headers.get("user-agent") ?? "sin-ua";
    return `${ip}|${ua.slice(0, 80)}`;
  } catch {
    return "sin-origen";
  }
}

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

/** Máximo 5 envíos por huella cada 10 minutos. */
async function checkRateLimit(admin: AdminClient, kind: string) {
  const fp = fingerprint();
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("submission_log")
    .select("id", { count: "exact", head: true })
    .eq("fingerprint", fp)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) {
    throw new Error("Has enviado demasiadas solicitudes. Intenta de nuevo en unos minutos.");
  }
  await admin.from("submission_log").insert({ fingerprint: fp, kind });
}

async function resolvePropertyId(admin: AdminClient, code: string | null) {
  if (!code) return null;
  const { data } = await admin
    .from("properties")
    .select("id")
    .eq("verification_code", code)
    .maybeSingle();
  return data?.id ?? null;
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await checkRateLimit(supabaseAdmin, "contacto");
    const { honeypot, property_code, ...rest } = data;
    if (honeypot) return { ok: true };
    const property_id = await resolvePropertyId(supabaseAdmin, property_code);
    const { error } = await supabaseAdmin
      .from("contacts")
      .insert({ ...rest, property_code, property_id });
    if (error) throw new Error("No pudimos registrar tu mensaje. Intenta nuevamente.");
    return { ok: true };
  });

export const submitCreditApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => creditSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await checkRateLimit(supabaseAdmin, "credito");
    const { honeypot, property_code, ...rest } = data;
    if (honeypot) return { ok: true };
    const property_id = await resolvePropertyId(supabaseAdmin, property_code);
    const { error } = await supabaseAdmin
      .from("credit_applications")
      .insert({ ...rest, property_code, property_id });
    if (error) throw new Error("No pudimos registrar tu solicitud. Intenta nuevamente.");
    return { ok: true };
  });

export const submitAppointment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => appointmentSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await checkRateLimit(supabaseAdmin, "cita");
    const { honeypot, property_code, consent, ...rest } = data;
    if (honeypot) return { ok: true };
    const property_id = await resolvePropertyId(supabaseAdmin, property_code);
    const { error } = await supabaseAdmin
      .from("appointments")
      .insert({ ...rest, property_code, property_id });
    if (error) throw new Error("No pudimos registrar tu solicitud de visita.");
    return { ok: true };
  });

const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const submitAcquisition = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => acquisitionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await checkRateLimit(supabaseAdmin, "captacion");
    const { honeypot, photos, ...rest } = data;
    if (honeypot) return { ok: true };

    const { data: inserted, error } = await supabaseAdmin
      .from("acquisitions")
      .insert(rest)
      .select("id")
      .single();
    if (error || !inserted) throw new Error("No pudimos registrar tu propiedad. Intenta nuevamente.");

    let index = 0;
    for (const photo of photos ?? []) {
      const ext = EXT_BY_TYPE[photo.type];
      if (!ext) continue;
      const binary = Uint8Array.from(atob(photo.dataBase64), (c) => c.charCodeAt(0));
      if (binary.byteLength > MAX_PHOTO_BYTES) continue;
      const path = `${inserted.id}/${Date.now()}-${index}.${ext}`;
      const upload = await supabaseAdmin.storage
        .from("acquisition-photos")
        .upload(path, binary, { contentType: photo.type, upsert: false });
      if (!upload.error) {
        await supabaseAdmin
          .from("acquisition_photos")
          .insert({ acquisition_id: inserted.id, storage_path: path, sort_order: index });
      }
      index += 1;
    }

    return { ok: true };
  });
