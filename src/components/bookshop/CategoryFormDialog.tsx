import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BookCategory, addCategory } from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Schéma de validation pour le formulaire de catégorie
const categorySchema = z.object({
  name: z.string().min(2, 'Le nom est requis et doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  slug: z.string().min(2, 'Le slug est requis pour les URL')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: BookCategory) => void;
}

export default function CategoryFormDialog({ 
  open, 
  onOpenChange, 
  onSave 
}: CategoryFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulaire avec validation
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
    }
  });
  
  // Génère automatiquement un slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')       // Remplace les espaces par des tirets
      .replace(/[^\w-]+/g, '')    // Supprime les caractères spéciaux
      .replace(/--+/g, '-')       // Remplace les doubles tirets par des tirets simples
      .replace(/^-+/, '')         // Supprime les tirets au début
      .replace(/-+$/, '');        // Supprime les tirets à la fin
  };
  
  // Mise à jour automatique du slug lorsque le nom change
  const watchName = form.watch('name');
  const autoUpdateSlug = () => {
    const slugValue = form.getValues('slug');
    // Ne met à jour le slug que s'il est vide ou n'a pas été modifié manuellement
    if (!slugValue || slugValue === generateSlug(form.getValues('name').slice(0, -1))) {
      form.setValue('slug', generateSlug(watchName));
    }
  };
  
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      
      const newCategory = await addCategory({
        name: data.name,
        description: data.description || '',
        slug: data.slug,
      });
      
      onSave(newCategory);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la catégorie. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la catégorie</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Romans, Biographies, etc." 
                      onChange={(e) => {
                        field.onChange(e);
                        autoUpdateSlug();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="romans, biographies, etc." />
                  </FormControl>
                  <FormDescription>
                    Identifiant unique utilisé dans les URL (sans espaces ni caractères spéciaux)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnelle)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Description brève de la catégorie"
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormDescription>
                    Une description courte pour expliquer le type de livres dans cette catégorie
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                    Création...
                  </>
                ) : (
                  "Créer la catégorie"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 