import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Nom de la collection pour les paramètres globaux
const SETTINGS_COLLECTION = "settings";
const GLOBAL_SETTINGS_DOC = "global";

// Interface pour les paramètres globaux
export interface GlobalSettings {
  maintenanceMode: boolean;
  lastUpdated: Date;
  updatedBy?: string;
}

// Récupérer les paramètres globaux
export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        maintenanceMode: data.maintenanceMode || false,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        updatedBy: data.updatedBy
      };
    } else {
      // Si le document n'existe pas, créer des paramètres par défaut
      const defaultSettings: GlobalSettings = {
        maintenanceMode: false,
        lastUpdated: new Date()
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres globaux:", error);
    // En cas d'erreur, retourner des paramètres par défaut
    return {
      maintenanceMode: false,
      lastUpdated: new Date()
    };
  }
};

// Mettre à jour le mode maintenance
export const updateMaintenanceMode = async (isEnabled: boolean, userId?: string): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
    
    await updateDoc(settingsRef, {
      maintenanceMode: isEnabled,
      lastUpdated: new Date(),
      updatedBy: userId || "unknown"
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mode maintenance:", error);
    throw error;
  }
}; 