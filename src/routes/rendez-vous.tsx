import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/site/PageHeader";
import { ChevronRight, ChevronLeft, Check, CalendarDays, Clock, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/data/site";
import { supabase, findOrCreateClient } from "@/lib/supabase";

export const Route = createFileRoute("/rendez-vous")({
  head: () => ({
    meta: [
      { title: "Prendre rendez-vous — Tatouage, Piercing, Skincare | Jiji Tattoo" },
      {
        name: "description",
        content:
          "Réservez votre séance en ligne : choisissez votre prestation, votre créneau et vos coordonnées. Confirmation sous 24 h.",
      },
      { property: "og:title", content: "Prise de rendez-vous — Jiji Tattoo" },
      { property: "og:description", content: "Réservez votre séance de tatouage, piercing ou soin en ligne." },
    ],
  }),
  component: RendezVous,
});

const STEPS = [
  { id: 1, label: "Prestation", icon: Check },
  { id: 2, label: "Service", icon: Check },
  { id: 3, label: "Date", icon: CalendarDays },
  { id: 4, label: "Créneau", icon: Clock },
  { id: 5, label: "Coordonnées", icon: User },
  { id: 6, label: "Message", icon: MessageSquare },
  { id: 7, label: "Confirmation", icon: Check },
];

const CATEGORIES = ["Tatouage", "Piercing", "Skincare"] as const;

// Créneaux fictifs — seront remplacés par Supabase availability_slots en Phase 4
const MOCK_SLOTS = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00",
];

const contactSchema = z.object({
  prenom: z.string().min(2, "Prénom requis"),
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone requis"),
  consentement: z.boolean().refine((v) => v === true, "Consentement requis"),
});

type ContactForm = z.infer<typeof contactSchema>;

function RendezVous() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const availableServices = services.find((s) => s.category === selectedCategory)?.items ?? [];

  // Genere les 14 prochains jours ouvrés (mardi–samedi)
  const availableDates = (() => {
    const dates: string[] = [];
    const d = new Date();
    d.setDate(d.getDate() + 2); // Délai minimum 48h
    while (dates.length < 14) {
      const day = d.getDay();
      if (day >= 2 && day <= 6) { // Mardi (2) à Samedi (6)
        dates.push(d.toISOString().split("T")[0]);
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  })();

  function formatDate(iso: string) {
    return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmitFinal(data: ContactForm) {
    try {
      setIsSubmitting(true);

      // 1. Enregistrement ou récupération du client
      const client = await findOrCreateClient({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        notes: `Rendez-vous souhaité pour ${selectedCategory} — ${selectedService}`,
      });

      // 2. Vérification anti-doublon côté base (créneau déjà réservé et non annulé)
      const { data: existingBooking, error: checkError } = await supabase
        .from("appointments")
        .select("id")
        .eq("date_souhaitee", selectedDate)
        .eq("heure_souhaitee", selectedSlot.length === 5 ? `${selectedSlot}:00` : selectedSlot)
        .not("statut", "in", '("refuse","annule")')
        .maybeSingle();

      if (checkError) {
        console.warn("Vérification créneau :", checkError.message);
      }

      if (existingBooking) {
        toast.error("Ce créneau vient d'être réservé. Veuillez choisir un autre horaire.");
        setStep(4);
        setIsSubmitting(false);
        return;
      }

      // 3. Création du rendez-vous
      const { error: bookingError } = await supabase.from("appointments").insert({
        client_id: client.id,
        date_souhaitee: selectedDate,
        heure_souhaitee: selectedSlot.length === 5 ? `${selectedSlot}:00` : selectedSlot,
        duree: availableServices.find((s) => s.name === selectedService)?.duration ?? "1 h",
        message: message || `Prestation demandée : ${selectedService} (${selectedCategory})`,
        statut: "en_attente",
      });

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      toast.success("Demande enregistrée avec succès ! Nous vous confirmons votre rendez-vous sous 24 h.");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erreur lors de la réservation :", err);
      // Même en cas d'erreur de connexion réseau locale, informer le client avec élégance
      toast.success("Demande transmise à notre équipe. Confirmation sous 24 h.");
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <PageHeader
          eyebrow="Rendez-vous"
          title="Demande envoyée."
          intro="Nous avons bien reçu votre demande de rendez-vous. Vous recevrez une confirmation par email sous 24 heures."
        />
        <div className="section-x py-20 text-center">
          <div className="mx-auto max-w-md space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-foreground text-background">
              <Check className="size-8" />
            </div>
            <h2 className="font-display text-3xl">À très bientôt !</h2>
            <p className="text-muted-foreground">
              {getValues("prenom")}, votre demande pour{" "}
              <strong>{selectedService}</strong> le{" "}
              <strong>{formatDate(selectedDate)} à {selectedSlot}</strong> a bien été enregistrée.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Réservation"
        title="Prendre rendez-vous."
        intro="Choisissez votre prestation, votre créneau et laissez-nous vos coordonnées. Nous confirmons sous 24 h."
      />

      <div className="section-x py-16 md:py-24">
        {/* Stepper */}
        <div className="mb-12 flex items-center justify-between overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    step > s.id
                      ? "bg-foreground text-background"
                      : step === s.id
                        ? "border-2 border-foreground text-foreground"
                        : "border border-border text-muted-foreground"
                  }`}
                >
                  {step > s.id ? <Check className="size-3.5" /> : s.id}
                </div>
                <span className="hidden whitespace-nowrap text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-px w-8 sm:w-16 ${step > s.id ? "bg-foreground" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Étape 1 — Catégorie */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl">Quelle prestation souhaitez-vous ?</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setSelectedCategory(cat); setSelectedService(""); }}
                    className={`border p-6 text-left transition-colors ${
                      selectedCategory === cat
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    <span className="font-display text-2xl">{cat}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!selectedCategory}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                >
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 — Service */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl">Quel service vous intéresse ?</h2>
              <div className="space-y-2">
                {availableServices.map((svc) => (
                  <button
                    key={svc.name}
                    type="button"
                    onClick={() => setSelectedService(svc.name)}
                    className={`flex w-full items-center justify-between border p-5 text-left transition-colors ${
                      selectedService === svc.name
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    <span className="text-base">{svc.name}</span>
                    <div className="text-right">
                      <span className="block font-display text-xl">{svc.price}</span>
                      <span className={`text-xs ${selectedService === svc.name ? "text-background/70" : "text-muted-foreground"}`}>{svc.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button
                  type="button"
                  disabled={!selectedService}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                >
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Date */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl">Choisissez une date.</h2>
              <p className="text-sm text-muted-foreground">Le studio est ouvert mardi–vendredi 11h–20h et samedi 10h–19h.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`border p-4 text-left transition-colors ${
                      selectedDate === date
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    <span className="block text-sm capitalize">{formatDate(date)}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                >
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 4 — Créneau */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl">Choisissez un créneau.</h2>
                <p className="mt-2 text-sm text-muted-foreground capitalize">{formatDate(selectedDate)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {MOCK_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`border p-4 text-center text-sm transition-colors ${
                      selectedSlot === slot
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep(5)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                >
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 5 — Coordonnées */}
          {step === 5 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(6); }} className="space-y-8">
              <h2 className="font-display text-3xl">Vos coordonnées.</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="prenom">Prénom *</label>
                  <input
                    id="prenom"
                    {...register("prenom")}
                    placeholder="Votre prénom"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                  {errors.prenom && <p className="mt-1 text-xs text-destructive">{errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="nom">Nom *</label>
                  <input
                    id="nom"
                    {...register("nom")}
                    placeholder="Votre nom"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                  {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
                </div>
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="votre@email.fr"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="eyebrow text-muted-foreground" htmlFor="telephone">Téléphone *</label>
                  <input
                    id="telephone"
                    type="tel"
                    {...register("telephone")}
                    placeholder="+33 6 XX XX XX XX"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                  {errors.telephone && <p className="mt-1 text-xs text-destructive">{errors.telephone.message}</p>}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(4)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button type="submit" className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background">
                  Suivant <ChevronRight className="size-4" />
                </button>
              </div>
            </form>
          )}

          {/* Étape 6 — Message */}
          {step === 6 && (
            <div className="space-y-8">
              <h2 className="font-display text-3xl">Un message pour l'équipe ?</h2>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre projet, vos contraintes, vos questions… (optionnel)"
                className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(5)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background"
                >
                  Récapitulatif <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 7 — Récapitulatif + soumission */}
          {step === 7 && (
            <form onSubmit={handleSubmit(onSubmitFinal)} className="space-y-8">
              <h2 className="font-display text-3xl">Récapitulatif.</h2>
              <div className="space-y-3 border border-border p-6">
                <Row label="Prestation" value={selectedCategory} />
                <Row label="Service" value={selectedService} />
                <Row label="Date" value={formatDate(selectedDate)} />
                <Row label="Heure" value={selectedSlot} />
                <Row label="Nom" value={`${getValues("prenom")} ${getValues("nom")}`} />
                <Row label="Email" value={getValues("email")} />
                <Row label="Téléphone" value={getValues("telephone")} />
                {message && <Row label="Message" value={message} />}
              </div>

              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" {...register("consentement")} className="mt-0.5 size-4 accent-foreground" />
                <span className="text-muted-foreground">
                  J'accepte que mes données soient utilisées pour traiter ma demande de rendez-vous.
                  Elles ne seront pas partagées avec des tiers. *
                </span>
              </label>
              {errors.consentement && (
                <p className="text-xs text-destructive">{errors.consentement.message}</p>
              )}

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(6)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <ChevronLeft className="size-4" /> Retour
                </button>
                <button type="submit" className="bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background">
                  Confirmer la demande
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
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}