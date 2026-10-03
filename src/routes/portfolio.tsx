import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { portfolio as seedPortfolio, type Category } from "@/data/site";
import workTattoo from "@/assets/work-tattoo-1.jpg";
import workPiercing from "@/assets/work-piercing-1.jpg";
import skincare from "@/assets/skincare-1.jpg";
import heroSalon from "@/assets/hero-salon.jpg";
import { getGalleryImages } from "@/lib/supabase";
import { X, ChevronLeft, ChevronRight, SlidersHorizontal, Eye } from "lucide-react";

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
        content: "Réalisations filtrables par type de prestation, style et artiste.",
      },
    ],
  }),
  component: Portfolio,
});

const defaultImages: Record<Category, string> = {
  Tatouage: workTattoo,
  Piercing: workPiercing,
  Skincare: skincare,
};

const categories = ["Tous", "Tatouage", "Piercing", "Skincare"] as const;
const artists = ["Tous", "Jiji", "Malo", "Nour", "Léa"] as const;
const styles = ["Tous", "Fine line", "Blackwork", "Réalisme", "Titane", "Cicatrisation"] as const;

type PortfolioItem = {
  id: string | number;
  title: string;
  category: Category;
  artist: string;
  ratio: "tall" | "wide";
  image_url?: string;
  image_avant?: string | null;
  image_apres?: string | null;
  description?: string;
  tags?: string[];
};

function Portfolio() {
  const [cat, setCat] = useState<(typeof categories)[number]>("Tous");
  const [artist, setArtist] = useState<(typeof artists)[number]>("Tous");
  const [style, setStyle] = useState<(typeof styles)[number]>("Tous");
  const [itemsList, setItemsList] = useState<PortfolioItem[]>(seedPortfolio as PortfolioItem[]);
  
  // Lightbox
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [showBefore, setShowBefore] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      const dbImages = await getGalleryImages();
      if (dbImages && dbImages.length > 0) {
        const mapped: PortfolioItem[] = dbImages.map((img) => ({
          id: img.id,
          title: img.titre,
          category: (img.categories?.nom || "Tatouage") as Category,
          artist: img.artiste || "Jiji",
          ratio: "tall",
          image_url: img.image_url,
          image_avant: img.image_avant,
          image_apres: img.image_apres,
          description: img.description || undefined,
          tags: img.tags || [],
        }));
        setItemsList(mapped);
      }
    }
    loadPortfolio();
  }, []);

  const filteredItems = useMemo(
    () =>
      itemsList.filter((p) => {
        const matchCat = cat === "Tous" || p.category === cat;
        const matchArtist = artist === "Tous" || p.artist === artist;
        const matchStyle = style === "Tous" || p.title.toLowerCase().includes(style.toLowerCase()) || (p.tags && p.tags.some(t => t.toLowerCase().includes(style.toLowerCase())));
        return matchCat && matchArtist && matchStyle;
      }),
    [itemsList, cat, artist, style],
  );

  const activeItem = activeIdx !== null ? filteredItems[activeIdx] : null;

  function nextImage() {
    if (activeIdx !== null && activeIdx < filteredItems.length - 1) {
      setActiveIdx(activeIdx + 1);
      setShowBefore(false);
    }
  }

  function prevImage() {
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
      setShowBefore(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Réalisations"
        title="Portfolio."
        intro="Chaque pièce est unique. Filtrez par prestation, par style ou par artiste pour explorer nos compositions."
      />

      <div className="section-x py-16">
        {/* Filtres de catégorie */}
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

        {/* Filtres Artiste & Styles */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="eyebrow text-muted-foreground">Style</span>
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`text-[11px] uppercase tracking-wider px-2.5 py-1 border transition-colors ${
                  style === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grille du Portfolio */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, idx) => {
            const imgSrc = item.image_url || defaultImages[item.category] || heroSalon;
            return (
              <figure
                key={item.id}
                onClick={() => { setActiveIdx(idx); setShowBefore(false); }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden bg-secondary">
                  <img
                    src={imgSrc}
                    alt={item.title}
                    loading="lazy"
                    className={`w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 ${
                      item.ratio === "wide" ? "aspect-[4/3]" : "aspect-[3/4]"
                    }`}
                  />
                  <div className="absolute inset-0 bg-ink/30 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                    <span className="flex items-center gap-2 bg-ink-foreground/90 text-ink text-xs uppercase tracking-widest px-4 py-2">
                      <Eye className="size-3.5" /> Explorer
                    </span>
                  </div>
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-xl">{item.title}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.category} · {item.artist}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">
            Aucune réalisation pour cette combinaison de filtres.
          </p>
        )}
      </div>

      {/* Lightbox Modal Plein Écran */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-md text-ink-foreground p-4 md:p-10">
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute right-6 top-6 text-ink-foreground/70 hover:text-ink-foreground z-10"
            aria-label="Fermer"
          >
            <X className="size-8" />
          </button>

          {activeIdx! > 0 && (
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-ink-foreground/60 hover:text-ink-foreground z-10"
              aria-label="Précédent"
            >
              <ChevronLeft className="size-8" />
            </button>
          )}

          {activeIdx! < filteredItems.length - 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-ink-foreground/60 hover:text-ink-foreground z-10"
              aria-label="Suivant"
            >
              <ChevronRight className="size-8" />
            </button>
          )}

          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            {/* Image avec support Avant / Après */}
            <div className="relative max-h-[70vh] overflow-hidden">
              <img
                src={
                  showBefore && activeItem.image_avant
                    ? activeItem.image_avant
                    : activeItem.image_url || defaultImages[activeItem.category] || heroSalon
                }
                alt={activeItem.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            {/* Sélecteur Avant / Après si disponible */}
            {activeItem.image_avant && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowBefore(true)}
                  className={`text-xs uppercase tracking-widest px-3 py-1 border ${
                    showBefore ? "bg-ink-foreground text-ink" : "border-ink-foreground/40 text-ink-foreground"
                  }`}
                >
                  Avant
                </button>
                <button
                  onClick={() => setShowBefore(false)}
                  className={`text-xs uppercase tracking-widest px-3 py-1 border ${
                    !showBefore ? "bg-ink-foreground text-ink" : "border-ink-foreground/40 text-ink-foreground"
                  }`}
                >
                  Après
                </button>
              </div>
            )}

            <div className="mt-4 text-center space-y-1">
              <p className="font-display text-2xl">{activeItem.title}</p>
              <p className="text-xs uppercase tracking-widest text-ink-foreground/60">
                {activeItem.category} · Réalisé par {activeItem.artist}
              </p>
              {activeItem.description && (
                <p className="text-sm max-w-lg text-ink-foreground/75 mt-2">{activeItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
