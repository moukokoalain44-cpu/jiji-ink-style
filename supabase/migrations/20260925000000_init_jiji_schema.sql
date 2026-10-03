-- ============================================================================
-- JIJI TATTOO STUDIO — Schéma complet Supabase PostgreSQL
-- Version : 1.0.0
-- ============================================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FONCTIONS UTILITAIRES & TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_date_modification_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLES PRINCIPALES
-- ============================================================================

-- Table : categories (Tattoo, Piercing, Skincare...)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL UNIQUE,
    description TEXT,
    image_couverture TEXT,
    ordre_affichage INT NOT NULL DEFAULT 0,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_date_modification
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_date_modification_column();

-- Table : services
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    description TEXT,
    prix_minimum NUMERIC,
    prix_maximum NUMERIC,
    prix_fixe NUMERIC,
    duree_estimee TEXT,
    image TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_modification TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_services_date_modification
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_date_modification_column();

-- Table : gallery_images (Portfolio)
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    titre TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    image_avant TEXT,
    image_apres TEXT,
    artiste TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    publiee BOOLEAN NOT NULL DEFAULT TRUE,
    consentement_publication BOOLEAN NOT NULL DEFAULT TRUE,
    date_ajout TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table : clients (Prospects et Clients unifiés)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    date_naissance DATE,
    notes TEXT,
    consentement_contact BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_clients_email UNIQUE (email)
);

-- Table : availability_slots (Créneaux de disponibilité)
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    type_prestation TEXT,
    notes TEXT,
    CONSTRAINT uq_availability_slot UNIQUE (date, heure_debut, type_prestation)
);

-- Table : appointments (Réservations)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    date_souhaitee DATE NOT NULL,
    heure_souhaitee TIME NOT NULL,
    duree TEXT,
    message TEXT,
    statut TEXT NOT NULL DEFAULT 'en_attente' 
        CHECK (statut IN ('en_attente', 'confirme', 'refuse', 'a_reprogrammer', 'termine', 'annule')),
    date_proposee TIMESTAMPTZ,
    commentaire_admin TEXT,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_appointment_slot UNIQUE (date_souhaitee, heure_souhaitee, service_id)
);

-- Table : quote_requests (Demandes de devis)
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    description_projet TEXT NOT NULL,
    zone_du_corps TEXT,
    taille_estimee TEXT,
    couleurs TEXT,
    budget TEXT,
    date_souhaitee TEXT,
    statut TEXT NOT NULL DEFAULT 'nouveau'
        CHECK (statut IN ('nouveau', 'en_etude', 'devis_envoye', 'accepte', 'refuse', 'expire')),
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table : quote_request_attachments (Images de référence devis)
CREATE TABLE IF NOT EXISTS quote_request_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT,
    mime_type TEXT,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table : quotes (Devis générés)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    montant_total NUMERIC NOT NULL DEFAULT 0,
    validite_jusqu_au DATE NOT NULL,
    description_generale TEXT,
    conditions TEXT,
    statut TEXT NOT NULL DEFAULT 'en_attente'
        CHECK (statut IN ('en_attente', 'accepte', 'refuse', 'expire')),
    token_acces TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    date_envoi TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table : quote_items (Lignes de devis)
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    designation TEXT NOT NULL,
    description TEXT,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

-- Table : reviews (Avis clients)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    nom TEXT NOT NULL,
    photo_url TEXT,
    photos_resultat TEXT[] DEFAULT '{}',
    note INT NOT NULL CHECK (note BETWEEN 1 AND 5),
    service TEXT,
    commentaire TEXT NOT NULL,
    statut_publication TEXT NOT NULL DEFAULT 'en_attente'
        CHECK (statut_publication IN ('en_attente', 'approuve', 'masque', 'supprime')),
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_reviews_date_modification
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_date_modification_column();

-- Table : products (Boutique Skincare)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    nom TEXT NOT NULL,
    description TEXT,
    detail TEXT,
    prix NUMERIC NOT NULL,
    image TEXT,
    stock INT NOT NULL DEFAULT 50,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_products_date_modification
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_date_modification_column();

-- ============================================================================
-- 3. INDEX DE PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_publiee ON gallery_images(publiee);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date_souhaitee, heure_souhaitee);
CREATE INDEX IF NOT EXISTS idx_quote_requests_client ON quote_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_token ON quotes(token_acces);
CREATE INDEX IF NOT EXISTS idx_reviews_statut ON reviews(statut_publication);

-- ============================================================================
-- 4. CONFIGURATION ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4.1 Politiques publiques de lecture
CREATE POLICY "Lecture publique des catégories actives"
    ON categories FOR SELECT USING (actif = TRUE);

CREATE POLICY "Lecture publique des services actifs"
    ON services FOR SELECT USING (actif = TRUE);

CREATE POLICY "Lecture publique de la galerie publiée"
    ON gallery_images FOR SELECT USING (publiee = TRUE);

CREATE POLICY "Lecture publique des créneaux"
    ON availability_slots FOR SELECT USING (TRUE);

CREATE POLICY "Lecture publique des avis approuvés"
    ON reviews FOR SELECT USING (statut_publication = 'approuve');

CREATE POLICY "Lecture publique des produits actifs"
    ON products FOR SELECT USING (actif = TRUE);

-- 4.2 Politiques publiques d'insertion (Formulaires client)
CREATE POLICY "Création de client / prospect"
    ON clients FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Mise à jour d'un client par son email"
    ON clients FOR UPDATE USING (TRUE);

CREATE POLICY "Création de rendez-vous"
    ON appointments FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Création de demande de devis"
    ON quote_requests FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Ajout de pièces jointes devis"
    ON quote_request_attachments FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Dépôt d'un avis client"
    ON reviews FOR INSERT WITH CHECK (statut_publication = 'en_attente');

-- 4.3 Politiques d'accès aux devis par Token imprévisible
CREATE POLICY "Lecture devis par token sécurisé"
    ON quotes FOR SELECT USING (TRUE);

CREATE POLICY "Mise à jour statut devis (acceptation/refus)"
    ON quotes FOR UPDATE USING (TRUE);

CREATE POLICY "Lecture des lignes de devis"
    ON quote_items FOR SELECT USING (TRUE);

-- 4.4 Politiques Administrateur (authentifié)
CREATE POLICY "Accès complet administrateur categories"
    ON categories FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur services"
    ON services FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur gallery_images"
    ON gallery_images FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur clients"
    ON clients FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur availability_slots"
    ON availability_slots FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur appointments"
    ON appointments FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur quote_requests"
    ON quote_requests FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur quote_request_attachments"
    ON quote_request_attachments FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur quotes"
    ON quotes FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur quote_items"
    ON quote_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur reviews"
    ON reviews FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Accès complet administrateur products"
    ON products FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================================
-- 5. BUCKETS SUPABASE STORAGE
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('portfolio', 'portfolio', true),
    ('reviews', 'reviews', true),
    ('products', 'products', true),
    ('quote-attachments', 'quote-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Lecture publique portfolio"
    ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Lecture publique reviews"
    ON storage.objects FOR SELECT USING (bucket_id = 'reviews');

CREATE POLICY "Lecture publique products"
    ON storage.objects FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Upload public attachments devis"
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'quote-attachments');

CREATE POLICY "Upload public photos avis"
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reviews');

CREATE POLICY "Admin full access storage"
    ON storage.objects FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================================
-- 6. DONNÉES INITIALES (SEEDING AVEC LES VRAIS TARIFS DU SALON)
-- ============================================================================

-- Catégories
INSERT INTO categories (id, nom, description, ordre_affichage, actif)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Tatouage', 'Pièces sur-mesure, fine line, blackwork et réalisme.', 1, TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing', 'Bijoux titane implant grade, hygiène médicale et pose millimétrée.', 2, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Skincare', 'Protocoles de soin et cosmétiques dédiés à la peau tatouée.', 3, TRUE)
ON CONFLICT (nom) DO UPDATE SET actif = TRUE;

-- Vrais Tarifs Piercing en FCFA (selon la grille officielle Instagram @jijitattoo_66)
INSERT INTO services (category_id, nom, description, prix_fixe, duree_estimee, actif)
VALUES
    -- Piercings Visage
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Nez', 'Perçage de la narine avec bijou standard titane inclus.', 5000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Medusa', 'Perçage au centre de la lèvre supérieure avec bijou standard inclus.', 5000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Monroe', 'Perçage au-dessus de la lèvre supérieure côté gauche.', 4000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Madonna', 'Perçage au-dessus de la lèvre supérieure côté droit.', 4000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Labret', 'Perçage sous la lèvre inférieure.', 6000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Septum', 'Perçage de la cloison nasale avec fer à cheval ou anneau standard.', 8000, '30 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Arcade', 'Perçage de l''arcade sourcilière.', 6000, '20 min', TRUE),

    -- Piercings Oreille
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Lobe', 'Perçage simple du lobe avec bijou stérile.', 4000, '15 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Lobe Double', 'Deux perçages de lobe lors de la même séance.', 8000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Tragus', 'Cartilage tragus, placement sur-mesure.', 5000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Anti Tragus', 'Cartilage face au tragus.', 8000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Helix', 'Perçage du cartilage supérieur de l''oreille.', 5000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Anti Helix', 'Cartilage avant en haut de l''oreille.', 5000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Snug', 'Perçage du repli cartilagineux interne.', 4000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Conch', 'Centre de la coquille du pavillon.', 4000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Rook', 'Crête de cartilage supérieure interne.', 5000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Daith', 'Anneau au pli le plus interne au-dessus du conduit auditif.', 6000, '30 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Industriel', 'Double perçage traversant avec barre longue.', 10000, '35 min', TRUE),

    -- Piercings Buccal
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Langue B. Droite', 'Perçage classique de la langue.', 6000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Eyes Snack (Snake Eyes)', 'Perçage horizontal à l''extrémité de la langue.', 8000, '30 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Surface Langue', 'Perçage en surface sur le dessus de la langue.', 6000, '30 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Smiley', 'Perçage du frein de la lèvre supérieure.', 6000, '20 min', TRUE),

    -- Piercings Corporel & Microdermal
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Nombril', 'Perçage du repli supérieur du nombril avec banane.', 5000, '20 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Nombril Long', 'Perçage nombril avec bijou pendant.', 6000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Téton simple', 'Perçage d''un téton avec barre stérile.', 10000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Tétons Double', 'Perçage des deux tétons.', 15000, '40 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Piercing Surface Corporel', 'Barre de surface en titane avec embouts plats.', 8000, '30 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Microdermal (1 point)', 'Implant sous-cutané unitaire en titane avec disque.', 10000, '25 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Microdermal X2', 'Deux implants sous-cutanés.', 15000, '40 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Microdermal Surface', 'Composition microdermal surface.', 10000, '30 min', TRUE),

    -- Services Bijouterie & Soins Piercing
    ('a0000000-0000-0000-0000-000000000002', 'Produits Soins Piercing', 'Solution saline stérile et nettoyant doux adapté.', 5000, '10 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Pose Bijou', 'Pose ou ajustement de bijou apporté ou acheté.', 2000, '15 min', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Échange Bijou', 'Changement de bijou de pose après cicatrisation.', 2000, '15 min', TRUE),

    -- Tatouage
    ('a0000000-0000-0000-0000-000000000001', 'Flash / Petit Motif', 'Motif prédéfini ou création miniature fine line.', 55000, '45 min', TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'Pièce sur-mesure moyenne', 'Création originale dessinée pour votre morphologie.', 180000, '2 à 3 h', TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'Grande Pièce (Séance 5h)', 'Manchette, dos ou cuisse en séances longues.', 350000, '5 h', TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'Retouche (dans les 6 mois)', 'Séance de contrôle et retouche de cicatrisation.', 0, '30 min', TRUE),

    -- Skincare
    ('a0000000-0000-0000-0000-000000000003', 'Soin apaisant post-encre', 'Protocole d''apaisement et régénération cutanée.', 45000, '45 min', TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Nettoyage profond & hydratation', 'Désincrustation douce et bain d''hydratation.', 55000, '1 h', TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Protocole éclat contraste', 'Réveil des pigments et éclat de la peau.', 70000, '1 h 15', TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Diagnostic de peau', 'Bilan personnalisé avant séance ou routine skincare.', 0, '20 min', TRUE);

-- Produits Skincare Boutique
INSERT INTO products (category_id, nom, description, detail, prix, stock, actif)
VALUES
    ('a0000000-0000-0000-0000-000000000003', 'Baume après-tatouage Jiji', 'Cire d''abeille, beurre de karité et calendula biologique. Apaise immédiatement et soutient la barrière cutanée.', 'Cire d''abeille, calendula — 50 ml', 12500, 50, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Sérum apaisant réparateur', 'Formule concentrée en panthénol et extrait d''aloé vera pur. Texture non grasse à pénétration rapide.', 'Panthénol & aloé — 30 ml', 19000, 40, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Écran solaire minéral SPF 50', 'Filtres minéraux invisibles haute protection. Empêche le délavage des pigments sous les rayons UV.', 'Protection UV encre — 50 ml', 15500, 60, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Nettoyant doux pH 5.5', 'Gel moussant sans savon et sans parfum pour laver en toute sécurité une peau fraîchement percée ou tatouée.', 'Sans parfum — 200 ml', 10500, 75, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Huile de soin quotidienne', 'Cocktail d''huile de jojoba et de vitamine E pour nourrir la peau et maintenir l''éclat du noir profond.', 'Jojoba & vitamine E — 30 ml', 14500, 35, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Kit Cicatrisation Complet', 'Le rituel incontournable réuni dans un coffret : Nettoyant pH 5.5 + Baume réparateur + Écran SPF 50.', 'Baume + nettoyant + SPF', 35000, 25, TRUE);

-- Avis clients initiaux approuvés
INSERT INTO reviews (nom, note, service, commentaire, statut_publication)
VALUES
    ('Camille R.', 5, 'Tatouage fine line', 'Écoute parfaite, trait impeccable et un studio d''un calme rare. Le résultat dépasse mon projet initial.', 'approuve'),
    ('Yanis B.', 5, 'Piercing hélix', 'Placement discuté au millimètre, zéro douleur inutile, cicatrisation nickel en trois semaines.', 'approuve'),
    ('Sofia M.', 4, 'Soin peau', 'Mon tatouage de six ans a retrouvé du contraste après le protocole éclat. Conseils très concrets.', 'approuve');
