import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/contexts/AuthContext";
import { getGlobalSettings, updateMaintenanceMode } from "@/lib/services/settingsService";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";

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
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Composant pour les routes accessibles uniquement aux administrateurs
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
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

const App = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const { currentUser } = useAuth();

  // Initialiser le thème au démarrage de l'application
  useEffect(() => {
    initializeTheme();
  }, []);

  // Récupérer le mode maintenance depuis Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsSettingsLoading(true);
        const settings = await getGlobalSettings();
        setIsMaintenanceMode(settings.maintenanceMode);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

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
  
  if (isSettingsLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement des paramètres...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <MaintenanceContext.Provider value={{ isMaintenanceMode, setMaintenanceMode: handleSetMaintenanceMode }}>
            <BrowserRouter>
              <MaintenanceWrapper>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MaintenanceWrapper>
            </BrowserRouter>
          </MaintenanceContext.Provider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
