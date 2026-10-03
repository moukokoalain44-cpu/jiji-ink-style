export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          nom: string;
          description: string | null;
          image_couverture: string | null;
          ordre_affichage: number;
          actif: boolean;
          date_creation: string;
          date_modification: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string | null;
          image_couverture?: string | null;
          ordre_affichage?: number;
          actif?: boolean;
          date_creation?: string;
          date_modification?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string | null;
          image_couverture?: string | null;
          ordre_affichage?: number;
          actif?: boolean;
          date_creation?: string;
          date_modification?: string;
        };
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          nom: string;
          description: string | null;
          prix_minimum: number | null;
          prix_maximum: number | null;
          prix_fixe: number | null;
          duree_estimee: string | null;
          image: string | null;
          actif: boolean;
          date_modification: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          nom: string;
          description?: string | null;
          prix_minimum?: number | null;
          prix_maximum?: number | null;
          prix_fixe?: number | null;
          duree_estimee?: string | null;
          image?: string | null;
          actif?: boolean;
          date_modification?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          nom?: string;
          description?: string | null;
          prix_minimum?: number | null;
          prix_maximum?: number | null;
          prix_fixe?: number | null;
          duree_estimee?: string | null;
          image?: string | null;
          actif?: boolean;
          date_modification?: string;
        };
      };
      gallery_images: {
        Row: {
          id: string;
          category_id: string | null;
          titre: string;
          description: string | null;
          image_url: string;
          image_avant: string | null;
          image_apres: string | null;
          artiste: string | null;
          tags: string[];
          publiee: boolean;
          consentement_publication: boolean;
          date_ajout: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          titre: string;
          description?: string | null;
          image_url: string;
          image_avant?: string | null;
          image_apres?: string | null;
          artiste?: string | null;
          tags?: string[];
          publiee?: boolean;
          consentement_publication?: boolean;
          date_ajout?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          titre?: string;
          description?: string | null;
          image_url?: string;
          image_avant?: string | null;
          image_apres?: string | null;
          artiste?: string | null;
          tags?: string[];
          publiee?: boolean;
          consentement_publication?: boolean;
          date_ajout?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          date_naissance: string | null;
          notes: string | null;
          consentement_contact: boolean;
          date_creation: string;
        };
        Insert: {
          id?: string;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          date_naissance?: string | null;
          notes?: string | null;
          consentement_contact?: boolean;
          date_creation?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          prenom?: string;
          email?: string;
          telephone?: string;
          date_naissance?: string | null;
          notes?: string | null;
          consentement_contact?: boolean;
          date_creation?: string;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          date: string;
          heure_debut: string;
          heure_fin: string;
          disponible: boolean;
          type_prestation: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          heure_debut: string;
          heure_fin: string;
          disponible?: boolean;
          type_prestation?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          heure_debut?: string;
          heure_fin?: string;
          disponible?: boolean;
          type_prestation?: string | null;
          notes?: string | null;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          service_id: string | null;
          date_souhaitee: string;
          heure_souhaitee: string;
          duree: string | null;
          message: string | null;
          statut: "en_attente" | "confirme" | "refuse" | "a_reprogrammer" | "termine" | "annule";
          date_proposee: string | null;
          commentaire_admin: string | null;
          date_creation: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          service_id?: string | null;
          date_souhaitee: string;
          heure_souhaitee: string;
          duree?: string | null;
          message?: string | null;
          statut?: "en_attente" | "confirme" | "refuse" | "a_reprogrammer" | "termine" | "annule";
          date_proposee?: string | null;
          commentaire_admin?: string | null;
          date_creation?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          service_id?: string | null;
          date_souhaitee?: string;
          heure_souhaitee?: string;
          duree?: string | null;
          message?: string | null;
          statut?: "en_attente" | "confirme" | "refuse" | "a_reprogrammer" | "termine" | "annule";
          date_proposee?: string | null;
          commentaire_admin?: string | null;
          date_creation?: string;
        };
      };
      quote_requests: {
        Row: {
          id: string;
          client_id: string;
          category_id: string | null;
          service_id: string | null;
          description_projet: string;
          zone_du_corps: string | null;
          taille_estimee: string | null;
          couleurs: string | null;
          budget: string | null;
          date_souhaitee: string | null;
          statut: "nouveau" | "en_etude" | "devis_envoye" | "accepte" | "refuse" | "expire";
          date_creation: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          category_id?: string | null;
          service_id?: string | null;
          description_projet: string;
          zone_du_corps?: string | null;
          taille_estimee?: string | null;
          couleurs?: string | null;
          budget?: string | null;
          date_souhaitee?: string | null;
          statut?: "nouveau" | "en_etude" | "devis_envoye" | "accepte" | "refuse" | "expire";
          date_creation?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          category_id?: string | null;
          service_id?: string | null;
          description_projet?: string;
          zone_du_corps?: string | null;
          taille_estimee?: string | null;
          couleurs?: string | null;
          budget?: string | null;
          date_souhaitee?: string | null;
          statut?: "nouveau" | "en_etude" | "devis_envoye" | "accepte" | "refuse" | "expire";
          date_creation?: string;
        };
      };
      quote_request_attachments: {
        Row: {
          id: string;
          quote_request_id: string;
          file_url: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          date_creation: string;
        };
        Insert: {
          id?: string;
          quote_request_id: string;
          file_url: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          date_creation?: string;
        };
        Update: {
          id?: string;
          quote_request_id?: string;
          file_url?: string;
          file_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          date_creation?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          quote_request_id: string | null;
          client_id: string;
          montant_total: number;
          validite_jusqu_au: string;
          description_generale: string | null;
          conditions: string | null;
          statut: "en_attente" | "accepte" | "refuse" | "expire";
          token_acces: string;
          date_envoi: string;
        };
        Insert: {
          id?: string;
          quote_request_id?: string | null;
          client_id: string;
          montant_total?: number;
          validite_jusqu_au: string;
          description_generale?: string | null;
          conditions?: string | null;
          statut?: "en_attente" | "accepte" | "refuse" | "expire";
          token_acces?: string;
          date_envoi?: string;
        };
        Update: {
          id?: string;
          quote_request_id?: string | null;
          client_id?: string;
          montant_total?: number;
          validite_jusqu_au?: string;
          description_generale?: string | null;
          conditions?: string | null;
          statut?: "en_attente" | "accepte" | "refuse" | "expire";
          token_acces?: string;
          date_envoi?: string;
        };
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          designation: string;
          description: string | null;
          quantite: number;
          prix_unitaire: number;
          total: number;
        };
        Insert: {
          id?: string;
          quote_id: string;
          designation: string;
          description?: string | null;
          quantite?: number;
          prix_unitaire?: number;
        };
        Update: {
          id?: string;
          quote_id?: string;
          designation?: string;
          description?: string | null;
          quantite?: number;
          prix_unitaire?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          client_id: string | null;
          nom: string;
          photo_url: string | null;
          photos_resultat: string[];
          note: number;
          service: string | null;
          commentaire: string;
          statut_publication: "en_attente" | "approuve" | "masque" | "supprime";
          date_creation: string;
          date_modification: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          nom: string;
          photo_url?: string | null;
          photos_resultat?: string[];
          note: number;
          service?: string | null;
          commentaire: string;
          statut_publication?: "en_attente" | "approuve" | "masque" | "supprime";
          date_creation?: string;
          date_modification?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          nom?: string;
          photo_url?: string | null;
          photos_resultat?: string[];
          note?: number;
          service?: string | null;
          commentaire?: string;
          statut_publication?: "en_attente" | "approuve" | "masque" | "supprime";
          date_creation?: string;
          date_modification?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          nom: string;
          description: string | null;
          detail: string | null;
          prix: number;
          image: string | null;
          stock: number;
          actif: boolean;
          date_creation: string;
          date_modification: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          nom: string;
          description?: string | null;
          detail?: string | null;
          prix: number;
          image?: string | null;
          stock?: number;
          actif?: boolean;
          date_creation?: string;
          date_modification?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          nom?: string;
          description?: string | null;
          detail?: string | null;
          prix?: number;
          image?: string | null;
          stock?: number;
          actif?: boolean;
          date_creation?: string;
          date_modification?: string;
        };
      };
    };
  };
}
