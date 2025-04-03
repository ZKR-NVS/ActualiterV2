import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ArticleFormValues {
  title: string;
  content: string;
  author: string;
  verificationStatus: "true" | "false" | "partial";
  imageUrl: string;
}

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const defaultValues = isEditMode && articleToEdit 
    ? {
        title: articleToEdit.title,
        content: articleToEdit.content || articleToEdit.excerpt?.replace('...', '') || '',
        author: articleToEdit.author,
        verificationStatus: articleToEdit.verificationStatus,
        imageUrl: articleToEdit.image || articleToEdit.imageUrl || ''
      }
    : {
        title: "",
        content: "",
        author: "",
        verificationStatus: "partial",
        imageUrl: ""
      };

  const form = useForm<ArticleFormValues>({
    defaultValues
  });

  // Si nous sommes en mode édition et qu'il y a une image, définir l'aperçu
  useState(() => {
    if (isEditMode && articleToEdit && (articleToEdit.image || articleToEdit.imageUrl)) {
      setImagePreview(articleToEdit.image || articleToEdit.imageUrl);
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type et la taille du fichier
    if (!file.type.includes('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("L'image est trop volumineuse (max 5MB)");
      return;
    }

    setUploadingImage(true);

    // Simuler un téléchargement (dans une vraie application, vous utiliseriez Firebase Storage)
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setImagePreview(imageUrl);
      form.setValue("imageUrl", imageUrl);
      setUploadingImage(false);
    };
    reader.onerror = () => {
      toast.error("Erreur lors du téléchargement de l'image");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: ArticleFormValues) => {
    // Vérifier que tous les champs obligatoires sont remplis
    if (!values.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    if (!values.author.trim()) {
      toast.error("L'auteur est obligatoire");
      return;
    }

    if (!values.content.trim()) {
      toast.error("Le contenu est obligatoire");
      return;
    }

    // Créer l'article avec tous les champs nécessaires
    const article = isEditMode && articleToEdit 
      ? { 
          ...articleToEdit, 
          title: values.title, 
          author: values.author, 
          content: values.content,
          verificationStatus: values.verificationStatus,
          image: values.imageUrl || imagePreview,
          imageUrl: values.imageUrl || imagePreview,
          excerpt: values.content.substring(0, 120) + '...',
          summary: values.content.substring(0, 120) + '...',
        } 
      : {
          id: Math.random().toString(36).substring(2, 9),
          title: values.title,
          author: values.author,
          date: new Date().toLocaleDateString(),
          verificationStatus: values.verificationStatus,
          content: values.content,
          image: values.imageUrl || imagePreview,
          imageUrl: values.imageUrl || imagePreview,
          excerpt: values.content.substring(0, 120) + '...',
          summary: values.content.substring(0, 120) + '...',
          source: "Rédaction TruthBeacon",
          publicationDate: new Date(),
          tags: []
        };
    
    onCreateArticle(article);
    setOpen(false);
    form.reset();
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Titre de l'article" />
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
                    <Input {...field} placeholder="Nom de l'auteur" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Contenu de l'article"
                      className="min-h-[150px]"
                    />
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
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-input-bg dark:border-input-border dark:text-foreground"
                    >
                      <option value="true">Vérifié Vrai</option>
                      <option value="false">Vérifié Faux</option>
                      <option value="partial">Partiellement Vrai</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <div className="space-y-3">
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                    </FormControl>
                    
                    <label 
                      htmlFor="image-upload" 
                      className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md cursor-pointer hover:bg-primary-hover"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingImage ? "Téléchargement..." : "Télécharger une image"}
                    </label>
                    
                    {imagePreview && (
                      <div className="relative w-full rounded-md overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-40 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            form.setValue("imageUrl", "");
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    )}
                    
                    <Input 
                      {...field} 
                      placeholder="Ou entrez une URL d'image" 
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                        }
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button type="submit">{isEditMode ? "Mettre à jour" : "Créer l'article"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
