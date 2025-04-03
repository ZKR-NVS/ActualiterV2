
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
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
          
          <div className="mt-4 border-t pt-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Connexion Administrateur
              </Button>
            </Link>
          </div>
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
