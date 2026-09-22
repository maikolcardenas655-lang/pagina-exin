import { queryOptions } from "@tanstack/react-query";

import {
  getPropertyBySlug,
  getSiteSettings,
  listBanks,
  listCities,
  listFeaturedProperties,
  listProperties,
  listPropertyTypes,
  type PropertyFilters,
} from "./public.functions";

export const settingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 5 * 60 * 1000,
});

export const propertyTypesQuery = queryOptions({
  queryKey: ["property-types"],
  queryFn: () => listPropertyTypes(),
  staleTime: 10 * 60 * 1000,
});

export const citiesQuery = queryOptions({
  queryKey: ["cities"],
  queryFn: () => listCities(),
  staleTime: 10 * 60 * 1000,
});

export const featuredQuery = queryOptions({
  queryKey: ["featured-properties"],
  queryFn: () => listFeaturedProperties(),
  staleTime: 60 * 1000,
});

export const banksQuery = queryOptions({
  queryKey: ["banks"],
  queryFn: () => listBanks(),
  staleTime: 5 * 60 * 1000,
});

export const propertiesQuery = (filters: PropertyFilters) =>
  queryOptions({
    queryKey: ["properties", filters],
    queryFn: () => listProperties({ data: filters }),
    staleTime: 30 * 1000,
  });

export const propertyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["property", slug],
    queryFn: () => getPropertyBySlug({ data: { slug } }),
    staleTime: 60 * 1000,
  });
