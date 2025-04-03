import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/contexts/AuthContext";
import { getMaintenanceStatus, setMaintenanceStatus, onMaintenanceStatusChange } from "@/lib/services/maintenanceService";

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
  setMaintenanceMode: (value: boolean) => Promise<void>;
}

export const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenanceMode: false,
  setMaintenanceMode: async () => {},
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
  const { currentUser } = useAuth();

  // Initialiser le mode maintenance et s'abonner aux changements
  useEffect(() => {
    // Récupérer l'état initial
    getMaintenanceStatus().then(status => {
      setIsMaintenanceMode(status);
    });

    // S'abonner aux changements
    const unsubscribe = onMaintenanceStatusChange(status => {
      setIsMaintenanceMode(status);
    });

    return () => unsubscribe();
  }, []);

  // Fonction pour mettre à jour le mode maintenance
  const setMaintenanceMode = async (value: boolean) => {
    try {
      await setMaintenanceStatus(value, currentUser?.uid);
      // L'état local sera mis à jour automatiquement via l'abonnement onSnapshot
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mode maintenance:", error);
    }
  };

  // Initialiser le thème au démarrage de l'application
  useEffect(() => {
    initializeTheme();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <MaintenanceContext.Provider value={{ isMaintenanceMode, setMaintenanceMode }}>
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
