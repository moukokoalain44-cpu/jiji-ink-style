import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { reviews as seedReviews } from "@/data/site";
import { Star, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/avis")({
  head: () => ({
    meta: [
      { title: "Avis clients — Notes et photos | Jiji Tattoo" },
      {
        name: "description",
        content:
          "Lisez les avis des clients du studio Jiji Tattoo et déposez le vôtre avec une note et des photos de votre résultat.",
      },
      { property: "og:title", content: "Avis clients — Jiji Tattoo" },
      {
        property: "og:description",
        content: "Notes en étoiles, témoignages et photos des résultats.",
      },
    ],
  }),
  component: Avis,
});

type Review = {
  name: string;
  rating: number;
  service: string;
  text: string;
  photos?: string[];
};

function Avis() {
  const [list, setList] = useState<Review[]>(seedReviews);
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState<string[]>([]);

  function onFiles(files: FileList | null) {
    if (!files) return;
    setPhotos(Array.from(files).map((f) => URL.createObjectURL(f)));
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setList((prev) => [
      {
        name: String(data.get("name") || "Anonyme"),
        service: String(data.get("service") || "Prestation"),
        text: String(data.get("text") || ""),
        rating,
        photos,
      },
      ...prev,
    ]);
    e.currentTarget.reset();
    setPhotos([]);
    setRating(5);
    toast.success("Merci ! Votre avis est publié.");
  }

  return (
    <>
      <PageHeader
        eyebrow="Témoignages"
        title="Avis clients."
        intro="Notes, mots et photos de cicatrisation : la meilleure façon de juger un studio."
      />

      <div className="section-x grid gap-16 py-24 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-12">
          {list.map((r, i) => (
            <article key={`${r.name}-${i}`} className="border-b border-border pb-10">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`size-4 ${s < r.rating ? "fill-current" : "text-muted-foreground/40"}`}
                  />
                ))}
              </div>
              <p className="mt-4 font-display text-2xl leading-snug">“{r.text}”</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {r.name} — {r.service}
              </p>
              {r.photos && r.photos.length > 0 && (
                <div className="mt-5 flex gap-3">
                  {r.photos.map((p) => (
                    <img
                      key={p}
                      src={p}
                      alt="Photo du résultat"
                      loading="lazy"
                      className="size-24 object-cover grayscale"
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <form onSubmit={submit} className="h-fit border border-border bg-card p-8 lg:sticky lg:top-28">
          <p className="eyebrow text-muted-foreground">Déposer un avis</p>
          <h2 className="mt-4 font-display text-3xl">Racontez votre expérience</h2>

          <div className="mt-8 space-y-5">
            <div>
              <label className="eyebrow text-muted-foreground">Votre note</label>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} étoiles`}
                    onClick={() => setRating(n)}
                  >
                    <Star
                      className={`size-6 ${n <= rating ? "fill-current" : "text-muted-foreground/40"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <input
              name="name"
              placeholder="Prénom et initiale"
              required
              className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
            />
            <input
              name="service"
              placeholder="Prestation (tatouage, piercing, soin…)"
              className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
            />
            <textarea
              name="text"
              rows={5}
              required
              placeholder="Votre avis…"
              className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
            />

            <label className="flex cursor-pointer items-center gap-3 border border-dashed border-input px-4 py-4 text-sm text-muted-foreground">
              <ImagePlus className="size-4" />
              Ajouter des photos du résultat
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>

            {photos.length > 0 && (
              <div className="flex gap-3">
                {photos.map((p) => (
                  <img key={p} src={p} alt="" className="size-16 object-cover grayscale" />
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-foreground px-6 py-4 text-xs uppercase tracking-[0.2em] text-background"
            >
              Publier mon avis
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
