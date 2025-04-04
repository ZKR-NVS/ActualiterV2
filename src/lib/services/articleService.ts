import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  DocumentData,
  QuerySnapshot,
  Timestamp
} from "firebase/firestore";
import { deleteImage } from "./imageService";

export interface Article {
  id?: string;
  title: string;
  source: string;
  author: string;
  publicationDate: Date | Timestamp;
  content: string;
  summary: string;
  imageUrl: string;
  verificationStatus: "true" | "false" | "partial";
  verifiedBy?: string;
  verificationNote?: string;
  tags: string[];
  viewCount?: number;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

const articlesCollection = "articles";

// Transformer les données Firestore en format utilisable
const transformArticleData = (doc: DocumentData): Article => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    source: data.source,
    author: data.author,
    publicationDate: data.publicationDate?.toDate() || new Date(),
    content: data.content,
    summary: data.summary,
    imageUrl: data.imageUrl,
    verificationStatus: data.verificationStatus,
    verifiedBy: data.verifiedBy,
    verificationNote: data.verificationNote,
    tags: data.tags || [],
    viewCount: data.viewCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Récupérer tous les articles
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, articlesCollection);
    const querySnapshot = await getDocs(
      query(articlesRef, orderBy("publicationDate", "desc"))
    );
    
    return querySnapshot.docs.map(transformArticleData);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    throw error;
  }
};

// Récupérer un article par son ID
export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    const articleRef = doc(db, articlesCollection, id);
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return transformArticleData(articleSnap);
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'article ${id}:`, error);
    throw error;
  }
};

// Récupérer les articles par statut de vérification
export const getArticlesByStatus = async (status: "true" | "false" | "partial"): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, articlesCollection);
    const querySnapshot = await getDocs(
      query(
        articlesRef,
        where("verificationStatus", "==", status),
        orderBy("publicationDate", "desc")
      )
    );
    
    return querySnapshot.docs.map(transformArticleData);
  } catch (error) {
    console.error(`Erreur lors de la récupération des articles avec statut ${status}:`, error);
    throw error;
  }
};

// Récupérer les articles populaires
export const getPopularArticles = async (count: number = 5): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, articlesCollection);
    const querySnapshot = await getDocs(
      query(
        articlesRef,
        orderBy("viewCount", "desc"),
        limit(count)
      )
    );
    
    return querySnapshot.docs.map(transformArticleData);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles populaires:", error);
    throw error;
  }
};

// Créer un nouvel article
export const createArticle = async (article: Omit<Article, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const now = Timestamp.now();
    const newArticle = {
      ...article,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      verificationStatus: ["true", "false", "partial"].includes(article.verificationStatus) 
        ? article.verificationStatus 
        : "partial",
      title: article.title || "",
      content: article.content || "",
      summary: article.summary || "",
      author: article.author || "",
      imageUrl: article.imageUrl || "",
      tags: article.tags || [],
      source: article.source || "",
      publicationDate: article.publicationDate || now
    };
    
    const docRef = await addDoc(collection(db, articlesCollection), newArticle);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    throw error;
  }
};

// Mettre à jour un article
export const updateArticle = async (id: string, article: Partial<Article>): Promise<void> => {
  try {
    const articleRef = doc(db, articlesCollection, id);
    const updates = {
      ...article,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(articleRef, updates);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'article ${id}:`, error);
    throw error;
  }
};

// Supprimer un article
export const deleteArticle = async (id: string): Promise<void> => {
  try {
    // Récupérer l'article pour obtenir l'URL de l'image
    const article = await getArticleById(id);
    
    if (article && article.imageUrl) {
      try {
        // Supprimer l'image associée
        await deleteImage(article.imageUrl);
      } catch (error) {
        console.error(`Erreur lors de la suppression de l'image pour l'article ${id}:`, error);
        // Continuer même si la suppression de l'image échoue
      }
    }
    
    // Supprimer l'article
    const articleRef = doc(db, articlesCollection, id);
    await deleteDoc(articleRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'article ${id}:`, error);
    throw error;
  }
};

// Incrémenter le compteur de vues d'un article
export const incrementArticleViewCount = async (id: string): Promise<void> => {
  try {
    const articleRef = doc(db, articlesCollection, id);
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      const currentCount = articleSnap.data().viewCount || 0;
      await updateDoc(articleRef, {
        viewCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation du compteur de vues pour l'article ${id}:`, error);
    throw error;
  }
};

// Rechercher des articles
export const searchArticles = async (searchTerm: string): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, articlesCollection);
    const searchTermLower = searchTerm.toLowerCase();
    
    // Récupérer tous les articles et filtrer côté client
    // Note: Firestore ne permet pas de recherche de texte complexe sans solutions externes
    const querySnapshot = await getDocs(articlesRef);
    
    const filteredArticles = querySnapshot.docs
      .map(transformArticleData)
      .filter(article => 
        article.title.toLowerCase().includes(searchTermLower) ||
        article.content.toLowerCase().includes(searchTermLower) ||
        article.author.toLowerCase().includes(searchTermLower) ||
        article.summary.toLowerCase().includes(searchTermLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    
    return filteredArticles;
  } catch (error) {
    console.error("Erreur lors de la recherche d'articles:", error);
    throw error;
  }
}; 