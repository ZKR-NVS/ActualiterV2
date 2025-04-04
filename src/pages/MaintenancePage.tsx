import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MaintenancePage.css";

const MaintenancePage = () => {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const navigate = useNavigate();
  
  // Messages alternants
  const messages = [
    "Merci de votre patience",
    "Nous revenons bientôt",
    "Améliorations en cours",
    "Mise à jour en cours"
  ];
  
  // Séquence secrète maintenue: tbadmin
  const SECRET_SEQUENCE = ["t", "b", "a", "d", "m", "i", "n"];
  
  // Écouter les touches du clavier pour les séquences secrètes et bloquer F12
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquer F12 et autres touches de développeur
      if (e.key === "F12" || 
          (e.ctrlKey && e.shiftKey && e.key === "I") || 
          (e.ctrlKey && e.shiftKey && e.key === "J") || 
          (e.ctrlKey && e.shiftKey && e.key === "C") || 
          (e.ctrlKey && e.key === "U")) {
        e.preventDefault();
        return false;
      }
      
      // Vérifier la combinaison Ctrl+Alt+A pour afficher le lien admin
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setShowAdminLink(true);
        showNotification("Lien administrateur activé");
        
        // Cacher le lien après 10 secondes
        setTimeout(() => {
          setShowAdminLink(false);
        }, 10000);
        
        return;
      }
      
      // Ignorer les événements de modification pour la séquence secrète
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

    // Désactiver le clic droit
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    
    // Bloquer console.log, console.debug, etc.
    const blockConsole = () => {
      try {
        Object.defineProperty(window, 'console', {
          value: { 
            ...console,
            log: () => {},
            warn: () => {},
            error: () => {},
            info: () => {},
            debug: () => {}
          },
          writable: false,
          configurable: false
        });
      } catch (e) {}
    };
    
    blockConsole();
    
    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
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
  
  // Rotation des messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Empêcher l'ouverture des outils de développement à la volée
  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // Redirection ou autre action en cas de détection des outils de développement
        document.body.innerHTML = "Accès non autorisé";
      }
    };
    
    const interval = setInterval(checkDevTools, 1000);
    window.addEventListener('resize', checkDevTools);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);
  
  // Afficher une notification
  const showNotification = (message: string) => {
    const notification = document.getElementById('notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 5000);
    }
  };
  
  // Service Worker (note: nécessite une implémentation supplémentaire)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Dans une implémentation complète, vous enregistreriez ici un service worker
      console.log('Service Worker supporté');
    }
  }, []);

  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        <h1>
          <i className="fas fa-tools"></i>
          Site en maintenance
        </h1>
        <div className="loader" role="progressbar" aria-label="Chargement"></div>
        <p>Nous améliorons actuellement votre expérience sur Actualiter.</p>
        <p>Notre équipe travaille sur des mises à jour importantes pour vous offrir une meilleure qualité d'information.</p>
        <div className="progress-container">
          <div className="progress-bar"></div>
          </div>
        <p>
          <strong>Nous travaillons pour vous !</strong> <span id="maintenanceMessage">{messages[currentMessageIndex]}</span>
        </p>
        <div className="social-links">
          <a href="https://twitter.com/actualiter" className="social-link" rel="noopener noreferrer" target="_blank">
            <i className="fab fa-twitter"></i>
            Twitter
          </a>
          <a href="https://facebook.com/actualiter" className="social-link" rel="noopener noreferrer" target="_blank">
            <i className="fab fa-facebook"></i>
            Facebook
          </a>
          <a href="https://instagram.com/actualiter" className="social-link" rel="noopener noreferrer" target="_blank">
            <i className="fab fa-instagram"></i>
            Instagram
          </a>
        </div>
      </div>
      
      <div className="notification" id="notification">
        Nous vous notifierons dès que le site sera de retour !
      </div>
      
      {/* Lien admin caché par défaut */}
      {showAdminLink && (
        <a 
          href="#" 
          className="admin-link"
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
        >
          Admin
        </a>
      )}
    </div>
  );
};

export default MaintenancePage;
