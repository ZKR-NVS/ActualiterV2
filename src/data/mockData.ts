import { Article } from "@/components/ArticleCard";

// Interface des articles pour maintenir la compatibilité avec le code existant
export const mockArticles: Article[] = [];

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "user";
  avatar?: string;
}

// Interface des utilisateurs pour maintenir la compatibilité avec le code existant
export const mockUsers: User[] = [];
