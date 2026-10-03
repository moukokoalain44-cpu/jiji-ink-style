import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { CartDrawer } from "@/components/site/CartDrawer";
import { products as seedProducts } from "@/data/site";
import { getProducts } from "@/lib/supabase";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique Skincare — Soins peau tatouée | Jiji Tattoo" },
      {
        name: "description",
        content:
          "Produits skincare sélectionnés par Jiji Tattoo : baumes, sérums et routines pour prendre soin de votre peau tatouée.",
      },
      { property: "og:title", content: "Boutique Skincare — Jiji Tattoo" },
      {
        property: "og:description",
        content: "Soins et produits dédiés à la peau tatouée, conçus avec Léa.",
      },
    ],
  }),
  component: Boutique,
});

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type ProductItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  image?: string | null;
};

function Boutique() {
  const [productList, setProductList] = useState<ProductItem[]>(seedProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      if (data && data.length > 0) {
        setProductList(
          data.map((p) => ({
            id: p.id,
            name: p.nom,
            detail: p.detail || p.description || "",
            price: Number(p.prix),
            image: p.image,
          }))
        );
      }
    }
    loadProducts();
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(product: ProductItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    toast.success(`${product.name} ajouté au panier.`);
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
    }
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <>
      {/* Bandeau promo */}
      <div className="section-x flex items-center justify-between border-b border-border bg-secondary py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Code <strong className="font-mono text-foreground">JIJI10</strong> — 10% sur votre première commande
        </p>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 text-xs uppercase tracking-[0.18em]"
          aria-label={`Ouvrir le panier (${cartCount} article${cartCount > 1 ? "s" : ""})`}
        >
          <ShoppingBag className="size-4" />
          {cartCount > 0 && (
            <span className="absolute -right-3 -top-3 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] text-background">
              {cartCount}
            </span>
          )}
          Panier
        </button>
      </div>

      <PageHeader
        eyebrow="Skincare"
        title="Prendre soin de sa peau."
        intro="Des formules douces, sans parfum agressif, étudiées par Léa pour accompagner chaque étape : cicatrisation, hydratation, protection solaire."
      />

      {/* Catégorie */}
      <section className="section-x py-16 md:py-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {productList.map((product) => (
            <article
              key={product.id}
              className="group border border-border bg-card transition-shadow hover:shadow-sm"
            >
              {/* Image placeholder — sera remplacée par Supabase Storage */}
              <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                <div className="text-center space-y-2 p-8">
                  <div className="mx-auto size-16 rounded-full bg-muted" />
                  <p className="eyebrow text-muted-foreground">{product.name.split(" ")[0]}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl">{product.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{product.detail}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl">{product.price} €</span>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="border border-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section conseil */}
      <section className="border-t border-border bg-secondary">
        <div className="section-x grid gap-12 py-24 md:grid-cols-2 md:py-32">
          <div>
            <p className="eyebrow text-muted-foreground">Conseils de Léa</p>
            <h2 className="mt-6 font-display text-4xl leading-tight">
              La peau tatouée mérite une attention particulière.
            </h2>
          </div>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Dans les premières 72 heures après une séance, la peau est ouverte et vulnérable.
              Le nettoyant pH 5.5 et le baume après-tatouage sont vos alliés quotidiens.
            </p>
            <p>
              À partir du 15e jour, le SPF 50 devient indispensable pour protéger l'encre des UV
              et maintenir le contraste de votre tatouage dans le temps.
            </p>
            <Link
              to="/rendez-vous"
              className="inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em] text-foreground"
            >
              Prendre rendez-vous avec Léa
            </Link>
          </div>
        </div>
      </section>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={updateQty}
        onRemove={removeItem}
      />
    </>
  );
}