import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const MAINTENANCE_DOC_ID = "maintenance_status";
const SETTINGS_COLLECTION = "settings";

/**
 * Interface pour le document de maintenance
 */
interface MaintenanceStatus {
  isActive: boolean;
  updatedAt: Date;
  updatedBy?: string;
  message?: string;
}

/**
 * Récupère l'état actuel du mode maintenance
 */
export const getMaintenanceStatus = async (): Promise<boolean> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, MAINTENANCE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as MaintenanceStatus;
      return data.isActive;
    } else {
      // Si le document n'existe pas encore, le créer avec maintenance désactivée
      await setDoc(docRef, {
        isActive: false,
        updatedAt: new Date(),
        message: "Mode maintenance initialisé"
      });
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du mode maintenance:", error);
    return false;
  }
};

/**
 * Met à jour l'état du mode maintenance
 */
export const setMaintenanceStatus = async (
  isActive: boolean, 
  userId?: string, 
  message?: string
): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, MAINTENANCE_DOC_ID);
    await setDoc(docRef, {
      isActive,
      updatedAt: new Date(),
      updatedBy: userId || "system",
      message: message || (isActive ? "Mode maintenance activé" : "Mode maintenance désactivé")
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mode maintenance:", error);
    throw error;
  }
};

/**
 * S'abonne aux changements d'état du mode maintenance
 */
export const onMaintenanceStatusChange = (callback: (isActive: boolean) => void): (() => void) => {
  const docRef = doc(db, SETTINGS_COLLECTION, MAINTENANCE_DOC_ID);
  
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as MaintenanceStatus;
      callback(data.isActive);
    } else {
      callback(false);
    }
  }, (error) => {
    console.error("Erreur lors de l'écoute des changements du mode maintenance:", error);
    callback(false);
  });
  
  return unsubscribe;
}; 