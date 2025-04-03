import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getCurrentUser, onAuthStateChange, signIn, signOut, registerUser, updateUserProfile as updateUserProfileService } from "../services/authService";

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'authentification:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Observer les changements d'état d'authentification
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Nettoyer l'observateur lors du démontage
    return () => unsubscribe();
  }, []);

  // Vérifier si l'utilisateur a le rôle d'administrateur
  // Assurons-nous que l'utilisateur existe et a spécifiquement le rôle "admin"
  const isAdmin = currentUser?.role === "admin";
  
  // Vérifier si l'utilisateur a le rôle d'éditeur
  // Un admin est également considéré comme éditeur (accès plus large)
  const isEditor = currentUser?.role === "editor" || isAdmin;

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      const loggedInUser = await signIn(email, password);
      setCurrentUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, displayName: string): Promise<User> => {
    try {
      setLoading(true);
      const newUser = await registerUser(email, password, displayName);
      setCurrentUser(newUser);
      return newUser;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: { 
    displayName?: string; 
    photoURL?: string; 
    role?: "user" | "admin" | "editor";
  }): Promise<void> => {
    if (!currentUser) throw new Error("Aucun utilisateur connecté");
    
    try {
      setLoading(true);
      await updateUserProfileService(currentUser.uid, updates);
      
      // Mettre à jour l'utilisateur actuel dans le state
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Erreur de mise à jour du profil:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // Vous pouvez rendre un spinner ou un écran de chargement ici
    // return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isAdmin,
      isEditor,
      login,
      logout,
      register,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 