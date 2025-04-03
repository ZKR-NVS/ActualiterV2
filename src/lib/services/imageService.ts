import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Télécharge une image vers Firebase Storage et retourne son URL
 * @param file Le fichier image à télécharger
 * @param path Le chemin où stocker l'image (dossier)
 * @returns L'URL de téléchargement de l'image
 */
export const uploadImage = async (file: File | Blob, path: string = "articles"): Promise<string> => {
  try {
    // Créer un nom unique pour l'image
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const storageRef = ref(storage, fileName);
    
    // Télécharger l'image
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtenir l'URL de l'image
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    throw new Error("Impossible de télécharger l'image. Veuillez réessayer.");
  }
};

/**
 * Supprime une image de Firebase Storage
 * @param url L'URL de l'image à supprimer
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extraire le chemin du fichier à partir de l'URL
    const decodedUrl = decodeURIComponent(url);
    const startIndex = decodedUrl.indexOf("/o/") + 3;
    const endIndex = decodedUrl.indexOf("?");
    const filePath = decodedUrl.substring(startIndex, endIndex);
    
    // Créer la référence au fichier
    const fileRef = ref(storage, filePath);
    
    // Supprimer le fichier
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image:", error);
    throw new Error("Impossible de supprimer l'image. Veuillez réessayer.");
  }
}; 