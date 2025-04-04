import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Cart, createOrder, Order, clearCart } from '@/lib/services/bookService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Check } from 'lucide-react';

// Schéma de validation pour le formulaire de commande
const checkoutSchema = z.object({
  shipping: z.object({
    fullName: z.string().min(3, 'Le nom complet est requis'),
    address: z.string().min(5, 'L\'adresse est requise'),
    city: z.string().min(2, 'La ville est requise'),
    postalCode: z.string().min(4, 'Le code postal est requis'),
    country: z.string().min(2, 'Le pays est requis'),
    phone: z.string().optional(),
  }),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer']),
  cardDetails: z.object({
    cardNumber: z.string().min(16, 'Le numéro de carte est requis').max(19),
    cardName: z.string().min(3, 'Le nom sur la carte est requis'),
    expiryDate: z.string().min(5, 'La date d\'expiration est requise'),
    cvv: z.string().min(3, 'Le code de sécurité est requis').max(4),
  }).optional(),
  notes: z.string().optional(),
  saveInfo: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  cart: Cart & { id: string };
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CheckoutForm({ cart, onCancel, onSuccess }: CheckoutFormProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulaire avec validation
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: {
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
        phone: '',
      },
      paymentMethod: 'credit_card',
      cardDetails: {
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
      },
      notes: '',
      saveInfo: false,
    },
  });
  
  const paymentMethod = form.watch('paymentMethod');
  
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour finaliser la commande",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer l'objet de commande à partir des données du formulaire et du panier
      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: currentUser.uid,
        books: cart.items.map(item => ({
          bookId: item.bookId,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cart.totalAmount,
        status: 'pending',
        shippingAddress: {
          fullName: data.shipping.fullName,
          address: data.shipping.address,
          city: data.shipping.city,
          postalCode: data.shipping.postalCode,
          country: data.shipping.country,
          phone: data.shipping.phone,
        },
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending'
      };
      
      // Créer la commande dans Firestore
      await createOrder(orderData);
      
      // Vider le panier après une commande réussie
      await clearCart(currentUser.uid);
      
      toast({
        title: "Commande confirmée",
        description: "Votre commande a été traitée avec succès. Merci pour votre achat!",
      });
      
      // Appeler le callback de succès
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la finalisation de votre commande. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au panier
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Informations de livraison et paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Adresse de livraison</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shipping.fullName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Jean Dupont" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shipping.address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123 Rue de la Paix" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shipping.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Paris" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shipping.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="75001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shipping.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un pays" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Belgique">Belgique</SelectItem>
                              <SelectItem value="Suisse">Suisse</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shipping.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone (optionnel)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+33 6 12 34 56 78" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Méthode de paiement</h3>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem value="credit_card" id="credit_card" />
                              <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                                Carte de crédit
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem value="paypal" id="paypal" />
                              <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                                PayPal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                              <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                                Virement bancaire
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 border rounded-md p-4">
                      <FormField
                        control={form.control}
                        name="cardDetails.cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de carte</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="4242 4242 4242 4242" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardDetails.cardName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom sur la carte</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="JEAN DUPONT" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cardDetails.expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date d'expiration</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="MM/AA" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardDetails.cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code de sécurité</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="123" type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes de commande (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Instructions de livraison, informations supplémentaires..."
                            className="min-h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="saveInfo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 mt-1"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Sauvegarder ces informations</FormLabel>
                          <FormDescription>
                            Enregistrer pour vos prochaines commandes
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Confirmer la commande
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Résumé de la commande */}
      <div className="lg:row-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Résumé de votre commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.bookId} className="flex space-x-4">
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={item.coverImage || '/placeholder.svg'} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{cart.totalAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span>Incluses</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{cart.totalAmount.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-muted-foreground">
              En passant commande, vous acceptez nos <a href="#" className="text-primary underline">conditions générales de vente</a> et reconnaissez avoir pris connaissance de notre <a href="#" className="text-primary underline">politique de confidentialité</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 