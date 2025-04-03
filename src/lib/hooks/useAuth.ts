import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentUser } from "@/lib/services/authService";
import { AuthUser } from "@/lib/types";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // L'utilisateur est connecté, récupérer son profil complet
          const userProfile = await getCurrentUser();
          
          if (userProfile) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: userProfile.displayName || "",
              role: userProfile.role || "user"
            });
          } else {
            // Si aucun profil n'existe, utiliser les données de base
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: "user"
            });
          }
        } else {
          // L'utilisateur n'est pas connecté
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, []);

  return { user, loading };
}; 