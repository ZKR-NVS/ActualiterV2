import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, BookOpen } from 'lucide-react';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  
  // Ajout d'un effet pour rediriger après un délai (valeur temporaire pour le développement)
  useEffect(() => {
    // On pourrait ajouter un compteur ici qui redirige après un certain temps
    const redirectTimer = setTimeout(() => {
      // Décommenter la ligne suivante pour une redirection automatique
      // navigate('/bookshop');
    }, 30000); // 30 secondes
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6 pb-8 flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            
            <h1 className="text-3xl font-bold mb-2">Commande confirmée!</h1>
            <p className="text-muted-foreground mb-8 max-w-lg">
              Merci pour votre achat. Un e-mail de confirmation a été envoyé à votre adresse avec les détails de votre commande.
            </p>
            
            <div className="w-full max-w-md bg-accent/20 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-lg mb-4">Détails de la commande</h2>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numéro de commande:</span>
                  <span className="font-medium">ORD-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">Confirmée</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Méthode de paiement:</span>
                  <span className="font-medium">Carte de crédit</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-8">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => navigate('/bookshop')}
              >
                <BookOpen className="h-4 w-4" />
                Continuer vos achats
              </Button>
              
              <Button 
                className="flex items-center justify-center gap-2"
                onClick={() => navigate('/orders')}
              >
                <ShoppingBag className="h-4 w-4" />
                Voir mes commandes
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 