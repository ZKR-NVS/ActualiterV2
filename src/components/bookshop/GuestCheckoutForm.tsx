import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { CartItem, checkIfEmailExists, createGuestOrder, GuestCheckoutData } from '@/lib/services/bookService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Check, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// Schéma de validation pour le formulaire de commande invité
const guestCheckoutSchema = z.object({
  email: z.string().email('Adresse email invalide'),
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
  subscribeToNewsletter: z.boolean().default(false),
});

type GuestCheckoutFormValues = z.infer<typeof guestCheckoutSchema>;

interface GuestCheckoutFormProps {
  items: CartItem[];
  totalAmount: number;
  onCancel: () => void;
  onSuccess: (orderId: string, email: string) => void;
}

export default function GuestCheckoutForm({ items, totalAmount, onCancel, onSuccess }: GuestCheckoutFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  
  // Formulaire avec validation
  const form = useForm<GuestCheckoutFormValues>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      email: '',
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
      subscribeToNewsletter: false,
    },
  });
  
  const paymentMethod = form.watch('paymentMethod');
  const email = form.watch('email');
  
  // Vérifier si l'email existe déjà quand il change
  useEffect(() => {
    const checkEmail = async () => {
      if (email && email.includes('@') && email.includes('.')) {
        try {
          const exists = await checkIfEmailExists(email);
          setEmailExists(exists);
          setEmailChecked(true);
        } catch (error) {
          console.error("Erreur lors de la vérification de l'email:", error);
        }
      } else {
        setEmailExists(false);
        setEmailChecked(false);
      }
    };
    
    const debounce = setTimeout(() => {
      checkEmail();
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [email]);
  
  const onSubmit = async (data: GuestCheckoutFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Créer l'objet de commande invité
      const guestOrderData: GuestCheckoutData = {
        email: data.email,
        shippingAddress: {
          fullName: data.shipping.fullName,
          address: data.shipping.address,
          city: data.shipping.city,
          postalCode: data.shipping.postalCode,
          country: data.shipping.country,
          phone: data.shipping.phone,
        },
        paymentMethod: data.paymentMethod,
        items: items,
        totalAmount: totalAmount,
        subscribeToNewsletter: data.subscribeToNewsletter
      };
      
      // Créer la commande dans Firestore
      const order = await createGuestOrder(guestOrderData);
      
      toast({
        title: t("cart.orderConfirmed"),
        description: t("cart.orderProcessedSuccess"),
      });
      
      // Appeler le callback de succès avec l'ID de commande et l'email
      onSuccess(order.id, data.email);
    } catch (error) {
      console.error("Erreur lors de la création de la commande invité:", error);
      toast({
        title: t("errors.error"),
        description: t("errors.orderError"),
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
          {t("cart.backToCart")}
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("cart.guestCheckout")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.email")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="exemple@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {emailExists && emailChecked && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{t("cart.existingAccount")}</AlertTitle>
                      <AlertDescription>
                        {t("cart.existingAccountDescription")} 
                        <a href="/login" className="underline font-medium">{t("auth.login")}</a> 
                        {t("cart.toAccessOrderHistory")}
                        <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/forgot-password'}>
                          {t("auth.forgotPassword")}
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">{t("cart.shippingAddress")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shipping.fullName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>{t("cart.fullName")}</FormLabel>
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
                          <FormLabel>{t("cart.address")}</FormLabel>
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
                          <FormLabel>{t("cart.city")}</FormLabel>
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
                          <FormLabel>{t("cart.postalCode")}</FormLabel>
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
                          <FormLabel>{t("cart.country")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("cart.selectCountry")} />
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
                          <FormLabel>{t("cart.phone")}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+33 6 12 34 56 78" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">{t("cart.paymentMethod")}</h3>
                  
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
                                {t("cart.creditCard")}
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
                                {t("cart.bankTransfer")}
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
                            <FormLabel>{t("cart.cardNumber")}</FormLabel>
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
                            <FormLabel>{t("cart.nameOnCard")}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="J. DUPONT" />
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
                              <FormLabel>{t("cart.expiryDate")}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="MM/YY" />
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
                              <FormLabel>{t("cart.securityCode")}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="123" />
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
                    name="subscribeToNewsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("cart.subscribeToNewsletter")}
                          </FormLabel>
                          <FormDescription>
                            {t("cart.subscribeDescription")}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
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
                          {t("cart.processing")}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {t("cart.confirmOrder")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Résumé de la commande */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{t("cart.orderSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
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
                      {t("cart.quantity")}: {item.quantity}
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
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.shipping")}</span>
                <span>{t("cart.free")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.taxes")}</span>
                <span>{t("cart.included")}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold text-lg">
                <span>{t("cart.total")}</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-muted-foreground">
              {t("cart.termsAgreement")} <a href="#" className="text-primary underline">{t("cart.termsOfService")}</a> {t("cart.andAcknowledge")} <a href="#" className="text-primary underline">{t("cart.privacyPolicy")}</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 