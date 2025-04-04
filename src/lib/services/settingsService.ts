import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Interface pour les paramètres généraux
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultUserRole: "user" | "editor" | "admin";
  maxArticlesPerPage: number;
  enableComments: boolean;
  enableSocialSharing: boolean;
  theme: "light" | "dark" | "system";
}

// Interface pour les paramètres email
export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableEmailNotifications: boolean;
  senderName: string;
  senderEmail: string;
  emailTemplates: {
    welcomeEmail: string;
    passwordReset: string;
    articlePublished: string;
  };
}

// Interface pour les paramètres de contenu
export interface ContentSettings {
  defaultVerificationStatus: "pending" | "verified" | "rejected" | "true" | "false" | "partial";
  requireImageForArticles: boolean;
  maxArticleLength: number;
  minArticleLength: number;
  allowedTags: string[];
  defaultTags: string[];
  featuredArticlesCount: number;
}

// Interface pour les paramètres de sécurité
export interface SecuritySettings {
  passwordMinLength: number;
  requirePasswordComplexity: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableTwoFactorAuth: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
}

// Interface pour tous les paramètres
export interface SiteSettings {
  general: GeneralSettings;
  content: ContentSettings;
  email: EmailSettings;
  security: SecuritySettings;
}

// Valeurs par défaut pour les paramètres
const defaultSettings: SiteSettings = {
  general: {
    siteName: "Actualiter",
    siteDescription: "Plateforme de vérification d'articles",
    contactEmail: "contact@actualiter.com",
    enableRegistration: true,
    maintenanceMode: false,
    maintenanceMessage: "Le site est en maintenance. Merci de revenir plus tard.",
    defaultUserRole: "user",
    maxArticlesPerPage: 10,
    enableComments: true,
    enableSocialSharing: true,
    theme: "system"
  },
  content: {
    defaultVerificationStatus: "pending",
    requireImageForArticles: true,
    maxArticleLength: 5000,
    minArticleLength: 100,
    allowedTags: ["actualité", "politique", "économie", "société", "technologie", "sport", "culture"],
    defaultTags: ["actualité"],
    featuredArticlesCount: 5
  },
  email: {
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    enableEmailNotifications: false,
    senderName: "Actualiter",
    senderEmail: "noreply@actualiter.com",
    emailTemplates: {
      welcomeEmail: "Bienvenue sur Actualiter!",
      passwordReset: "Réinitialisation de votre mot de passe",
      articlePublished: "Un nouvel article a été publié"
    }
  },
  security: {
    passwordMinLength: 8,
    requirePasswordComplexity: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableTwoFactorAuth: false,
    allowedFileTypes: ["jpg", "jpeg", "png", "gif"],
    maxFileSize: 5
  }
};

// Récupérer tous les paramètres
export const getSettings = async (): Promise<SiteSettings> => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    
    if (!settingsDoc.exists()) {
      // Si les paramètres n'existent pas, créer avec les valeurs par défaut
      await setDoc(doc(db, "settings", "site"), defaultSettings);
      return defaultSettings;
    }
    
    return settingsDoc.data() as SiteSettings;
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    throw error;
  }
};

// Mettre à jour les paramètres généraux
export const updateGeneralSettings = async (settings: GeneralSettings): Promise<void> => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    await setDoc(doc(db, "settings", "site"), {
      ...currentSettings,
      general: settings
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres généraux:", error);
    throw error;
  }
};

// Mettre à jour les paramètres de contenu
export const updateContentSettings = async (settings: ContentSettings): Promise<void> => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    await setDoc(doc(db, "settings", "site"), {
      ...currentSettings,
      content: settings
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres de contenu:", error);
    throw error;
  }
};

// Mettre à jour les paramètres email
export const updateEmailSettings = async (settings: EmailSettings): Promise<void> => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    await setDoc(doc(db, "settings", "site"), {
      ...currentSettings,
      email: settings
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres email:", error);
    throw error;
  }
};

// Mettre à jour les paramètres de sécurité
export const updateSecuritySettings = async (settings: SecuritySettings): Promise<void> => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    await setDoc(doc(db, "settings", "site"), {
      ...currentSettings,
      security: settings
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres de sécurité:", error);
    throw error;
  }
};

// Activer/désactiver le mode maintenance
export const toggleMaintenanceMode = async (enabled: boolean, message?: string): Promise<void> => {
  try {
    const settingsRef = doc(db, "settings", "site");
    await updateDoc(settingsRef, {
      "general.maintenanceMode": enabled,
      ...(message && { "general.maintenanceMessage": message })
    });
  } catch (error) {
    console.error("Erreur lors de la modification du mode maintenance:", error);
    throw error;
  }
};

// Alias pour getSettings pour maintenir la compatibilité
export const getGlobalSettings = async (): Promise<{ maintenanceMode: boolean }> => {
  try {
    try {
      const settings = await getSettings();
      return { 
        maintenanceMode: settings.general.maintenanceMode 
      };
    } catch (error: any) {
      // En cas d'erreur d'autorisation, retourner une valeur par défaut
      if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
        console.warn("Permissions insuffisantes pour accéder aux paramètres. Utilisation des valeurs par défaut.");
        return { maintenanceMode: false };
      }
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres globaux:", error);
    // En cas d'erreur, retourner false pour le mode maintenance
    return { maintenanceMode: false };
  }
};

// Alias pour toggleMaintenanceMode pour maintenir la compatibilité
export const updateMaintenanceMode = async (enabled: boolean, userId?: string): Promise<void> => {
  try {
    await toggleMaintenanceMode(enabled);
    
    // Synchroniser également avec le document global pour assurer la cohérence
    const globalRef = doc(db, "settings", "global");
    await updateDoc(globalRef, {
      maintenanceMode: enabled
    });
    
    console.log(`Mode maintenance ${enabled ? 'activé' : 'désactivé'} par l'utilisateur ${userId || 'inconnu'}`);
  } catch (error: any) {
    // Si c'est une erreur d'autorisation et que l'utilisateur n'est pas admin, on ignore silencieusement
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      console.warn("Permissions insuffisantes pour modifier le mode maintenance.");
      return; // Sortir silencieusement sans propager l'erreur
    }
    console.error("Erreur lors de la mise à jour du mode maintenance:", error);
    throw error;
  }
};

// Fonction pour synchroniser le mode maintenance entre les documents
export const synchronizeMaintenanceMode = async (): Promise<void> => {
  try {
    // Obtenir les paramètres du document site
    const siteSettings = await getSettings();
    const maintenanceMode = siteSettings.general.maintenanceMode;
    
    // Mettre à jour le document global avec l'état du mode maintenance du document site
    const globalRef = doc(db, "settings", "global");
    await updateDoc(globalRef, {
      maintenanceMode
    });
  } catch (error: any) {
    // Si c'est une erreur d'autorisation et que l'utilisateur n'est pas admin, on ignore silencieusement
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      console.warn("Permissions insuffisantes pour synchroniser le mode maintenance.");
      return; // Sortir silencieusement sans propager l'erreur
    }
    console.error("Erreur lors de la synchronisation du mode maintenance:", error);
    throw error;
  }
}; 