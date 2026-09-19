import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { team } from "@/data/site";
import heroSalon from "@/assets/hero-salon.jpg";

export const Route = createFileRoute("/univers")({
  head: () => ({
    meta: [
      { title: "L'Univers Jiji — Histoire, philosophie et équipe | Jiji Tattoo" },
      {
        name: "description",
        content:
          "L'histoire du studio Jiji Tattoo, sa philosophie du soin et l'équipe : tatoueurs, perceuse et esthéticienne.",
      },
      { property: "og:title", content: "L'Univers Jiji Tattoo" },
      {
        property: "og:description",
        content: "Histoire du studio, philosophie et présentation de l'équipe.",
      },
    ],
  }),
  component: Univers,
});

function Univers() {
  return (
    <>
      <PageHeader
        eyebrow="L'univers Jiji"
        title="Un atelier plus qu'un salon."
        intro="Ouvert en 2016 dans un ancien atelier de menuiserie, Jiji Tattoo est né d'une envie simple : tatouer sans précipitation, dans un lieu où l'on se sent en sécurité."
      />

      <section className="section-x grid gap-16 py-24 md:grid-cols-2 md:py-32">
        <img
          src={heroSalon}
          alt="Le studio Jiji Tattoo"
          loading="lazy"
          className="aspect-[4/5] w-full object-cover grayscale"
        />
        <div className="space-y-8">
          <p className="eyebrow text-muted-foreground">Notre philosophie</p>
          <h2 className="font-display text-4xl leading-tight">
            Le dessin appartient à la peau qui le porte.
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Chaque projet commence par une conversation : votre histoire, votre morphologie, votre
            rapport à la douleur. Nous dessinons ensuite une pièce unique, jamais reproduite.
          </p>
          <ul className="space-y-4 border-t border-border pt-8 text-sm">
            {[
              "Matériel à usage unique et stérilisation contrôlée",
              "Bijoux titane implant grade certifiés",
              "Devis clair avant toute séance, sans surprise",
              "Suivi de cicatrisation offert pendant 6 mois",
            ].map((item) => (
              <li key={item} className="flex gap-4 text-muted-foreground">
                <span className="text-foreground">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-secondary py-24">
        <div className="section-x">
          <p className="eyebrow text-muted-foreground">L'équipe</p>
          <div className="mt-12 grid gap-px border-t border-border md:grid-cols-2">
            {team.map((m) => (
              <article key={m.name} className="border-b border-border py-10 md:pr-10">
                <h3 className="font-display text-3xl">{m.name}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {m.role}
                </p>
                <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{m.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
