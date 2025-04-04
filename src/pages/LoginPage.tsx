import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState<string | null>(null);

  // Formulaire de connexion
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Formulaire d'inscription
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        // Connexion
        await login(loginEmail, loginPassword);
        toast.success("Connexion réussie!");
        
        // Rediriger vers la page d'origine si elle existe, sinon vers l'accueil
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        // Vérifier que les mots de passe correspondent
        if (registerPassword !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas.");
          setIsLoading(false);
          return;
        }

        // Vérifier la complexité du mot de passe
        if (registerPassword.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caractères.");
          setIsLoading(false);
          return;
        }

        // Inscription
        await register(registerEmail, registerPassword, registerName);
        toast.success("Inscription réussie! Veuillez vérifier votre email pour confirmer votre compte.");
        
        // Passer à l'onglet de connexion après l'inscription
        setActiveTab("login");
        
        // Réinitialiser les champs d'inscription
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      console.error("Erreur d'authentification:", error);
      
      // Traduire les messages d'erreur Firebase
      let errorMessage = "Une erreur s'est produite lors de l'authentification.";
      
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Cet email est déjà utilisé par un autre compte.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Le mot de passe est trop faible.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
      }
      
      setError(errorMessage);
      
      uiToast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Bienvenue</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte Actualiter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="votre@email.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      <a href="#" className="text-sm text-primary hover:underline">
                        Mot de passe oublié?
                      </a>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </span>
                    ) : "Se connecter"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Créer un compte</CardTitle>
                  <CardDescription>
                    Rejoignez Actualiter pour accéder à plus de fonctionnalités
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input 
                      id="name" 
                      placeholder="Jean Dupont" 
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input 
                      id="registerEmail" 
                      type="email" 
                      placeholder="votre@email.com" 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Mot de passe</Label>
                    <Input 
                      id="registerPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création du compte...
                      </span>
                    ) : "Créer un compte"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Overlay de chargement pendant le processus d'authentification */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner 
            size="lg" 
            text={activeTab === "login" ? "Connexion en cours..." : "Création du compte..."} 
          />
        </div>
      )}
    </Layout>
  );
};

export default LoginPage;
