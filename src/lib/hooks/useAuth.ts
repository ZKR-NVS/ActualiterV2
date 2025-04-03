import { useState, useEffect } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

interface UserWithRole extends FirebaseUser {
  role: "user" | "editor" | "admin";
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Récupérer les informations supplémentaires de l'utilisateur (rôle, etc.)
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Combiner les données Firebase Auth avec les données Firestore
            const enhancedUser = {
              ...firebaseUser,
              role: userData.role || "user",
            } as UserWithRole;
            
            setUser(enhancedUser);
          } else {
            // Si aucun document utilisateur n'existe encore, définir un rôle par défaut
            const enhancedUser = {
              ...firebaseUser,
              role: "user",
            } as UserWithRole;
            
            setUser(enhancedUser);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          // En cas d'erreur, définir l'utilisateur avec des valeurs par défaut
          const enhancedUser = {
            ...firebaseUser,
            role: "user",
          } as UserWithRole;
          
          setUser(enhancedUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}; 