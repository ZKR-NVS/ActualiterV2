import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ArticleFormValues {
  title: string;
  content: string;
  author: string;
  verificationStatus: "true" | "false" | "partial";
  image?: string;
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
  const [imagePreview, setImagePreview] = useState<string | null>(isEditMode && articleToEdit?.image ? articleToEdit.image : null);
  const [imageUrl, setImageUrl] = useState<string>(isEditMode && articleToEdit?.image ? articleToEdit.image : "");

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

    // For a real implementation, you would upload the image to a storage service
    // For now, we'll just use the preview URL as the image URL
    setImageUrl(previewUrl);
    form.setValue("image", previewUrl);
  };

  const onSubmit = (values: ArticleFormValues) => {
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
          excerpt: values.content.substring(0, 120) + '...',
          image: imageUrl,
          summary: values.content.substring(0, 120) + '...',  // For Firestore compatibility
          publicationDate: new Date()  // For Firestore compatibility
        };
    
    onCreateArticle(article);
    setOpen(false);
    form.reset();
    setImagePreview(null);
    setImageUrl("");
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
            
            {/* Image upload field */}
            <FormItem>
              <FormLabel htmlFor="image-upload">Image de l'article</FormLabel>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {imagePreview ? "Changer l'image" : "Ajouter une image"}
                  </Button>
                  {imagePreview && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-shrink-0"
                      onClick={() => {
                        setImagePreview(null);
                        setImageUrl("");
                        form.setValue("image", "");
                      }}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2 relative w-full h-40 rounded-md overflow-hidden border">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>
            </FormItem>
            
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
                      className="w-full p-2 border border-gray-300 rounded-md"
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
