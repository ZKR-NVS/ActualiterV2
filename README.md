# Actualiter - Plateforme de vérification d'actualités - v1.0.3
*Dernière mise à jour : Janvier 2025*

Actualiter est une application web moderne conçue pour aider les utilisateurs à vérifier la véracité des informations et actualités. Avec une interface intuitive et un système de vérification visuel, Actualiter permet de distinguer facilement les informations vérifiées des contenus douteux. La plateforme intègre maintenant une boutique de livres complètement fonctionnelle permettant aux utilisateurs d'acheter des ouvrages en rapport avec l'information et le fact-checking.

## État actuel du projet
- Intégration complète avec Firebase (Auth, Firestore, Storage)
- Interface utilisateur moderne et fonctionnelle
- Design responsive optimisé pour mobile et desktop
- Fonctionnalités de vérification implémentées
- Système de commentaires opérationnel avec modération
- Gestion des utilisateurs complète
- Interface administrateur avancée
- Système de notifications intégré
- Fonctionnalité de recherche d'articles
- Sections informationnelles et expérience utilisateur améliorée
- Écrans de chargement optimisés et feedback visuel amélioré
- Paramètres de sécurité et correction des types TypeScript
- Boutique de livres complètement fonctionnelle avec panier d'achat et système de paiement
- Gestion des fichiers PDF pour les livres avec téléchargement
- **AMÉLIORÉ** : Support multilingue complet et optimisé (français et anglais)
- **NOUVEAU** : Traduction complète de toutes les pages principales, y compris la page d'accueil

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
- Paramètres administrateur (général, contenu, email, sécurité)
- Modération des commentaires
- Système de notifications utilisateur
- Recherche d'articles (par titre, contenu, auteur, tags)
- Sections informatives (statistiques, témoignages, newsletter)
- Animations et transitions pour une meilleure UX
- Écrans de chargement interactifs et skeletons pour les contenus
- Paramètres de sécurité configurables
- Boutique de livres avec recherche et filtrage par catégorie
- Gestion de panier d'achat et processus de commande
- Interface d'administration pour gérer les livres et les catégories
- Gestion et téléchargement des fichiers PDF associés aux livres
- Interface d'administration pour visualiser et gérer les commandes
- **AMÉLIORÉ** : Système complet d'internationalisation avec support français/anglais
- **AMÉLIORÉ** : Composants intégralement traduits (Page d'accueil, Footer, Préférences, etc.)
- **AMÉLIORÉ** : Sélecteur de langue dans l'interface utilisateur avec persistance des préférences

### En cours
- Système de contrôle d'accès aux PDF basé sur les achats
- Tableau de bord d'analyse pour les administrateurs
- Tests unitaires et d'intégration
- Optimisation des performances
- **NOUVEAU** : Intégration de solutions de paiement réelles (Stripe, PayPal)
- **NOUVEAU** : Système de gestion des stocks avancé

## Système de traduction
Actualiter utilise un système de traduction complet qui permet de basculer facilement entre le français et l'anglais. Voici les points clés de ce système :

### Fonctionnement
- **Fichiers de traduction** : Les traductions sont stockées dans des fichiers dédiés (`src/lib/i18n/fr.ts` et `src/lib/i18n/en.ts`)
- **Contexte de langue** : Un contexte React (`LanguageContext`) permet de gérer la langue active et de fournir la fonction de traduction
- **Sélecteur de langue** : Un composant dédié permet aux utilisateurs de changer la langue depuis l'interface
- **Persistance** : La préférence de langue est sauvegardée localement pour être restaurée à la prochaine visite

### Utilisation pour les développeurs
Pour ajouter de nouvelles traductions :
1. Ajoutez une nouvelle clé et sa valeur dans les fichiers de traduction (`fr.ts` et `en.ts`)
2. Utilisez la fonction `t()` dans les composants : `t("maClé.sousCle")`

Exemple de structure dans les fichiers de traduction :
```typescript
export default {
  section: {
    titre: "Mon titre",
    description: "Ma description"
  }
}
```

Utilisation dans un composant :
```typescript
const { t } = useLanguage();

return (
  <div>
    <h1>{t("section.titre")}</h1>
    <p>{t("section.description")}</p>
  </div>
);
```

## Corrections récentes
- Correction du problème d'interface dans le formulaire de création de livre (bouton indiquant incorrectement "Création..." avec le texte normal)
- Correction des incohérences du mode maintenance entre les documents "global" et "site"
- Ajout d'une fonction de synchronisation du mode maintenance entre tous les documents
- Ajout d'un bouton pour synchroniser manuellement l'état du mode maintenance
- Correction de l'erreur TypeScript dans `ProfilePage.tsx` (remplacement de `isLoading` par `loading`)
- Correction de l'affichage du rôle dans le profil utilisateur (n'apparaît plus pour les utilisateurs standards)
- Mise à jour de la page d'accueil pour utiliser le système de traduction
- Ajout de traductions complètes pour toutes les sections de la page d'accueil
- Amélioration de l'affichage du titre avec mise en évidence sur la page d'accueil
- Correction des erreurs TypeScript dans `Header.tsx` (remplacement de `isLoading` par `loading`)
- Correction des erreurs TypeScript dans `CartPage.tsx` (ajout de `updatedAt` aux objets de panier)
- Correction des fonctions de service de panier dans `bookService.ts` pour inclure `updatedAt` dans tous les objets retournés
- Amélioration de la cohérence du rendu des composants dans l'interface utilisateur
- Ajout de la gestion des fichiers PDF pour les livres
- Implémentation de l'interface d'administration des commandes

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
- react-image-crop pour l'édition d'images
- zod pour la validation des formulaires
- Sonner pour les notifications toast
- lodash pour la manipulation d'objets

## Installation et démarrage

```bash
# Cloner le dépôt
git clone https://github.com/ZKR-NVS/ActualiterV2.git
cd ActualiterV2

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
npm run deploy
```

## Fonctionnalités de la boutique de livres

La boutique de livres d'Actualiter offre une expérience d'achat complète :

### Pour les utilisateurs
- Catalogue complet avec filtrage par catégories
- Recherche de livres par titre, auteur, ou description
- Fiches détaillées pour chaque livre
- Téléchargement des fichiers PDF associés aux livres
- Panier d'achat avec gestion des quantités
- Processus de commande avec formulaire d'adresse de livraison
- Page de confirmation de commande

### Pour les administrateurs
- Interface de gestion complète des livres (ajout, modification, suppression)
- Upload de fichiers PDF pour les livres
- Gestion des catégories de livres
- Contrôle des prix et des stocks
- Suivi et gestion des commandes avec mise à jour du statut
- Statistiques de vente (revenus, nombre de commandes)

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
│   │   │   ├── EmailSettings.tsx       # Paramètres email
│   │   │   ├── GeneralSettings.tsx     # Paramètres généraux
│   │   │   ├── MaintenanceCard.tsx     # Gestion du mode maintenance 
│   │   │   ├── SecuritySettings.tsx    # Paramètres de sécurité
│   │   │   ├── SettingsCard.tsx        # Carte de paramètres
│   │   │   ├── UserFormDialog.tsx      # Formulaire de création/édition d'utilisateur
│   │   │   └── UserTable.tsx           # Tableau des utilisateurs
│   │   ├── articles/                   # Composants articles
│   │   │   ├── ArticleFormDialog.tsx   # Formulaire d'article
│   │   │   ├── ArticleTable.tsx        # Tableau des articles
│   │   │   └── CommentSection.tsx      # Section de commentaires
│   │   ├── bookshop/                   # Composants boutique de livres
│   │   │   ├── BookCard.tsx            # Carte d'un livre
│   │   │   ├── BookFilter.tsx          # Filtres pour la boutique
│   │   │   ├── BookFormDialog.tsx      # Formulaire d'ajout/édition de livre
│   │   │   ├── CategoryFormDialog.tsx  # Formulaire d'ajout de catégorie
│   │   │   └── CheckoutForm.tsx        # Formulaire de commande
│   │   ├── profile/                    # Composants de profil
│   │   │   ├── PreferencesForm.tsx     # Formulaire de préférences
│   │   │   ├── ProfileForm.tsx         # Formulaire de profil
│   │   │   ├── ProfileSidebar.tsx      # Barre latérale du profil
│   │   │   ├── SecurityForm.tsx        # Formulaire de sécurité
│   │   │   └── VerificationForm.tsx    # Formulaire de vérification
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
│   │   │   ├── language-switcher.tsx   # Composant de sélection de langue
│   │   │   ├── loading-spinner.tsx     # Composant de chargement et skeletons
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
│   │   ├── NotificationDropdown.tsx    # Menu déroulant de notifications
│   │   ├── SearchBar.tsx               # Barre de recherche
│   │   └── VerificationBadge.tsx       # Badge de statut de vérification
│   ├── data/                           # Données
│   │   └── mockData.ts                 # Interfaces de données (sans données fictives)
│   ├── hooks/                          # Hooks personnalisés
│   │   ├── use-mobile.tsx              # Détection mobile
│   │   └── use-toast.ts                # Notifications toast
│   ├── lib/                            # Bibliothèques/utilitaires
│   │   ├── api/                        # API endpoints
│   │   ├── contexts/                   # Contextes React
│   │   │   ├── AuthContext.tsx         # Contexte d'authentification
│   │   │   └── LanguageContext.tsx     # Contexte de langue
│   │   ├── hooks/                      # Hooks spécifiques à l'application
│   │   │   └── useAuth.ts              # Hook d'authentification utilisateur
│   │   ├── i18n/                       # Système d'internationalisation
│   │   │   ├── en.ts                   # Traductions anglaises
│   │   │   ├── fr.ts                   # Traductions françaises
│   │   │   └── index.ts                # Configuration des langues
│   │   ├── services/                   # Services d'accès aux données
│   │   │   ├── articleService.ts       # Service de gestion des articles
│   │   │   ├── authService.ts          # Service d'authentification
│   │   │   ├── bookService.ts          # Service de gestion des livres
│   │   │   ├── commentService.ts       # Service de gestion des commentaires
│   │   │   ├── imageService.ts         # Service de gestion des images
│   │   │   ├── notificationService.ts  # Service de gestion des notifications
│   │   │   └── settingsService.ts      # Service de gestion des paramètres
│   │   ├── types/                      # Types TypeScript partagés
│   │   ├── firebase.ts                 # Configuration Firebase
│   │   └── utils.ts                    # Fonctions utilitaires générales
│   ├── pages/                          # Pages
│   │   ├── admin/                      # Pages d'administration
│   │   │   └── BookManagementPage.tsx  # Gestion des livres
│   │   ├── AdminPage.tsx               # Page admin
│   │   ├── ArticleDetailsPage.tsx      # Détails d'un article
│   │   ├── BookDetailPage.tsx          # Détails d'un livre
│   │   ├── BookshopPage.tsx            # Boutique de livres
│   │   ├── CartPage.tsx                # Panier d'achat
│   │   ├── HomePage.tsx                # Page d'accueil
│   │   ├── Index.tsx                   # Point d'entrée
│   │   ├── LoginPage.tsx               # Page de connexion
│   │   ├── MaintenancePage.css         # Style de la page de maintenance
│   │   ├── MaintenancePage.tsx         # Page de maintenance
│   │   ├── NotFound.tsx                # Page 404
│   │   ├── OrderConfirmationPage.tsx   # Confirmation de commande
│   │   └── ProfilePage.tsx             # Profil utilisateur
│   ├── types/                          # Définitions de types globaux
│   │   └── date-fns.d.ts               # Types pour date-fns
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

## Design et Expérience Utilisateur

Actualiter met l'accent sur une expérience utilisateur intuitive et agréable :

- **Design responsive** - L'application s'adapte parfaitement à tous les appareils, du mobile au grand écran
- **Animations subtiles** - Des transitions et animations légères améliorent l'interaction sans alourdir l'interface
- **Accessibilité** - L'application suit les meilleures pratiques WCAG pour garantir l'accessibilité à tous les utilisateurs
- **Performances optimisées** - Chargement rapide, interactions fluides et expérience utilisateur sans interruption
- **Cohérence visuelle** - Utilisation cohérente des couleurs, typographies et espacements pour une identité forte
- **États de chargement** - Feedback visuel amélioré pendant les temps de chargement avec spinners et skeletons

## Gestion des états de chargement

Actualiter utilise des composants spécialisés pour améliorer l'expérience utilisateur pendant les temps de chargement :

- **LoadingSpinner** - Un indicateur de chargement animé avec options de taille et de texte personnalisables
- **SkeletonList** - Affiche une liste de placeholders animés pendant le chargement des articles
- **SkeletonCard** - Composant unitaire pour représenter le chargement d'un élément de contenu
- **Modes plein écran** - Option d'affichage du chargement en superposition sur l'interface entière
- **Feedback contextuel** - Messages de chargement spécifiques à chaque type de contenu

## Firebase

L'application utilise Firebase pour plusieurs fonctionnalités :

- **Firebase Authentication** : Gestion des utilisateurs, inscription et connexion
- **Firestore** : Base de données NoSQL pour stocker les articles, les profils utilisateurs, etc.
- **Storage** : Stockage des images et autres médias

Les collections Firestore principales sont :
- `users` : Informations sur les utilisateurs
- `articles` : Articles avec leur statut de vérification
- `comments` : Commentaires des utilisateurs
- `notifications` : Notifications des utilisateurs
- `settings` : Paramètres de l'application (général, contenu, email, sécurité)
- `books` : Livres disponibles dans la boutique
- `bookCategories` : Catégories de livres
- `carts` : Paniers des utilisateurs
- `orders` : Commandes passées par les utilisateurs

## Boutique de Livres

La nouvelle boutique de livres offre les fonctionnalités suivantes :

- **Catalogue de livres** - Affichage de tous les livres disponibles avec filtres par catégorie
- **Recherche** - Recherche de livres par titre, auteur ou description
- **Détails du livre** - Page détaillée pour chaque livre avec toutes les informations pertinentes
- **Panier d'achat** - Ajout de livres au panier, modification des quantités, suppression d'articles
- **Processus de commande** - Formulaire de commande avec adresse de livraison et options de paiement
- **Confirmation de commande** - Page de confirmation après un achat réussi
- **Interface d'administration** - Gestion complète des livres et des catégories pour les administrateurs
- **Gestion des stocks** - Suivi automatique du stock disponible lors des commandes

## Meilleures pratiques

Ce projet suit plusieurs meilleures pratiques de développement :

- **Architecture modulaire** - Components réutilisables et séparation des préoccupations
- **TypeScript strict** - Typage fort pour réduire les erreurs et améliorer la maintenabilité
- **Services découplés** - Interaction avec Firebase isolée dans des services dédiés
- **Gestion d'état contextuelle** - Utilisation appropriée des contextes React pour le state global
- **Tests** - Stratégie de test en cours d'implémentation pour assurer la fiabilité
- **Responsive design** - Priorité au mobile et design adaptatif
- **Documentation** - Code bien documenté et README complet

## Comment contribuer

Nous accueillons les contributions au projet. Pour contribuer :

1. **Fork le dépôt** - Créez votre propre fork du projet
2. **Créez une branche de fonctionnalité** - `git checkout -b feature/amazing-feature`
3. **Committez vos changements** - `git commit -m 'Add some amazing feature'`
4. **Poussez vers la branche** - `git push origin feature/amazing-feature`
5. **Ouvrez une Pull Request** 

Assurez-vous de suivre les conventions de codage existantes et d'ajouter des tests pour les nouvelles fonctionnalités.

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
- Système de contrôle d'accès aux PDF basé sur les achats des utilisateurs
- Interface d'administration complète pour gérer les commandes
- Système de recommandations basé sur l'historique des achats
- Intégration des passerelles de paiement (Stripe, PayPal)
- Système d'avis et de notations pour les livres
- Fonctionnalités de liste de souhaits pour les utilisateurs
- Optimisation des performances du panier et du processus d'achat
- Ajout de nouvelles langues (espagnol, allemand, etc.)

## Journal des modifications

### v1.0.2 (Décembre 2024)
- Ajout d'un système complet de traduction avec support français/anglais
- Implémentation d'un sélecteur de langue dans l'interface utilisateur
- Nettoyage des données fictives dans le code source pour plus de sécurité
- Correction des références incohérentes au nom du site
- Mise à jour des traductions dans toute l'application
- Optimisation des performances générales
- Résolution de problèmes de compatibilité des dépendances

### v1.0.1 (Août 2024)
- Ajout de la gestion des fichiers PDF pour les livres
- Implémentation de l'interface d'administration des commandes
- Ajout d'un bouton de téléchargement de PDF dans la page de détail des livres
- Correction des bugs et amélioration des performances

### v1.0 (Août 2024)
- Implémentation d'une boutique de livres complète et fonctionnelle
- Ajout du panier d'achat avec gestion des quantités
- Interface de gestion des livres et catégories pour les administrateurs
- Processus de commande avec formulaire de livraison
- Page de confirmation de commande
- Correction des erreurs TypeScript dans plusieurs composants
- Optimisation des performances de la boutique
- Documentation complète des fonctionnalités

### v0.9 (Août 2024)
- Correction des erreurs TypeScript dans les composants de paramètres
- Ajout des paramètres de sécurité (longueur de mot de passe, tentatives de connexion, etc.)
- Amélioration de la cohérence des types pour les statuts de vérification
- Mise à jour des valeurs par défaut pour correspondre au nom Actualiter
- Correction de bugs mineurs et optimisations

### v0.8 et antérieures
- Voir l'historique précédent des versions

## License

MIT

## Configuration Firebase

### Règles de sécurité Firestore
Pour que toutes les fonctionnalités de l'application fonctionnent correctement, il est important de configurer les règles de sécurité Firebase adéquates. Voici les règles à appliquer dans votre console Firebase:

```
rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles par défaut - refuser tout accès
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Règles pour la collection users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                     request.auth.uid == userId && 
                     request.resource.data.role == "user";
      allow update: if request.auth != null && 
                     (request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
      allow delete: if false;
    }
    
    // Règles pour la collection settings
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Règles pour la collection articles
    match /articles/{articleId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
                                     (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin" || 
                                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "verifier");
    }
    
    // Règles pour les notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                  resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                           (resource.data.userId == request.auth.uid || 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
    }
    
    // Règles pour les livres
    match /books/{bookId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Règles pour les catégories de livres
    match /bookCategories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Règles pour les paniers
    match /carts/{userId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
    }
    
    // Règles pour les commandes
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                 (resource.data.userId == request.auth.uid || 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

### Règles de sécurité Storage
Pour les fichiers stockés dans Firebase Storage (images et PDF), utilisez ces règles:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Par défaut, refuser l'accès
      allow read, write: if false;
    }
    
    // Images d'articles - lecture publique, écriture par admin/vérificateur
    match /articles/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
                   (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin" || 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "verifier");
    }
    
    // Images de profil - lecture publique, écriture par le propriétaire
    match /profiles/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Images de livres - lecture publique, écriture par admin
    match /books/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // PDF de livres - lecture par utilisateurs authentifiés, écriture par admin
    match /books/pdf/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

### Résolution des problèmes de permission
Si vous rencontrez des erreurs "Missing or insufficient permissions", vérifiez:
1. Que vous avez bien configuré les règles ci-dessus dans la console Firebase
2. Que les collections mentionnées dans les règles correspondent à celles utilisées dans votre code
3. Que l'authentification fonctionne correctement et que les rôles des utilisateurs sont bien définis

Pour plus d'informations, consultez la [documentation officielle des règles de sécurité Firebase](https://firebase.google.com/docs/rules).

## Internationalisation

Actualiter est désormais entièrement traduit en français et en anglais :

- **Système de traduction** - Infrastructure complète basée sur des fichiers de traduction et un contexte React
- **Détection automatique** - Détection de la langue préférée de l'utilisateur à partir des paramètres du navigateur
- **Persistance des préférences** - Sauvegarde de la langue choisie dans le localStorage
- **Sélecteur de langue** - Interface simple permettant de changer la langue depuis n'importe quelle page
- **Extensibilité** - Architecture conçue pour faciliter l'ajout de nouvelles langues

Les utilisateurs peuvent changer la langue via :
- Le sélecteur de langue dans la barre de navigation principale
- Les paramètres de leur profil utilisateur
