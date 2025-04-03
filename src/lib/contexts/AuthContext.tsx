import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  User, 
  getCurrentUser, 
  onAuthStateChange, 
  signIn, 
  signOut, 
  registerUser, 
  updateUserProfile as updateUserProfileService,
  getUserProfile
} from "../services/authService";

// Interface simplifiée pour l'utilisateur dans le contexte d'authentification
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin" | "editor";
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<AuthUser>;
  updateUserProfile: (updates: { 
    displayName?: string; 
    photoURL?: string;
    role?: "user" | "admin" | "editor";
  }) => Promise<void>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: currentUser.role
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'authentification:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Observer les changements d'état d'authentification
    const unsubscribe = onAuthStateChange((currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: currentUser.role
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Nettoyer l'observateur lors du démontage
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
      setLoading(true);
      const loggedInUser = await signIn(email, password);
      const authUser: AuthUser = {
        uid: loggedInUser.uid,
        email: loggedInUser.email,
        displayName: loggedInUser.displayName,
        role: loggedInUser.role
      };
      setUser(authUser);
      return authUser;
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
      setUser(null);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, displayName: string): Promise<AuthUser> => {
    try {
      setLoading(true);
      const newUser = await registerUser(email, password, displayName);
      const authUser: AuthUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role
      };
      setUser(authUser);
      return authUser;
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
    if (!user) throw new Error("Aucun utilisateur connecté");
    
    try {
      setLoading(true);
      await updateUserProfileService(user.uid, updates);
      
      // Mettre à jour l'utilisateur actuel dans le state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
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
      user,
      loading,
      login,
      logout,
      register,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 