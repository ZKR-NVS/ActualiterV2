import { Timestamp } from "firebase/firestore";

/**
 * Interface pour les utilisateurs authentifiés
 */
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin" | "editor";
}

/**
 * Interface complète pour les utilisateurs dans Firestore
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: "user" | "admin" | "editor";
  createdAt: Date | Timestamp;
  lastLogin: Date | Timestamp | null;
}

/**
 * Interface pour les articles
 */
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