import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon, Upload, X, Crop, Maximize2, Link } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactCrop, { Crop as CropType, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadImage } from "@/lib/services/imageService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Définir le schéma de validation pour le formulaire
const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
  content: z.string().min(20, { message: "Le contenu doit contenir au moins 20 caractères" }),
  author: z.string().min(2, { message: "L'auteur doit être spécifié" }),
  verificationStatus: z.enum(["true", "false", "partial"]),
  image: z.string().optional(),
  externalImageUrl: z.string().optional()
});

// Fonction pour convertir un lien Google Drive en lien direct
const convertGoogleDriveLink = (url: string): string => {
  if (!url) return url;
  
  // Vérifier si c'est un lien Google Drive
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    // Extraire l'ID et créer un lien direct
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url; // Retourner l'URL originale si ce n'est pas un lien Google Drive
};

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormDialogProps {
  onSubmit: (article: any) => void;
  isEditMode?: boolean;
  articleToEdit?: any;
  title?: string;
  submitButtonText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ArticleFormDialog = ({
  onSubmit,
  isEditMode = false, 
  articleToEdit = null,
  title = "Créer un nouvel article",
  submitButtonText = "Créer l'article",
  open,
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(open || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(isEditMode && articleToEdit?.image ? articleToEdit.image : null);
  const [imageUrl, setImageUrl] = useState<string>(isEditMode && articleToEdit?.image ? articleToEdit.image : "");
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [useExternalImage, setUseExternalImage] = useState<boolean>(false);
  const [externalImageUrl, setExternalImageUrl] = useState<string>("");

  const defaultValues = isEditMode && articleToEdit 
    ? {
        title: articleToEdit.title,
        content: articleToEdit.content || articleToEdit.excerpt || "",
        author: articleToEdit.author,
        verificationStatus: articleToEdit.verificationStatus,
        image: articleToEdit.image || "",
        externalImageUrl: ""
      }
    : {
        title: "",
        content: "",
        author: "",
        verificationStatus: "partial",
        image: "",
        externalImageUrl: ""
      };

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);
  
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen) {
      form.reset();
      setImagePreview(null);
      setImageUrl("");
      setCrop(undefined);
      setCompletedCrop(undefined);
      setIsCropping(false);
      setUseExternalImage(false);
      setExternalImageUrl("");
    }
  };

  // Fonction pour prévisualiser l'image à partir d'une URL externe
  const handleExternalImagePreview = (url: string) => {
    if (!url) {
      toast.error("Veuillez entrer une URL d'image valide");
      return;
    }
    
    // Vérifier si c'est un lien ImgBB (solution recommandée)
    const isImgBB = url.includes('i.ibb.co') || url.includes('imgbb.com');
    
    // Convertir le lien Google Drive en lien direct si nécessaire
    const convertedUrl = convertGoogleDriveLink(url);
    
    console.log("URL convertie:", convertedUrl); // Log pour le débogage
    
    // Afficher immédiatement un message de chargement
    toast.info(isImgBB 
      ? "Chargement de l'image depuis ImgBB..." 
      : "Tentative de chargement de l'image..."
    );
    
    // Vérifier si l'image peut être chargée avant de mettre à jour l'état
    const img = new Image();
    
    // Configurer les gestionnaires d'événements avant de définir la source
    img.onload = () => {
      // L'image a été chargée avec succès
      setExternalImageUrl(convertedUrl);
      setImagePreview(convertedUrl);
      setUseExternalImage(true);
      form.setValue("externalImageUrl", convertedUrl);
      toast.success(isImgBB 
        ? "Image ImgBB chargée avec succès !" 
        : "Image chargée avec succès"
      );
    };
    
    img.onerror = () => {
      // Si c'est déjà un lien ImgBB, il ne devrait pas y avoir d'erreur CORS
      if (isImgBB) {
        toast.error("Impossible de charger l'image ImgBB. Vérifiez que le lien est correct et réessayez.");
        return;
      }
      
      // Tentative alternative avec un proxy CORS si c'est Google Drive
      const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${convertedUrl}`;
      console.log("Tentative avec proxy CORS:", corsProxyUrl);
      
      toast.info("Premier essai échoué. Tentative avec un proxy CORS. Nous recommandons d'utiliser ImgBB à la place de Google Drive.");
      
      // Deuxième tentative avec proxy
      const imgWithProxy = new Image();
      
      imgWithProxy.onload = () => {
        setExternalImageUrl(corsProxyUrl);
        setImagePreview(corsProxyUrl);
        setUseExternalImage(true);
        form.setValue("externalImageUrl", convertedUrl); // Garder l'URL originale dans le formulaire
        toast.success("Image chargée via proxy CORS. Pour une solution plus fiable, utilisez ImgBB.");
      };
      
      imgWithProxy.onerror = () => {
        toast.error("Impossible de charger l'image. Pour éviter ce problème, nous vous recommandons d'utiliser ImgBB (voir README).");
        
        // Afficher un message explicatif avec un lien vers ImgBB
        setTimeout(() => {
          toast.info("Utilisez ImgBB.com pour héberger vos images sans problèmes CORS.");
        }, 1000);
      };
      
      // Appliquer un délai avant de charger l'image avec proxy
      setTimeout(() => {
        imgWithProxy.crossOrigin = "anonymous";
        imgWithProxy.src = corsProxyUrl;
      }, 300);
    };
    
    // Appliquer un timeout pour éviter les problèmes de CORS avec certaines images
    setTimeout(() => {
      img.crossOrigin = "anonymous"; // Tenter d'éviter les problèmes CORS
      img.src = convertedUrl;
    }, 200);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("L'image est trop volumineuse (max 5MB)");
      return;
    }

    // Create a temporary URL for preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIsCropping(true);
    setUseExternalImage(false);

    // Reset crop when new image is loaded
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 100,
        },
        16 / 9, // Aspect ratio 16:9
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
  ): Promise<{blob: Blob, previewUrl: string}> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        // Créer une URL temporaire pour l'aperçu
        const previewUrl = URL.createObjectURL(blob);
        resolve({ blob, previewUrl });
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    try {
      const { blob, previewUrl } = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-image.jpg'
      );
      
      // Stocker le blob pour l'upload ultérieur lors de la soumission
      setImageBlob(blob);
      
      // Utiliser l'URL de prévisualisation pour l'affichage uniquement
      setImagePreview(previewUrl);
      
      setIsCropping(false);
    } catch (error) {
      toast.error("Erreur lors du recadrage de l'image");
      console.error(error);
    }
  };

  const handleFormSubmit = async (values: ArticleFormValues) => {
    setIsSubmitting(true);
    
    try {
      let imageUrlToSubmit = "";
      
      // Si on utilise une URL externe
      if (useExternalImage && externalImageUrl) {
        imageUrlToSubmit = externalImageUrl;
      } 
      // Si on a une image à uploader (pas utile maintenant, mais gardé pour compatibilité)
      else if (imageBlob && !useExternalImage) {
        // Cette partie reste en place pour quand Firebase Storage sera disponible
        try {
          imageUrlToSubmit = await uploadImage(imageBlob);
        } catch (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
          toast.error("Erreur lors de l'upload de l'image. Utilisez plutôt une URL externe.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Article complet
      const articleData = {
        ...values,
        image: imageUrlToSubmit || imagePreview || values.image
      };
      
      await onSubmit(articleData);
      form.reset();
      handleOpenChange(false);
      toast.success(isEditMode ? "Article mis à jour avec succès!" : "Article créé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!onOpenChange && (
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
            {submitButtonText}
        </Button>
      </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6 md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                      <FormLabel>Titre de l'article</FormLabel>
                  <FormControl>
                        <Input {...field} placeholder="Entrez un titre captivant" className="text-lg" />
                  </FormControl>
                      <FormDescription>
                        Un titre clair qui résume le sujet principal
                      </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
              </div>
            
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auteur</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom de l'auteur" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
                name="verificationStatus"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Statut de vérification</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                  <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                  </FormControl>
                      <SelectContent>
                        <SelectItem value="true" className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          Vérifié Vrai
                        </SelectItem>
                        <SelectItem value="false" className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                          Vérifié Faux
                        </SelectItem>
                        <SelectItem value="partial" className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                          Partiellement Vrai
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            
            {/* Section d'image modifiée */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Image d'illustration</h3>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="link">URL d'image (recommandé)</TabsTrigger>
                  <TabsTrigger value="upload">Upload (limité)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="link" className="space-y-4">
                  <div className="space-y-2">
                    <FormItem>
                      <FormLabel>URL de l'image</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="https://drive.google.com/file/d/.../view" 
                            value={externalImageUrl}
                            onChange={(e) => setExternalImageUrl(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            onClick={() => handleExternalImagePreview(externalImageUrl)}
                            variant="secondary"
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Prévisualiser
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Pour utiliser Google Drive : uploadez l'image sur Drive, partagez-la (accessible avec le lien) et collez l'URL ici
                      </FormDescription>
                    </FormItem>
                    
                    {imagePreview && useExternalImage && (
                      <div className="relative mt-4 border rounded-md overflow-hidden aspect-video">
                        <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            setExternalImageUrl("");
                            setUseExternalImage(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-4">
                  <FormDescription className="text-amber-500">
                    ⚠️ L'upload d'images directement dans l'application n'est pas recommandé actuellement.
                    Utilisez plutôt l'option "URL d'image" avec Google Drive.
                  </FormDescription>
                  
                  {/* Garder le code existant pour l'upload comme option de secours */}
            <FormItem className="md:col-span-2">
              <FormLabel>Image de l'article</FormLabel>
              <div className={cn(
                "border-2 border-dashed rounded-lg p-4 transition-colors",
                imagePreview ? "border-primary/50 bg-primary/5" : "border-gray-300 hover:border-primary/50"
              )}>
                <div className="flex flex-col items-center justify-center space-y-2">
                  {!imagePreview ? (
                    <>
                      <div className="rounded-full bg-primary/10 p-2">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Glissez une image ou</p>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="mt-0"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          parcourez vos fichiers
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG ou GIF (max. 5MB)</p>
                    </>
                  ) : (
                    <div className="relative w-full">
                      {isCropping ? (
                        <div className="space-y-4">
                          <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={16 / 9}
                          >
                            <img
                              ref={imgRef}
                              src={imagePreview}
                              alt="Crop preview"
                              onLoad={onImageLoad}
                              className="max-h-[400px] w-full object-contain"
                            />
                          </ReactCrop>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setImagePreview(null);
                                setImageUrl("");
                                form.setValue("image", "");
                                setCrop(undefined);
                                setCompletedCrop(undefined);
                                setIsCropping(false);
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCropComplete}
                              disabled={!completedCrop}
                            >
                              Appliquer le recadrage
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="absolute top-2 right-2 z-10">
                            <Button 
                              type="button" 
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7 rounded-full"
                              onClick={() => {
                                setImagePreview(null);
                                setImageUrl("");
                                form.setValue("image", "");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="relative w-full h-48 rounded-md overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Aperçu" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex justify-center mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsCropping(true)}
                            >
                              <Crop className="h-4 w-4 mr-2" />
                              Recadrer l'image
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
            </FormItem>
                </TabsContent>
              </Tabs>
            </div>
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu de l'article</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Rédigez le contenu de votre article ici..."
                      className="min-h-[200px] resize-y"
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length} caractères • Minimum 20 caractères
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline" type="button">Annuler</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 
                  "Enregistrement..." : 
                  isEditMode ? "Mettre à jour" : "Créer l'article"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
