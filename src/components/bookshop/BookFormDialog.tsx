import { useState, useRef, useEffect, useCallback } from 'react';
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
import { ImagePlus, FileUp, FileText, Download, X, Crop } from 'lucide-react';

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
  const [isCropping, setIsCropping] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
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
  
  const onSubmit = useCallback(
    async (data: BookFormValues) => {
      if (!open) return;
      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        const coverImageFile = fileInputRef.current?.files?.[0];
        
        const bookData = {
          title: data.title,
          author: data.author,
          description: data.description || '',
          publicationDate: data.publicationDate ? new Date(data.publicationDate) : new Date(),
          isbn: data.isbn || '',
          language: data.language || 'fr',
          pages: data.pages ? Number(data.pages) : 0,
          publisher: data.publisher || '',
          categories: data.category ? [data.category] : [],
          coverImage: coverImagePreview || '/placeholder.svg',
          rating: 0,
          reviewCount: 0,
          price: data.price ? Number(data.price) : 0,
          stock: data.stock ? Number(data.stock) : 0,
          pdfUrl: data.pdfUrl || '',
          featured: data.featured || false,
          discountPercentage: data.discountPercentage || 0
        };

        // Assurer que toutes les propriétés requises sont définies
        const completeData = {
          ...bookData,
          coverImage: bookData.coverImage || '/placeholder.svg',
        } as Book;

        if (book) {
          // Mettre à jour un livre existant
          const updatedBook = await updateBook(
            book.id!, 
            completeData, 
            coverImageFile,
            pdfFile
          ).catch(error => {
            console.error("Erreur lors de la mise à jour du livre:", error);
            throw error;
          });
          onSave(updatedBook as Book);

          toast({
            title: "Livre mis à jour",
            description: `Le livre "${data.title}" a été mis à jour avec succès.`,
            variant: "default"
          });
        } else {
          // Ajouter un nouveau livre
          const newBook = await addBook(
            completeData, 
            coverImageFile,
            pdfFile
          ).catch(error => {
            console.error("Erreur lors de l'ajout du livre:", error);
            throw error;
          });
          onSave(newBook as Book);

          toast({
            title: "Livre créé",
            description: `Le livre "${data.title}" a été créé avec succès.`,
            variant: "default"
          });
        }

        // Réinitialiser les champs du formulaire et fermer le modal
        form.reset();
        setCoverImagePreview(null);
        setPdfFile(null);
        onOpenChange(false);
      } catch (error: any) {
        console.error('Erreur lors de la soumission:', error);
        
        // Message d'erreur spécifique pour les erreurs CORS de Firebase Storage
        if (error?.message?.includes('cors') || error?.message?.includes('CORS')) {
          setSubmissionError('Erreur lors du téléchargement de l\'image. Le livre a été créé avec l\'image par défaut.');
          toast({
            title: 'Avertissement',
            description: 'Problème de CORS lors du téléchargement de l\'image. Le livre a été créé avec l\'image par défaut.',
            variant: "default"
          });
        } else {
          // Message d'erreur général
          setSubmissionError(`Une erreur s'est produite: ${error?.message || 'Erreur inconnue'}`);
          toast({
            title: 'Erreur',
            description: `Une erreur s'est produite lors de la création du livre: ${error?.message || 'Erreur inconnue'}`,
            variant: "destructive"
          });
        }
      } finally {
        // Toujours réinitialiser l'état de soumission, qu'il y ait une erreur ou non
        setIsSubmitting(false);
      }
    },
    [book, coverImagePreview, pdfFile, onOpenChange, form, toast]
  );
  
  /**
   * Recadre l'image pour qu'elle s'adapte au ratio 3:4 (aspect-[3/4]) utilisé dans l'application
   * @param imageDataUrl L'URL de données de l'image
   * @returns Une promesse qui se résout en une URL de données de l'image recadrée
   */
  const cropImageToRatio = (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        // Dimensions cibles: ratio 3:4
        const targetRatio = 3 / 4;
        let cropWidth = image.width;
        let cropHeight = image.height;
        let offsetX = 0;
        let offsetY = 0;
        
        // Calculer les dimensions de recadrage pour atteindre le ratio cible
        const currentRatio = image.width / image.height;
        
        if (currentRatio > targetRatio) {
          // Image trop large, recadrer les côtés
          cropWidth = image.height * targetRatio;
          offsetX = (image.width - cropWidth) / 2;
        } else if (currentRatio < targetRatio) {
          // Image trop haute, recadrer le haut et le bas
          cropHeight = image.width / targetRatio;
          offsetY = (image.height - cropHeight) / 2;
        }
        
        // Créer un canvas pour le recadrage
        const canvas = document.createElement('canvas');
        // Définir une taille raisonnable pour l'image stockée (pour réduire la taille du fichier)
        const maxDimension = 800;
        let canvasWidth = cropWidth;
        let canvasHeight = cropHeight;
        
        // Redimensionner si nécessaire
        if (cropWidth > maxDimension || cropHeight > maxDimension) {
          if (cropWidth > cropHeight) {
            canvasWidth = maxDimension;
            canvasHeight = (cropHeight / cropWidth) * maxDimension;
          } else {
            canvasHeight = maxDimension;
            canvasWidth = (cropWidth / cropHeight) * maxDimension;
          }
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Dessiner l'image recadrée sur le canvas
          ctx.drawImage(
            image, 
            offsetX, offsetY, cropWidth, cropHeight, // Source
            0, 0, canvasWidth, canvasHeight // Destination
          );
          
          // Convertir le canvas en URL de données
          const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve(croppedImageUrl);
        } else {
          // Fallback si le contexte 2D n'est pas disponible
          resolve(imageDataUrl);
        }
      };
      
      image.src = imageDataUrl;
    });
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;
        setOriginalImage(imageDataUrl);
        
        // Appliquer le recadrage automatique
        const croppedImageUrl = await cropImageToRatio(imageDataUrl);
        setCoverImagePreview(croppedImageUrl);
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
                  <div className="relative border rounded-md aspect-[3/4] overflow-hidden flex items-center justify-center bg-accent/20">
                    {coverImagePreview ? (
                      <img 
                        ref={imageRef}
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
                      <>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCoverImagePreview(null)}
                          className="text-destructive hover:text-destructive mb-2"
                      >
                          <X className="mr-2 h-4 w-4" />
                        Supprimer l'image
                      </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          L'image sera automatiquement recadrée au format 3:4 pour s'adapter parfaitement au cadre d'affichage.
                        </p>
                      </>
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
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>{book ? 'Mise à jour...' : 'Création...'}</span>
                  </div>
                ) : (
                  book ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 