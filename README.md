# TruthBeacon - Plateforme de vérification d'articles

TruthBeacon est une application web de vérification de faits qui permet aux utilisateurs de consulter, soumettre et vérifier des informations. Cette plateforme combine une interface utilisateur moderne avec des fonctionnalités robustes de gestion de contenu.

## Fonctionnalités principales

- **Gestion d'articles** : Création, édition, et suppression d'articles avec statut de vérification
- **Système d'authentification** : Inscription, connexion, et gestion des permissions utilisateurs
- **Gestion des médias** : Téléchargement, recadrage et gestion des images
- **Administration complète** : Interface d'administration pour gérer utilisateurs, articles, médias et paramètres
- **Thème personnalisable** : Support des modes clair/sombre et personnalisation via les paramètres

## Captures d'écran

- Page d'accueil avec articles récents
- Interface d'administration
- Formulaire d'article avec outil de recadrage d'images
- Gestionnaire de médias

## Technologies utilisées

- **Frontend** : React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend** : Firebase (Auth, Firestore, Storage)
- **Outils** : Vite, ESLint, React Hook Form, Zod
- **Bibliothèques UI** : Lucide Icons, React Crop, Sonner

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/truthbeacon.git
cd truthbeacon

# Installer les dépendances
npm install

# Configuration de Firebase
# Créez un fichier .env à la racine du projet avec vos clés Firebase:
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
VITE_FIREBASE_MEASUREMENT_ID=votre_measurement_id

# Lancer l'application en mode développement
npm run dev
```

## Structure du projet

```
src/
├── components/         # Composants React réutilisables
│   ├── admin/          # Composants spécifiques à l'administration
│   ├── articles/       # Composants liés aux articles
│   └── ui/             # Composants UI génériques (Shadcn)
├── lib/                # Bibliothèques et utilitaires
│   ├── contexts/       # Contextes React (Auth, Thème)
│   ├── hooks/          # Hooks personnalisés
│   ├── services/       # Services (Auth, Articles, Settings, Images)
│   └── utils/          # Fonctions utilitaires
├── pages/              # Pages principales de l'application
│   ├── AdminPage.tsx   # Page d'administration
│   ├── ArticlePage.tsx # Page de détail d'article
│   ├── HomePage.tsx    # Page d'accueil
│   └── ...
├── App.tsx             # Point d'entrée principal
└── main.tsx            # Point d'entrée de l'application
```

## Rôles utilisateur

- **User** : Peut consulter des articles et soumettre des commentaires
- **Editor** : Peut créer et éditer des articles, assigner des statuts de vérification
- **Admin** : Accès complet à toutes les fonctionnalités, y compris la gestion des utilisateurs et paramètres

## Fonctionnalités détaillées

### Articles

- Création/édition avec support d'images (upload, recadrage)
- Statuts de vérification (Vrai, Faux, Partiellement vrai)
- Système de tags et catégorisation

### Média

- Gestionnaire de médias avec support pour différents dossiers
- Téléchargement multiple de fichiers
- Prévisualisation et suppression d'images
- Recadrage et redimensionnement d'images

### Administration

- Tableau de bord administrateur
- Gestion des utilisateurs (création, modification des rôles, suppression)
- Gestion des articles (modération, édition, suppression)
- Paramètres du site personnalisables

### Paramètres

- **Général** : Nom du site, description, email de contact, etc.
- **Contenu** : Statut de vérification par défaut, longueur d'article, tags autorisés
- **Email** : Configuration SMTP, modèles d'emails

## Développement futur

- Système de commentaires pour les articles
- Prise en charge de contenus multimédias avancés (vidéos, audio)
- Système de métadonnées amélioré pour les articles
- Intégration avec des API de fact-checking
- Tableau de bord d'analyse pour les tendances des articles

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Contact

Pour toute question ou suggestion, veuillez ouvrir une issue sur GitHub ou contacter l'équipe de développement.

---

Développé avec ❤️ par l'équipe TruthBeacon.
