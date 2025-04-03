import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getCurrentUser, onAuthStateChange, signIn, signOut, registerUser } from "../services/authService";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVerifier: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'authentification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Observer les changements d'état d'authentification
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Nettoyer l'observateur lors du démontage
    return () => unsubscribe();
  }, []);

  // Vérifier si l'utilisateur a le rôle d'administrateur
  // Assurons-nous que l'utilisateur existe et a spécifiquement le rôle "admin"
  const isAdmin = currentUser?.role === "admin";
  
  // Vérifier si l'utilisateur a le rôle de vérificateur
  // Un admin est également considéré comme vérificateur (accès plus large)
  const isVerifier = currentUser?.role === "verifier" || isAdmin;

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await signIn(email, password);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string, displayName: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await registerUser(email, password, displayName);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAdmin,
    isVerifier,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 