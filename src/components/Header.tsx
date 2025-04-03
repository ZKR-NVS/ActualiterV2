import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, User, LogOut, AlertTriangle } from "lucide-react";
import { useMaintenanceMode } from "@/App";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { ThemeSwitcher } from "./ui/theme-switcher";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Simuler un utilisateur connecté pour la démo
  const { isMaintenanceMode, setMaintenanceMode, isAdmin } = useMaintenanceMode();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Simuler l'authentification
  const handleAuthAction = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  // Fermer le menu mobile lors de la navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center">
              TruthBeacon
              {isMaintenanceMode && (
                <Badge variant="outline" className="ml-2 bg-partial text-partial-foreground border-partial">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Maintenance
                </Badge>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-foreground hover:text-primary ${location.pathname === '/' ? 'text-primary font-medium' : ''}`}>
              Accueil
            </Link>
            {isLoggedIn && (
              <Link to="/profile" className={`text-foreground hover:text-primary ${location.pathname === '/profile' ? 'text-primary font-medium' : ''}`}>
                Profil
              </Link>
            )}
            {isLoggedIn && isAdmin && (
              <Link to="/admin" className={`text-foreground hover:text-primary ${location.pathname === '/admin' ? 'text-primary font-medium' : ''}`}>
                Admin
              </Link>
            )}
            
            {isLoggedIn && isAdmin && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Maintenance:</span>
                <Switch 
                  checked={isMaintenanceMode} 
                  onCheckedChange={setMaintenanceMode}
                  aria-label="Toggle maintenance mode"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
              
              {isLoggedIn ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleAuthAction}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="outline">Connexion</Button>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-3 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted ${location.pathname === '/' ? 'text-primary font-medium bg-muted' : ''}`}
              >
                Accueil
              </Link>
              {isLoggedIn && (
                <Link
                  to="/profile"
                  className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted ${location.pathname === '/profile' ? 'text-primary font-medium bg-muted' : ''}`}
                >
                  Profil
                </Link>
              )}
              {isLoggedIn && isAdmin && (
                <Link
                  to="/admin"
                  className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted ${location.pathname === '/admin' ? 'text-primary font-medium bg-muted' : ''}`}
                >
                  Admin
                </Link>
              )}
              
              {isLoggedIn && isAdmin && (
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-muted-foreground">Mode maintenance</span>
                  <Switch 
                    checked={isMaintenanceMode} 
                    onCheckedChange={setMaintenanceMode}
                    aria-label="Toggle maintenance mode"
                  />
                </div>
              )}
              
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  className="justify-start mx-4"
                  onClick={handleAuthAction}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Déconnexion
                </Button>
              ) : (
                <Link
                  to="/login"
                  className="w-full px-4"
                >
                  <Button variant="outline" className="w-full">Connexion</Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
