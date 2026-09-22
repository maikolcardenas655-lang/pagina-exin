import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Car, MapPin, Ruler } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCOP, formatNumber, OPERATION_LABEL } from "@/lib/format";
import type { PublicProperty } from "@/lib/public.functions";

export function PropertyCard({ property }: { property: PublicProperty }) {
  return (
    <article className="surface-panel group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.cover_url ? (
          <img
            src={property.cover_url}
            alt={`${property.type_name ?? "Inmueble"} ${property.name} en ${property.city ?? "Colombia"}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Sin fotografía
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground">
            {OPERATION_LABEL[property.operation]}
          </Badge>
          {property.is_featured ? <Badge variant="secondary">Destacada</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {property.type_name ?? "Inmueble"} · Código {property.verification_code}
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-foreground">{property.name}</h3>
          {property.city ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {[property.zone, property.city].filter(Boolean).join(" · ")}
              </span>
            </p>
          ) : null}
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {property.bedrooms !== null ? (
            <li className="flex items-center gap-1.5">
              <BedDouble className="size-4" aria-hidden="true" />
              {property.bedrooms} Hab.
            </li>
          ) : null}
          {property.bathrooms !== null ? (
            <li className="flex items-center gap-1.5">
              <Bath className="size-4" aria-hidden="true" />
              {property.bathrooms} Baños
            </li>
          ) : null}
          {property.area_m2 !== null ? (
            <li className="flex items-center gap-1.5">
              <Ruler className="size-4" aria-hidden="true" />
              {formatNumber(property.area_m2, " m²")}
            </li>
          ) : null}
          {property.parking !== null ? (
            <li className="flex items-center gap-1.5">
              <Car className="size-4" aria-hidden="true" />
              {property.parking}
            </li>
          ) : null}
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-border pt-4">
          <p className="text-price text-xl text-foreground">
            {formatCOP(property.price, property.currency)}
          </p>
          <Link
            to="/propiedades/$slug"
            params={{ slug: property.slug }}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Ver propiedad →
          </Link>
        </div>
      </div>
    </article>
  );
}
