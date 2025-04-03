
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";

interface ArticleFormValues {
  title: string;
  content: string;
  author: string;
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

  const defaultValues = isEditMode && articleToEdit 
    ? {
        title: articleToEdit.title,
        content: articleToEdit.content,
        author: articleToEdit.author,
        verificationStatus: articleToEdit.verificationStatus
      }
    : {
        title: "",
        content: "",
        author: "",
        verificationStatus: "partial"
      };

  const form = useForm<ArticleFormValues>({
    defaultValues
  });

  const onSubmit = (values: ArticleFormValues) => {
    const article = isEditMode && articleToEdit 
      ? { 
          ...articleToEdit, 
          title: values.title, 
          author: values.author, 
          content: values.content,
          verificationStatus: values.verificationStatus
        } 
      : {
          id: Math.random().toString(36).substring(2, 9),
          title: values.title,
          author: values.author,
          date: new Date().toLocaleDateString(),
          verificationStatus: values.verificationStatus,
          content: values.content,
          excerpt: values.content.substring(0, 120) + '...'
        };
    
    onCreateArticle(article);
    setOpen(false);
    form.reset();
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
