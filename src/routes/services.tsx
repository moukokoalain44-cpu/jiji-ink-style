import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { services } from "@/data/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Tarifs — Tatouage, piercing, soins | Jiji Tattoo" },
      {
        name: "description",
        content:
          "Prestations et tarifs indicatifs du studio Jiji Tattoo : tatouage sur-mesure, piercing et soins de la peau.",
      },
      { property: "og:title", content: "Services & Tarifs — Jiji Tattoo" },
      {
        property: "og:description",
        content: "Durées et prix indicatifs pour le tatouage, le piercing et le skincare.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHeader
        eyebrow="Prestations"
        title="Nos services & tarifs."
        intro="Les prix affichés sont indicatifs : chaque pièce sur-mesure fait l'objet d'un devis précis après échange."
      />

      <div className="section-x py-24 md:py-32">
        {services.map((group) => (
          <section key={group.category} className="mb-20 last:mb-0">
            <div className="flex items-end justify-between border-b border-foreground pb-4">
              <h2 className="font-display text-4xl md:text-5xl">{group.category}</h2>
              <Link
                to="/rendez-vous"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Réserver
              </Link>
            </div>
            <ul>
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="grid grid-cols-1 gap-2 border-b border-border py-6 sm:grid-cols-[1fr_auto_auto] sm:items-baseline sm:gap-10"
                >
                  <span className="text-lg">{item.name}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.duration}
                  </span>
                  <span className="font-display text-2xl">{item.price}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
