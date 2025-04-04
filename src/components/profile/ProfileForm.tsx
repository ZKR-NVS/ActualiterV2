import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/contexts/AuthContext";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState("");
  const { updateUserProfile } = useAuth();
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mettre à jour le profil utilisateur avec Firebase
      await updateUserProfile({ displayName: name });
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleProfileUpdate}>
        <CardHeader>
          <CardTitle>Informations du profil</CardTitle>
          <CardDescription>
            Mettre à jour vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={user.email} 
              disabled 
              className="opacity-70"
            />
            <p className="text-sm text-muted-foreground">
              L'adresse email ne peut pas être modifiée
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Parlez-nous de vous..."
            />
          </div>
          {user.role && user.role !== "user" && (
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Input 
                id="role" 
                value={user.role} 
                disabled 
                className="opacity-70"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
