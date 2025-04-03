
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useMaintenanceMode } from "@/App";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMaintenanceMode, isAdmin } = useMaintenanceMode();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {isMaintenanceMode && isAdmin && (
        <Alert className="bg-amber-50 border-amber-200 mx-4 mt-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Le site est actuellement en mode maintenance. Seuls les administrateurs peuvent voir cette version.
          </AlertDescription>
        </Alert>
      )}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};
