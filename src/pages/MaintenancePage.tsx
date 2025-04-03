import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaintenancePage = () => {
  const [adminClicks, setAdminClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const navigate = useNavigate();
  
  // Réinitialiser le compteur de clics après un certain délai
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (adminClicks > 0 && Date.now() - lastClickTime > 3000) {
        setAdminClicks(0);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [adminClicks, lastClickTime]);
  
  // Gérer les clics sur le logo/titre pour accès administrateur
  const handleLogoClick = () => {
    const currentTime = Date.now();
    setLastClickTime(currentTime);
    
    // Incrémenter le compteur de clics
    setAdminClicks(prev => {
      const newCount = prev + 1;
      
      // Si 5 clics rapides, rediriger vers la page de connexion
      if (newCount >= 5) {
        navigate("/login");
        return 0;
      }
      
      return newCount;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div 
          className="flex justify-center mb-6 cursor-pointer" 
          onClick={handleLogoClick}
          title="TruthBeacon"
        >
          <div className="bg-amber-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Nous serons bientôt de retour !</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <p className="text-gray-600 mb-4">
            TruthBeacon est actuellement en maintenance programmée. Nous travaillons à améliorer votre expérience de vérification des faits !
          </p>
          
          <p className="text-gray-600">
            Veuillez revenir dans quelques instants. Nous nous excusons pour tout inconvénient.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Durée estimée: <span className="font-medium">1 heure</span>
          </div>
          
          <Button variant="outline" className="mx-auto" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TruthBeacon. Tous droits réservés.</p>
        <p className="mt-1">Pour toute demande urgente, veuillez contacter support@truthbeacon.com</p>
      </footer>
    </div>
  );
};

export default MaintenancePage;
