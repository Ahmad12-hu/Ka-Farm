# KA Farm - Configuration Feedback System

## 📋 Vue d'ensemble

Le système de feedback permet de collecter des avis utilisateur directement dans l'application KA Farm. Les feedbacks sont stockés dans Supabase.

## 🚀 Installation

### Étape 1 : Créer la table dans Supabase

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu du fichier `feedback-table.sql`
4. Exécutez le script

### Étape 2 : Configurer les credentials

Ajoutez ces variables dans votre fichier `.env` à la racine du projet :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important** : Utilisez la **clé publique** (anon key), pas la clé secrète !

### Étape 3 : Tester le fonctionnement

1. Lancez l'application : `npm run dev`
2. Naviguez vers une page (pas auth/admin)
3. Cliquez sur le bouton flottant en bas à droite
4. Remplissez le formulaire et envoyez

## 📊 Structure de la table `feedback`

```sql
id BIGSERIAL PRIMARY KEY
created_at TIMESTAMPTZ DEFAULT NOW()
note INTEGER (1-4)  -- 1=😞, 2=😐, 3=🙂, 4=😃
message TEXT
user_id UUID (optionnel)
```

## 🔧 Configuration avancée

### Désactiver le stockage local fallback

Si vous voulez obligatoirement utiliser Supabase, modifiez `js/modules/feedback.js` :

```javascript
if (!this.supabaseClient) {
  alert("Service temporairement indisponible");
  return;
}
```

### Personnaliser les questions

Éditez le HTML dans `js/modules/feedback.js` dans la méthode `openModal()`.

### Changer la position du bouton

Modifiez la classe dans `injectFloatingButton()` :

```javascript
// Actuel : bottom-20 right-4
// Exemple pour haut gauche :
fab.className = "fixed top-4 left-4 z-40 ...";
```

## 📱 Utilisation

### Pour les utilisateurs

1. Cliquer sur le bouton 💬 en bas à droite
2. Choisir une note (😞 à 😃)
3. Écrire un commentaire (optionnel)
4. Cliquer sur "Envoyer mon avis"

### Pour les admins

Les feedbacks sont consultables directement dans Supabase :

```sql
-- Voir tous les feedbacks
SELECT * FROM feedback ORDER BY created_at DESC;

-- Statistiques
SELECT * FROM feedback_stats;

-- Feedback des 7 derniers jours
SELECT * FROM feedback
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

## 🎨 Personnalisation CSS

Les classes CSS sont dans `css/styles.css` :

```css
#feedback-fab          /* Bouton flottant */
#feedback-modal        /* Modal complet */
.rating-btn            /* Boutons de notation */
```

## 📦 Dépendances

- Supabase JS SDK v2 (chargé dynamiquement)
- Tailwind CSS (déjà dans le projet)

## 🔒 Sécurité

- RLS activé sur la table `feedback`
- Les utilisateurs anonymes peuvent soumettre des feedbacks
- Seuls les authentifiés peuvent modifier/supprimer (politique admin)
- Le stockage local est chiffré par le navigateur

## 🐛 Troubleshooting

**Le bouton n'apparaît pas ?**

- Vérifiez que vous n'êtes pas sur une page /auth/ ou /admin/
- Ouvrez la console et cherchez "FeedbackModule"

**L'envoi échoue ?**

- Vérifiez vos credentials Supabase dans `.env`
- Testez la connexion : `supabase.functions.invoke('test')`
- Consultez les logs de la console navigateur

**Les transitions sont saccadées ?**

- Vérifiez que `backdrop-filter` est supporté par votre navigateur
- Désactivez les autres animations pour diagnostiquer

## 📞 Support

Pour toute question, consultez la documentation Supabase :

- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
