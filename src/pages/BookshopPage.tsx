import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCart } from '@/lib/contexts/CartContext';
import { getAllBooks, getFeaturedBooks, getBooksByCategory, searchBooks, Book, getAllCategories, BookCategory, addToCart, CartItem } from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import BookCard from '@/components/bookshop/BookCard';
import BookFilter from '@/components/bookshop/BookFilter';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

// Fonction pour sécuriser l'affichage de données Firebase
const safeBookData = (books: Book[]): Book[] => {
  return books.map(book => {
    // Créer une copie sûre de l'objet livre
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
  });
};

export default function BookshopPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('tous');
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { refetchCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [allBooks, featured, allCategories] = await Promise.all([
          getAllBooks(),
          getFeaturedBooks(),
          getAllCategories()
        ]);
        // Sécuriser les données avant de les afficher
        setBooks(safeBookData(allBooks));
        setFeaturedBooks(safeBookData(featured));
        setCategories(allCategories);
      } catch (error) {
        console.error("Erreur lors du chargement des livres:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les livres. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  const handleCategoryChange = async (categoryId: string | null) => {
    try {
      setLoading(true);
      setSelectedCategory(categoryId);
      
      if (categoryId) {
        const categoryBooks = await getBooksByCategory(categoryId);
        // Sécuriser les données avant de les afficher
        setBooks(safeBookData(categoryBooks));
        setCurrentTab('tous');
      } else {
        const allBooks = await getAllBooks();
        // Sécuriser les données avant de les afficher
        setBooks(safeBookData(allBooks));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des livres par catégorie:", error);
      toast({
        title: "Erreur",
        description: "Impossible de filtrer les livres. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      const results = await searchBooks(searchTerm);
      // Sécuriser les données avant de les afficher
      setBooks(safeBookData(results));
      setCurrentTab('tous');
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "La recherche a échoué. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (book: Book) => {
    if (!currentUser) {
      // Au lieu d'exiger une connexion, ajouter au panier local
      const cartItem: CartItem = {
        bookId: book.id!,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: 1,
        coverImage: book.coverImage
      };
      
      // Récupérer le panier local existant ou en créer un nouveau
      const savedCart = localStorage.getItem('guestCart');
      let guestCart = savedCart ? JSON.parse(savedCart) : { items: [], totalAmount: 0 };
      
      // Vérifier si le livre est déjà dans le panier
      const existingItemIndex = guestCart.items.findIndex((item: any) => item.bookId === book.id);
      
      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité si le livre est déjà dans le panier
        guestCart.items[existingItemIndex].quantity += 1;
      } else {
        // Ajouter le nouvel élément
        guestCart.items.push(cartItem);
      }
      
      // Recalculer le montant total
      guestCart.totalAmount = guestCart.items.reduce(
        (sum: number, item: any) => sum + (item.price * item.quantity), 
        0
      );
      
      // Sauvegarder le panier dans localStorage
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      
      // S'assurer que le titre du livre existe et n'est pas undefined
      const bookTitle = book?.title || t("shop.unknownBook");
      
      toast({
        title: t("shop.addedToCart"),
        description: `${bookTitle} ${t("shop.hasBeenAddedToCart")}`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/cart')}
            className="mt-2"
          >
            {t("shop.viewCart")}
          </Button>
        )
      });
      
      return;
    }

    try {
      const cartItem: CartItem = {
        bookId: book.id!,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: 1,
        coverImage: book.coverImage
      };
      
      await addToCart(currentUser.uid, cartItem);
      // Mettre à jour le panier global
      await refetchCart();
      
      // S'assurer que le titre du livre existe et n'est pas undefined
      const bookTitle = book?.title || t("shop.unknownBook");
      
      toast({
        title: t("shop.addedToCart"),
        description: `${bookTitle} ${t("shop.hasBeenAddedToCart")}`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/cart')}
            className="mt-2"
          >
            {t("shop.viewCart")}
          </Button>
        )
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast({
        title: t("errors.error"),
        description: t("shop.errorAddingToCart"),
        variant: "destructive"
      });
    }
  };

  const resetFilters = async () => {
    try {
      setLoading(true);
      setSelectedCategory(null);
      setSearchTerm('');
      
      const allBooks = await getAllBooks();
      // Sécuriser les données avant de les afficher
      setBooks(safeBookData(allBooks));
      setCurrentTab('tous');
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des filtres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les filtres. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar de filtrage */}
          <div className="w-full md:w-64 lg:w-72">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">{t("shop.filters")}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("shop.search")}</label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder={t("shop.titleAuthor")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button size="icon" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <BookFilter 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                  
                  <Separator />
                  
                  <Button variant="outline" onClick={resetFilters} className="w-full">
                    {t("shop.resetFilters")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Liste des livres */}
          <div className="flex-1">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t("shop.title")}</h1>
                <TabsList>
                  <TabsTrigger value="tous">{t("shop.all")}</TabsTrigger>
                  <TabsTrigger value="vedette">{t("shop.featured")}</TabsTrigger>
                </TabsList>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoadingSpinner size="lg" text={t("shop.loadingBooks")} />
                </div>
              ) : (
                <>
                  <TabsContent value="tous" className="mt-0">
                    {books.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-lg text-muted-foreground">{t("shop.noBooksFound")}</p>
                        <Button variant="outline" onClick={resetFilters} className="mt-4">
                          {t("shop.showAllBooks")}
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book) => (
                          <BookCard 
                            key={book.id} 
                            book={book} 
                            onAddToCart={() => handleAddToCart(book)} 
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="vedette" className="mt-0">
                    {featuredBooks.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-lg text-muted-foreground">{t("shop.noFeaturedBooks")}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredBooks.map((book) => (
                          <BookCard 
                            key={book.id} 
                            book={book} 
                            onAddToCart={() => handleAddToCart(book)} 
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
} 