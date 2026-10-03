import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  Clock,
  FileText,
  Star,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Send,
  Eye,
  Settings,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — Jiji Tattoo Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type TabType = "dashboard" | "rdv" | "devis" | "avis" | "services" | "clients";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire création de devis
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [quoteItems, setQuoteItems] = useState([
    { designation: "Séance sur-mesure", description: "", quantite: 1, prix_unitaire: 80000 },
  ]);
  const [validiteDays, setValiditeDays] = useState(30);
  const [conditions, setConditions] = useState("Acompte de 30% requis à la réservation. Retouches offertes sous 6 mois.");
  const [createdQuoteToken, setCreatedQuoteToken] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [appRes, reqRes, revRes, cliRes, svcRes] = await Promise.all([
        supabase.from("appointments").select("*, clients(nom, prenom, email, telephone)").order("date_creation", { ascending: false }),
        supabase.from("quote_requests").select("*, clients(nom, prenom, email, telephone), quote_request_attachments(*)").order("date_creation", { ascending: false }),
        supabase.from("reviews").select("*").order("date_creation", { ascending: false }),
        supabase.from("clients").select("*").order("date_creation", { ascending: false }),
        supabase.from("services").select("*, categories(nom)").order("nom", { ascending: true }),
      ]);

      if (appRes.data) setAppointments(appRes.data);
      if (reqRes.data) setQuoteRequests(reqRes.data);
      if (revRes.data) setReviews(revRes.data);
      if (cliRes.data) setClients(cliRes.data);
      if (svcRes.data) setServicesList(svcRes.data);
    } catch (err) {
      console.warn("Chargement admin :", err);
    } finally {
      setLoading(false);
    }
  }

  // Actions Rendez-vous
  async function updateAppointmentStatus(id: string, statut: string) {
    try {
      const { error } = await supabase.from("appointments").update({ statut }).eq("id", id);
      if (error) throw error;
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, statut } : a)));
      toast.success(`Rendez-vous mis à jour : ${statut}`);
    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`);
    }
  }

  // Actions Avis
  async function updateReviewStatus(id: string, statut_publication: string) {
    try {
      const { error } = await supabase.from("reviews").update({ statut_publication }).eq("id", id);
      if (error) throw error;
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, statut_publication } : r)));
      toast.success(`Avis mis à jour : ${statut_publication}`);
    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`);
    }
  }

  // Actions Devis
  function addQuoteItem() {
    setQuoteItems((prev) => [...prev, { designation: "", description: "", quantite: 1, prix_unitaire: 0 }]);
  }

  function removeQuoteItem(idx: number) {
    setQuoteItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQuoteItem(idx: number, field: string, value: any) {
    setQuoteItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  const quoteTotal = quoteItems.reduce((acc, it) => acc + (Number(it.quantite) || 0) * (Number(it.prix_unitaire) || 0), 0);

  async function handleCreateQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReq) return;
    try {
      const validiteDate = new Date();
      validiteDate.setDate(validiteDate.getDate() + validiteDays);

      // 1. Création devis
      const { data: quote, error: qErr } = await supabase
        .from("quotes")
        .insert({
          quote_request_id: selectedReq.id,
          client_id: selectedReq.client_id,
          montant_total: quoteTotal,
          validite_jusqu_au: validiteDate.toISOString().split("T")[0],
          conditions,
          statut: "en_attente",
        })
        .select()
        .single();

      if (qErr) throw qErr;

      // 2. Création des lignes de devis
      for (const item of quoteItems) {
        await supabase.from("quote_items").insert({
          quote_id: quote.id,
          designation: item.designation,
          description: item.description,
          quantite: Number(item.quantite) || 1,
          prix_unitaire: Number(item.prix_unitaire) || 0,
        });
      }

      // 3. Mise à jour statut de la demande
      await supabase.from("quote_requests").update({ statut: "devis_envoye" }).eq("id", selectedReq.id);

      setCreatedQuoteToken(quote.token_acces);
      toast.success("Devis généré avec succès !");
      loadAllData();
    } catch (err: any) {
      toast.error(`Erreur création devis : ${err.message}`);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Console Interne"
        title="Administration Jiji Tattoo."
        intro="Gestion des rendez-vous, demandes de devis, modération des avis et suivi clientèle."
      />

      <div className="section-x py-12">
        {/* Navigation Admin */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-6">
          {[
            { id: "dashboard", label: "Dashboard", icon: Sparkles },
            { id: "rdv", label: `Rendez-vous (${appointments.filter(a => a.statut === "en_attente").length})`, icon: Calendar },
            { id: "devis", label: `Devis (${quoteRequests.filter(q => q.statut === "nouveau").length})`, icon: FileText },
            { id: "avis", label: `Avis (${reviews.filter(r => r.statut_publication === "en_attente").length})`, icon: Star },
            { id: "services", label: "Services & Tarifs", icon: Layers },
            { id: "clients", label: `Clients (${clients.length})`, icon: Users },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id as TabType); setSelectedReq(null); setCreatedQuoteToken(null); }}
                className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.18em] transition-colors ${
                  activeTab === t.id
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* CONTENU ONGLET DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="mt-12 space-y-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-border p-6">
                <p className="eyebrow text-muted-foreground">Demandes RDV en attente</p>
                <p className="mt-3 font-display text-4xl">
                  {appointments.filter((a) => a.statut === "en_attente").length}
                </p>
              </div>
              <div className="border border-border p-6">
                <p className="eyebrow text-muted-foreground">Nouveaux devis</p>
                <p className="mt-3 font-display text-4xl">
                  {quoteRequests.filter((q) => q.statut === "nouveau").length}
                </p>
              </div>
              <div className="border border-border p-6">
                <p className="eyebrow text-muted-foreground">Avis à modérer</p>
                <p className="mt-3 font-display text-4xl">
                  {reviews.filter((r) => r.statut_publication === "en_attente").length}
                </p>
              </div>
              <div className="border border-border p-6">
                <p className="eyebrow text-muted-foreground">Clients & Prospects</p>
                <p className="mt-3 font-display text-4xl">{clients.length}</p>
              </div>
            </div>

            {/* Aperçu rapide des dernières demandes */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="border border-border p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-display text-2xl">Derniers Rendez-vous</h3>
                  <button onClick={() => setActiveTab("rdv")} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    Voir tout →
                  </button>
                </div>
                <ul className="divide-y divide-border">
                  {appointments.slice(0, 5).map((a) => (
                    <li key={a.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{a.clients?.prenom} {a.clients?.nom}</p>
                        <p className="text-xs text-muted-foreground">{a.date_souhaitee} à {a.heure_souhaitee}</p>
                      </div>
                      <span className="eyebrow">{a.statut}</span>
                    </li>
                  ))}
                  {appointments.length === 0 && <p className="py-4 text-xs text-muted-foreground">Aucun rendez-vous enregistré.</p>}
                </ul>
              </div>

              <div className="border border-border p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-display text-2xl">Dernières Demandes de Devis</h3>
                  <button onClick={() => setActiveTab("devis")} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    Voir tout →
                  </button>
                </div>
                <ul className="divide-y divide-border">
                  {quoteRequests.slice(0, 5).map((q) => (
                    <li key={q.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{q.clients?.prenom} {q.clients?.nom}</p>
                        <p className="text-xs text-muted-foreground">{q.zone_du_corps} · {q.description_projet.slice(0, 35)}...</p>
                      </div>
                      <span className="eyebrow">{q.statut}</span>
                    </li>
                  ))}
                  {quoteRequests.length === 0 && <p className="py-4 text-xs text-muted-foreground">Aucune demande de devis.</p>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET RENDEZ-VOUS */}
        {activeTab === "rdv" && (
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-3xl">Gestion des Rendez-vous</h2>
            <div className="border border-border divide-y divide-border overflow-x-auto">
              {appointments.map((a) => (
                <div key={a.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-display text-xl">{a.clients?.prenom} {a.clients?.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.clients?.email} · {a.clients?.telephone}
                    </p>
                    <p className="text-sm">
                      Date : <strong>{a.date_souhaitee}</strong> à <strong>{a.heure_souhaitee}</strong>
                    </p>
                    {a.message && <p className="text-xs italic text-muted-foreground mt-2">"{a.message}"</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow px-3 py-1 bg-secondary border border-border mr-2">{a.statut}</span>
                    <button
                      onClick={() => updateAppointmentStatus(a.id, "confirme")}
                      className="border border-border px-3 py-2 text-xs uppercase tracking-widest hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(a.id, "termine")}
                      className="border border-border px-3 py-2 text-xs uppercase tracking-widest hover:border-foreground"
                    >
                      Terminé
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(a.id, "refuse")}
                      className="border border-border px-3 py-2 text-xs uppercase tracking-widest text-destructive hover:border-destructive"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="p-12 text-center text-muted-foreground">Aucune réservation pour le moment.</p>
              )}
            </div>
          </div>
        )}

        {/* CONTENU ONGLET DEVIS */}
        {activeTab === "devis" && (
          <div className="mt-12 space-y-8">
            <h2 className="font-display text-3xl">Demandes de Devis Tattoo</h2>

            {/* Formulaire de création de devis lorsqu'une demande est sélectionnée */}
            {selectedReq ? (
              <div className="border border-foreground p-8 bg-card space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="eyebrow text-muted-foreground">Édition du Devis</span>
                    <h3 className="font-display text-2xl mt-1">
                      Pour {selectedReq.clients?.prenom} {selectedReq.clients?.nom}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    ✕ Fermer
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 text-sm bg-secondary p-4">
                  <div>
                    <p className="eyebrow text-muted-foreground">Description du projet</p>
                    <p className="mt-1 leading-relaxed">{selectedReq.description_projet}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="eyebrow text-muted-foreground">Détails techniques</p>
                    <p>Zone : {selectedReq.zone_du_corps}</p>
                    <p>Taille : {selectedReq.taille_estimee}</p>
                    <p>Couleurs : {selectedReq.couleurs}</p>
                    <p>Budget client : {selectedReq.budget}</p>
                  </div>
                </div>

                {/* Pièces jointes photos */}
                {selectedReq.quote_request_attachments?.length > 0 && (
                  <div>
                    <p className="eyebrow text-muted-foreground mb-3">Références envoyées par le client</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedReq.quote_request_attachments.map((att: any) => (
                        <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer">
                          <img src={att.file_url} alt="" className="size-20 object-cover border border-border hover:opacity-80" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lignes du devis */}
                <form onSubmit={handleCreateQuote} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow">Lignes de prestation</p>
                      <button type="button" onClick={addQuoteItem} className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                        <Plus className="size-3" /> Ajouter une ligne
                      </button>
                    </div>

                    {quoteItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center">
                        <input
                          placeholder="Désignation"
                          value={item.designation}
                          onChange={(e) => updateQuoteItem(idx, "designation", e.target.value)}
                          required
                          className="border border-input bg-background px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Quantité"
                          value={item.quantite}
                          onChange={(e) => updateQuoteItem(idx, "quantite", Number(e.target.value))}
                          required
                          className="border border-input bg-background px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Prix unitaire"
                          value={item.prix_unitaire}
                          onChange={(e) => updateQuoteItem(idx, "prix_unitaire", Number(e.target.value))}
                          required
                          className="border border-input bg-background px-3 py-2 text-sm"
                        />
                        {quoteItems.length > 1 && (
                          <button type="button" onClick={() => removeQuoteItem(idx)} className="p-2 text-muted-foreground hover:text-destructive">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-baseline justify-between border-t border-border pt-4">
                    <span className="eyebrow">Total Devis</span>
                    <span className="font-display text-3xl">{quoteTotal.toLocaleString("fr-FR")} F</span>
                  </div>

                  <div>
                    <label className="eyebrow text-muted-foreground block mb-2">Conditions particulières</label>
                    <textarea
                      rows={2}
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      className="w-full border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.2em]"
                  >
                    Générer et envoyer le devis
                  </button>
                </form>

                {createdQuoteToken && (
                  <div className="border border-foreground bg-secondary p-4 space-y-2 mt-4">
                    <p className="eyebrow text-foreground">Devis généré avec succès !</p>
                    <p className="text-xs text-muted-foreground">Lien sécurisé pour le client :</p>
                    <a
                      href={`/espace/devis/${createdQuoteToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm underline font-mono"
                    >
                      /espace/devis/{createdQuoteToken}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-border divide-y divide-border">
                {quoteRequests.map((q) => (
                  <div key={q.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-xl">{q.clients?.prenom} {q.clients?.nom}</span>
                        <span className="eyebrow px-2 py-0.5 bg-secondary text-xs">{q.statut}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {q.clients?.email} · {q.clients?.telephone}
                      </p>
                      <p className="text-sm mt-2">
                        Zone : <strong>{q.zone_du_corps}</strong> · Budget : <strong>{q.budget}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        "{q.description_projet}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedReq(q)}
                        className="bg-foreground text-background px-5 py-3 text-xs uppercase tracking-widest hover:opacity-85"
                      >
                        Créer le devis
                      </button>
                    </div>
                  </div>
                ))}
                {quoteRequests.length === 0 && (
                  <p className="p-12 text-center text-muted-foreground">Aucune demande de devis pour le moment.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTENU ONGLET AVIS */}
        {activeTab === "avis" && (
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-3xl">Modération des Avis Clients</h2>
            <div className="border border-border divide-y divide-border">
              {reviews.map((r) => (
                <div key={r.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl">{r.nom}</span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">· {r.service}</span>
                      <div className="flex text-foreground">
                        {Array.from({ length: r.note }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed italic">"{r.commentaire}"</p>
                    {r.photos_resultat?.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {r.photos_resultat.map((photo: string, i: number) => (
                          <img key={i} src={photo} alt="" className="size-16 object-cover grayscale" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow px-3 py-1 bg-secondary mr-2">{r.statut_publication}</span>
                    <button
                      onClick={() => updateReviewStatus(r.id, "approuve")}
                      className="border border-border px-3 py-2 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => updateReviewStatus(r.id, "masque")}
                      className="border border-border px-3 py-2 text-xs uppercase tracking-widest hover:border-foreground"
                    >
                      Masquer
                    </button>
                    <button
                      onClick={() => updateReviewStatus(r.id, "supprime")}
                      className="border border-border px-3 py-2 text-xs uppercase tracking-widest text-destructive hover:border-destructive"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="p-12 text-center text-muted-foreground">Aucun avis soumis pour le moment.</p>
              )}
            </div>
          </div>
        )}

        {/* CONTENU ONGLET SERVICES */}
        {activeTab === "services" && (
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-3xl">Services & Tarifs Officiels</h2>
            <div className="border border-border divide-y divide-border">
              {servicesList.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg">{s.nom}</p>
                    <p className="text-xs text-muted-foreground">{s.categories?.nom} · {s.duree_estimee}</p>
                  </div>
                  <span className="font-display text-xl">{s.prix_fixe ? `${Number(s.prix_fixe).toLocaleString("fr-FR")} F` : "Sur devis"}</span>
                </div>
              ))}
              {servicesList.length === 0 && (
                <p className="p-8 text-center text-muted-foreground">Les services seront synchronisés lors de l'application de la migration SQL.</p>
              )}
            </div>
          </div>
        )}

        {/* CONTENU ONGLET CLIENTS */}
        {activeTab === "clients" && (
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-3xl">Fichier Clients & Prospects</h2>
            <div className="border border-border divide-y divide-border">
              {clients.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-muted-foreground">{c.email} · {c.telephone}</p>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Inscrit le {new Date(c.date_creation).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="p-8 text-center text-muted-foreground">Aucun client enregistré pour l'instant.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
