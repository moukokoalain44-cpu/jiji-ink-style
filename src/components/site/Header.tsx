import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/univers", label: "L'Univers" },
  { to: "/services", label: "Services & Tarifs" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/boutique", label: "Boutique" },
  { to: "/avis", label: "Avis" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="section-x flex h-20 items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-[0.3em] uppercase">
          Jiji
          <span className="text-muted-foreground"> Tattoo</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <Link
              to="/devis"
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground hidden xl:inline"
            >
              Devis
            </Link>
            <Link
              to="/rendez-vous"
              className="border border-foreground px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
            >
              Prendre RDV
            </Link>
          </div>
        </nav>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="section-x flex flex-col gap-4 border-t border-border py-6 lg:hidden bg-background">
          {[
            ...nav,
            { to: "/devis", label: "Demander un devis" } as const,
            { to: "/rendez-vous", label: "Prendre rendez-vous" } as const,
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
