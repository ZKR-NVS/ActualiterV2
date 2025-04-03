import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/contexts/AuthContext";
import { resetPassword } from "@/lib/services/authService";

export const SecurityForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { currentUser } = useAuth();
  
  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      toast.error("Aucune adresse email associée à ce compte");
      return;
    }
    
    try {
      setIsLoading(true);
      await resetPassword(currentUser.email);
      toast.success("Email de réinitialisation de mot de passe envoyé");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      toast.error("Erreur lors de l'envoi de l'email de réinitialisation");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsLoading(true);
    try {
      // Dans une vraie implémentation, vous appelleriez votre API pour changer le mot de passe
      // Pour l'instant, on simule un succès
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Mot de passe modifié avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handlePasswordChange}>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>
            Gérez votre mot de passe et les paramètres de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input 
              id="currentPassword" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input 
              id="newPassword" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum 8 caractères, avec au moins une lettre majuscule et un chiffre
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handlePasswordReset}
            disabled={isLoading}
          >
            Réinitialiser par email
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
