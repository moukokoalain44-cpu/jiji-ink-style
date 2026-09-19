import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="section-x grid gap-12 py-20 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-[0.3em] uppercase">Jiji Tattoo</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-foreground/60">
            Tatouage, piercing et soins de la peau. Un studio, une encre, une peau respectée.
          </p>
        </div>

        <div className="space-y-3 text-sm text-ink-foreground/70">
          <p className="eyebrow text-ink-foreground">Le studio</p>
          <p className="flex items-center gap-3">
            <MapPin className="size-4" /> 12 rue des Ateliers, 75011 Paris
          </p>
          <p className="flex items-center gap-3">
            <Phone className="size-4" /> 01 23 45 67 89
          </p>
          <p className="flex items-center gap-3">
            <Mail className="size-4" /> bonjour@jijitattoo.fr
          </p>
          <p className="flex items-center gap-3">
            <Instagram className="size-4" /> @jiji.tattoo
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="eyebrow text-ink-foreground">Navigation</p>
          {[
            { to: "/portfolio", label: "Portfolio" },
            { to: "/services", label: "Services & Tarifs" },
            { to: "/boutique", label: "Boutique skincare" },
            { to: "/rendez-vous", label: "Prendre RDV / Devis" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block text-ink-foreground/70 transition-colors hover:text-ink-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="section-x border-t border-ink-foreground/10 py-6 text-xs tracking-widest uppercase text-ink-foreground/40">
        © {new Date().getFullYear()} Jiji Tattoo — Mentions légales
      </div>
    </footer>
  );
}
