export function formatCOP(value: number | null | undefined, currency = "COP"): string {
  if (value === null || value === undefined) return "Precio a consultar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatNumber(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(Number(value))}${suffix}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function timeAgo(value: string | null | undefined): string {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

/** Enlace de WhatsApp con mensaje contextual. Nunca inyecta texto sin codificar. */
export function whatsappLink(phone: string | undefined | null, message: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const text = encodeURIComponent(message.slice(0, 600));
  if (!digits) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${digits}?text=${text}`;
}

export const OPERATION_LABEL: Record<string, string> = {
  venta: "En venta",
  arriendo: "En arriendo",
};

export const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  vendida: "Vendida",
  arrendada: "Arrendada",
  archivada: "Archivada",
};
