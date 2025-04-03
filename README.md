# TruthBeacon - Plateforme de vérification d'actualités - v0.5
*Dernière mise à jour : Juillet 2024*

TruthBeacon est une application web moderne conçue pour aider les utilisateurs à vérifier la véracité des informations et actualités. Avec une interface intuitive et un système de vérification visuel, TruthBeacon permet de distinguer facilement les informations vérifiées des contenus douteux.

## État actuel du projet
- Intégration complète avec Firebase (Auth, Firestore, Storage)
- Interface utilisateur moderne et fonctionnelle
- Fonctionnalités de vérification implémentées
- Système de commentaires opérationnel
- Gestion des utilisateurs complète
- Interface administrateur avancée

## Fonctionnalités
### Terminées
- Interface utilisateur moderne et responsive
- Système de vérification visuel avec badges (Vérifié Vrai, Vérifié Faux, Partiellement Vrai)
- Thèmes personnalisables (Défaut, Ocean, Forest, Sunset, Lavender, Midnight)
- Mode maintenance pour les administrateurs
- Design adaptatif pour mobile et desktop
- Navigation entre les pages principales
- Intégration Firebase (Auth, Firestore, Storage)
- Routes protégées pour les zones sécurisées
- Système d'authentification complet
- Gestion des utilisateurs (création, modification des rôles)
- Système de commentaires avec modération
- Upload et gestion d'images pour les articles
- Paramètres administrateur (général et contenu)
- Modération des commentaires

### En cours
- Tableau de bord d'analyse pour les administrateurs
- Fonctionnalités de recherche avancée
- Système de notification

## Technologies utilisées

Ce projet est construit avec :

- Vite
- TypeScript
- React
- React Router
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- TanStack Query
- Firebase (Auth, Firestore, Storage)
- date-fns pour la gestion des dates

## Installation et démarrage

```bash
# Cloner le dépôt
git clone https://github.com/ZKR-NVS/ActualiterV2.git
cd ActualiterV2

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Structure du projet

```
.
├── .vercel/                            # Configuration Vercel
│   ├── project.json
│   └── README.txt
├── .vscode/                            # Configuration VS Code
│   └── settings.json
├── node_modules/                       # Dépendances
├── public/                             # Ressources statiques
│   ├── favicon.ico                     # Favicon du site
│   ├── placeholder.svg                 # Image placeholder
│   └── robots.txt                      # Paramètres pour les robots
├── src/                                # Code source
│   ├── components/                     # Composants réutilisables
│   │   ├── admin/                      # Composants admin
│   │   │   ├── CommentModeration.tsx   # Modération des commentaires
│   │   │   ├── ContentSettings.tsx     # Paramètres de contenu
│   │   │   ├── GeneralSettings.tsx     # Paramètres généraux
│   │   │   ├── MaintenanceCard.tsx     # Gestion du mode maintenance 
│   │   │   ├── SettingsCard.tsx        # Carte de paramètres
│   │   │   └── UserTable.tsx           # Tableau des utilisateurs
│   │   ├── articles/                   # Composants articles
│   │   │   ├── ArticleFormDialog.tsx   # Formulaire d'article
│   │   │   ├── ArticleTable.tsx        # Tableau des articles
│   │   │   └── CommentSection.tsx      # Section de commentaires
│   │   ├── profile/                    # Composants de profil
│   │   │   ├── PreferencesForm.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── ProfileSidebar.tsx
│   │   │   ├── SecurityForm.tsx
│   │   │   └── VerificationForm.tsx
│   │   ├── ui/                         # Composants d'interface utilisateur (shadcn/ui)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── theme-switcher.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   ├── ArticleCard.tsx             # Carte d'article
│   │   ├── ArticleList.tsx             # Liste des articles
│   │   ├── Footer.tsx                  # Pied de page
│   │   ├── Header.tsx                  # En-tête avec navigation
│   │   ├── Layout.tsx                  # Mise en page principale
│   │   └── VerificationBadge.tsx       # Badge de statut de vérification
│   ├── data/                           # Données
│   │   └── mockData.ts                 # Données simulées (fallback)
│   ├── hooks/                          # Hooks personnalisés
│   │   ├── use-mobile.tsx              # Détection mobile
│   │   └── use-toast.ts                # Notifications toast
│   │   └── useAuth.ts              # Hook d'authentification 
│   ├── lib/                            # Bibliothèques/utilitaires
│   │   ├── contexts/                   # Contextes React
│   │   │   └── AuthContext.tsx         # Contexte d'authentification
│   │   ├── services/                   # Services d'accès aux données
│   │   │   ├── articleService.ts       # Service de gestion des articles
│   │   │   ├── authService.ts          # Service d'authentification
│   │   │   ├── commentService.ts       # Service de gestion des commentaires
│   │   │   ├── imageService.ts         # Service de gestion des images
│   │   │   ├── settingsService.ts      # Service de gestion des paramètres
│   │   │   └── userService.ts          # Service de gestion des utilisateurs
│   │   ├── firebase.ts                 # Configuration Firebase
│   │   └── utils.ts                    # Fonctions utilitaires générales
│   ├── pages/                          # Pages
│   │   ├── AdminPage.tsx               # Page admin
│   │   ├── ArticleDetailsPage.tsx      # Détails d'un article
│   │   ├── HomePage.tsx                # Page d'accueil
│   │   ├── Index.tsx                   # Point d'entrée
│   │   ├── LoginPage.tsx               # Page de connexion
│   │   ├── MaintenancePage.tsx         # Page de maintenance
│   │   ├── NotFound.tsx                # Page 404
│   │   └── ProfilePage.tsx             # Profil utilisateur
│   ├── App.css                         # Styles de l'application
│   ├── App.tsx                         # Composant racine
│   ├── index.css                       # Styles globaux
│   ├── main.tsx                        # Point d'entrée React
│   └── vite-env.d.ts                   # Types Vite
├── .gitignore                          # Fichiers ignorés par Git
├── bun.lockb                           # Lockfile Bun
├── components.json                     # Configuration des composants
├── deploy.bat                          # Script de déploiement
├── eslint.config.js                    # Configuration ESLint
├── index.html                          # HTML principal
├── package-lock.json                   # Lockfile npm
├── package.json                        # Dépendances et scripts
├── postcss.config.js                   # Configuration PostCSS
├── README.md                           # Documentation (ce fichier)
├── tailwind.config.ts                  # Configuration Tailwind
├── tsconfig.app.json                   # Configuration TypeScript app
├── tsconfig.json                       # Configuration TypeScript
├── tsconfig.node.json                  # Configuration TypeScript node
├── vercel.json                         # Configuration Vercel
└── vite.config.ts                      # Configuration Vite
```

## Personnalisation des thèmes

L'application inclut plusieurs thèmes prédéfinis que vous pouvez sélectionner via le sélecteur de thème dans l'en-tête. Pour personnaliser davantage les couleurs, modifiez les variables CSS dans `src/index.css`.

## Firebase

L'application utilise Firebase pour plusieurs fonctionnalités :

- **Firebase Authentication** : Gestion des utilisateurs, inscription et connexion
- **Firestore** : Base de données NoSQL pour stocker les articles, les profils utilisateurs, etc.
- **Storage** : Stockage des images et autres médias

Les collections Firestore principales sont :
- `users` : Informations sur les utilisateurs
- `articles` : Articles avec leur statut de vérification
- `comments` : Commentaires des utilisateurs
- `settings` : Paramètres de l'application

## Déploiement sur Vercel

Pour déployer ce projet sur Vercel :

1. Assurez-vous que votre code est poussé vers GitHub
2. Créez un compte sur [Vercel](https://vercel.com/) si vous n'en avez pas déjà un
3. Dans votre tableau de bord Vercel, cliquez sur "Add New" puis "Project"
4. Sélectionnez votre dépôt GitHub
5. Configuration du projet:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
6. Ajoutez les variables d'environnement Firebase
7. Cliquez sur "Deploy"

Le fichier `vercel.json` inclus dans ce dépôt configure automatiquement les redirections nécessaires pour une application React à page unique.

## Prochaines étapes
- Tableau de bord d'analyse pour les administrateurs
- Tests unitaires et d'intégration
- Fonctionnalités de recherche avancée
- Système de notifications en temps réel
- API publique pour l'accès aux données vérifiées

## Journal des modifications

### v0.5 (Juillet 2024)
- Système de commentaires avec modération
- Gestion complète des utilisateurs
- Upload et stockage d'images dans Firebase Storage
- Interface administrateur améliorée avec paramètres
- Gestion des rôles utilisateurs

### v0.4 (17/10/2023)
- Intégration de Firebase (Auth, Firestore, Storage)
- Création de services pour les articles et l'authentification
- Création d'un contexte d'authentification
- Mise en place de routes protégées
- Conversion des données mockées vers des données réelles Firebase

### v0.3 (Version précédente)
- Analyse du code existant
- Mise à jour de la documentation
- Plan de développement pour les prochaines fonctionnalités

### v0.2
- Implémentation des thèmes personnalisables
- Création des composants principaux
- Mise en place du système de vérification visuel

### v0.1 (Version initiale)
- Structure de base du projet
- Configuration de l'environnement de développement
- Mise en place de l'architecture frontend

## License

MIT
