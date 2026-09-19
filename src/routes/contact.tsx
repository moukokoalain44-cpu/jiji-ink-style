import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { toast } from "sonner";
import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & accès — Jiji Tattoo" },
      {
        name: "description",
        content: "Adresse, horaires, téléphone et formulaire de contact du studio Jiji Tattoo.",
      },
      { property: "og:title", content: "Contact & accès — Jiji Tattoo" },
      { property: "og:description", content: "Nous écrire, nous appeler, nous trouver." },
    ],
  }),
  component: Contact,
});

const hours = [
  ["Mardi — Vendredi", "11h — 20h"],
  ["Samedi", "10h — 19h"],
  ["Dimanche — Lundi", "Fermé"],
];

function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Nous trouver"
        title="Contact & accès."
        intro="Une question sur un projet, un piercing ou un soin ? Écrivez-nous, nous répondons sous 48 h."
      />

      <div className="section-x grid gap-16 py-24 lg:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message envoyé. Nous revenons vers vous rapidement.");
            e.currentTarget.reset();
          }}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              required
              placeholder="Nom"
              className="border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <input
            placeholder="Sujet"
            className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
          />
          <textarea
            required
            rows={7}
            placeholder="Votre message"
            className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background"
          >
            Envoyer
          </button>
        </form>

        <div className="space-y-10">
          <div className="space-y-3 text-sm">
            <p className="eyebrow text-muted-foreground">Studio</p>
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
              <Instagram className="size-4" /> @jijitattoo_66
            </p>
          </div>

          <div>
            <p className="eyebrow flex items-center gap-2 text-muted-foreground">
              <Clock className="size-3.5" /> Horaires
            </p>
            <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
              {hours.map(([d, h]) => (
                <li key={d} className="flex justify-between py-3">
                  <span>{d}</span>
                  <span className="text-muted-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="aspect-[4/3] w-full border border-border bg-secondary">
            <iframe
              title="Plan d'accès Jiji Tattoo"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.3600%2C48.8520%2C2.3900%2C48.8680&layer=mapnik"
              className="size-full grayscale"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </>
  );
}
