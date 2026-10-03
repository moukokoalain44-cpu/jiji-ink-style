import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";

export function PromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center gap-4 bg-foreground px-8 py-2.5 text-background">
      <p className="text-xs tracking-[0.18em] uppercase">
        Boutique skincare &mdash;{" "}
        <strong>-10% sur votre première commande</strong>{" "}
        avec le code{" "}
        <span className="font-mono font-bold tracking-widest">JIJI10</span>
      </p>
      <Link
        to="/boutique"
        className="hidden text-xs uppercase tracking-[0.15em] underline underline-offset-4 transition-opacity hover:opacity-70 sm:inline"
      >
        Découvrir
      </Link>
      <button
        type="button"
        aria-label="Fermer le bandeau promotionnel"
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}