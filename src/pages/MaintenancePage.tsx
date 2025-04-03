import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaintenancePage = () => {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const navigate = useNavigate();
  
  // Séquence secrète: tbadmin
  const SECRET_SEQUENCE = ["t", "b", "a", "d", "m", "i", "n"];
  
  // Écouter les touches du clavier pour la séquence secrète
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer les événements de modification et les touches spéciales
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        return;
      }
      
      // Ajouter la touche à la séquence
      const newSequence = [...keySequence, e.key.toLowerCase()];
      
      // Vérifier si la séquence correspond au début de la séquence secrète
      const isValidPartialSequence = SECRET_SEQUENCE.slice(0, newSequence.length).every(
        (key, index) => key === newSequence[index]
      );
      
      if (isValidPartialSequence) {
        setKeySequence(newSequence);
        
        // Si la séquence complète est entrée
        if (newSequence.length === SECRET_SEQUENCE.length) {
          // Réinitialiser et naviguer
          setKeySequence([]);
          navigate("/login");
        }
      } else {
        // Réinitialiser si la séquence est incorrecte
        setKeySequence([]);
      }
    };
    
    // Ajouter l'écouteur d'événements
    window.addEventListener("keydown", handleKeyDown);
    
    // Nettoyer l'écouteur d'événements
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keySequence, navigate]);
  
  // Réinitialiser la séquence après 5 secondes d'inactivité
  useEffect(() => {
    if (keySequence.length > 0) {
      const timeout = setTimeout(() => {
        setKeySequence([]);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [keySequence]);

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
