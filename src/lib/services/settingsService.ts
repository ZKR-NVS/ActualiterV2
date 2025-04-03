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
  defaultVerificationStatus: "pending" | "verified" | "rejected";
  requireImageForArticles: boolean;
  maxArticleLength: number;
  minArticleLength: number;
  allowedTags: string[];
  defaultTags: string[];
  featuredArticlesCount: number;
}

// Interface pour tous les paramètres
export interface SiteSettings {
  general: GeneralSettings;
  content: ContentSettings;
  email: EmailSettings;
}

// Valeurs par défaut pour les paramètres
const defaultSettings: SiteSettings = {
  general: {
    siteName: "TruthBeacon",
    siteDescription: "Plateforme de vérification d'articles",
    contactEmail: "contact@truthbeacon.com",
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
    senderName: "TruthBeacon",
    senderEmail: "noreply@truthbeacon.com",
    emailTemplates: {
      welcomeEmail: "Bienvenue sur TruthBeacon!",
      passwordReset: "Réinitialisation de votre mot de passe",
      articlePublished: "Un nouvel article a été publié"
    }
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
    console.log("Mise à jour des paramètres généraux:", settings);
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    console.log("Paramètres actuels:", currentSettings);
    
    const updatedSettings = {
      ...currentSettings,
      general: settings
    };
    
    console.log("Nouveaux paramètres:", updatedSettings);
    
    await setDoc(doc(db, "settings", "site"), updatedSettings);
    console.log("Paramètres mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres généraux:", error);
    throw error;
  }
};

// Mettre à jour les paramètres de contenu
export const updateContentSettings = async (settings: ContentSettings): Promise<void> => {
  try {
    console.log("Mise à jour des paramètres de contenu:", settings);
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    console.log("Paramètres actuels:", currentSettings);
    
    const updatedSettings = {
      ...currentSettings,
      content: settings
    };
    
    console.log("Nouveaux paramètres:", updatedSettings);
    
    await setDoc(doc(db, "settings", "site"), updatedSettings);
    console.log("Paramètres de contenu mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres de contenu:", error);
    throw error;
  }
};

// Mettre à jour les paramètres email
export const updateEmailSettings = async (settings: EmailSettings): Promise<void> => {
  try {
    console.log("Mise à jour des paramètres email:", settings);
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    console.log("Paramètres actuels:", currentSettings);
    
    const updatedSettings = {
      ...currentSettings,
      email: settings
    };
    
    console.log("Nouveaux paramètres:", updatedSettings);
    
    await setDoc(doc(db, "settings", "site"), updatedSettings);
    console.log("Paramètres email mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres email:", error);
    throw error;
  }
};

// Activer/désactiver le mode maintenance
export const toggleMaintenanceMode = async (enabled: boolean, message?: string): Promise<void> => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "site"));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as SiteSettings : defaultSettings;
    
    // Mettre à jour le mode maintenance
    await setDoc(doc(db, "settings", "site"), {
      ...currentSettings,
      general: {
        ...currentSettings.general,
        maintenanceMode: enabled,
        ...(message ? { maintenanceMessage: message } : {})
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mode maintenance:", error);
    throw error;
  }
}; 