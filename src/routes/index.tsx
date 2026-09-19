import { createFileRoute, Link } from "@tanstack/react-router";
import heroSalon from "@/assets/hero-salon.jpg";
import workTattoo from "@/assets/work-tattoo-1.jpg";
import workPiercing from "@/assets/work-piercing-1.jpg";
import skincare from "@/assets/skincare-1.jpg";
import { reviews } from "@/data/site";
import { Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jiji Tattoo — Tatouage, piercing & skincare à Paris" },
      {
        name: "description",
        content:
          "Jiji Tattoo : studio de tatouage sur-mesure, piercing et soins de la peau. Portfolio, prise de rendez-vous et devis en ligne.",
      },
      { property: "og:title", content: "Jiji Tattoo — Tatouage, piercing & skincare" },
      {
        property: "og:description",
        content: "Portfolio, prise de rendez-vous, devis sur-mesure et boutique skincare.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroSalon}
          alt="Intérieur du studio Jiji Tattoo"
          width={1600}
          height={1104}
          className="absolute inset-0 -z-10 size-full object-cover opacity-55"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        <div className="section-x w-full pb-20 pt-32">
          <p className="eyebrow text-ink-foreground/60 reveal-up">
            Paris 11e · Tatouage · Piercing · Skincare
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-6xl leading-[0.95] md:text-8xl reveal-up">
            L'encre se pose,
            <br />
            la peau se respecte.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-foreground/70 reveal-up">
            Un studio en noir et blanc où chaque projet est dessiné pour une seule personne, puis
            accompagné jusqu'à la cicatrisation.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 reveal-up">
            <Link
              to="/rendez-vous"
              className="bg-ink-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-opacity hover:opacity-85"
            >
              Prendre rendez-vous
            </Link>
            <Link
              to="/portfolio"
              className="border border-ink-foreground/40 px-8 py-4 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink-foreground hover:text-ink"
            >
              Voir le portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Manifeste */}
      <section className="section-x grid gap-12 py-24 md:grid-cols-[1fr_1.2fr] md:py-32">
        <p className="eyebrow text-muted-foreground">L'univers Jiji</p>
        <div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Trois métiers, une même exigence : la justesse du geste.
          </h2>
          <p className="mt-8 max-w-xl leading-relaxed text-muted-foreground">
            Jiji Tattoo réunit des tatoueurs, une perceuse certifiée et une esthéticienne spécialisée
            dans la peau tatouée. Le dessin, le placement et le soin sont pensés ensemble, dans un lieu
            calme, hygiénique et sans jugement.
          </p>
          <Link
            to="/univers"
            className="mt-8 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]"
          >
            Découvrir le studio
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-border bg-secondary">
        <div className="section-x grid gap-px py-0 md:grid-cols-3">
          {[
            { img: workTattoo, title: "Tatouage", text: "Fine line, blackwork, réalisme.", to: "/services" },
            { img: workPiercing, title: "Piercing", text: "Bijoux titane, placement sur-mesure.", to: "/services" },
            { img: skincare, title: "Skincare", text: "Soins et routine après-encre.", to: "/boutique" },
          ].map((s) => (
            <Link key={s.title} to={s.to} className="group block py-16">
              <div className="overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-6 font-display text-3xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Avis */}
      <section className="section-x py-24 md:py-32">
        <p className="eyebrow text-muted-foreground">Avis clients</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="border-t border-border pt-6">
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-xl leading-snug">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {r.name} — {r.service}
              </figcaption>
            </figure>
          ))}
        </div>
        <Link
          to="/avis"
          className="mt-12 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em]"
        >
          Lire et déposer un avis
        </Link>
      </section>

      {/* CTA */}
      <section className="bg-ink text-ink-foreground">
        <div className="section-x flex flex-col items-start gap-8 py-24 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl font-display text-4xl leading-tight md:text-6xl">
            Un projet en tête ? Demandez un devis personnalisé.
          </h2>
          <Link
            to="/rendez-vous"
            className="bg-ink-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink"
          >
            Demander un devis
          </Link>
        </div>
      </section>
    </>
  );
}
