import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserCart, updateCartItemQuantity, removeFromCart, clearCart, Cart, CartItem } from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CreditCard, AlertTriangle } from 'lucide-react';
import CheckoutForm from '@/components/bookshop/CheckoutForm';
import { serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Fonction pour sécuriser les données du panier
const safeCartItems = (cart: Cart | null): Cart | null => {
  if (!cart) return null;
  
  // Créer une copie du panier
  const safeCopy = { ...cart };
  
  // Traiter les éléments du panier
  if (Array.isArray(safeCopy.items)) {
    safeCopy.items = safeCopy.items.map(item => {
      const safeItem = { ...item };
      
      // Si updatedAt est un objet Timestamp, convertir en chaîne ISO
      if (safeItem.updatedAt && typeof safeItem.updatedAt === 'object' && 'seconds' in safeItem.updatedAt) {
        try {
          // @ts-ignore - nous savons que c'est un objet Timestamp
          safeItem.updatedAt = new Date(safeItem.updatedAt.seconds * 1000).toISOString();
        } catch (e) {
          safeItem.updatedAt = null;
        }
      }
      
      return safeItem;
    });
  }
  
  // Si updatedAt du panier est un objet Timestamp, convertir en chaîne ISO
  if (safeCopy.updatedAt && typeof safeCopy.updatedAt === 'object' && 'seconds' in safeCopy.updatedAt) {
    try {
      // @ts-ignore - nous savons que c'est un objet Timestamp
      safeCopy.updatedAt = new Date(safeCopy.updatedAt.seconds * 1000).toISOString();
    } catch (e) {
      safeCopy.updatedAt = null;
    }
  }
  
  return safeCopy;
};

export default function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cardIssue, setCardIssue] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchCart = async () => {
      try {
        setLoading(true);
        const fetchedCart = await getUserCart(currentUser.uid);
        // Sécuriser les données du panier
        const safeCart = safeCartItems(fetchedCart);
        setCart(safeCart);
        
        // Initialiser l'état des quantités
        const initialQuantities: Record<string, number> = {};
        safeCart?.items.forEach(item => {
          initialQuantities[item.bookId] = item.quantity;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
        toast({
          title: t("errors.error"),
          description: t("errors.cartLoadError"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [currentUser, navigate, toast, t]);
  
  const handleUpdateQuantity = async (bookId: string, quantity: number) => {
    if (!currentUser || !cart) return;
    
    // Mettre à jour localement d'abord pour une interface réactive
    const newQuantities = { ...quantities, [bookId]: quantity };
    setQuantities(newQuantities);
    
    try {
      await updateCartItemQuantity(currentUser.uid, bookId, quantity);
      
      // Mettre à jour l'état du panier
      const updatedCart = await getUserCart(currentUser.uid);
      setCart(safeCartItems(updatedCart));
      
      toast({
        title: t("cart.quantityUpdated"),
        description: t("cart.quantityUpdatedSuccess")
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
      toast({
        title: t("errors.error"),
        description: t("errors.quantityUpdateError"),
        variant: "destructive"
      });
      
      // Restaurer la quantité précédente en cas d'erreur
      const item = cart.items.find(item => item.bookId === bookId);
      if (item) {
        setQuantities({ ...quantities, [bookId]: item.quantity });
      }
    }
  };
  
  const handleRemoveItem = async (bookId: string) => {
    if (!currentUser || !cart) return;
    
    try {
      await removeFromCart(currentUser.uid, bookId);
      
      // Mettre à jour l'état du panier
      const updatedCart = await getUserCart(currentUser.uid);
      setCart(safeCartItems(updatedCart));
      
      toast({
        title: t("cart.itemRemoved"),
        description: t("cart.itemRemovedSuccess")
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article:", error);
      toast({
        title: t("errors.error"),
        description: t("errors.removeItemError"),
        variant: "destructive"
      });
    }
  };
  
  const handleClearCart = async () => {
    if (!currentUser || !cart || cart.items.length === 0) return;
    
    try {
      await clearCart(currentUser.uid);
      
      // Mettre à jour l'état du panier
      const updatedCart = await getUserCart(currentUser.uid);
      setCart(safeCartItems(updatedCart));
      
      toast({
        title: t("cart.cartCleared"),
        description: t("cart.cartClearedSuccess")
      });
    } catch (error) {
      console.error("Erreur lors du vidage du panier:", error);
      toast({
        title: t("errors.error"),
        description: t("errors.clearCartError"),
        variant: "destructive"
      });
    }
  };
  
  const handleProceedToCheckout = () => {
    if (cart && cart.items.length > 0) {
      setIsCheckingOut(true);
    } else {
      toast({
        title: t("cart.emptyCart"),
        description: t("cart.emptyCartDescription"),
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 min-h-screen flex justify-center items-center">
          <LoadingSpinner size="lg" text={t("loading.loadingCart")} />
        </div>
      </Layout>
    );
  }
  
  if (!currentUser) {
    return null; // Redirection gérée dans useEffect
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <ShoppingCart className="mr-2 h-6 w-6" />
          {t("cart.yourCart")}
        </h1>
        
        {isCheckingOut ? (
          <CheckoutForm 
            cart={cart!} 
            onCancel={() => setIsCheckingOut(false)} 
            onSuccess={() => {
              // Redirige vers une page de confirmation après une commande réussie
              setIsCheckingOut(false);
              navigate('/order-confirmation');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="md:col-span-2">
              {!cart || cart.items.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">{t("cart.emptyCart")}</h2>
                      <p className="text-muted-foreground mb-6">
                        {t("cart.emptyCartDescription")}
                      </p>
                      <Button onClick={() => navigate('/bookshop')} className="px-6">
                        {t("cart.browseShop")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{t("cart.items")} ({cart.items.length})</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearCart}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("cart.clearCart")}
                    </Button>
                  </div>
                
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <Card key={item.bookId} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          {/* Image du livre */}
                          <div className="w-full sm:w-24 h-24 overflow-hidden">
                            <img 
                              src={item.coverImage || '/placeholder.svg'} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Détails de l'article */}
                          <CardContent className="flex-1 py-3 sm:py-4">
                            <div className="flex flex-col sm:flex-row justify-between h-full">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">par {item.author}</p>
                                <p className="font-medium mt-1">{item.price.toFixed(2)} €</p>
                              </div>
                              
                              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                {/* Contrôles de quantité */}
                                <div className="flex items-center">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleUpdateQuantity(item.bookId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center mx-1">
                                    {item.quantity}
                                  </span>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {/* Sous-total pour cet article */}
                                <div className="text-right w-20">
                                  <span className="font-semibold">
                                    {(item.price * item.quantity).toFixed(2)} €
                                  </span>
                                </div>
                                
                                {/* Bouton de suppression */}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleRemoveItem(item.bookId)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Résumé de la commande */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t("cart.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                      <span>{cart ? cart.totalAmount.toFixed(2) : "0.00"} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("cart.shipping")}</span>
                      <span>{t("cart.shippingFree")}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t("cart.total")}</span>
                      <span>{cart ? cart.totalAmount.toFixed(2) : "0.00"} €</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {t("cart.taxesIncluded")} {t("cart.shippingCalculatedLater")}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!cart || cart.items.length === 0}
                    onClick={handleProceedToCheckout}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t("cart.proceedToPayment")}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/bookshop')}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {t("cart.continueShopping")}
                  </Button>
                  
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      {t("cart.itemsNotReserved")} {t("cart.finalizeOrder")} {t("cart.guaranteeAvailability")}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 