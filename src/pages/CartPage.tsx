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

export default function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [cart, setCart] = useState<Cart & { id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }
      
      try {
        setLoading(true);
        const cartData = await getUserCart(currentUser.uid);
        setCart(cartData);
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre panier. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [currentUser, navigate, toast]);
  
  const handleUpdateQuantity = async (bookId: string, quantity: number) => {
    if (!currentUser || !cart) return;
    
    try {
      const updatedCart = await updateCartItemQuantity(currentUser.uid, bookId, quantity);
      setCart(updatedCart);
      
      toast({
        title: "Panier mis à jour",
        description: "La quantité a été mise à jour avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveItem = async (bookId: string) => {
    if (!currentUser || !cart) return;
    
    try {
      const updatedCart = await removeFromCart(currentUser.uid, bookId);
      setCart(updatedCart);
      
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé de votre panier."
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const handleClearCart = async () => {
    if (!currentUser || !cart) return;
    
    try {
      await clearCart(currentUser.uid);
      setCart({
        ...cart,
        items: [],
        totalAmount: 0,
        updatedAt: serverTimestamp()
      });
      
      toast({
        title: "Panier vidé",
        description: "Tous les articles ont été supprimés de votre panier."
      });
    } catch (error) {
      console.error("Erreur lors du vidage du panier:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vider le panier. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const handleProceedToCheckout = () => {
    if (cart && cart.items.length > 0) {
      setIsCheckingOut(true);
    } else {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles à votre panier avant de procéder au paiement.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 min-h-screen flex justify-center items-center">
          <LoadingSpinner size="lg" text="Chargement de votre panier..." />
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
          Votre Panier
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
                      <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
                      <p className="text-muted-foreground mb-6">
                        Parcourez notre boutique et ajoutez des livres à votre panier
                      </p>
                      <Button onClick={() => navigate('/bookshop')} className="px-6">
                        Parcourir la boutique
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Articles ({cart.items.length})</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearCart}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Vider le panier
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
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{cart ? cart.totalAmount.toFixed(2) : "0.00"} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span>Gratuite</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{cart ? cart.totalAmount.toFixed(2) : "0.00"} €</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Taxes incluses. Frais de livraison calculés à l'étape suivante.
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
                    Procéder au paiement
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/bookshop')}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continuer vos achats
                  </Button>
                  
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Les articles dans votre panier ne sont pas réservés. Finalisez votre commande pour garantir leur disponibilité.
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