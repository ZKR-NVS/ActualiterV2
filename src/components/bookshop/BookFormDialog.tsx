import { useState, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Book, BookCategory, addBook, updateBook } from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ImagePlus, FileUp, FileText, Download, X } from 'lucide-react';

// Schéma de validation pour le formulaire de livre
const bookSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().min(1, 'L\'auteur est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.coerce.number().min(0.01, 'Le prix doit être supérieur à 0'),
  stock: z.coerce.number().int().min(0, 'Le stock ne peut pas être négatif'),
  category: z.string().min(1, 'La catégorie est requise'),
  isbn: z.string().optional(),
  publicationDate: z.string().optional(),
  publisher: z.string().optional(),
  pages: z.coerce.number().int().min(1, 'Le nombre de pages doit être positif').optional(),
  language: z.string().optional(),
  featured: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0, 'La remise ne peut pas être négative').max(100, 'La remise ne peut pas dépasser 100%').optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  categories: BookCategory[];
  onSave: (book: Book) => void;
}

export default function BookFormDialog({ 
  open, 
  onOpenChange, 
  book, 
  categories, 
  onSave 
}: BookFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(book?.coverImage || null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [hasPdf, setHasPdf] = useState(!!book?.pdfUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  // Formulaire avec validation
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: book ? {
      title: book.title,
      author: book.author,
      description: book.description || '',
      price: book.price,
      stock: book.stock,
      category: book.category,
      isbn: book.isbn || '',
      publicationDate: book.publicationDate || '',
      publisher: book.publisher || '',
      pages: book.pages || undefined,
      language: book.language || '',
      featured: book.featured || false,
      discountPercentage: book.discountPercentage || 0
    } : {
      title: '',
      author: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      isbn: '',
      publicationDate: '',
      publisher: '',
      language: 'Français',
      featured: false,
      discountPercentage: 0
    }
  });
  
  const onSubmit = async (data: BookFormValues) => {
    try {
      setIsSubmitting(true);
      
      const coverImageFile = fileInputRef.current?.files?.[0];
      
      if (book) {
        // Mettre à jour un livre existant
        const updatedBook = await updateBook(
          book.id!, 
          {
            ...data,
            coverImage: coverImagePreview || '/placeholder.svg'
          }, 
          coverImageFile,
          pdfFile
        );
        onSave(updatedBook);
      } else {
        // Ajouter un nouveau livre
        const newBook = await addBook(
          {
            ...data,
            coverImage: coverImagePreview || '/placeholder.svg'
          }, 
          coverImageFile,
          pdfFile
        );
        onSave(newBook);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du livre:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du livre. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setHasPdf(true);
    }
  };
  
  const removePdf = () => {
    setPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
    // Si le livre existant a un PDF, on le supprimera lors de la mise à jour
    setHasPdf(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book ? 'Modifier le livre' : 'Ajouter un nouveau livre'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Informations de base</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Le titre du livre" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auteur</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="L'auteur du livre" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Description du livre"
                          className="min-h-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Image de couverture */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Image de couverture</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="relative border rounded-md h-48 overflow-hidden flex items-center justify-center bg-accent/20">
                    {coverImagePreview ? (
                      <img 
                        src={coverImagePreview} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Aucune image sélectionnée
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2"
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      {coverImagePreview ? 'Changer l\'image' : 'Ajouter une image'}
                    </Button>
                    
                    {coverImagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCoverImagePreview(null)}
                        className="text-destructive hover:text-destructive"
                      >
                        Supprimer l'image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* PDF du livre */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Fichier PDF du livre</h3>
                
                <div className="border rounded-md p-4">
                  {hasPdf || pdfFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-primary mr-3" />
                        <div>
                          <p className="font-medium">{pdfFile ? pdfFile.name : "Fichier PDF disponible"}</p>
                          <p className="text-sm text-muted-foreground">
                            {pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB` : book?.pdfUrl ? "PDF existant" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {book?.pdfUrl && !pdfFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(book.pdfUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removePdf}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6">
                      <FileUp className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Aucun fichier PDF n'a été ajouté
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        ref={pdfInputRef}
                        onChange={handlePdfChange}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => pdfInputRef.current?.click()}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Ajouter un PDF
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Informations de prix et stock */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Prix et stock</h3>
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remise (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" max="100" />
                      </FormControl>
                      <FormDescription>
                        Pourcentage de remise sur le prix (0-100%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Mettre en vedette</FormLabel>
                        <FormDescription>
                          Afficher ce livre en priorité dans la boutique
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Informations complémentaires */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Détails du livre</h3>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id!}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="978-3-16-148410-0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Éditeur</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nom de l'éditeur" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publicationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de publication</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="2023" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de pages</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Langue</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une langue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Français">Français</SelectItem>
                          <SelectItem value="Anglais">Anglais</SelectItem>
                          <SelectItem value="Espagnol">Espagnol</SelectItem>
                          <SelectItem value="Allemand">Allemand</SelectItem>
                          <SelectItem value="Italien">Italien</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {book ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  <>{book ? 'Mettre à jour' : 'Créer'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 