import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon, Upload, X, Crop, Maximize2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactCrop, { Crop as CropType, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Définir le schéma de validation pour le formulaire
const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
  content: z.string().min(20, { message: "Le contenu doit contenir au moins 20 caractères" }),
  author: z.string().min(2, { message: "L'auteur doit être spécifié" }),
  verificationStatus: z.enum(["true", "false", "partial"]),
  image: z.string().optional()
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormDialogProps {
  onCreateArticle: (article: any) => void;
  isEditMode?: boolean;
  articleToEdit?: any;
  dialogTitle?: string;
  buttonText?: string;
}

export const ArticleFormDialog: React.FC<ArticleFormDialogProps> = ({ 
  onCreateArticle, 
  isEditMode = false, 
  articleToEdit,
  dialogTitle = "Créer un nouvel article",
  buttonText = "Nouvel Article"
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(isEditMode && articleToEdit?.image ? articleToEdit.image : null);
  const [imageUrl, setImageUrl] = useState<string>(isEditMode && articleToEdit?.image ? articleToEdit.image : "");
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const defaultValues = isEditMode && articleToEdit 
    ? {
        title: articleToEdit.title,
        content: articleToEdit.content || articleToEdit.excerpt || "",
        author: articleToEdit.author,
        verificationStatus: articleToEdit.verificationStatus,
        image: articleToEdit.image || ""
      }
    : {
        title: "",
        content: "",
        author: "",
        verificationStatus: "partial",
        image: ""
      };

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues
  });

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
  ): Promise<string> => {
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
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve(croppedImageUrl);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    try {
      const croppedImageUrl = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-image.jpg'
      );
      setImageUrl(croppedImageUrl);
      setImagePreview(croppedImageUrl);
      setIsCropping(false);
      form.setValue("image", croppedImageUrl);
    } catch (error) {
      toast.error("Erreur lors du recadrage de l'image");
      console.error(error);
    }
  };

  const onSubmit = async (values: ArticleFormValues) => {
    try {
      setIsSubmitting(true);
      // Ensure verification status is properly typed
      const verificationStatus = values.verificationStatus as "true" | "false" | "partial";
      
      const article = isEditMode && articleToEdit 
        ? { 
            ...articleToEdit, 
            title: values.title, 
            author: values.author, 
            content: values.content,
            verificationStatus: verificationStatus,
            image: imageUrl || articleToEdit.image
          } 
        : {
            id: `article-${Date.now()}`, // Temporary ID for new articles
            title: values.title,
            author: values.author,
            date: new Date().toLocaleDateString(),
            verificationStatus: verificationStatus,
            content: values.content,
            excerpt: values.content.substring(0, 120) + (values.content.length > 120 ? '...' : ''),
            image: imageUrl,
            summary: values.content.substring(0, 120) + (values.content.length > 120 ? '...' : ''),  // For Firestore compatibility
            publicationDate: new Date()  // For Firestore compatibility
          };
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onCreateArticle(article);
      toast.success(isEditMode ? "Article mis à jour avec succès" : "Article créé avec succès");
      setOpen(false);
      form.reset();
      setImagePreview(null);
      setImageUrl("");
    } catch (error) {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        form.reset();
        setImagePreview(null);
        setImageUrl("");
        setCrop(undefined);
        setCompletedCrop(undefined);
        setIsCropping(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            {/* Image upload field */}
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
