# TruthBeacon - Plateforme de vérification d'actualités

TruthBeacon est une application web moderne conçue pour aider les utilisateurs à vérifier la véracité des informations et actualités. Avec une interface intuitive et un système de vérification visuel, TruthBeacon permet de distinguer facilement les informations vérifiées des contenus douteux.

## Fonctionnalités

- Interface utilisateur moderne et responsive
- Système de vérification visuel avec badges (Vérifié Vrai, Vérifié Faux, Partiellement Vrai)
- Thèmes personnalisables (Défaut, Ocean, Forest, Sunset, Lavender, Midnight)
- Mode maintenance pour les administrateurs
- Design adaptatif pour mobile et desktop

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
src/
├── components/     # Composants réutilisables
│   ├── ui/         # Composants d'interface utilisateur
│   └── ...
├── pages/          # Pages de l'application
├── hooks/          # Hooks personnalisés
├── data/           # Données mockées et constantes
├── App.tsx         # Composant principal
└── index.css       # Styles globaux et variables CSS
```

## Personnalisation des thèmes

L'application inclut plusieurs thèmes prédéfinis que vous pouvez sélectionner via le sélecteur de thème dans l'en-tête. Pour personnaliser davantage les couleurs, modifiez les variables CSS dans `src/index.css`.

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
6. Cliquez sur "Deploy"

Le fichier `vercel.json` inclus dans ce dépôt configure automatiquement les redirections nécessaires pour une application React à page unique.

## License

MIT
