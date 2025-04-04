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
    console.log(`Tentative de modification du mode maintenance: ${enabled}`);
    const now = new Date().toISOString();
    
    // Mettre à jour le document site
    const settingsRef = doc(db, "settings", "site");
    await updateDoc(settingsRef, {
      "general.maintenanceMode": enabled,
      "lastUpdated": now,
      ...(message && { "general.maintenanceMessage": message })
    });

    // Mettre également à jour le document global
    const globalRef = doc(db, "settings", "global");
    await updateDoc(globalRef, {
      maintenanceMode: enabled,
      lastUpdated: now
    });

    console.log(`Mode maintenance ${enabled ? 'activé' : 'désactivé'} dans toggleMaintenanceMode`);
  } catch (error: any) {
    // Si le document n'existe pas, tenter de le créer
    if (error.code === 'not-found') {
      try {
        console.log("Document non trouvé dans toggleMaintenanceMode, tentative de création...");
        const now = new Date().toISOString();
        
        if (error.path?.includes('global')) {
          // Créer le document global
          const globalRef = doc(db, "settings", "global");
          await setDoc(globalRef, {
            maintenanceMode: enabled,
            lastUpdated: now
          });
          console.log("Document global créé avec succès");
        } else {
          // Créer le document site
          const siteRef = doc(db, "settings", "site");
          await setDoc(siteRef, defaultSettings);
          await updateDoc(siteRef, {
            "general.maintenanceMode": enabled,
            "lastUpdated": now,
            ...(message && { "general.maintenanceMessage": message })
          });
          console.log("Document site créé avec succès");
        }
      } catch (createError) {
        console.error("Échec de la création du document:", createError);
        throw createError;
      }
    } else {
      console.error("Erreur lors de la modification du mode maintenance:", error);
      throw error;
    }
  }
};

// Alias pour toggleMaintenanceMode pour maintenir la compatibilité
export const updateMaintenanceMode = async (enabled: boolean, userId?: string): Promise<void> => {
  try {
    console.log(`Tentative de mise à jour du mode maintenance: ${enabled}`);
    const now = new Date().toISOString();
    
    // Mise à jour atomique des deux documents
    const siteRef = doc(db, "settings", "site");
    const globalRef = doc(db, "settings", "global");
    
    // Vérifier que les documents existent
    const [siteDoc, globalDoc] = await Promise.all([
      getDoc(siteRef),
      getDoc(globalRef)
    ]);
    
    // Préparer les promesses de mise à jour
    const updatePromises = [];
    
    // Mise à jour du document site s'il existe
    if (siteDoc.exists()) {
      updatePromises.push(
        updateDoc(siteRef, {
          "general.maintenanceMode": enabled,
          "lastUpdated": now
        })
      );
    } else {
      // Créer le document site s'il n'existe pas
      const newSettings = { ...defaultSettings };
      newSettings.general.maintenanceMode = enabled;
      updatePromises.push(
        setDoc(siteRef, {
          ...newSettings,
          lastUpdated: now
        })
      );
    }
    
    // Mise à jour du document global s'il existe
    if (globalDoc.exists()) {
      updatePromises.push(
        updateDoc(globalRef, {
          maintenanceMode: enabled,
          lastUpdated: now
        })
      );
    } else {
      // Créer le document global s'il n'existe pas
      updatePromises.push(
        setDoc(globalRef, {
          maintenanceMode: enabled,
          lastUpdated: now
        })
      );
    }
    
    // Exécuter toutes les mises à jour
    await Promise.all(updatePromises);
    
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
export const synchronizeMaintenanceMode = async (forceSource?: 'global' | 'site'): Promise<void> => {
  try {
    console.log("Début de la synchronisation du mode maintenance entre les documents");
    
    // Vérifier d'abord si les documents existent
    const globalRef = doc(db, "settings", "global");
    const siteRef = doc(db, "settings", "site");
    
    const [globalDoc, siteDoc] = await Promise.all([
      getDoc(globalRef),
      getDoc(siteRef)
    ]);
    
    // Si le document global n'existe pas, le créer
    if (!globalDoc.exists()) {
      // Le document site doit exister pour cette opération
      if (!siteDoc.exists()) {
        throw new Error("Aucun des documents (site et global) n'existe pour synchroniser le mode maintenance");
      }
      
      // Extraire l'état du mode maintenance du document site
      const siteData = siteDoc.data();
      const maintenanceMode = siteData?.general?.maintenanceMode || false;
      
      // Créer le document global
      await setDoc(globalRef, {
        maintenanceMode,
        lastUpdated: new Date().toISOString()
      });
      
      console.log(`Document global créé avec mode maintenance: ${maintenanceMode}`);
      return;
    }
    
    // Si le document site n'existe pas, une erreur se produira
    if (!siteDoc.exists()) {
      throw new Error("Le document de configuration 'site' n'existe pas");
    }
    
    // Extraire les états de maintenance des deux documents
    const globalData = globalDoc.data();
    const siteData = siteDoc.data();
    const globalMaintenanceMode = globalData.maintenanceMode;
    const siteMaintenanceMode = siteData?.general?.maintenanceMode;
    
    // Extraire les timestamps de dernière mise à jour si disponibles
    const globalLastUpdated = globalData.lastUpdated ? new Date(globalData.lastUpdated) : new Date(0);
    const siteLastUpdated = siteData?.lastUpdated ? new Date(siteData.lastUpdated) : new Date(0);
    
    console.log(`État actuel - Global: ${globalMaintenanceMode}, Site: ${siteMaintenanceMode}`);
    console.log(`Dernière mise à jour - Global: ${globalLastUpdated.toISOString()}, Site: ${siteLastUpdated.toISOString()}`);
    
    // Si les états sont différents, synchroniser
    if (globalMaintenanceMode !== siteMaintenanceMode) {
      console.log("Les états de maintenance sont différents, synchronisation en cours...");
      
      // Déterminer quelle source utiliser (par défaut: le plus récent)
      let sourceIsGlobal = false;
      
      if (forceSource === 'global') {
        sourceIsGlobal = true;
      } else if (forceSource === 'site') {
        sourceIsGlobal = false;
      } else {
        // Utiliser le document le plus récemment mis à jour
        sourceIsGlobal = globalLastUpdated > siteLastUpdated;
      }
      
      const now = new Date().toISOString();
      
      if (sourceIsGlobal) {
        // Synchroniser du global vers le site
        console.log(`Utilisation de la source GLOBAL (${globalMaintenanceMode}) pour la synchronisation`);
        await updateDoc(siteRef, {
          "general.maintenanceMode": globalMaintenanceMode,
          "lastUpdated": now
        });
        
        // Mettre à jour le timestamp dans global aussi
        await updateDoc(globalRef, {
          "lastUpdated": now
        });
      } else {
        // Synchroniser du site vers le global
        console.log(`Utilisation de la source SITE (${siteMaintenanceMode}) pour la synchronisation`);
        await updateDoc(globalRef, {
          "maintenanceMode": siteMaintenanceMode,
          "lastUpdated": now
        });
        
        // Mettre à jour le timestamp dans site aussi
        await updateDoc(siteRef, {
          "lastUpdated": now
        });
      }
      
      console.log(`Synchronisation terminée. État utilisé: ${sourceIsGlobal ? globalMaintenanceMode : siteMaintenanceMode}`);
    } else {
      console.log("Les documents sont déjà synchronisés, aucune action nécessaire");
      
      // Mettre à jour les timestamps pour indiquer la vérification
      const now = new Date().toISOString();
      await Promise.all([
        updateDoc(globalRef, { lastUpdated: now }),
        updateDoc(siteRef, { lastUpdated: now })
      ]);
    }
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

// Alias pour getSettings pour maintenir la compatibilité
export const getGlobalSettings = async (): Promise<{ maintenanceMode: boolean }> => {
  try {
    // Essayer d'abord de lire depuis le document global
    try {
      const globalRef = doc(db, "settings", "global");
      const globalDoc = await getDoc(globalRef);
      
      if (globalDoc.exists()) {
        return { 
          maintenanceMode: globalDoc.data().maintenanceMode || false
        };
      }
    } catch (error) {
      console.warn("Échec de lecture du document global, tentative de lecture du document site...");
    }

    // Si le document global n'existe pas ou n'est pas accessible, essayer le document site
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