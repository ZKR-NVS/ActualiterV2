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
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles au panier.",
        variant: "destructive"
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
      
      toast({
        title: "Ajouté au panier",
        description: `${book.title} a été ajouté à votre panier.`
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
                <h2 className="text-xl font-semibold mb-4">Filtres</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rechercher</label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Titre, auteur..."
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
                    Réinitialiser les filtres
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Liste des livres */}
          <div className="flex-1">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Boutique de Livres</h1>
                <TabsList>
                  <TabsTrigger value="tous">Tous</TabsTrigger>
                  <TabsTrigger value="vedette">En vedette</TabsTrigger>
                </TabsList>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoadingSpinner size="lg" text="Chargement des livres..." />
                </div>
              ) : (
                <>
                  <TabsContent value="tous" className="mt-0">
                    {books.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-lg text-muted-foreground">Aucun livre trouvé</p>
                        <Button variant="outline" onClick={resetFilters} className="mt-4">
                          Afficher tous les livres
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
                        <p className="text-lg text-muted-foreground">Aucun livre en vedette pour le moment</p>
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