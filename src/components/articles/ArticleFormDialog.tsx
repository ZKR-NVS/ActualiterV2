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
    
    // Vérifier si c'est un lien Postimages (solution recommandée)
    const isPostimages = url.includes('postimg.cc') || url.includes('postimages.org');
    
    console.log("URL à traiter:", url);
    
    // Afficher un message de chargement
    toast.info("Chargement de l'image...");
    
    // Vérifier si l'image peut être chargée
    const img = new Image();
    
    // Configurer les gestionnaires d'événements
    img.onload = () => {
      // L'image a été chargée avec succès
      setExternalImageUrl(url);
      setImagePreview(url);
      setUseExternalImage(true);
      form.setValue("externalImageUrl", url);
      toast.success("Image chargée avec succès!");
    };
    
    img.onerror = () => {
      toast.error("Impossible de charger l'image. Vérifiez que l'URL est correcte.");
      
      // Recommander Postimages si ce n'est pas déjà un lien Postimages
      if (!isPostimages) {
        setTimeout(() => {
          toast.info("Nous recommandons d'utiliser Postimages.org pour héberger vos images.");
        }, 1000);
      }
    };
    
    // Charger l'image
    img.src = url;
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

  const onSubmitForm = async (values: ArticleFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Valeurs soumises:", values);

      // Préparer les données de l'article
      const articleData = {
        ...(isEditMode && articleToEdit ? { id: articleToEdit.id } : {}),
        title: values.title,
        content: values.content,
        excerpt: values.content.substring(0, 150) + "...",
        author: values.author,
        date: isEditMode && articleToEdit ? articleToEdit.date : new Date().toISOString().split('T')[0],
        verificationStatus: values.verificationStatus,
        image: useExternalImage 
          ? externalImageUrl 
          : imageUrl || (isEditMode && articleToEdit ? articleToEdit.image : ""),
        tags: isEditMode && articleToEdit && articleToEdit.tags ? articleToEdit.tags : []
      };

      console.log("Article data à soumettre:", articleData);

      // S'assurer que la fonction onSubmit est disponible et est une fonction
      if (typeof onSubmit === 'function') {
        await onSubmit(articleData);
        toast.success(`Article ${isEditMode ? "modifié" : "créé"} avec succès`);
        handleOpenChange(false);
      } else {
        console.error("onSubmit n'est pas une fonction:", onSubmit);
        toast.error("Erreur: La fonction de soumission n'est pas disponible");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error(`Erreur lors de la soumission: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
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
                      <FormDescription className="mt-1 text-xs">
                        Il n'est pas possible d'uploader directement des images.
                        Utilisez plutôt l'option "URL d'image" avec Postimages.
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
                  
                  <div className="mb-4 text-sm text-muted-foreground">
                    <p>Nous ne pouvons pas stocker d'images directement. Utilisez Postimages.org pour héberger vos images :</p>
                    <ol className="list-decimal pl-4 mt-1 text-xs">
                      <li>Rendez-vous sur <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="text-blue-500 underline">Postimages.org</a></li>
                      <li>Cliquez sur "Choose Images"</li>
                      <li>Après l'upload, copiez le lien "Direct link"</li>
                      <li>Collez ce lien dans le champ URL ci-dessous</li>
                    </ol>
                  </div>
                  
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
