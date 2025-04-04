import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, User, LogOut, AlertTriangle, BookOpen, ShoppingCart } from "lucide-react";
import { useMaintenanceMode } from "@/App";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { ThemeSwitcher } from "./ui/theme-switcher";
import { LanguageSwitcher } from "./ui/language-switcher";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NotificationDropdown } from "./NotificationDropdown";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMaintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  const { currentUser, isAdmin, loading, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Fermer le menu mobile lors de la navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center">
              Actualiter
              {isMaintenanceMode && (
                <Badge variant="outline" className="ml-2 bg-partial text-partial-foreground border-partial">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {t('common.maintenance')}
                </Badge>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-foreground hover:text-primary ${location.pathname === '/' ? 'text-primary font-medium' : ''}`}>
              {t('common.home')}
            </Link>
            <Link to="/bookshop" className={`text-foreground hover:text-primary flex items-center ${location.pathname.startsWith('/bookshop') || location.pathname.startsWith('/book/') ? 'text-primary font-medium' : ''}`}>
              <BookOpen className="h-4 w-4 mr-1" />
              {t('common.bookshop')}
            </Link>
            {currentUser && (
              <Link to="/profile" className={`text-foreground hover:text-primary ${location.pathname === '/profile' ? 'text-primary font-medium' : ''}`}>
                {t('common.profile')}
              </Link>
            )}
            {currentUser && isAdmin && (
              <Link to="/admin" className={`text-foreground hover:text-primary ${location.pathname === '/admin' ? 'text-primary font-medium' : ''}`}>
                {t('common.admin')}
              </Link>
            )}
            {currentUser && isAdmin && (
              <Link to="/admin/books" className={`text-foreground hover:text-primary ${location.pathname === '/admin/books' ? 'text-primary font-medium' : ''}`}>
                {t('common.shopManagement')}
              </Link>
            )}
            {currentUser && isAdmin && (
              <Link to="/admin/orders" className={`text-foreground hover:text-primary ${location.pathname === '/admin/orders' ? 'text-primary font-medium' : ''}`}>
                {t('common.orders')}
              </Link>
            )}
            
            {currentUser && isAdmin && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('header.maintenanceMode')}:</span>
                <Switch 
                  checked={isMaintenanceMode} 
                  onCheckedChange={setMaintenanceMode}
                  aria-label="Toggle maintenance mode"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
              
              {currentUser && (
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {/* On pourrait ajouter ici un badge avec le nombre d'articles dans le panier */}
                  </Button>
                </Link>
              )}
              
              {!loading && currentUser && (
                <NotificationDropdown />
              )}
              
              {!loading && (currentUser ? (
                <>
                  <Link to="/profile">
                    <Avatar className="h-8 w-8">
                      {currentUser.photoURL ? (
                        <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName} />
                      ) : (
                        <AvatarFallback>{getInitials(currentUser.displayName)}</AvatarFallback>
                      )}
                    </Avatar>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} title={t('common.logout')}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="outline">{t('common.login')}</Button>
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            {currentUser && (
              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            )}
            {!loading && currentUser && (
              <NotificationDropdown />
            )}
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
                {t('common.home')}
              </Link>
              <Link
                to="/bookshop"
                className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted flex items-center ${location.pathname.startsWith('/bookshop') || location.pathname.startsWith('/book/') ? 'text-primary font-medium bg-muted' : ''}`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {t('common.bookshop')}
              </Link>
              {currentUser && (
                <Link
                  to="/profile"
                  className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted ${location.pathname === '/profile' ? 'text-primary font-medium bg-muted' : ''}`}
                >
                  {t('common.profile')}
                </Link>
              )}
              {currentUser && isAdmin && (
                <Link
                  to="/admin"
                  className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted ${location.pathname === '/admin' ? 'text-primary font-medium bg-muted' : ''}`}
                >
                  {t('common.admin')}
                </Link>
              )}
              {currentUser && isAdmin && (
                <Link
                  to="/admin/books"
                  className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted ${location.pathname === '/admin/books' ? 'text-primary font-medium bg-muted' : ''}`}
                >
                  {t('common.shopManagement')}
                </Link>
              )}
              {currentUser && isAdmin && (
                <Link
                  to="/admin/orders"
                  className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-muted ${location.pathname === '/admin/orders' ? 'text-primary font-medium bg-muted' : ''}`}
                >
                  {t('common.orders')}
                </Link>
              )}
              
              {currentUser && isAdmin && (
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-muted-foreground">{t('header.maintenanceMode')}</span>
                  <Switch 
                    checked={isMaintenanceMode} 
                    onCheckedChange={setMaintenanceMode}
                    aria-label="Toggle maintenance mode"
                  />
                </div>
              )}
              
              {!loading && (currentUser ? (
                <Button
                  variant="outline"
                  className="justify-start mx-4"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {t('common.logout')}
                </Button>
              ) : (
                <Link
                  to="/login"
                  className="w-full px-4"
                >
                  <Button variant="outline" className="w-full">{t('common.login')}</Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
