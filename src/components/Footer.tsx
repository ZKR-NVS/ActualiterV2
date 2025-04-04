import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-muted py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Actualiter</h3>
            <p className="text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('footer.navigation')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary">{t('common.home')}</Link>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-primary">{t('common.login')}</Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary">{t('common.profile')}</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary">{t('footer.termsOfService')}</Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary">{t('footer.privacyPolicy')}</Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary">{t('footer.cookiePolicy')}</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {currentYear} Actualiter. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};
