import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Notification {
  id?: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationsCollection = "notifications";

// Transformer les données Firestore en format utilisable
const transformNotificationData = (doc: any): Notification => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link,
    isRead: data.isRead,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Créer une nouvelle notification
export const createNotification = async (notification: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<string> => {
  try {
    const now = Timestamp.now();
    const newNotification = {
      ...notification,
      isRead: false,
      createdAt: now,
    };
    
    const docRef = await addDoc(collection(db, notificationsCollection), newNotification);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
};

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string, count: number = 10): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, notificationsCollection);
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformNotificationData);
  } catch (error) {
    console.error(`Erreur lors de la récupération des notifications pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Récupérer les notifications non lues d'un utilisateur
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, notificationsCollection);
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("isRead", "==", false),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformNotificationData);
  } catch (error) {
    console.error(`Erreur lors de la récupération des notifications non lues pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, notificationsCollection, notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
  } catch (error) {
    console.error(`Erreur lors du marquage de la notification ${notificationId} comme lue:`, error);
    throw error;
  }
};

// Marquer toutes les notifications d'un utilisateur comme lues
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, notificationsCollection);
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Mise à jour par lots des notifications
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error(`Erreur lors du marquage de toutes les notifications comme lues pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Supprimer une notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, notificationsCollection, notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la notification ${notificationId}:`, error);
    throw error;
  }
}; 