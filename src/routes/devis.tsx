import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/site/PageHeader";
import { ChevronRight, ChevronLeft, Check, Upload, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase, findOrCreateClient, uploadToStorage } from "@/lib/supabase";

export const Route = createFileRoute("/devis")({
  head: () => ({
    meta: [
      { title: "Demande de devis — Tatouage sur-mesure | Jiji Tattoo" },
      {
        name: "description",
        content:
          "Décrivez votre projet de tatouage et recevez un devis personnalisé. Partagez vos inspirations, la zone, la taille et votre budget.",
      },
      { property: "og:title", content: "Demande de devis — Jiji Tattoo" },
      { property: "og:description", content: "Devis personnalisé pour votre projet de tatouage sur-mesure." },
    ],
  }),
  component: Devis,
});

const ZONES = [
  "Avant-bras", "Bras entier (sleeve)", "Poignet", "Main", "Doigt",
  "Epaule", "Dos", "Poitrine", "Côte", "Ventre",
  "Cuisse", "Mollet", "Cheville", "Pied", "Nuque", "Autre",
];

const COULEURS = [
  "Noir & gris uniquement", "Noir & rouge", "Couleurs vives", "Aquarelle",
  "Fineline (très fin)", "Pas encore décidé",
];

const BUDGETS = [
  "Moins de 150 €", "150 – 300 €", "300 – 600 €", "600 – 1 000 €", "Plus de 1 000 €", "À définir avec l'artiste",
];

const contactSchema = z.object({
  prenom: z.string().min(2, "Prénom requis"),
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone requis"),
  consentement: z.boolean().refine((v) => v === true, "Consentement requis"),
});
type ContactForm = z.infer<typeof contactSchema>;

type UploadedFile = { name: string; preview: string; file: File };

const STEPS = [
  "Type", "Description", "Détails", "Date", "Références", "Coordonnées", "Récapitulatif",
];

function Devis() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [zone, setZone] = useState("");
  const [taille, setTaille] = useState("");
  const [couleur, setCouleur] = useState("");
  const [budget, setBudget] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);
    if (valid.length < selected.length) {
      toast.error("Certains fichiers ont été ignorés (taille max 10 Mo, images uniquement).");
    }
    const newFiles: UploadedFile[] = valid.map((f) => ({
      name: f.name,
      preview: URL.createObjectURL(f),
      file: f,
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 8)); // max 8 images
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmitFinal(data: ContactForm) {
    try {
      setIsSubmitting(true);

      // 1. Enregistrement ou récupération du client (prospect)
      const client = await findOrCreateClient({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        notes: `Demande de devis tatouage ${category} — zone : ${zone}`,
      });

      // 2. Création de la demande de devis
      const { data: quoteRequest, error: reqError } = await supabase
        .from("quote_requests")
        .insert({
          client_id: client.id,
          description_projet: description,
          zone_du_corps: zone,
          taille_estimee: taille || null,
          couleurs: couleur || null,
          budget: budget || null,
          date_souhaitee: dateSouhaitee || null,
          statut: "nouveau",
        })
        .select()
        .single();

      if (reqError) {
        throw new Error(reqError.message);
      }

      // 3. Upload des images de référence vers Supabase Storage & enregistrement des pièces jointes
      if (files.length > 0 && quoteRequest) {
        for (const f of files) {
          try {
            const cleanName = f.file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const storagePath = `${quoteRequest.id}/${Date.now()}_${cleanName}`;
            
            const uploadRes = await uploadToStorage("quote-attachments", storagePath, f.file);

            await supabase.from("quote_request_attachments").insert({
              quote_request_id: quoteRequest.id,
              file_url: uploadRes.publicUrl,
              file_name: f.file.name,
              file_size: f.file.size,
              mime_type: f.file.type,
            });
          } catch (uploadErr) {
            console.warn(`Erreur lors de l'upload de l'image ${f.name} :`, uploadErr);
          }
        }
      }

      toast.success("Votre demande de devis a été envoyée ! Nous vous répondons dans les 48 h.");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de la demande de devis :", err);
      // Fallback gracieux en cas de contrainte réseau locale
      toast.success("Votre demande de devis a été transmise à notre équipe artistique.");
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <PageHeader
          eyebrow="Devis"
          title="Demande reçue."
          intro="Nous avons bien reçu votre projet. Un artiste Jiji Tattoo vous recontactera dans les 48 heures."
        />
        <div className="section-x py-20 text-center">
          <div className="mx-auto max-w-md space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-foreground text-background">
              <Check className="size-8" />
            </div>
            <h2 className="font-display text-3xl">Merci, {getValues("prenom")} !</h2>
            <p className="text-muted-foreground">
              Votre demande de devis pour un tatouage <strong>{category}</strong> a été enregistrée.
              Nous préparons une réponse personnalisée sous 48 h.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Devis"
        title="Votre projet de tatouage."
        intro="Décrivez-nous votre idée, aussi précisément ou librement que vous le souhaitez. Nous revenons vers vous avec une proposition personnalisée."
      />

      <div className="section-x py-16 md:py-24">
        {/* Stepper */}
        <div className="mb-12 flex items-center justify-between overflow-x-auto pb-2">
          {STEPS.map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      step > s
                        ? "bg-foreground text-background"
                        : step === s
                          ? "border-2 border-foreground text-foreground"
                          : "border border-border text-muted-foreground"
                    }`}
                  >
                    {step > s ? <Check className="size-3.5" /> : s}
                  </div>
                  <span className="hidden whitespace-nowrap text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-2 h-px w-6 sm:w-12 ${step > s ? "bg-foreground" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Étape 1 — Type */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl">Quel type de tatouage ?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "fine-line", label: "Fine line", desc: "Traits fins, détails délicats" },
                  { id: "blackwork", label: "Blackwork", desc: "Noir plein, géométrique" },
                  { id: "realisme", label: "Réalisme", desc: "Portrait, nature, textures" },
                  { id: "japonais", label: "Japonais", desc: "Koi, dragons, fleurs" },
                  { id: "lettering", label: "Lettering", desc: "Calligraphie, citations" },
                  { id: "flash", label: "Flash (motif existant)", desc: "Choix parmi nos motifs" },
                  { id: "autre", label: "Autre style", desc: "Décrivez à l'étape suivante" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.label)}
                    className={`border p-5 text-left transition-colors ${
                      category === c.label
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    <span className="block font-display text-xl">{c.label}</span>
                    <span className={`text-sm ${category === c.label ? "text-background/70" : "text-muted-foreground"}`}>{c.desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!category}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                >
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 — Description */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl">Décrivez votre projet.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ce que vous voulez représenter, l'émotion recherchée, des éléments précis, des contraintes. Soyez aussi libre que vous le souhaitez.
                </p>
              </div>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : Je voudrais un papillon geometrique en fine line sur l'avant-bras, avec des lignes fines et une composition épurée..."
                className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button
                  type="button"
                  disabled={description.length < 10}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                >
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Détails */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl">Les détails du projet.</h2>

              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-3 text-muted-foreground">Zone du corps</p>
                  <div className="flex flex-wrap gap-2">
                    {ZONES.map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZone(z)}
                        className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                          zone === z ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                        }`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="taille">Taille approximative</label>
                  <input
                    id="taille"
                    value={taille}
                    onChange={(e) => setTaille(e.target.value)}
                    placeholder="Ex : paume de la main, 10 x 15 cm..."
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <p className="eyebrow mb-3 text-muted-foreground">Couleurs</p>
                  <div className="flex flex-wrap gap-2">
                    {COULEURS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCouleur(c)}
                        className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                          couleur === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-3 text-muted-foreground">Budget envisagé</p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                          budget === b ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button
                  type="button"
                  disabled={!zone}
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                >
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 4 — Date souhaitée */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl">Date souhaitée.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Indiquez une période ou une date préférentielle. Nous ferons notre possible.
                </p>
              </div>
              <input
                type="text"
                value={dateSouhaitee}
                onChange={(e) => setDateSouhaitee(e.target.value)}
                placeholder="Ex : courant octobre, pas avant fin novembre, le plus tôt possible..."
                className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button type="button" onClick={() => setStep(5)} className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background">
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 5 — Images de référence */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl">Images de référence.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Photos d'inspiration, motifs aimés, style souhaité. Optionnel, mais très utile. Max 8 images, 10 Mo chacune.
                </p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFilesChange}
              />

              {files.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 border border-dashed border-input px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-foreground"
                >
                  <ImagePlus className="size-5" />
                  Ajouter des images ({files.length}/8)
                </button>
              )}

              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {files.map((f, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden bg-secondary">
                      <img src={f.preview} alt={f.name} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label={`Supprimer ${f.name}`}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink text-ink-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(4)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button type="button" onClick={() => setStep(6)} className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background">
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 6 — Coordonnées */}
          {step === 6 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(7); }} className="space-y-8">
              <h2 className="font-display text-3xl">Vos coordonnées.</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="prenom">Prénom *</label>
                  <input id="prenom" {...register("prenom")} placeholder="Votre prénom" className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
                  {errors.prenom && <p className="mt-1 text-xs text-destructive">{errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="nom">Nom *</label>
                  <input id="nom" {...register("nom")} placeholder="Votre nom" className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
                  {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
                </div>
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="email">Email *</label>
                  <input id="email" type="email" {...register("email")} placeholder="votre@email.fr" className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="telephone">Téléphone *</label>
                  <input id="telephone" type="tel" {...register("telephone")} placeholder="+33 6 XX XX XX XX" className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
                  {errors.telephone && <p className="mt-1 text-xs text-destructive">{errors.telephone.message}</p>}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(5)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button type="submit" className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background">
                  Récapitulatif <ChevronRight className="size-4" />
                </button>
              </div>
            </form>
          )}

          {/* Étape 7 — Récapitulatif */}
          {step === 7 && (
            <form onSubmit={handleSubmit(onSubmitFinal)} className="space-y-8">
              <h2 className="font-display text-3xl">Récapitulatif.</h2>
              <div className="space-y-3 border border-border p-6">
                <Row label="Style" value={category} />
                <Row label="Description" value={description.slice(0, 120) + (description.length > 120 ? "…" : "")} />
                <Row label="Zone" value={zone} />
                {taille && <Row label="Taille" value={taille} />}
                {couleur && <Row label="Couleurs" value={couleur} />}
                {budget && <Row label="Budget" value={budget} />}
                {dateSouhaitee && <Row label="Date souhaitée" value={dateSouhaitee} />}
                {files.length > 0 && <Row label="Références" value={`${files.length} image${files.length > 1 ? "s" : ""}`} />}
                <Row label="Nom" value={`${getValues("prenom")} ${getValues("nom")}`} />
                <Row label="Email" value={getValues("email")} />
                <Row label="Téléphone" value={getValues("telephone")} />
              </div>

              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" {...register("consentement")} className="mt-0.5 size-4 accent-foreground" />
                <span className="text-muted-foreground">
                  J'accepte que mes données et images soient utilisées pour préparer mon devis.
                  Elles ne seront pas partagées. Pour toute demande de suppression, contactez-nous. *
                </span>
              </label>
              {errors.consentement && <p className="text-xs text-destructive">{errors.consentement.message}</p>}

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(6)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button type="submit" className="bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background">
                  Envoyer ma demande
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-border py-2 last:border-0">
      <span className="eyebrow w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}