import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/contexts/AuthContext";
import { getGlobalSettings, updateMaintenanceMode, synchronizeMaintenanceMode } from "@/lib/services/settingsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

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

export const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenanceMode: false,
  setMaintenanceMode: () => {},
});

// Hook pour utiliser le contexte de maintenance
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

const queryClient = new QueryClient();

// Composant pour le contenu de l'application qui utilisera useAuth
const AppContent = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const { currentUser, isAdmin } = useAuth();

  // Récupérer le mode maintenance depuis Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Pour les utilisateurs non-admin, ne pas afficher l'écran de chargement
        if (isAdmin) {
          setIsSettingsLoading(true);
        }
        
        // Optimisation: Pour les utilisateurs non-admin, pas besoin de synchroniser
        if (isAdmin) {
          await synchronizeMaintenanceMode();
        }
        
        // Récupérer les paramètres (cette fonction gère déjà les erreurs de permission)
        const settings = await getGlobalSettings();
        setIsMaintenanceMode(settings.maintenanceMode);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    fetchSettings();
  }, [isAdmin]);

  // Fonction pour mettre à jour le mode maintenance
  const handleSetMaintenanceMode = async (value: boolean) => {
    try {
      // Mettre à jour l'état local immédiatement pour une réponse rapide
      setIsMaintenanceMode(value);
      
      // Mettre à jour dans Firestore
      await updateMaintenanceMode(value, currentUser?.uid);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mode maintenance:", error);
      // En cas d'erreur, revenir à l'état précédent
      setIsMaintenanceMode(!value);
    }
  };
  
  if (isAdmin && isSettingsLoading) {
    return <LoadingSpinner size="lg" text="Chargement des paramètres..." fullScreen />;
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
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } 
            />
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MaintenanceWrapper>
      </BrowserRouter>
    </MaintenanceContext.Provider>
  );
};

const App = () => {
  // Initialiser le thème au démarrage de l'application
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
