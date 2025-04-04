import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllBooks, Book, deleteBook, getAllCategories, BookCategory, addCategory, deleteCategory } from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Search, Trash2, Edit, Eye, BookIcon, LayoutGrid, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookFormDialog from '@/components/bookshop/BookFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CategoryFormDialog from '@/components/bookshop/CategoryFormDialog';

export default function BookManagementPage() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookForm, setShowBookForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [currentTab, setCurrentTab] = useState('books');
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    fetchData();
  }, [isAdmin, navigate]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [allBooks, allCategories] = await Promise.all([
        getAllBooks(),
        getAllCategories()
      ]);
      setBooks(allBooks);
      setCategories(allCategories);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddBook = () => {
    setEditingBook(null);
    setShowBookForm(true);
  };
  
  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };
  
  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteBook(bookId);
      setBooks(books.filter(book => book.id !== bookId));
      
      toast({
        title: "Livre supprimé",
        description: "Le livre a été supprimé avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du livre:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le livre. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddCategory = () => {
    setShowCategoryForm(true);
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(category => category.id !== categoryId));
      
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const handleBookSaved = (savedBook: Book) => {
    setShowBookForm(false);
    
    if (editingBook) {
      // Mise à jour d'un livre existant
      setBooks(books.map(book => book.id === savedBook.id ? savedBook : book));
      toast({
        title: "Livre mis à jour",
        description: "Le livre a été mis à jour avec succès."
      });
    } else {
      // Ajout d'un nouveau livre
      setBooks([savedBook, ...books]);
      toast({
        title: "Livre ajouté",
        description: "Le livre a été ajouté avec succès."
      });
    }
  };
  
  const handleCategorySaved = (savedCategory: BookCategory) => {
    setShowCategoryForm(false);
    setCategories([...categories, savedCategory]);
    
    toast({
      title: "Catégorie ajoutée",
      description: "La catégorie a été ajoutée avec succès."
    });
  };
  
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 min-h-screen flex justify-center items-center">
          <LoadingSpinner size="lg" text="Chargement..." />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Gestion de la boutique</h1>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="books" className="flex items-center gap-1">
              <BookIcon className="h-4 w-4" />
              Livres
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Catégories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="books" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un livre..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <Button onClick={handleAddBook}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un livre
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-lg text-muted-foreground">
                    {searchTerm ? "Aucun livre ne correspond à votre recherche" : "Aucun livre disponible"}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-4">
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              ) : (
                filteredBooks.map(book => (
                  <Card key={book.id} className="overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={book.coverImage || '/placeholder.svg'} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => navigate(`/book/${book.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleEditBook(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action ne peut pas être annulée. Le livre sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBook(book.id!)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">par {book.author}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">{book.price.toFixed(2)} €</span>
                        <span className="text-sm text-muted-foreground">Stock: {book.stock}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Catégories</h2>
              <Button onClick={handleAddCategory}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une catégorie
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-lg text-muted-foreground">
                    Aucune catégorie disponible
                  </p>
                </div>
              ) : (
                categories.map(category => (
                  <Card key={category.id}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-base font-medium">{category.name}</CardTitle>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. La catégorie sera définitivement supprimée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id!)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardHeader>
                    <CardContent>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {category.description}
                        </p>
                      )}
                      <p className="text-sm">
                        Slug: <code className="bg-accent/30 px-1 rounded">{category.slug}</code>
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal pour ajouter/éditer un livre */}
      <BookFormDialog 
        open={showBookForm}
        onOpenChange={setShowBookForm}
        book={editingBook}
        categories={categories}
        onSave={handleBookSaved}
      />
      
      {/* Modal pour ajouter une catégorie */}
      <CategoryFormDialog 
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        onSave={handleCategorySaved}
      />
    </Layout>
  );
} 