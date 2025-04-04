import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, Download, BookOpen, ArrowRight, Gift, Link } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getUserOrders, getBookById } from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function OrderConfirmationPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasDigitalProducts, setHasDigitalProducts] = useState(false);
  
  // État pour les achats en tant qu'invité
  const orderIdFromState = location.state?.orderId;
  const emailFromState = location.state?.email;
  const isGuestFromState = location.state?.isGuest;
  
  // Génération d'un numéro de commande unique
  const orderNumber = orderIdFromState 
    ? orderIdFromState.substring(0, 6) // Utiliser les 6 premiers caractères de l'ID de commande
    : Math.floor(Math.random() * 900000) + 100000; // ou générer un nombre aléatoire à 6 chiffres
  
  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        setLoading(true);
        
        // Si nous avons une commande invité depuis l'état de location
        if (isGuestFromState && orderIdFromState) {
          // Pour les invités, on a déjà l'information sur la commande
          // Vérifier si la commande contient des livres numériques
          setHasDigitalProducts(true); // Simplifié pour cet exemple, idéalement vérifier avec une API
          setLoading(false);
          return;
        }
        
        // Pour les utilisateurs connectés
        if (currentUser) {
          const orders = await getUserOrders(currentUser.uid);
          
          if (orders.length > 0) {
            // Récupérer la dernière commande
            const latestOrder = orders[0];
            
            // Vérifier si la commande contient des livres numériques
            const books = latestOrder.books || [];
            let hasDigital = false;
            
            for (const bookItem of books) {
              try {
                const book = await getBookById(bookItem.bookId);
                if (book && book.pdfUrl) {
                  hasDigital = true;
                  break;
                }
              } catch (error) {
                console.error(`Erreur lors de la récupération du livre ${bookItem.bookId}:`, error);
              }
            }
            
            setHasDigitalProducts(hasDigital);
          }
        } else if (!isGuestFromState) {
          // L'utilisateur n'est pas connecté et ce n'est pas une commande invité
          // Rediriger vers la page d'accueil
          navigate('/');
          toast({
            title: t("errors.error"),
            description: t("errors.accessDenied"),
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la commande:", error);
        toast({
          title: t("errors.error"),
          description: t("errors.orderCheckError"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkOrderStatus();
  }, [currentUser, navigate, toast, t, isGuestFromState, orderIdFromState]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 min-h-screen flex justify-center items-center">
          <LoadingSpinner size="lg" text={t("loading.processingOrder")} />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-green-300 shadow-lg">
            <CardHeader className="text-center border-b">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-green-700">
                {t("orderConfirmation.thankYou")}
              </CardTitle>
              <CardDescription className="text-lg">
                {t("orderConfirmation.orderSuccess")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Message de confirmation avec numéro de commande */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-lg font-medium">
                    Votre commande #{orderNumber} est confirmée ! 
                    {isGuestFromState && (
                      <span>
                        {" "}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto inline font-medium" 
                          onClick={() => navigate('/login')}
                        >
                          [Connectez-vous]
                        </Button> pour suivre la livraison et accumuler des points fidélité.
                      </span>
                    )}
                  </p>
                </div>
                
                {isGuestFromState && (
                  <Card className="bg-primary/10 border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Gift className="h-5 w-5 mr-2" />
                        {t("orderConfirmation.createAccountTitle")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        {t("orderConfirmation.createAccountDescription")}
                      </p>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{t("orderConfirmation.benefit1")}</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{t("orderConfirmation.benefit2")}</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{t("orderConfirmation.benefit3")}</span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full"
                        onClick={() => navigate('/register', { state: { email: emailFromState }})}
                      >
                        {t("orderConfirmation.createAccount")}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              
                <div className="rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                  <h3 className="font-medium text-lg mb-2">{t("orderConfirmation.orderDetails")}</h3>
                  
                  {isGuestFromState ? (
                    <p className="text-muted-foreground">
                      {t("orderConfirmation.confirmation1")} <span className="font-medium">{emailFromState}</span> {t("orderConfirmation.confirmation2")}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("orderConfirmation.confirmationAccount")}
                    </p>
                  )}
                </div>
                
                {hasDigitalProducts && (
                  <div className="rounded-lg p-4 border border-primary">
                    <h3 className="font-medium text-lg mb-2 flex items-center">
                      <Download className="h-5 w-5 mr-2 text-primary" />
                      {t("orderConfirmation.digitalProducts")}
                    </h3>
                    
                    {isGuestFromState ? (
                      <p className="text-muted-foreground mb-4">
                        {t("orderConfirmation.downloadInstructions")}
                      </p>
                    ) : (
                      <p className="text-muted-foreground mb-4">
                        {t("orderConfirmation.accessDigitalProducts")}
                      </p>
                    )}
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate('/profile/downloads')}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      {t("orderConfirmation.accessDownloads")}
                    </Button>
                </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/')}>
                {t("common.backToHome")}
              </Button>
              <Button className="w-full sm:w-auto" onClick={() => navigate('/bookshop')}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t("orderConfirmation.continueShopping")}
              </Button>
            </CardFooter>
          </Card>
            </div>
      </div>
    </Layout>
  );
} 