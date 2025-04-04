import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/contexts/AuthContext";
import { CartProvider } from "@/lib/contexts/CartContext";
import { getGlobalSettings, updateMaintenanceMode, synchronizeMaintenanceMode } from "@/lib/services/settingsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { doc, onSnapshot, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";
import { ArticleDetailsPage } from "./pages/ArticleDetailsPage";

// Pages de la boutique de livres
import BookshopPage from "./pages/BookshopPage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderManagementPage from "./pages/admin/OrderManagementPage";
import BookManagementPage from "./pages/admin/BookManagementPage";

// Créer un contexte pour le mode maintenance
interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (value: boolean) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenanceMode: false,
  setMaintenanceMode: () => {}
});

export const useMaintenanceMode = () => useContext(MaintenanceContext);

// Composant wrapper pour vérifier le mode maintenance
const MaintenanceWrapper = ({ children }: { children: ReactNode }) => {
  const { isMaintenanceMode } = useMaintenanceMode();
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  
  // Rediriger vers la page de maintenance sauf pour les admins ou la page login
  if (isMaintenanceMode && !isAdmin && location.pathname !== "/login") {
    return <MaintenancePage />;
  }
  
  return <>{children}</>;
};

// Composant pour les routes protégées nécessitant une authentification
interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple simulation du chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="md" text="Chargement..." className="h-screen" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier si la route nécessite des droits d'admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Composant pour les routes accessibles uniquement aux administrateurs
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple simulation du chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="md" text="Chargement de l'interface admin..." className="h-screen" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Initialiser le thème depuis localStorage
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme && savedTheme !== "default") {
    document.documentElement.classList.add(savedTheme);
  }
};

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
}

const AppContent = () => {
  const { currentUser, isAdmin } = useAuth();
  const [isPreloading, setIsPreloading] = useState(true); // État de pré-chargement
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Récupération des paramètres globaux au pré-chargement
  useEffect(() => {
    const preloadSettings = async () => {
      try {
        // Récupérer l'état du mode maintenance en premier
        const settings = await getGlobalSettings();
        setIsMaintenanceMode(settings.maintenanceMode);
      } catch (error) {
        console.error("Erreur lors du pré-chargement des paramètres:", error);
      } finally {
        // Terminer le pré-chargement
        setIsPreloading(false);
      }
    };
    
    preloadSettings();
  }, []);
  
  // Écouteur en temps réel pour les changements dans Firebase
  useEffect(() => {
    // Ne s'exécute que lorsque le pré-chargement est terminé
    if (isPreloading) return;
    
    console.log("Configuration des écouteurs en temps réel pour les documents de configuration");
    
    // Écouteur pour le document global
    const globalUnsubscribe = onSnapshot(
      doc(db, "settings", "global"),
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log(`Changement détecté dans le document global: maintenanceMode=${data.maintenanceMode}`);
          
          // Mettre à jour l'état de l'application
          setIsMaintenanceMode(data.maintenanceMode);
          
          // Synchroniser avec le document site
          try {
            const siteRef = doc(db, "settings", "site");
            const siteDoc = await getDoc(siteRef);
            
            if (siteDoc.exists()) {
              // Vérifier si une synchronisation est nécessaire
              const siteData = siteDoc.data();
              if (siteData.general && siteData.general.maintenanceMode !== data.maintenanceMode) {
                console.log(`Synchronisation automatique de global vers site: ${data.maintenanceMode}`);
                await updateDoc(siteRef, {
                  "general.maintenanceMode": data.maintenanceMode,
                  "lastUpdated": new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error("Erreur lors de la synchronisation automatique global -> site:", error);
          }
        }
      },
      (error) => {
        console.error("Erreur lors de l'écoute du document global:", error);
      }
    );
    
    // Écouteur pour le document site (au cas où global ne serait pas disponible)
    const siteUnsubscribe = onSnapshot(
      doc(db, "settings", "site"),
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.general && data.general.maintenanceMode !== undefined) {
            console.log(`Changement détecté dans le document site: maintenanceMode=${data.general.maintenanceMode}`);
            
            // Vérifier la cohérence avec le document global et synchroniser si nécessaire
            try {
              const globalRef = doc(db, "settings", "global");
              const globalDoc = await getDoc(globalRef);
              
              if (globalDoc.exists()) {
                const globalData = globalDoc.data();
                
                // Si les valeurs sont différentes, mettre à jour global depuis site
                if (globalData.maintenanceMode !== data.general.maintenanceMode) {
                  console.log(`Synchronisation automatique de site vers global: ${data.general.maintenanceMode}`);
                  await updateDoc(globalRef, {
                    "maintenanceMode": data.general.maintenanceMode,
                    "lastUpdated": new Date().toISOString()
                  });
                }
                
                // Dans tous les cas, mettre à jour l'état de l'application pour refléter le changement
                setIsMaintenanceMode(data.general.maintenanceMode);
              } else {
                // Si le document global n'existe pas, le créer
                console.log(`Création du document global avec maintenanceMode: ${data.general.maintenanceMode}`);
                await setDoc(globalRef, {
                  "maintenanceMode": data.general.maintenanceMode,
                  "lastUpdated": new Date().toISOString()
                });
                
                // Mettre à jour l'état de l'application
                setIsMaintenanceMode(data.general.maintenanceMode);
              }
            } catch (error) {
              console.error("Erreur lors de la synchronisation automatique site -> global:", error);
              
              // En cas d'erreur, mettre quand même à jour l'état de l'application
              setIsMaintenanceMode(data.general.maintenanceMode);
            }
          }
        }
      },
      (error) => {
        console.error("Erreur lors de l'écoute du document site:", error);
      }
    );
    
    // Nettoyer les écouteurs lors du démontage du composant
    return () => {
      globalUnsubscribe();
      siteUnsubscribe();
    };
  }, [isPreloading]);
  
  // Récupération détaillée et synchronisation pour les administrateurs
  useEffect(() => {
    // Ne s'exécute que lorsque le pré-chargement est terminé
    if (isPreloading) return;
    
    // Ne bloquer le chargement complet que pour les administrateurs
    if (isAdmin) {
      setIsSettingsLoading(true);
    }
    
    const fetchSettings = async () => {
      try {
        // Ne synchroniser que pour les administrateurs
        if (currentUser && isAdmin) {
          // Récupérer à nouveau les paramètres et synchroniser
          const settings = await getGlobalSettings();
          setIsMaintenanceMode(settings.maintenanceMode);
          await synchronizeMaintenanceMode();
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    fetchSettings();
  }, [currentUser, isAdmin, isPreloading]);

  // Fonction qui permet de mettre à jour l'état local et dans Firestore
  const handleSetMaintenanceMode = async (value: boolean) => {
    setIsMaintenanceMode(value);
    try {
      await updateMaintenanceMode(value);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mode maintenance:", error);
    }
  };
  
  // Afficher un écran de chargement pendant le pré-chargement
  if (isPreloading) {
    return <LoadingSpinner size="lg" text="Initialisation..." />;
  }
  
  // Afficher un écran de chargement pendant le chargement des paramètres pour les admins
  if (isSettingsLoading && isAdmin) {
    return <LoadingSpinner size="lg" text="Chargement des paramètres..." />;
  }

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, setMaintenanceMode: handleSetMaintenanceMode }}>
      <BrowserRouter>
        <MaintenanceWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/article/:id" element={<ArticleDetailsPage />} />
            
            {/* Routes de la boutique de livres */}
            <Route path="/bookshop" element={<BookshopPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route 
              path="/order-confirmation" 
              element={
                <ProtectedRoute>
                  <OrderConfirmationPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } 
            />
            
            {/* Routes d'administration de la boutique */}
            <Route 
              path="/admin/books" 
              element={
                <ProtectedRoute adminOnly>
                  <BookManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute adminOnly>
                  <OrderManagementPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback pour les routes inconnues */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MaintenanceWrapper>
      </BrowserRouter>
    </MaintenanceContext.Provider>
  );
};
