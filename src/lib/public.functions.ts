import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { mergeSettings, type SiteSettings } from "./site-content";

export type PublicProperty = {
  id: string;
  verification_code: string;
  name: string;
  slug: string;
  operation: "venta" | "arriendo";
  type_name: string | null;
  price: number | null;
  admin_fee: number | null;
  currency: string;
  city: string | null;
  zone: string | null;
  address: string | null;
  stratum: number | null;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  amenities: string[];
  description: string | null;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  cover_url: string | null;
  created_at: string;
};

export type PublicPropertyDetail = PublicProperty & {
  gallery: { url: string; alt: string }[];
};

const filtersSchema = z.object({
  operation: z.enum(["venta", "arriendo"]).optional(),
  typeSlug: z.string().max(60).optional(),
  city: z.string().max(80).optional(),
  code: z.string().max(40).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  q: z.string().max(120).optional(),
  page: z.number().int().min(1).max(200).optional(),
});

export type PropertyFilters = z.infer<typeof filtersSchema>;

const PAGE_SIZE = 12;

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const { createPublicClient } = await import("./supabase-public.server");
    const client = createPublicClient();
    const { data } = await client.from("site_settings").select("key, value");
    return mergeSettings(data ?? []);
  },
);

export const listPropertyTypes = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const client = createPublicClient();
  const { data } = await client
    .from("property_types")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
});

export const listCities = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const client = createPublicClient();
  const { data } = await client
    .from("properties")
    .select("city")
    .eq("status", "publicada")
    .not("city", "is", null);
  return [...new Set((data ?? []).map((r) => r.city as string))].sort();
});

const SELECT_COLUMNS =
  "id, verification_code, name, slug, operation, price, admin_fee, currency, city, zone, address, stratum, area_m2, bedrooms, bathrooms, parking, amenities, description, is_featured, seo_title, seo_description, cover_image_path, created_at, property_types(name)";

type Row = Record<string, unknown> & { property_types?: { name: string } | null };

function mapRow(row: Row, covers: Record<string, string>): PublicProperty {
  const coverPath = (row["cover_image_path"] as string | null) ?? null;
  return {
    id: row["id"] as string,
    verification_code: row["verification_code"] as string,
    name: row["name"] as string,
    slug: row["slug"] as string,
    operation: row["operation"] as "venta" | "arriendo",
    type_name: row.property_types?.name ?? null,
    price: row["price"] === null ? null : Number(row["price"]),
    admin_fee: row["admin_fee"] === null ? null : Number(row["admin_fee"]),
    currency: (row["currency"] as string) ?? "COP",
    city: (row["city"] as string) ?? null,
    zone: (row["zone"] as string) ?? null,
    address: (row["address"] as string) ?? null,
    stratum: (row["stratum"] as number) ?? null,
    area_m2: row["area_m2"] === null ? null : Number(row["area_m2"]),
    bedrooms: (row["bedrooms"] as number) ?? null,
    bathrooms: (row["bathrooms"] as number) ?? null,
    parking: (row["parking"] as number) ?? null,
    amenities: (row["amenities"] as string[]) ?? [],
    description: (row["description"] as string) ?? null,
    is_featured: Boolean(row["is_featured"]),
    seo_title: (row["seo_title"] as string) ?? null,
    seo_description: (row["seo_description"] as string) ?? null,
    cover_url: coverPath ? (covers[coverPath] ?? null) : null,
    created_at: row["created_at"] as string,
  };
}

export const listProperties = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => filtersSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { createPublicClient, signPaths } = await import("./supabase-public.server");
    const client = createPublicClient();
    const page = data.page ?? 1;

    let query = client
      .from("properties")
      .select(SELECT_COLUMNS, { count: "exact" })
      .eq("status", "publicada");

    if (data.operation) query = query.eq("operation", data.operation);
    if (data.city) query = query.eq("city", data.city);
    if (data.code) query = query.eq("verification_code", data.code.trim());
    if (data.minPrice !== undefined) query = query.gte("price", data.minPrice);
    if (data.maxPrice !== undefined) query = query.lte("price", data.maxPrice);
    if (data.bedrooms !== undefined) query = query.gte("bedrooms", data.bedrooms);
    if (data.bathrooms !== undefined) query = query.gte("bathrooms", data.bathrooms);
    if (data.q) {
      const term = data.q.replace(/[%,()]/g, " ").trim();
      if (term) query = query.or(`name.ilike.%${term}%,city.ilike.%${term}%,zone.ilike.%${term}%`);
    }
    if (data.typeSlug) {
      const { data: type } = await client
        .from("property_types")
        .select("id")
        .eq("slug", data.typeSlug)
        .maybeSingle();
      if (type) query = query.eq("property_type_id", type.id);
    }

    const from = (page - 1) * PAGE_SIZE;
    const { data: rows, count } = await query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    const list = (rows ?? []) as Row[];
    const covers = await signPaths(
      client,
      "property-images",
      list.map((r) => (r["cover_image_path"] as string) ?? ""),
    );

    return {
      items: list.map((row) => mapRow(row, covers)),
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
    };
  });

export const listFeaturedProperties = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient, signPaths } = await import("./supabase-public.server");
  const client = createPublicClient();
  const { data: rows } = await client
    .from("properties")
    .select(SELECT_COLUMNS)
    .eq("status", "publicada")
    .eq("is_featured", true)
    .order("featured_at", { ascending: false })
    .limit(5);
  const list = (rows ?? []) as Row[];
  const covers = await signPaths(
    client,
    "property-images",
    list.map((r) => (r["cover_image_path"] as string) ?? ""),
  );
  return list.map((row) => mapRow(row, covers));
});

export const getPropertyBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }): Promise<PublicPropertyDetail | null> => {
    const { createPublicClient, signPaths } = await import("./supabase-public.server");
    const client = createPublicClient();
    const { data: row } = await client
      .from("properties")
      .select(SELECT_COLUMNS)
      .eq("slug", data.slug)
      .eq("status", "publicada")
      .maybeSingle();
    if (!row) return null;

    const { data: images } = await client
      .from("property_images")
      .select("storage_path, alt_text, sort_order, is_cover")
      .eq("property_id", (row as Row)["id"] as string)
      .order("is_cover", { ascending: false })
      .order("sort_order");

    const paths = [
      ((row as Row)["cover_image_path"] as string) ?? "",
      ...(images ?? []).map((i) => i.storage_path),
    ];
    const signed = await signPaths(client, "property-images", paths);
    const base = mapRow(row as Row, signed);

    return {
      ...base,
      gallery: (images ?? [])
        .filter((i) => signed[i.storage_path])
        .map((i) => ({ url: signed[i.storage_path]!, alt: i.alt_text ?? base.name })),
    };
  });

export const listBanks = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient, signPaths } = await import("./supabase-public.server");
  const client = createPublicClient();
  const { data } = await client
    .from("banks")
    .select("id, name, logo_path, website")
    .eq("is_active", true)
    .order("sort_order");
  const rows = data ?? [];
  const signed = await signPaths(
    client,
    "site-assets",
    rows.map((r) => r.logo_path ?? ""),
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    website: r.website,
    logo_url: r.logo_path ? (signed[r.logo_path] ?? null) : null,
  }));
});

export const listPropertySlugs = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const client = createPublicClient();
  const { data } = await client
    .from("properties")
    .select("slug, updated_at")
    .eq("status", "publicada")
    .order("updated_at", { ascending: false })
    .limit(5000);
  return data ?? [];
});
