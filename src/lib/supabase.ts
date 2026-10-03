import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://elcpslcoxnzuzdavvvpx.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_g2G2MPEDW0k_yrNlEo9Ehw_DsnXDmXB";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ============================================================================
// HELPERS REQUÊTES SUPABASE AVEC FALLBACK
// ============================================================================

/**
 * Récupère les catégories actives depuis Supabase
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("actif", true)
    .order("ordre_affichage", { ascending: true });

  if (error) {
    console.warn("Impossible de charger les catégories depuis Supabase :", error.message);
    return null;
  }
  return data;
}

/**
 * Récupère les services avec leur catégorie
 */
export async function getServices(categoryId?: string) {
  let query = supabase
    .from("services")
    .select("*, categories(nom)")
    .eq("actif", true)
    .order("nom", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("Impossible de charger les services depuis Supabase :", error.message);
    return null;
  }
  return data;
}

/**
 * Récupère la galerie d'images du portfolio
 */
export async function getGalleryImages(categoryNom?: string) {
  let query = supabase
    .from("gallery_images")
    .select("*, categories(nom)")
    .eq("publiee", true)
    .order("date_ajout", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.warn("Impossible de charger le portfolio depuis Supabase :", error.message);
    return null;
  }
  return data;
}

/**
 * Récupère les avis approuvés
 */
export async function getApprovedReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("statut_publication", "approuve")
    .order("date_creation", { ascending: false });

  if (error) {
    console.warn("Impossible de charger les avis depuis Supabase :", error.message);
    return null;
  }
  return data;
}

/**
 * Récupère les produits actifs pour la boutique
 */
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("actif", true)
    .order("date_creation", { ascending: true });

  if (error) {
    console.warn("Impossible de charger les produits depuis Supabase :", error.message);
    return null;
  }
  return data;
}

/**
 * Recherche ou crée un client (upsert par email pour éviter les doublons)
 */
export async function findOrCreateClient(clientData: {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  notes?: string;
}) {
  // Vérifier d'abord si le client existe déjà
  const { data: existingClient, error: findError } = await supabase
    .from("clients")
    .select("*")
    .eq("email", clientData.email.trim().toLowerCase())
    .maybeSingle();

  if (existingClient) {
    // Mise à jour éventuelle du numéro ou des informations
    const { data: updatedClient } = await supabase
      .from("clients")
      .update({
        nom: clientData.nom,
        prenom: clientData.prenom,
        telephone: clientData.telephone,
        notes: clientData.notes ?? existingClient.notes,
      })
      .eq("id", existingClient.id)
      .select()
      .single();

    return updatedClient ?? existingClient;
  }

  // Création du nouveau client
  const { data: newClient, error: createError } = await supabase
    .from("clients")
    .insert({
      email: clientData.email.trim().toLowerCase(),
      nom: clientData.nom.trim(),
      prenom: clientData.prenom.trim(),
      telephone: clientData.telephone.trim(),
      notes: clientData.notes,
      consentement_contact: true,
    })
    .select()
    .single();

  if (createError) {
    console.error("Erreur lors de la création du client :", createError);
    throw new Error(createError.message);
  }

  return newClient;
}

/**
 * Upload d'un fichier vers Supabase Storage
 */
export async function uploadToStorage(
  bucket: "portfolio" | "reviews" | "quote-attachments" | "products",
  path: string,
  file: File | Blob
) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    console.error(`Erreur d'upload vers ${bucket} :`, error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}
