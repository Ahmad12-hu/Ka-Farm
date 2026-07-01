// KA-FARM - Modèles de données PostgreSQL
// Fonctions d'accès aux données pour chaque table

import { query, transaction } from './config.js';

// ============================================
// MODÈLE FERMES
// ============================================
export const FermeModel = {
  async getAll() {
    const result = await query('SELECT * FROM fermes WHERE statut = $1 ORDER BY nom', ['actif']);
    return result.rows;
  },

  async getById(id) {
    const result = await query('SELECT * FROM fermes WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const result = await query(`
      INSERT INTO fermes (nom, code_ferme, localisation, region, surface_totale_m2, coordonnees_lat, coordonnees_lng, responsable_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [data.nom, data.code_ferme, data.localisation, data.region, data.surface_totale_m2, data.coordonnees_lat, data.coordonnees_lng, data.responsable_id]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await query(`
      UPDATE fermes
      SET nom = $1, localisation = $2, region = $3, surface_totale_m2 = $4, coordonnees_lat = $5, coordonnees_lng = $6
      WHERE id = $7
      RETURNING *
    `, [data.nom, data.localisation, data.region, data.surface_totale_m2, data.coordonnees_lat, data.coordonnees_lng, id]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE UTILISATEURS
// ============================================
export const UtilisateurModel = {
  async getAll() {
    const result = await query('SELECT id, email, nom, prenom, telephone, role, ferme_id, est_actif FROM utilisateurs ORDER BY nom');
    return result.rows;
  },

  async getById(id) {
    const result = await query('SELECT * FROM utilisateurs WHERE id = $1', [id]);
    return result.rows[0];
  },

  async getByEmail(email) {
    const result = await query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    return result.rows[0];
  },

  async create(data) {
    const result = await query(`
      INSERT INTO utilisateurs (email, password_hash, nom, prenom, telephone, role, ferme_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, nom, prenom, telephone, role, ferme_id, est_actif
    `, [data.email, data.password_hash, data.nom, data.prenom, data.telephone, data.role, data.ferme_id]);
    return result.rows[0];
  },

  async updateLastLogin(id) {
    await query('UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = $1', [id]);
  }
};

// ============================================
// MODÈLE PARCELLES
// ============================================
export const ParcelleModel = {
  async getByFerme(fermeId) {
    const result = await query('SELECT * FROM parcelles WHERE ferme_id = $1 ORDER BY nom_parcelle', [fermeId]);
    return result.rows;
  },

  async getById(id) {
    const result = await query('SELECT * FROM parcelles WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const result = await query(`
      INSERT INTO parcelles (ferme_id, nom_parcelle, code_parcelle, surface_m2, type_sol, coordonnees_lat, coordonnees_lng, statut)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [data.ferme_id, data.nom_parcelle, data.code_parcelle, data.surface_m2, data.type_sol, data.coordonnees_lat, data.coordonnees_lng, data.statut]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await query(`
      UPDATE parcelles
      SET nom_parcelle = $1, surface_m2 = $2, type_sol = $3, statut = $4
      WHERE id = $5
      RETURNING *
    `, [data.nom_parcelle, data.surface_m2, data.type_sol, data.statut, id]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE CULTURES
// ============================================
export const CultureModel = {
  async getByFerme(fermeId) {
    const result = await query(`
      SELECT c.*, p.nom_parcelle, p.surface_m2
      FROM cultures c
      JOIN parcelles p ON c.parcelle_id = p.id
      WHERE p.ferme_id = $1
      ORDER BY c.date_creation DESC
    `, [fermeId]);
    return result.rows;
  },

  async getById(id) {
    const result = await query('SELECT * FROM cultures WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    return await transaction(async (client) => {
      // Insérer la culture
      const result = await client.query(`
        INSERT INTO cultures (parcelle_id, nom_culture, variete, famille_botanique, date_semis, date_repiquage, date_recolte_prevue, statut, stade_developpement, water_status, fertilizer_status, densite_semis_m2, quantite_semis_unites, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [data.parcelle_id, data.nom_culture, data.variete, data.famille_botanique, data.date_semis, data.date_repiquage, data.date_recolte_prevue, data.statut, data.stade_developpement, data.water_status, data.fertilizer_status, data.densite_semis_m2, data.quantite_semis_unites, data.notes]);
      
      // Mettre à jour le statut de la parcelle si nécessaire
      if (data.statut === 'en_production') {
        await client.query('UPDATE parcelles SET statut = $1 WHERE id = $2', ['en_production', data.parcelle_id]);
      }
      
      return result.rows[0];
    });
  },

  async update(id, data) {
    const result = await query(`
      UPDATE cultures
      SET nom_culture = $1, variete = $2, statut = $3, stade_developpement = $4, water_status = $5, fertilizer_status = $6, date_recolte_prevue = $7, notes = $8
      WHERE id = $9
      RETURNING *
    `, [data.nom_culture, data.variete, data.statut, data.stade_developpement, data.water_status, data.fertilizer_status, data.date_recolte_prevue, data.notes, id]);
    return result.rows[0];
  },

  async delete(id) {
    await query('DELETE FROM cultures WHERE id = $1', [id]);
  }
};

// ============================================
// MODÈLE PÉPINIÈRES
// ============================================
export const PepiniereModel = {
  async getAll() {
    const result = await query(`
      SELECT p.*, parcelle.nom_parcelle
      FROM pepinieres p
      LEFT JOIN parcelles ON p.parcelle_id = parcelle.id
      ORDER BY p.date_semis DESC
    `);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO pepinieres (parcelle_id, nom_pepiniere, culture_type, variete, date_semis, nombre_semis, nombre_alveoles, surface_m2, taux_levee_estime, date_repiquage_prevue, statut, sante, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [data.parcelle_id, data.nom_pepiniere, data.culture_type, data.variete, data.date_semis, data.nombre_semis, data.nombre_alveoles, data.surface_m2, data.taux_levee_estime, data.date_repiquage_prevue, data.statut, data.sante, data.notes]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await query(`
      UPDATE pepinieres
      SET statut = $1, sante = $2, taux_levee_estime = $3, date_repiquage_prevue = $4, notes = $5
      WHERE id = $6
      RETURNING *
    `, [data.statut, data.sante, data.taux_levee_estime, data.date_repiquage_prevue, data.notes, id]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE RÉCOLTES
// ============================================
export const RecolteModel = {
  async getByFerme(fermeId, dateDebut, dateFin) {
    let sql = `
      SELECT r.*, c.nom_culture, p.nom_parcelle
      FROM recoltes r
      JOIN cultures c ON r.culture_id = c.id
      JOIN parcelles p ON r.parcelle_id = p.id
      WHERE p.ferme_id = $1
    `;
    const params = [fermeId];
    
    if (dateDebut) {
      sql += ' AND r.date_recolte >= $' + (params.length + 1);
      params.push(dateDebut);
    }
    
    if (dateFin) {
      sql += ' AND r.date_recolte <= $' + (params.length + 1);
      params.push(dateFin);
    }
    
    sql += ' ORDER BY r.date_recolte DESC';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO recoltes (culture_id, parcelle_id, date_recolte, poids_kg, qualite, nombre_caisse, prix_unitaire_fcfa, prix_total_fcfa, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [data.culture_id, data.parcelle_id, data.date_recolte, data.poids_kg, data.qualite, data.nombre_caisse, data.prix_unitaire_fcfa, data.prix_total_fcfa, data.notes]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE STOCKS
// ============================================
export const StockModel = {
  async getByFerme(fermeId) {
    const result = await query('SELECT * FROM stocks_intrants WHERE ferme_id = $1 ORDER BY categorie, intrant_nom', [fermeId]);
    return result.rows;
  },

  async getAlertes(fermeId) {
    const result = await query(`
      SELECT * FROM vue_alertes_stock
      WHERE ferme_id = $1
      ORDER BY niveau_alerte DESC
    `, [fermeId]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO stocks_intrants (ferme_id, intrant_nom, categorie, quantite_disponible, unite_mesure, quantite_miniale, quantite_maximale, fournisseur, cout_unitaire_fcfa)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [data.ferme_id, data.intrant_nom, data.categorie, data.quantite_disponible, data.unite_mesure, data.quantite_miniale, data.quantite_maximale, data.fournisseur, data.cout_unitaire_fcfa]);
    return result.rows[0];
  },

  async updateQuantite(id, nouvelleQuantite, operateurId) {
    return await transaction(async (client) => {
      const stock = await client.query('SELECT quantite_disponible FROM stocks_intrants WHERE id = $1', [id]);
      const ancienneQuantite = stock.rows[0].quantite_disponible;
      const difference = nouvelleQuantite - ancienneQuantite;
      
      // Mettre à jour le stock
      await client.query('UPDATE stocks_intrants SET quantite_disponible = $1 WHERE id = $2', [nouvelleQuantite, id]);
      
      // Enregistrer le mouvement
      const typeMouvement = difference > 0 ? 'entree' : 'sortie';
      await client.query(`
        INSERT INTO mouvements_stock (stock_id, type_mouvement, quantite, motif, operateur_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, typeMouvement, Math.abs(difference), 'Ajustement stock', operateurId]);
      
      return { success: true };
    });
  }
};

// ============================================
// MODÈLE EMPLOYÉS
// ============================================
export const EmployeModel = {
  async getByFerme(fermeId) {
    const result = await query('SELECT * FROM employes WHERE ferme_id = $1 AND statut = $2 ORDER BY nom', [fermeId, 'actif']);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO employes (ferme_id, nom, prenom, telephone, role, taux_journalier_fcfa, taux_mensuel_fcfa, date_embauche, statut, adresse, cni, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [data.ferme_id, data.nom, data.prenom, data.telephone, data.role, data.taux_journalier_fcfa, data.taux_mensuel_fcfa, data.date_embauche, data.statut, data.adresse, data.cni, data.notes]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await query(`
      UPDATE employes
      SET nom = $1, prenom = $2, telephone = $3, role = $4, taux_journalier_fcfa = $5, statut = $6
      WHERE id = $7
      RETURNING *
    `, [data.nom, data.prenom, data.telephone, data.role, data.taux_journalier_fcfa, data.statut, id]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE PRÉSENCES
// ============================================
export const PresenceModel = {
  async getByEmploye(employeId, dateDebut, dateFin) {
    let sql = 'SELECT * FROM presences WHERE employe_id = $1';
    const params = [employeId];
    
    if (dateDebut) {
      sql += ' AND date >= $' + (params.length + 1);
      params.push(dateDebut);
    }
    
    if (dateFin) {
      sql += ' AND date <= $' + (params.length + 1);
      params.push(dateFin);
    }
    
    sql += ' ORDER BY date DESC';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO presences (employe_id, date, statut, heures_travaillees, taches_effectuees, notes, enregistre_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (employe_id, date) DO UPDATE SET
        statut = $3, heures_travaillees = $4, taches_effectuees = $5, notes = $6, enregistre_par = $7
      RETURNING *
    `, [data.employe_id, data.date, data.statut, data.heures_travaillees, data.taches_effectuees, data.notes, data.enregistre_par]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE PAIEMENTS EMPLOYÉS
// ============================================
export const PaiementEmployeModel = {
  async getByEmploye(employeId) {
    const result = await query('SELECT * FROM paiements_employes WHERE employe_id = $1 ORDER BY date_paiement DESC', [employeId]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO paiements_employes (employe_id, montant_fcfa, date_paiement, periode_debut, periode_fin, methode_paiement, reference_paiement, notes, enregistre_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [data.employe_id, data.montant_fcfa, data.date_paiement, data.periode_debut, data.periode_fin, data.methode_paiement, data.reference_paiement, data.notes, data.enregistre_par]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE TRANSACTIONS FINANCIÈRES
// ============================================
export const TransactionModel = {
  async getByFerme(fermeId, typeTransaction, dateDebut, dateFin) {
    let sql = 'SELECT * FROM transactions_financieres WHERE ferme_id = $1';
    const params = [fermeId];
    
    if (typeTransaction) {
      sql += ' AND type_transaction = $' + (params.length + 1);
      params.push(typeTransaction);
    }
    
    if (dateDebut) {
      sql += ' AND date_transaction >= $' + (params.length + 1);
      params.push(dateDebut);
    }
    
    if (dateFin) {
      sql += ' AND date_transaction <= $' + (params.length + 1);
      params.push(dateFin);
    }
    
    sql += ' ORDER BY date_transaction DESC';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async getSynthese(fermeId) {
    const result = await query('SELECT * FROM vue_synthese_finances WHERE ferme_id = $1', [fermeId]);
    return result.rows[0];
  },

  async create(data) {
    const result = await query(`
      INSERT INTO transactions_financieres (ferme_id, type_transaction, categorie, description, montant_fcfa, date_transaction, mode_paiement, reference_facture, tiers, justificatif_url, enregistre_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [data.ferme_id, data.type_transaction, data.categorie, data.description, data.montant_fcfa, data.date_transaction, data.mode_paiement, data.reference_facture, data.tiers, data.justificatif_url, data.enregistre_par]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE VENTES
// ============================================
export const VenteModel = {
  async getByFerme(fermeId, dateDebut, dateFin) {
    let sql = 'SELECT * FROM ventes WHERE ferme_id = $1';
    const params = [fermeId];
    
    if (dateDebut) {
      sql += ' AND date_vente >= $' + (params.length + 1);
      params.push(dateDebut);
    }
    
    if (dateFin) {
      sql += ' AND date_vente <= $' + (params.length + 1);
      params.push(dateFin);
    }
    
    sql += ' ORDER BY date_vente DESC';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async create(data) {
    return await transaction(async (client) => {
      // Créer la vente
      const vente = await client.query(`
        INSERT INTO ventes (ferme_id, produit, quantite_kg, prix_unitaire_fcfa, prix_total_fcfa, destination_marche, intermediaire_nom, intermediaire_telephone, acompte_fcfa, statut_reglement, date_vente, notes, enregistre_par)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [data.ferme_id, data.produit, data.quantite_kg, data.prix_unitaire_fcfa, data.prix_total_fcfa, data.destination_marche, data.intermediaire_nom, data.intermediaire_telephone, data.acompte_fcfa, data.statut_reglement, data.date_vente, data.notes, data.enregistre_par]);
      
      // Créer la transaction financière correspondante
      const montantRestant = data.prix_total_fcfa - data.acompte_fcfa;
      await client.query(`
        INSERT INTO transactions_financieres (ferme_id, type_transaction, categorie, description, montant_fcfa, date_transaction, mode_paiement, tiers, enregistre_par)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [data.ferme_id, 'revenu', 'Vente', `Vente de ${data.produit} - ${data.intermediaire_nom || 'Direct'}`, data.prix_total_fcfa, data.date_vente, 'especes', data.intermediaire_nom, data.enregistre_par]);
      
      return vente.rows[0];
    });
  }
};

// ============================================
// MODÈLE CHEPTEL
// ============================================
export const CheptelModel = {
  async getByFerme(fermeId) {
    const result = await query('SELECT * FROM cheptel WHERE ferme_id = $1 ORDER BY type_animal, nom_troupeau', [fermeId]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO cheptel (ferme_id, nom_troupeau, type_animal, race, quantite, unite, sexe, age_moyen_mois, but, statut_sante, date_entree, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [data.ferme_id, data.nom_troupeau, data.type_animal, data.race, data.quantite, data.unite, data.sexe, data.age_moyen_mois, data.but, data.statut_sante, data.date_entree, data.notes]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE PRODUCTION ANIMALE
// ============================================
export const ProductionAnimaleModel = {
  async getByCheptel(cheptelId, dateDebut, dateFin) {
    let sql = 'SELECT * FROM production_animale WHERE cheptel_id = $1';
    const params = [cheptelId];
    
    if (dateDebut) {
      sql += ' AND date_production >= $' + (params.length + 1);
      params.push(dateDebut);
    }
    
    if (dateFin) {
      sql += ' AND date_production <= $' + (params.length + 1);
      params.push(dateFin);
    }
    
    sql += ' ORDER BY date_production DESC';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO production_animale (cheptel_id, date_production, type_production, quantite, unite, qualite, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [data.cheptel_id, data.date_production, data.type_production, data.quantite, data.unite, data.qualite, data.notes]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE SANTÉ ANIMALE
// ============================================
export const SanteAnimaleModel = {
  async getByCheptel(cheptelId) {
    const result = await query('SELECT * FROM sante_animale WHERE cheptel_id = $1 ORDER BY date_intervention DESC', [cheptelId]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO sante_animale (cheptel_id, date_intervention, type_intervention, cible, praticien, cout_fcfa, medicaments, notes, enregistre_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [data.cheptel_id, data.date_intervention, data.type_intervention, data.cible, data.praticien, data.cout_fcfa, data.medicaments, data.notes, data.enregistre_par]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE TÂCHES
// ============================================
export const TacheModel = {
  async getByFerme(fermeId, statut) {
    let sql = 'SELECT * FROM taches WHERE ferme_id = $1';
    const params = [fermeId];
    
    if (statut) {
      sql += ' AND statut = $' + (params.length + 1);
      params.push(statut);
    }
    
    sql += ' ORDER BY date_echeance ASC';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO taches (ferme_id, titre, description, categorie, priorite, date_echeance, assigne_a, statut, cree_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [data.ferme_id, data.titre, data.description, data.categorie, data.priorite, data.date_echeance, data.assigne_a, data.statut, data.cree_par]);
    return result.rows[0];
  },

  async updateStatut(id, statut) {
    const dateCompletion = statut === 'termine' ? new Date().toISOString().split('T')[0] : null;
    const result = await query(`
      UPDATE taches
      SET statut = $1, date_completion = $2, date_modification = NOW()
      WHERE id = $3
      RETURNING *
    `, [statut, dateCompletion, id]);
    return result.rows[0];
  }
};

// ============================================
// MODÈLE MESSAGES
// ============================================
export const MessageModel = {
  async getByFerme(fermeId, limite = 50) {
    const result = await query(`
      SELECT m.*, u.nom as expediteur_nom, u.prenom as expediteur_prenom
      FROM messages m
      JOIN utilisateurs u ON m.expediteur_id = u.id
      WHERE m.ferme_id = $1
      ORDER BY m.date_envoi DESC
      LIMIT $2
    `, [fermeId, limite]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO messages (ferme_id, expediteur_id, contenu, est_prive)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.ferme_id, data.expediteur_id, data.contenu, data.est_prive]);
    return result.rows[0];
  },

  async marquerCommeLu(id) {
    await query('UPDATE messages SET lu = true, date_lecture = NOW() WHERE id = $1', [id]);
  }
};

// ============================================
// MODÈLE ALERTES
// ============================================
export const AlerteModel = {
  async getActives(fermeId) {
    const result = await query(`
      SELECT * FROM alertes
      WHERE ferme_id = $1 AND est_active = true
      ORDER BY severite DESC, date_debut DESC
    `, [fermeId]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO alertes (ferme_id, type_alerte, titre, description, severite, date_debut, date_fin, est_active, cree_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [data.ferme_id, data.type_alerte, data.titre, data.description, data.severite, data.date_debut, data.date_fin, data.est_active, data.cree_par]);
    return result.rows[0];
  },

  async desactiver(id) {
    await query('UPDATE alertes SET est_active = false WHERE id = $1', [id]);
  }
};

// ============================================
// MODÈLE CRÉDITS
// ============================================
export const CreditModel = {
  async getByFerme(fermeId) {
    const result = await query('SELECT * FROM credits WHERE ferme_id = $1 ORDER BY date_octroi DESC', [fermeId]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO credits (ferme_id, creancier_nom, montant_emprunte_fcfa, taux_interet, date_octroi, date_remboursement_prevue, montant_rembourse_fcfa, statut, objet, enregistre_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [data.ferme_id, data.creancier_nom, data.montant_emprunte_fcfa, data.taux_interet, data.date_octroi, data.date_remboursement_prevue, data.montant_rembourse_fcfa, data.statut, data.objet, data.enregistre_par]);
    return result.rows[0];
  },

  async ajouterRemboursement(id, montant) {
    await query(`
      UPDATE credits
      SET montant_rembourse_fcfa = montant_rembourse_fcfa + $1,
          statut = CASE WHEN montant_rembourse_fcfa + $1 >= montant_emprunte_fcfa THEN 'rembourse' ELSE statut END
      WHERE id = $2
    `, [montant, id]);
  }
};

// ============================================
// MODÈLE ÉQUIPEMENTS
// ============================================
export const EquipementModel = {
  async getByFerme(fermeId) {
    const result = await query('SELECT * FROM equipements WHERE ferme_id = $1 ORDER BY type_equipement, nom', [fermeId]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO equipements (ferme_id, nom, type_equipement, marque, modele, date_achat, cout_achat_fcfa, statut, date_derniere_maintenance, heures_utilisation, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [data.ferme_id, data.nom, data.type_equipement, data.marque, data.modele, data.date_achat, data.cout_achat_fcfa, data.statut, data.date_derniere_maintenance, data.heures_utilisation, data.notes]);
    return result.rows[0];
  },

  async enregistrerMaintenance(id, date, cout) {
    await query(`
      UPDATE equipements
      SET date_derniere_maintenance = $1, statut = 'operationnel'
      WHERE id = $2
    `, [date, id]);
  }
};
