export type Category = "Tatouage" | "Piercing" | "Skincare";

export const team = [
  {
    name: "Jiji",
    role: "Fondatrice · Tatoueuse fine line & blackwork",
    bio: "Douze ans d'encre, une obsession pour le trait juste et les compositions organiques.",
  },
  {
    name: "Malo",
    role: "Tatoueur · Réalisme noir et gris",
    bio: "Portraits, textures et dégradés profonds, travaillés en séances longues.",
  },
  {
    name: "Nour",
    role: "Perceuse certifiée",
    bio: "Placement millimétré, bijoux titane implant grade, suivi de cicatrisation inclus.",
  },
  {
    name: "Léa",
    role: "Esthéticienne · Soins peau tatouée",
    bio: "Protocoles d'apaisement, hydratation et éclat pour une encre qui tient dans le temps.",
  },
];

export const services = [
  {
    category: "Tatouage" as Category,
    items: [
      { name: "Flash / petit motif", duration: "45 min", price: "dès 90 €" },
      { name: "Pièce sur-mesure moyenne", duration: "2 à 3 h", price: "dès 320 €" },
      { name: "Grande pièce (dos, manchette)", duration: "Séances de 5 h", price: "600 € / séance" },
      { name: "Retouche (dans les 6 mois)", duration: "30 min", price: "Offerte" },
    ],
  },
  {
    category: "Piercing" as Category,
    items: [
      { name: "Lobe / hélix", duration: "20 min", price: "45 € (bijou inclus)" },
      { name: "Daith · tragus · conch", duration: "30 min", price: "65 €" },
      { name: "Septum / nostril", duration: "30 min", price: "60 €" },
      { name: "Changement de bijou & contrôle", duration: "15 min", price: "15 €" },
    ],
  },
  {
    category: "Skincare" as Category,
    items: [
      { name: "Soin apaisant peau fraîchement tatouée", duration: "45 min", price: "70 €" },
      { name: "Nettoyage profond & hydratation", duration: "1 h", price: "85 €" },
      { name: "Protocole éclat avant séance photo", duration: "1 h 15", price: "110 €" },
      { name: "Diagnostic de peau", duration: "20 min", price: "Offert" },
    ],
  },
];

export const portfolio = [
  { id: 1, title: "Floral fine line", category: "Tatouage" as Category, artist: "Jiji", ratio: "tall" },
  { id: 2, title: "Constellation hélix", category: "Piercing" as Category, artist: "Nour", ratio: "tall" },
  { id: 3, title: "Peau nette avant séance", category: "Skincare" as Category, artist: "Léa", ratio: "wide" },
  { id: 4, title: "Blackwork géométrique", category: "Tatouage" as Category, artist: "Malo", ratio: "tall" },
  { id: 5, title: "Septum titane", category: "Piercing" as Category, artist: "Nour", ratio: "wide" },
  { id: 6, title: "Réalisme noir & gris", category: "Tatouage" as Category, artist: "Malo", ratio: "tall" },
];

export const products = [
  {
    id: "baume",
    name: "Baume après-tatouage",
    detail: "Cire d'abeille, calendula — 50 ml",
    price: 19,
  },
  { id: "serum", name: "Sérum apaisant", detail: "Panthénol & aloé — 30 ml", price: 29 },
  { id: "spf", name: "Écran solaire SPF 50", detail: "Protège l'encre — 50 ml", price: 24 },
  { id: "savon", name: "Nettoyant doux pH 5.5", detail: "Sans parfum — 200 ml", price: 16 },
  { id: "huile", name: "Huile de soin quotidienne", detail: "Jojoba & vitamine E — 30 ml", price: 22 },
  { id: "kit", name: "Kit cicatrisation complet", detail: "Baume + nettoyant + SPF", price: 54 },
];

export const reviews = [
  {
    name: "Camille R.",
    rating: 5,
    service: "Tatouage fine line",
    text: "Écoute parfaite, trait impeccable et un studio d'un calme rare. Le résultat dépasse mon projet initial.",
  },
  {
    name: "Yanis B.",
    rating: 5,
    service: "Piercing hélix",
    text: "Placement discuté au millimètre, zéro douleur inutile, cicatrisation nickel en trois semaines.",
  },
  {
    name: "Sofia M.",
    rating: 4,
    service: "Soin peau",
    text: "Mon tatouage de six ans a retrouvé du contraste après le protocole éclat. Conseils très concrets.",
  },
];
