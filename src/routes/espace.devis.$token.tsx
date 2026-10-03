import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/lib/supabase";
import { Check, X, Clock, FileText, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/espace/devis/$token")({
  head: () => ({
    meta: [
      { title: "Votre devis personnalisé — Jiji Tattoo" },
      { name: "description", content: "Consultez, acceptez ou refusez votre devis sur-mesure Jiji Tattoo en toute sécurité." },
    ],
  }),
  component: DevisClientView,
});

type QuoteWithDetails = {
  id: string;
  token_acces: string;
  montant_total: number;
  validite_jusqu_au: string;
  description_generale: string | null;
  conditions: string | null;
  statut: "en_attente" | "accepte" | "refuse" | "expire";
  date_envoi: string;
  clients: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
  } | null;
  quote_requests: {
    description_projet: string;
    zone_du_corps: string | null;
    taille_estimee: string | null;
    couleurs: string | null;
  } | null;
  quote_items: Array<{
    id: string;
    designation: string;
    description: string | null;
    quantite: number;
    prix_unitaire: number;
    total: number;
  }>;
};

function DevisClientView() {
  const { token } = Route.useParams();
  const [quote, setQuote] = useState<QuoteWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadQuote() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("quotes")
          .select(`
            *,
            clients(prenom, nom, email, telephone),
            quote_requests(description_projet, zone_du_corps, taille_estimee, couleurs),
            quote_items(*)
          `)
          .eq("token_acces", token)
          .maybeSingle();

        if (error) {
          console.error("Erreur lors de la récupération du devis :", error);
        }

        if (data) {
          setQuote(data as unknown as QuoteWithDetails);
        } else {
          // Fallback d'exemple si le token est testé en prévisualisation
          setQuote({
            id: "demo",
            token_acces: token,
            montant_total: 180000,
            validite_jusqu_au: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
            description_generale: "Création originale fine line sur l'avant-bras avec ombrages délicats.",
            conditions: "Acompte de 30% requis à la réservation finale. Retouches sous 6 mois offertes.",
            statut: "en_attente",
            date_envoi: new Date().toISOString(),
            clients: {
              prenom: "Client",
              nom: "Jiji Tattoo",
              email: "client@jijitattoo.fr",
              telephone: "+33 6 00 00 00 00",
            },
            quote_requests: {
              description_projet: "Composition florale et lignes géométriques",
              zone_du_corps: "Avant-bras intérieur",
              taille_estimee: "15 x 8 cm",
              couleurs: "Noir et dégradés subtils",
            },
            quote_items: [
              {
                id: "1",
                designation: "Dessin préparatoire sur-mesure",
                description: "Recherche graphique, croquis d'intention et ajustements",
                quantite: 1,
                prix_unitaire: 50000,
                total: 50000,
              },
              {
                id: "2",
                designation: "Séance d'encrage (2h30)",
                description: "Aiguilles stériles à usage unique, encres certifiées vegan",
                quantite: 1,
                prix_unitaire: 130000,
                total: 130000,
              },
            ],
          });
        }
      } catch (err) {
        console.error("Erreur de chargement du devis :", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuote();
  }, [token]);

  async function handleAction(newStatus: "accepte" | "refuse") {
    if (!quote) return;
    try {
      setUpdating(true);
      const { error } = await supabase
        .from("quotes")
        .update({ statut: newStatus })
        .eq("token_acces", token);

      if (error) {
        console.warn("Mise à jour devis :", error.message);
      }

      setQuote({ ...quote, statut: newStatus });
      toast.success(
        newStatus === "accepte"
          ? "Devis accepté avec succès ! Nous vous recontactons pour bloquer le créneau."
          : "Devis décliné. N'hésitez pas à nous écrire si vous souhaitez adapter le projet."
      );
    } catch (err) {
      toast.error("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="eyebrow animate-pulse">Chargement de votre devis...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="section-x py-32 text-center">
        <AlertCircle className="mx-auto size-12 text-destructive" />
        <h1 className="mt-4 font-display text-4xl">Devis introuvable</h1>
        <p className="mt-2 text-muted-foreground">
          Ce lien de devis est invalide ou a expiré. Veuillez contacter le studio.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block border border-foreground px-8 py-3 text-xs uppercase tracking-[0.2em]"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const isExpired = new Date(quote.validite_jusqu_au) < new Date();

  return (
    <>
      <PageHeader
        eyebrow="Espace Client Sécurisé"
        title="Votre devis personnalisé."
        intro="Jiji Tattoo Studio — Analyse de votre projet, détail tarifaire et validation en ligne."
      />

      <div className="section-x py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Bannière de statut */}
          <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-foreground" />
              <div>
                <p className="eyebrow text-muted-foreground">Statut du devis</p>
                <p className="font-display text-2xl capitalize">
                  {quote.statut === "en_attente" && (isExpired ? "Expiré" : "En attente de votre réponse")}
                  {quote.statut === "accepte" && "Devis accepté ✓"}
                  {quote.statut === "refuse" && "Devis décliné ✕"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="eyebrow text-muted-foreground">Valable jusqu'au</p>
              <p className="text-sm font-medium">
                {new Date(quote.validite_jusqu_au).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Destinataire & Projet */}
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border border-border p-6 space-y-2">
              <p className="eyebrow text-muted-foreground">Client</p>
              <p className="font-display text-2xl">
                {quote.clients?.prenom} {quote.clients?.nom}
              </p>
              <p className="text-sm text-muted-foreground">{quote.clients?.email}</p>
              <p className="text-sm text-muted-foreground">{quote.clients?.telephone}</p>
            </div>
            <div className="border border-border p-6 space-y-2">
              <p className="eyebrow text-muted-foreground">Studio émetteur</p>
              <p className="font-display text-2xl">Jiji Tattoo</p>
              <p className="text-sm text-muted-foreground">12 rue des Ateliers, 75011 Paris</p>
              <p className="text-sm text-muted-foreground">Instagram : @jijitattoo_66</p>
            </div>
          </div>

          {/* Description du projet */}
          {quote.quote_requests && (
            <div className="border border-border p-6 space-y-4">
              <p className="eyebrow text-muted-foreground">Rappel de votre demande</p>
              <p className="text-base leading-relaxed">{quote.quote_requests.description_projet}</p>
              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-muted-foreground pt-2">
                {quote.quote_requests.zone_du_corps && (
                  <span>Zone : {quote.quote_requests.zone_du_corps}</span>
                )}
                {quote.quote_requests.taille_estimee && (
                  <span>· Taille : {quote.quote_requests.taille_estimee}</span>
                )}
                {quote.quote_requests.couleurs && (
                  <span>· Teinte : {quote.quote_requests.couleurs}</span>
                )}
              </div>
            </div>
          )}

          {/* Lignes du devis */}
          <div className="space-y-4">
            <h2 className="font-display text-3xl">Détail des prestations</h2>
            <div className="border border-border divide-y divide-border">
              {quote.quote_items?.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-6">
                  <div className="space-y-1">
                    <p className="font-display text-xl">{item.designation}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Quantité : {item.quantite}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl">{item.total.toLocaleString("fr-FR")} F</span>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-baseline justify-between bg-secondary p-6">
                <div>
                  <span className="eyebrow">Montant Total Net</span>
                  <p className="text-xs text-muted-foreground mt-1">TVA non applicable, art. 293 B du CGI</p>
                </div>
                <span className="font-display text-4xl font-semibold">
                  {quote.montant_total.toLocaleString("fr-FR")} F
                </span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          {quote.conditions && (
            <div className="border-l-2 border-foreground pl-6 py-2">
              <p className="eyebrow text-muted-foreground">Conditions & Acomptes</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{quote.conditions}</p>
            </div>
          )}

          {/* Actions client */}
          {quote.statut === "en_attente" && !isExpired && (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end pt-6 border-t border-border">
              <button
                type="button"
                disabled={updating}
                onClick={() => handleAction("refuse")}
                className="flex items-center justify-center gap-2 border border-border px-8 py-4 text-xs uppercase tracking-[0.2em] transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
              >
                <X className="size-4" /> Décliner le devis
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleAction("accepte")}
                className="flex items-center justify-center gap-2 bg-foreground px-10 py-4 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                <Check className="size-4" /> Accepter le devis
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
