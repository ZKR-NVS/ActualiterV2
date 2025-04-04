import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCart } from '@/lib/contexts/CartContext';
import { updateCartItemQuantity, removeFromCart, clearCart, Cart } from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CreditCard, AlertTriangle, User } from 'lucide-react';
import CheckoutForm from '@/components/bookshop/CheckoutForm';
import GuestCheckoutForm from '@/components/bookshop/GuestCheckoutForm';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Fonction pour sécuriser les données du panier
const safeCartItems = (cart: Cart & { id: string; } | null): (Cart & { id: string; }) | null => {
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
  
  return safeCopy as Cart & { id: string; };
};

export default function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { cart, loading: cartLoading, refetchCart } = useCart();
  const { t } = useLanguage();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [localCart, setLocalCart] = useState<{items: any[], totalAmount: number} | null>(null);
  
  useEffect(() => {
    // Si l'utilisateur est connecté, utiliser le panier du contexte
    if (currentUser && cart) {
      const initialQuantities: Record<string, number> = {};
      cart.items.forEach(item => {
        initialQuantities[item.bookId] = item.quantity;
      });
      setQuantities(initialQuantities);
      setLocalCart(null);
    } 
    // Si utilisateur non connecté, vérifier s'il y a un panier dans le localStorage
    else if (!currentUser) {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setLocalCart(parsedCart);
        
        const localQuantities: Record<string, number> = {};
        parsedCart.items.forEach((item: any) => {
          localQuantities[item.bookId] = item.quantity;
        });
        setQuantities(localQuantities);
      } else {
        // Initialiser un panier vide pour les invités
        setLocalCart({
          items: [],
          totalAmount: 0
        });
      }
    }
  }, [currentUser, cart]);
  
  const handleUpdateQuantity = async (bookId: string, quantity: number) => {
    if (currentUser && cart) {
    // Mettre à jour localement d'abord pour une interface réactive
    const newQuantities = { ...quantities, [bookId]: quantity };
    setQuantities(newQuantities);
    
    try {
      await updateCartItemQuantity(currentUser.uid, bookId, quantity);
      await refetchCart(); // Mettre à jour l'état global du panier
      
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
    } 
    // Pour les invités, mettre à jour le panier local
    else if (localCart) {
      const newQuantities = { ...quantities, [bookId]: quantity };
      setQuantities(newQuantities);
      
      const updatedItems = [...localCart.items];
      const itemIndex = updatedItems.findIndex(item => item.bookId === bookId);
      
      if (quantity <= 0) {
        // Supprimer l'article si quantité <= 0
        if (itemIndex >= 0) {
          updatedItems.splice(itemIndex, 1);
        }
      } else {
        // Mettre à jour la quantité
        if (itemIndex >= 0) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity
          };
        }
      }
      
      // Recalculer le montant total
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      const updatedCart = {
        items: updatedItems,
        totalAmount
      };
      
      setLocalCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      
      toast({
        title: t("cart.quantityUpdated"),
        description: t("cart.quantityUpdatedSuccess")
      });
    }
  };
  
  const handleRemoveItem = async (bookId: string) => {
    if (currentUser && cart) {
    try {
      await removeFromCart(currentUser.uid, bookId);
      await refetchCart(); // Mettre à jour l'état global du panier
      
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
    }
    // Pour les invités, supprimer du panier local
    else if (localCart) {
      const updatedItems = localCart.items.filter(item => item.bookId !== bookId);
      
      // Recalculer le montant total
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      const updatedCart = {
        items: updatedItems,
        totalAmount
      };
      
      setLocalCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      
      toast({
        title: t("cart.itemRemoved"),
        description: t("cart.itemRemovedSuccess")
      });
    }
  };
  
  const handleClearCart = async () => {
    if (currentUser && cart && cart.items.length > 0) {
    try {
      await clearCart(currentUser.uid);
      await refetchCart(); // Mettre à jour l'état global du panier
      
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
    }
    // Pour les invités, vider le panier local
    else if (localCart && localCart.items.length > 0) {
      const emptyCart = {
        items: [],
        totalAmount: 0
      };
      
      setLocalCart(emptyCart);
      localStorage.setItem('guestCart', JSON.stringify(emptyCart));
      
      toast({
        title: t("cart.cartCleared"),
        description: t("cart.cartClearedSuccess")
      });
    }
  };
  
  const handleProceedToCheckout = () => {
    const activeCart = currentUser ? cart : localCart;
    
    if (activeCart && activeCart.items.length > 0) {
      if (currentUser) {
      setIsCheckingOut(true);
        setIsGuestCheckout(false);
      } else {
        // Proposer la connexion ou l'achat en tant qu'invité
        setIsGuestCheckout(false);
        navigate('/login', { state: { returnTo: '/cart' } });
      }
    } else {
      toast({
        title: t("cart.emptyCart"),
        description: t("cart.emptyCartDescription"),
        variant: "destructive"
      });
    }
  };
  
  const handleGuestCheckout = () => {
    if (localCart && localCart.items.length > 0) {
      setIsGuestCheckout(true);
      setIsCheckingOut(false);
    } else {
      toast({
        title: t("cart.emptyCart"),
        description: t("cart.emptyCartDescription"),
        variant: "destructive"
      });
    }
  };
  
  if (cartLoading && currentUser) {
    return (
      <Layout>
        <div className="container mx-auto py-8 min-h-screen flex justify-center items-center">
          <LoadingSpinner size="lg" text={t("loading.loadingCart")} />
        </div>
      </Layout>
    );
  }
  
  const activeCart = currentUser ? cart : localCart;
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <ShoppingCart className="mr-2 h-6 w-6" />
          {t("cart.yourCart")}
        </h1>
        
        {isCheckingOut && currentUser && cart ? (
          <CheckoutForm 
            cart={cart} 
            onCancel={() => setIsCheckingOut(false)} 
            onSuccess={() => {
              // Redirige vers une page de confirmation après une commande réussie
              setIsCheckingOut(false);
              navigate('/order-confirmation');
            }}
          />
        ) : isGuestCheckout && localCart ? (
          <GuestCheckoutForm
            items={localCart.items}
            totalAmount={localCart.totalAmount}
            onCancel={() => setIsGuestCheckout(false)}
            onSuccess={(orderId, email) => {
              // Vider le panier local après une commande réussie
              localStorage.removeItem('guestCart');
              setLocalCart({
                items: [],
                totalAmount: 0
              });
              
              // Redirige vers une page de confirmation avec l'ID de commande et l'email
              setIsGuestCheckout(false);
              navigate('/order-confirmation', { 
                state: { 
                  orderId,
                  email,
                  isGuest: true
                } 
              });
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="md:col-span-2">
              {!activeCart || activeCart.items.length === 0 ? (
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
                <Card>
                  <CardHeader>
                    <CardTitle>{t("cart.cartItems")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {activeCart.items.map((item) => (
                        <div key={item.bookId} className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b">
                          <div className="flex-shrink-0">
                            <img 
                              src={item.coverImage || '/placeholder.svg'} 
                              alt={item.title} 
                              className="w-24 h-24 object-cover rounded"
                            />
                          </div>
                              <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.author}</p>
                            <div className="mt-2 flex items-center">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                onClick={() => handleUpdateQuantity(item.bookId, quantities[item.bookId] - 1)}
                                disabled={quantities[item.bookId] <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                              <Input
                                className="w-14 mx-2 text-center"
                                min="1"
                                type="number"
                                value={quantities[item.bookId] || 1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val >= 1) {
                                    handleUpdateQuantity(item.bookId, val);
                                  }
                                }}
                              />
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                onClick={() => handleUpdateQuantity(item.bookId, quantities[item.bookId] + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-medium">
                              {(item.price * (quantities[item.bookId] || item.quantity)).toFixed(2)} €
                                  </span>
                                <Button 
                                  variant="ghost" 
                              size="sm" 
                              className="text-red-500 h-auto p-1"
                                  onClick={() => handleRemoveItem(item.bookId)}
                                >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t("cart.remove")}
                                </Button>
                              </div>
                        </div>
                    ))}
                  </div>
                  </CardContent>
                  <CardFooter className="flex flex-col md:flex-row justify-between gap-4">
                    <Button variant="outline" onClick={handleClearCart}>
                      {t("cart.clearCart")}
                    </Button>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t("cart.subtotal")}</p>
                      <p className="text-2xl font-bold">{activeCart.totalAmount.toFixed(2)} €</p>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            {/* Résumé et actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t("cart.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>{t("cart.subtotal")}</span>
                      <span>{(activeCart?.totalAmount || 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("cart.shipping")}</span>
                      <span>{t("cart.free")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>{t("cart.total")}</span>
                      <span>{(activeCart?.totalAmount || 0).toFixed(2)} €</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  {currentUser ? (
                  <Button 
                      className="w-full py-6" 
                    size="lg"
                    onClick={handleProceedToCheckout}
                      disabled={!activeCart || activeCart.items.length === 0}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                      {t("cart.proceedToCheckout")}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        className="w-full py-6" 
                        size="lg"
                        onClick={handleProceedToCheckout}
                        disabled={!activeCart || activeCart.items.length === 0}
                      >
                        <User className="mr-2 h-5 w-5" />
                        {t("cart.checkoutWithAccount")}
                  </Button>
                  
                  <Button 
                        className="w-full py-6" 
                        size="lg"
                        variant="secondary"
                        onClick={handleGuestCheckout}
                        disabled={!activeCart || activeCart.items.length === 0}
                  >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {t("cart.guestCheckout")}
                  </Button>
                  
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        {t("cart.guestCheckoutHint")}
                    </p>
                    </>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 