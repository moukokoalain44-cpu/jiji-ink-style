import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { portfolio, type Category } from "@/data/site";
import workTattoo from "@/assets/work-tattoo-1.jpg";
import workPiercing from "@/assets/work-piercing-1.jpg";
import skincare from "@/assets/skincare-1.jpg";
import heroSalon from "@/assets/hero-salon.jpg";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Réalisations tatouage & piercing | Jiji Tattoo" },
      {
        name: "description",
        content:
          "Galerie filtrable des réalisations du studio Jiji Tattoo : tatouages, piercings et soins, par artiste.",
      },
      { property: "og:title", content: "Portfolio — Jiji Tattoo" },
      {
        property: "og:description",
        content: "Réalisations filtrables par type de prestation et par artiste.",
      },
    ],
  }),
  component: Portfolio,
});

const images: Record<Category, string> = {
  Tatouage: workTattoo,
  Piercing: workPiercing,
  Skincare: skincare,
};

const categories = ["Tous", "Tatouage", "Piercing", "Skincare"] as const;
const artists = ["Tous", "Jiji", "Malo", "Nour", "Léa"] as const;

function Portfolio() {
  const [cat, setCat] = useState<(typeof categories)[number]>("Tous");
  const [artist, setArtist] = useState<(typeof artists)[number]>("Tous");

  const items = useMemo(
    () =>
      portfolio.filter(
        (p) => (cat === "Tous" || p.category === cat) && (artist === "Tous" || p.artist === artist),
      ),
    [cat, artist],
  );

  return (
    <>
      <PageHeader
        eyebrow="Réalisations"
        title="Portfolio."
        intro="Chaque pièce est unique. Filtrez par prestation ou par artiste pour trouver le style qui vous ressemble."
      />

      <div className="section-x py-16">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border pb-6">
          <span className="eyebrow text-muted-foreground">Prestation</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs uppercase tracking-[0.18em] transition-colors ${
                cat === c ? "text-foreground underline underline-offset-8" : "text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="eyebrow text-muted-foreground">Artiste</span>
          {artists.map((a) => (
            <button
              key={a}
              onClick={() => setArtist(a)}
              className={`text-xs uppercase tracking-[0.18em] transition-colors ${
                artist === a ? "text-foreground underline underline-offset-8" : "text-muted-foreground"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="group">
              <div className="overflow-hidden bg-secondary">
                <img
                  src={images[item.category] ?? heroSalon}
                  alt={item.title}
                  loading="lazy"
                  className={`w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 ${
                    item.ratio === "wide" ? "aspect-[4/3]" : "aspect-[3/4]"
                  }`}
                />
              </div>
              <figcaption className="mt-4 flex items-baseline justify-between">
                <span className="font-display text-xl">{item.title}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.category} · {item.artist}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {items.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">
            Aucune réalisation pour cette combinaison de filtres.
          </p>
        )}
      </div>
    </>
  );
}
