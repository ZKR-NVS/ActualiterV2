import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { User } from "./authService";

export interface Comment {
  id?: string;
  articleId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  likes: number;
  parentId?: string; // Pour les réponses à d'autres commentaires
  isApproved: boolean; // Pour modération
}

const commentsCollection = "comments";

// Créer un nouveau commentaire
export const createComment = async (comment: Omit<Comment, "id" | "createdAt" | "updatedAt" | "likes" | "isApproved">): Promise<string> => {
  try {
    const now = Timestamp.now();
    const newComment = {
      ...comment,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      isApproved: false // Par défaut, les commentaires nécessitent une approbation
    };
    
    const docRef = await addDoc(collection(db, commentsCollection), newComment);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du commentaire:", error);
    throw error;
  }
};

// Récupérer les commentaires d'un article
export const getCommentsByArticle = async (articleId: string, includeUnapproved = false): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, commentsCollection);
    
    let queryConstraints = [
      where("articleId", "==", articleId),
      orderBy("createdAt", "desc")
    ];
    
    if (!includeUnapproved) {
      queryConstraints.unshift(where("isApproved", "==", true));
    }
    
    const querySnapshot = await getDocs(query(commentsRef, ...queryConstraints));
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Comment;
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des commentaires pour l'article ${articleId}:`, error);
    throw error;
  }
};

// Approuver un commentaire
export const approveComment = async (commentId: string): Promise<void> => {
  try {
    const commentRef = doc(db, commentsCollection, commentId);
    await updateDoc(commentRef, {
      isApproved: true,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error(`Erreur lors de l'approbation du commentaire ${commentId}:`, error);
    throw error;
  }
};

// Supprimer un commentaire
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    // Supprimer aussi les réponses à ce commentaire
    const responsesRef = collection(db, commentsCollection);
    const responsesSnapshot = await getDocs(
      query(responsesRef, where("parentId", "==", commentId))
    );
    
    const deletePromises = responsesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    // Ajouter la suppression du commentaire lui-même
    deletePromises.push(deleteDoc(doc(db, commentsCollection, commentId)));
    
    // Exécuter toutes les suppressions
    await Promise.all(deletePromises);
  } catch (error) {
    console.error(`Erreur lors de la suppression du commentaire ${commentId}:`, error);
    throw error;
  }
};

// Ajouter un like à un commentaire
export const likeComment = async (commentId: string): Promise<void> => {
  try {
    const commentRef = doc(db, commentsCollection, commentId);
    const commentSnap = await getDoc(commentRef);
    
    if (commentSnap.exists()) {
      const currentLikes = commentSnap.data().likes || 0;
      await updateDoc(commentRef, {
        likes: currentLikes + 1,
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'un like au commentaire ${commentId}:`, error);
    throw error;
  }
};

// Récupérer tous les commentaires non approuvés (pour modération)
export const getUnapprovedComments = async (): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, commentsCollection);
    const querySnapshot = await getDocs(
      query(commentsRef, where("isApproved", "==", false), orderBy("createdAt", "asc"))
    );
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Comment;
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires non approuvés:", error);
    throw error;
  }
}; 