import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const PreferencesForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simuler un appel API pour sauvegarder les préférences
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une vraie implémentation, vous feriez un appel au backend
      toast.success("Préférences enregistrées avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences:", error);
      toast.error("Erreur lors de l'enregistrement des préférences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSavePreferences}>
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
          <CardDescription>
            Personnalisez votre expérience sur l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch 
                id="notifications" 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoSave">Sauvegarde automatique</Label>
              <Switch 
                id="autoSave" 
                checked={autoSave} 
                onCheckedChange={setAutoSave}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="compactView">Vue compacte</Label>
              <Switch 
                id="compactView" 
                checked={compactView} 
                onCheckedChange={setCompactView}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer les préférences"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
