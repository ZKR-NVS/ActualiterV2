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
  imageUrl: string;
  verificationStatus: "true" | "false" | "partial";
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
  const [imagePreview, setImagePreview] = useState<string | null>(isEditMode && articleToEdit ? articleToEdit.image : null);

  const defaultValues = isEditMode && articleToEdit 
    ? {
        title: articleToEdit.title,
        content: articleToEdit.content || "",
        author: articleToEdit.author,
        imageUrl: articleToEdit.image || "",
        verificationStatus: articleToEdit.verificationStatus
      }
    : {
        title: "",
        content: "",
        author: "",
        imageUrl: "",
        verificationStatus: "partial"
      };

  const form = useForm<ArticleFormValues>({
    defaultValues
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagePreview(url);
    form.setValue("imageUrl", url);
  };

  const onSubmit = (values: ArticleFormValues) => {
    if (!values.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    if (!values.author.trim()) {
      toast.error("L'auteur est obligatoire");
      return;
    }

    const article = isEditMode && articleToEdit 
      ? { 
          ...articleToEdit, 
          title: values.title, 
          author: values.author, 
          content: values.content,
          image: values.imageUrl,
          verificationStatus: values.verificationStatus
        } 
      : {
          id: Math.random().toString(36).substring(2, 9),
          title: values.title,
          author: values.author,
          date: new Date().toLocaleDateString(),
          verificationStatus: values.verificationStatus,
          content: values.content,
          image: values.imageUrl,
          excerpt: values.content.substring(0, 120) + '...'
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
                  <FormLabel>Titre*</FormLabel>
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
                  <FormLabel>Auteur*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom de l'auteur" />
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
                  <FormLabel>URL de l'image</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input 
                        {...field} 
                        placeholder="https://example.com/image.jpg" 
                        onChange={handleImageChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        title="Prévisualiser l'image"
                        disabled={!field.value}
                        onClick={() => setImagePreview(field.value)}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  {imagePreview && (
                    <div className="mt-2 relative rounded-md overflow-hidden h-40">
                      <img 
                        src={imagePreview} 
                        alt="Prévisualisation" 
                        className="w-full h-full object-cover"
                        onError={() => {
                          toast.error("L'image ne peut pas être chargée");
                          setImagePreview(null);
                        }}
                      />
                    </div>
                  )}
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
                  <FormLabel>Statut de vérification*</FormLabel>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Ce statut déterminera dans quelle catégorie l'article sera affiché
                  </p>
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
