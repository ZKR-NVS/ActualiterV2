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
  publicationDate: z.string().min(1, 'La date de publication est requise'),
  publisher: z.string().min(1, 'L\'éditeur est requis'),
  pages: z.coerce.number().int().min(1, 'Le nombre de pages doit être positif'),
  language: z.string().min(1, 'La langue est requise'),
  featured: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0, 'La remise ne peut pas être négative').max(100, 'La remise ne peut pas dépasser 100%').optional(),
  coverImageUrl: z.string().url('Entrez une URL valide').optional(),
  pdfUrl: z.string().url('Entrez une URL valide').optional(),
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
  const [useExternalImage, setUseExternalImage] = useState<boolean>(false);
  const [useExternalPdf, setUseExternalPdf] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // Formulaire avec validation
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: book ? {
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      price: book.price || 0,
      stock: book.stock || 0,
      category: book.category || '',
      isbn: book.isbn || '',
      publicationDate: book.publicationDate || '',
      publisher: book.publisher || '',
      pages: book.pages || undefined,
      language: book.language || '',
      featured: book.featured || false,
      discountPercentage: book.discountPercentage || 0,
      coverImageUrl: book.coverImage?.startsWith('http') ? book.coverImage : '',
      pdfUrl: book.pdfUrl || ''
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
      discountPercentage: null,
      coverImageUrl: '',
      pdfUrl: ''
    }
  });
  
  // Effet pour déterminer si une URL externe est utilisée pour l'image
  useEffect(() => {
    if (book) {
      // Mettre à jour les valeurs du formulaire à chaque fois que le livre change
      form.reset({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        price: book.price || 0,
        stock: book.stock || 0,
        category: book.category || '',
        isbn: book.isbn || '',
        publicationDate: book.publicationDate || '',
        publisher: book.publisher || '',
        pages: book.pages || undefined,
        language: book.language || '',
        featured: book.featured || false,
        discountPercentage: book.discountPercentage || 0,
        coverImageUrl: book.coverImage?.startsWith('http') ? book.coverImage : '',
        pdfUrl: book.pdfUrl || ''
      });
      
      // Si le livre a une image externe, l'afficher
      if (book.coverImage && book.coverImage.startsWith('http')) {
        setUseExternalImage(true);
        setCoverImagePreview(book.coverImage);
        
        // Tentative de pré-chargement de l'image
        const img = new Image();
        img.onload = () => {
          console.log("Image préchargée avec succès:", book.coverImage);
        };
        img.onerror = () => {
          console.log("Erreur lors du préchargement de l'image");
          setCoverImagePreview('/placeholder.svg');
        };
        img.src = book.coverImage;
      }
    }
  }, [book, form]);
  
  // Prévisualiser l'image à partir d'une URL
  const handlePreviewImage = () => {
    const coverImageUrl = form.getValues('coverImageUrl');
    if (!coverImageUrl) {
      toast({
        title: "URL manquante",
        description: "Veuillez entrer une URL d'image",
        variant: "destructive"
      });
      return;
    }

    // Vérifier si c'est un lien Postimages (solution recommandée)
    const isPostimages = coverImageUrl.includes('postimg.cc') || coverImageUrl.includes('postimages.org');
    
    console.log("URL à traiter:", coverImageUrl);
    
    // Afficher un message de chargement
    toast({
      title: "Chargement...",
      description: "Chargement de l'image...",
    });
    
    // Créer une nouvelle image pour tester le chargement
    const img = new Image();
    
    // Configurer les gestionnaires d'événements
    img.onload = () => {
      // L'image a été chargée avec succès
      setCoverImagePreview(coverImageUrl);
      setUseExternalImage(true);
      form.setValue("coverImageUrl", coverImageUrl);
      
      toast({
        title: "Image chargée",
        description: "Prévisualisation mise à jour avec succès",
        variant: "default"
      });
    };
    
    img.onerror = () => {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'image. Vérifiez que l'URL est correcte.",
        variant: "destructive"
      });
      
      // Recommander Postimages si ce n'est pas déjà un lien Postimages
      if (!isPostimages) {
        setTimeout(() => {
          toast({
            title: "Solution recommandée",
            description: "Utilisez Postimages.org pour héberger vos images.",
            variant: "default"
          });
        }, 1000);
      }
    };
    
    // Charger l'image
    img.src = coverImageUrl;
  };
  
  const onSubmit = useCallback(
    async (data: BookFormValues) => {
      if (!open) return;
      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        // Convertir le lien Google Drive si nécessaire
        const processedCoverImageUrl = data.coverImageUrl || '';
        const processedPdfUrl = data.pdfUrl || '';
        
        // Données de base du livre
        const bookData: Partial<Book> = {
          title: data.title,
          author: data.author,
          description: data.description || '',
          publicationDate: data.publicationDate ? data.publicationDate : new Date().getFullYear().toString(),
          isbn: data.isbn || '',
          language: data.language || 'fr',
          pages: data.pages ? Number(data.pages) : 0,
          publisher: data.publisher || '',
          category: data.category,
          // Utiliser l'URL modifiée si disponible
          coverImage: useExternalImage && processedCoverImageUrl ? processedCoverImageUrl : (coverImagePreview || '/placeholder.svg'),
          rating: 0,
          reviewCount: 0,
          price: data.price ? Number(data.price) : 0,
          stock: data.stock ? Number(data.stock) : 0,
          featured: data.featured || false,
          discountPercentage: data.discountPercentage && data.discountPercentage > 0 ? data.discountPercentage : null,
          pdfUrl: useExternalPdf && processedPdfUrl ? processedPdfUrl : (book?.pdfUrl || '')
        };

        if (book) {
          // Mettre à jour un livre existant
          const updatedBook = await updateBook(
            book.id!, 
            bookData, 
            null, 
            null
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
            bookData as Omit<Book, 'id' | 'createdAt' | 'updatedAt'>, 
            null, 
            null
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
        
        // Message d'erreur général
        setSubmissionError(`Une erreur s'est produite: ${error?.message || 'Erreur inconnue'}`);
        toast({
          title: 'Erreur',
          description: `Une erreur s'est produite lors de la création du livre: ${error?.message || 'Erreur inconnue'}`,
          variant: "destructive"
        });
      } finally {
        // Toujours réinitialiser l'état de soumission, qu'il y ait une erreur ou non
        setIsSubmitting(false);
      }
    },
    [book, coverImagePreview, form, onOpenChange, onSave, toast, useExternalImage, useExternalPdf]
  );
  
  /**
   * Recadre l'image pour qu'elle s'adapte au ratio 3:4 (aspect-[3/4]) utilisé dans l'application
   * et retourne l'URL de l'image recadrée
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
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="useExternalImage"
                      checked={useExternalImage}
                      onCheckedChange={(checked) => {
                        if (checked === true || checked === false) {
                          setUseExternalImage(checked);
                        }
                      }}
                    />
                    <label 
                      htmlFor="useExternalImage"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Utiliser une URL externe pour l'image
                    </label>
                  </div>
                  
                  <FormDescription className="text-xs">
                    Pour utiliser une image depuis Postimages :
                    1. Uploadez votre image sur <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Postimages.org</a>
                    2. Copiez le lien "Direct link" et collez-le ici
                  </FormDescription>
                  
                  {useExternalImage && (
                    <>
                      <FormField
                        control={form.control}
                        name="coverImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de l'image</FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                <Input {...field} placeholder="https://postimages.org/..." className="flex-1" />
                    <Button
                      type="button"
                                  variant="secondary" 
                                  onClick={handlePreviewImage}
                    >
                                  Prévisualiser
                    </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Collez le lien direct de l'image depuis Postimages (ou toute autre URL d'image)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                    {coverImagePreview && (
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto">
                            <img 
                              src={coverImagePreview}
                              alt="Prévisualisation" 
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                // En cas d'erreur, essayer avec un proxy CORS
                                console.log("Erreur de chargement de l'image, tentative avec proxy CORS");
                                const originalSrc = e.currentTarget.src;
                                
                                // Si on n'utilise pas déjà un proxy, essayer avec le proxy
                                if (!originalSrc.includes("cors-anywhere")) {
                                  const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${originalSrc}`;
                                  e.currentTarget.src = corsProxyUrl;
                                } else {
                                  // Si ça échoue même avec le proxy, utiliser une image de placeholder
                                  e.currentTarget.src = '/placeholder.svg';
                                  toast({
                                    title: "Erreur d'image",
                                    description: "Impossible d'afficher l'image. Vérifiez l'URL et les permissions d'accès.",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                      </>
                    )}
                </div>
              </div>
              
              {/* PDF du livre */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Fichier PDF du livre</h3>
                
                <div className="border rounded-md p-4">
                  <FormField
                    control={form.control}
                    name="pdfUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL du PDF externe</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://exemple.com/livre.pdf" 
                          />
                        </FormControl>
                        <FormDescription>
                          Entrez l'URL d'un fichier PDF accessible publiquement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Veuillez utiliser un service externe comme Postimages, Dropbox ou autre pour héberger votre PDF et coller l'URL publique ci-dessus.</p>
                  </div>
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