import { useState } from "react";

export function PropertyGallery({
  images,
  title,
}: {
  images: { url: string; alt: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Galería pendiente
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)]!;

  return (
    <section aria-label="Galería de la propiedad" className="space-y-3">
      <div className="overflow-hidden rounded-lg bg-muted">
        <img
          src={current.url}
          alt={current.alt || title}
          className="aspect-video w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver fotografía ${index + 1}`}
                aria-current={index === active}
                className={`block w-full overflow-hidden rounded-md border-2 transition-colors ${
                  index === active ? "border-primary" : "border-transparent hover:border-border"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt || `${title} — fotografía ${index + 1}`}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
