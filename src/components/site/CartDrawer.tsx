import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";
import { products } from "@/data/site";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
};

export function CartDrawer({ open, onClose, items, onUpdateQty, onRemove }: CartDrawerProps) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" />
        <Drawer.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl outline-none"
          aria-label="Panier"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <ShoppingBag className="size-5" />
              <span className="eyebrow">Panier</span>
              {items.length > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  {items.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </div>
            <Drawer.Close asChild>
              <button type="button" aria-label="Fermer le panier">
                <X className="size-5" />
              </button>
            </Drawer.Close>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <ShoppingBag className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Votre panier est vide.</p>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 border-b border-border pb-6">
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.price} €</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuer la quantité"
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                        className="flex size-8 items-center justify-center border border-border text-sm transition-colors hover:bg-secondary"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Augmenter la quantité"
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                        className="flex size-8 items-center justify-center border border-border text-sm transition-colors hover:bg-secondary"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Supprimer l'article"
                        onClick={() => onRemove(item.id)}
                        className="ml-2 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-muted-foreground">Total</span>
                <span className="font-display text-2xl">{total} €</span>
              </div>
              <p className="text-xs text-muted-foreground">Livraison calculée à l'étape suivante.</p>
              <button
                type="button"
                className="w-full bg-foreground px-6 py-4 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-85"
              >
                Commander — {total} €
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Paiement sécurisé — Paiement en ligne bientôt disponible
              </p>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}