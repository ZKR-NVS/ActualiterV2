import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCart } from '@/lib/contexts/CartContext';
import { 
  getBookById, 
  Book, 
  addToCart, 
  CartItem, 
  getUserOrders,
  Order
} from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  BookOpen, 
  Calendar, 
  Building, 
  Languages,
  FileText,
  Download,
  Lock
} from 'lucide-react';

// Fonction pour sécuriser l'affichage de données Firebase
const safeData = (book: Book | null): Book | null => {
  if (!book) return null;

  // Crée une copie sûre de l'objet livre
  const safeCopy = { ...book };
  
  // Si createdAt est un objet Timestamp, convertit-le en chaîne
  if (safeCopy.createdAt && typeof safeCopy.createdAt === 'object' && 'seconds' in safeCopy.createdAt) {
    try {
      // @ts-ignore - on ignore l'erreur car on sait que c'est un objet Timestamp
      safeCopy.createdAt = new Date(safeCopy.createdAt.seconds * 1000).toISOString();
    } catch (e) {
      safeCopy.createdAt = null;
    }
  }
  
  // Si updatedAt est un objet Timestamp, convertit-le en chaîne
  if (safeCopy.updatedAt && typeof safeCopy.updatedAt === 'object' && 'seconds' in safeCopy.updatedAt) {
    try {
      // @ts-ignore - on ignore l'erreur car on sait que c'est un objet Timestamp
      safeCopy.updatedAt = new Date(safeCopy.updatedAt.seconds * 1000).toISOString();
    } catch (e) {
      safeCopy.updatedAt = null;
    }
  }
  
  return safeCopy;
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { refetchCart } = useCart();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  
  // Vérifier si l'utilisateur a acheté ce livre
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!currentUser || !id) return;
      
      try {
        setCheckingPurchase(true);
        // Récupérer les commandes de l'utilisateur
        const orders = await getUserOrders(currentUser.uid);
        
        // Vérifier si l'une des commandes contient ce livre
        const hasBookInOrders = orders.some(order => 
          // Vérifier uniquement les commandes livrées ou expédiées
          (order.status === 'delivered' || order.status === 'shipped') && 
          order.books.some(item => item.bookId === id)
        );
        
        setHasPurchased(hasBookInOrders);
      } catch (error) {
        console.error("Erreur lors de la vérification des achats:", error);
        // Par défaut, considérer que l'utilisateur n'a pas acheté le livre
        setHasPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    };
    
    checkPurchaseStatus();
  }, [currentUser, id]);
  
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const bookData = await getBookById(id);
        // Utiliser la fonction de sécurisation des données
        setBook(safeData(bookData));
      } catch (error) {
        console.error("Erreur lors du chargement du livre:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du livre. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [id, toast]);
  
  const handleAddToCart = async () => {
    if (!currentUser || !book) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles au panier.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Vérifier que le livre est sécurisé (sans Timestamps)
      const safeBook = safeData(book);
      if (!safeBook) {
        throw new Error("Impossible de traiter les données du livre");
      }
      
      const cartItem: CartItem = {
        bookId: safeBook.id!,
        title: safeBook.title,
        author: safeBook.author,
        price: safeBook.price,
        quantity: quantity,
        coverImage: safeBook.coverImage
      };
      
      await addToCart(currentUser.uid, cartItem);
      // Mettre à jour le panier global
      await refetchCart();
      
      toast({
        title: "Ajouté au panier",
        description: `${safeBook.title} (${quantity} exemplaire${quantity > 1 ? 's' : ''}) a été ajouté à votre panier.`
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le livre au panier. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const incrementQuantity = () => {
    if (book && quantity < book.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 min-h-screen flex justify-center items-center">
          <LoadingSpinner size="lg" text="Chargement des détails du livre..." />
        </div>
      </Layout>
    );
  }
  
  if (!book) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Livre non trouvé</h1>
          <p className="text-muted-foreground mb-6">Le livre que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/bookshop')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la boutique
          </Button>
        </div>
      </Layout>
    );
  }
  
  const hasDiscount = book.discountPercentage && book.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? book.price - (book.price * book.discountPercentage! / 100)
    : book.price;
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/bookshop')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la boutique
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image du livre */}
          <div className="flex flex-col">
            <div className="relative rounded-lg overflow-hidden border aspect-[3/4] bg-accent/10">
              <img 
                src={book.coverImage || '/placeholder.svg'} 
                alt={book.title} 
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {book.featured && (
                  <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">
                    En vedette
                  </Badge>
                )}
                
                {hasDiscount && (
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    -{book.discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Détails du livre */}
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-xl text-muted-foreground">par {book.author}</p>
            
            {/* Prix et stock */}
            <div className="mt-6">
              <div className="flex items-baseline">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-bold text-primary">{discountedPrice.toFixed(2)} €</span>
                    <span className="text-xl text-muted-foreground line-through ml-3">{book.price.toFixed(2)} €</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">{book.price.toFixed(2)} €</span>
                )}
              </div>
              
              <p className="mt-2">
                {book.stock > 10 ? (
                  <Badge variant="outline" className="bg-green-100">En stock</Badge>
                ) : book.stock > 0 ? (
                  <Badge variant="outline" className="bg-orange-100">Plus que {book.stock} en stock</Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100">Rupture de stock</Badge>
                )}
              </p>
            </div>
            
            {/* Sélecteur de quantité et bouton d'achat */}
            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium">Quantité :</span>
                <div className="flex items-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={book.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= book.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-16 text-center mx-2"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={incrementQuantity}
                    disabled={quantity >= book.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full py-6 text-lg" 
                disabled={book.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {book.stock === 0 ? "Indisponible" : "Ajouter au panier"}
              </Button>
            </div>
            
            {/* Bouton de téléchargement du PDF */}
            {book.pdfUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Format numérique</h3>
                <Button
                  variant={hasPurchased ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    if (!currentUser) {
                      toast({
                        title: "Connexion requise",
                        description: "Veuillez vous connecter pour accéder au PDF.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    if (hasPurchased) {
                      window.open(book.pdfUrl, '_blank');
                    } else {
                      toast({
                        title: "Accès limité",
                        description: "Vous devez acheter ce livre pour accéder au PDF. Ajoutez-le au panier et finalisez votre achat.",
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={checkingPurchase}
                >
                  {checkingPurchase ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Vérification...
                    </>
                  ) : hasPurchased ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le PDF
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      PDF disponible après achat
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {hasPurchased ? (
                    <span className="text-green-600 font-medium">✓ Vous avez acheté ce livre et pouvez télécharger le PDF.</span>
                  ) : (
                    <span>Un fichier PDF est disponible pour ce livre. <strong>Seulement les utilisateurs qui ont acheté ce livre peuvent le télécharger.</strong></span>
                  )}
                </p>
              </div>
            )}
            
            {/* Informations détaillées */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {book.description || "Aucune description disponible."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Informations supplémentaires */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Détails du livre</h2>
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Informations générales</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  {book.isbn && (
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">ISBN :</span>
                      <span>{book.isbn}</span>
                    </li>
                  )}
                  {book.pages && book.pages > 0 && (
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Nombre de pages :</span>
                      <span>{book.pages}</span>
                    </li>
                  )}
                  {book.language && (
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Langue :</span>
                      <span>{book.language}</span>
                    </li>
                  )}
                  {book.category && (
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie :</span>
                      <span>{book.category}</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Publication</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  {book.publisher && (
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Éditeur :</span>
                      <span>{book.publisher}</span>
                    </li>
                  )}
                  {book.publicationDate && (
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Date de publication :</span>
                      <span>{book.publicationDate}</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Informations d'achat</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Prix :</span>
                    <span className="font-medium">{book.price.toFixed(2)} €</span>
                  </li>
                  {hasDiscount && (
                    <>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Remise :</span>
                        <span className="text-red-500">{book.discountPercentage}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Prix final :</span>
                        <span className="font-bold">{discountedPrice.toFixed(2)} €</span>
                      </li>
                    </>
                  )}
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Disponibilité :</span>
                    <span>{book.stock > 0 ? `${book.stock} en stock` : 'Rupture de stock'}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 