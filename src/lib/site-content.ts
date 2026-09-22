/** Formas de los bloques de contenido editables desde administración. */

export type EmpresaSettings = {
  razon_social: string;
  nombre_comercial: string;
  nit: string;
  logo_path: string;
  direccion: string;
  ciudad: string;
  horarios: string;
};

export type ContactoSettings = {
  telefono: string;
  whatsapp: string;
  correo: string;
  direccion: string;
};

export type RedesSettings = {
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
};

export type SeoSettings = {
  titulo: string;
  descripcion: string;
  imagen: string;
};

export type HomeSettings = {
  hero_titulo: string;
  hero_subtitulo: string;
  hero_descripcion: string;
  hero_imagen: string;
  hero_boton_texto: string;
  hero_boton_url: string;
  servicios: { titulo: string; texto: string }[];
  cta_titulo: string;
  cta_texto: string;
};

export type CreditosSettings = {
  hero_titulo: string;
  hero_descripcion: string;
  hipotecario_titulo: string;
  hipotecario_texto: string;
  leasing_titulo: string;
  leasing_texto: string;
  whatsapp_mensaje: string;
};

export type CaptacionSettings = {
  hero_titulo: string;
  hero_descripcion: string;
  texto_legal: string;
};

export type PropiedadesSettings = {
  arriendo_activo: boolean;
  whatsapp_mensaje: string;
};

export type LegalSettings = {
  politica_privacidad: string;
  tratamiento_datos: string;
};

export type SiteSettings = {
  empresa: EmpresaSettings;
  contacto: ContactoSettings;
  redes: RedesSettings;
  seo: SeoSettings;
  home: HomeSettings;
  creditos: CreditosSettings;
  captacion: CaptacionSettings;
  propiedades: PropiedadesSettings;
  legal: LegalSettings;
};

export const SETTINGS_KEYS = [
  "empresa",
  "contacto",
  "redes",
  "seo",
  "home",
  "creditos",
  "captacion",
  "propiedades",
  "legal",
] as const;

export const SETTINGS_LABELS: Record<(typeof SETTINGS_KEYS)[number], string> = {
  empresa: "Empresa",
  contacto: "Contacto",
  redes: "Redes sociales",
  seo: "SEO",
  home: "Página principal",
  creditos: "Créditos",
  captacion: "Captación",
  propiedades: "Propiedades",
  legal: "Legal",
};

export const EMPTY_SETTINGS: SiteSettings = {
  empresa: {
    razon_social: "",
    nombre_comercial: "eXIn Grupo",
    nit: "",
    logo_path: "",
    direccion: "",
    ciudad: "",
    horarios: "",
  },
  contacto: { telefono: "", whatsapp: "", correo: "", direccion: "" },
  redes: { facebook: "", instagram: "", youtube: "", linkedin: "", tiktok: "" },
  seo: { titulo: "eXIn Grupo", descripcion: "Plataforma inmobiliaria de eXIn Grupo.", imagen: "" },
  home: {
    hero_titulo: "Encuentra el inmueble perfecto para ti",
    hero_subtitulo: "",
    hero_descripcion: "",
    hero_imagen: "",
    hero_boton_texto: "Ver propiedades",
    hero_boton_url: "/propiedades",
    servicios: [],
    cta_titulo: "",
    cta_texto: "",
  },
  creditos: {
    hero_titulo: "Créditos y leasing",
    hero_descripcion: "",
    hipotecario_titulo: "Crédito hipotecario",
    hipotecario_texto: "",
    leasing_titulo: "Leasing habitacional",
    leasing_texto: "",
    whatsapp_mensaje: "Hola, estoy interesado en recibir asesoría para un crédito.",
  },
  captacion: { hero_titulo: "Vende tu propiedad", hero_descripcion: "", texto_legal: "" },
  propiedades: { arriendo_activo: false, whatsapp_mensaje: "Hola, estoy interesado en la propiedad" },
  legal: { politica_privacidad: "", tratamiento_datos: "" },
};

export function mergeSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const result = structuredClone(EMPTY_SETTINGS) as Record<string, Record<string, unknown>>;
  for (const row of rows) {
    if (row.key in result && row.value && typeof row.value === "object") {
      result[row.key] = { ...result[row.key], ...(row.value as Record<string, unknown>) };
    }
  }
  return result as unknown as SiteSettings;
}
