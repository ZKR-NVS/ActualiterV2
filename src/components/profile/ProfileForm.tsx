import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "../ui/use-toast";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateUserProfile } from "@/lib/services/authService";
import { Badge } from "@/components/ui/badge";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, {
      message: "Le nom doit comporter au moins 2 caractères.",
    })
    .max(30, {
      message: "Le nom ne doit pas dépasser 30 caractères.",
    }),
  email: z
    .string()
    .email({
      message: "Adresse email invalide.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const defaultValues: Partial<ProfileFormValues> = {
    displayName: currentUser?.displayName || "",
    email: currentUser?.email || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      if (currentUser) {
        await updateUserProfile(currentUser.uid, {
          displayName: data.displayName,
        });
        
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
        });
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
      });
    }
  }

  if (!currentUser) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Gérez vos informations personnelles et vos préférences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
            <Avatar className="h-32 w-32">
              {currentUser.photoURL ? (
                <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName} />
              ) : (
                <AvatarFallback className="text-3xl">
                  {currentUser.displayName?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-medium">{currentUser.displayName}</h2>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              <div className="mt-2">
                <Badge variant="outline" className="capitalize">{currentUser.role}</Badge>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'affichage</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormDescription>
                        Ce nom sera visible par les autres utilisateurs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="votre.email@example.com" {...field} disabled={true} />
                      </FormControl>
                      <FormDescription>
                        L'email ne peut pas être modifié directement.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Enregistrer</Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Modifier
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="debug-info">Informations de débogage</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebug(!showDebug)}
            >
              {showDebug ? "Masquer" : "Afficher"}
            </Button>
          </div>
          
          {showDebug && (
            <div className="mt-2 p-4 bg-muted rounded-md overflow-auto">
              <pre className="text-xs">{JSON.stringify(currentUser, null, 2)}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
