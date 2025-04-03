import { useState, useEffect } from "react";
import { SettingsCard } from "./SettingsCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneralSettings, getSettings, updateGeneralSettings, toggleMaintenanceMode } from "@/lib/services/settingsService";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export const GeneralSettingsForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState<GeneralSettings>({
    siteName: "TruthBeacon",
    siteDescription: "Vérification des faits pour l'ère numérique",
    contactEmail: "contact@truthbeacon.com",
    enableRegistration: true,
    maintenanceMode: false,
    maintenanceMessage: "Le site est en maintenance. Merci de revenir plus tard.",
    defaultUserRole: "user",
    maxArticlesPerPage: 10,
    enableComments: true,
    enableSocialSharing: true,
    theme: "system"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        console.log("Paramètres récupérés:", siteSettings.general);
        setSettings(siteSettings.general);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres généraux:", error);
        toast.error("Impossible de charger les paramètres généraux");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key: keyof GeneralSettings, value: any) => {
    console.log(`Modification de ${key} à ${value}`);
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      console.log("Nouvelles valeurs:", newSettings);
      setIsDirty(true);
      return newSettings;
    });
  };

  const handleSave = async () => {
    try {
      console.log("Tentative de sauvegarde des paramètres généraux:", settings);
      await updateGeneralSettings(settings);
      setIsDirty(false);
      toast.success("Paramètres généraux enregistrés avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres généraux:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres généraux: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleReset = () => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        setSettings(siteSettings.general);
        setIsDirty(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres généraux:", error);
        toast.error("Impossible de réinitialiser les paramètres généraux");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  };

  const handleMaintenanceToggle = async (enabled: boolean) => {
    try {
      await toggleMaintenanceMode(enabled, settings.maintenanceMessage);
      handleChange("maintenanceMode", enabled);
      toast.success(`Mode maintenance ${enabled ? "activé" : "désactivé"}`);
    } catch (error) {
      console.error("Erreur lors de la modification du mode maintenance:", error);
      toast.error("Erreur lors de la modification du mode maintenance");
    }
  };

  return (
    <SettingsCard 
      title="Paramètres Généraux" 
      description="Configurez les paramètres généraux de votre site"
      onSave={handleSave}
      isLoading={isLoading}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nom du Site</Label>
            <Input 
              id="siteName" 
              value={settings.siteName}
              onChange={(e) => handleChange("siteName", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Description du Site</Label>
            <Input 
              id="siteDescription" 
              value={settings.siteDescription}
              onChange={(e) => handleChange("siteDescription", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de Contact</Label>
            <Input 
              id="contactEmail" 
              type="email" 
              value={settings.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultUserRole">Rôle par défaut des nouveaux utilisateurs</Label>
            <Select 
              value={settings.defaultUserRole}
              onValueChange={(value) => handleChange("defaultUserRole", value)}
            >
              <SelectTrigger id="defaultUserRole">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="verifier">Vérificateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxArticlesPerPage">Articles par page</Label>
            <Input 
              id="maxArticlesPerPage" 
              type="number"
              min={5}
              max={50}
              value={settings.maxArticlesPerPage}
              onChange={(e) => handleChange("maxArticlesPerPage", parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maintenanceMessage">Message de maintenance</Label>
            <Textarea 
              id="maintenanceMessage" 
              value={settings.maintenanceMessage}
              onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-md border border-amber-200">
          <div>
            <h4 className="font-medium text-amber-800">Mode Maintenance</h4>
            <p className="text-sm text-amber-700">
              Activez le mode maintenance pour empêcher l'accès au site pendant les mises à jour.
            </p>
          </div>
          <Switch 
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={handleMaintenanceToggle}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="enableRegistration"
              checked={settings.enableRegistration}
              onCheckedChange={(checked) => handleChange("enableRegistration", checked)}
            />
            <Label htmlFor="enableRegistration">Autoriser les nouvelles inscriptions</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="enableComments"
              checked={settings.enableComments}
              onCheckedChange={(checked) => handleChange("enableComments", checked)}
            />
            <Label htmlFor="enableComments">Activer les commentaires</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="enableSocialSharing"
              checked={settings.enableSocialSharing}
              onCheckedChange={(checked) => handleChange("enableSocialSharing", checked)}
            />
            <Label htmlFor="enableSocialSharing">Activer le partage social</Label>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}; 