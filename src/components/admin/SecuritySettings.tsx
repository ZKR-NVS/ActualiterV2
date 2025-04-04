import { useState, useEffect } from "react";
import { SettingsCard } from "./SettingsCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteSettings, SecuritySettings, getSettings, updateSecuritySettings } from "@/lib/services/settingsService";
import { toast } from "sonner";

export const SecuritySettingsForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    requirePasswordComplexity: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableTwoFactorAuth: false,
    allowedFileTypes: ["jpg", "jpeg", "png", "gif"],
    maxFileSize: 5
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        if (siteSettings.security) {
          setSettings(siteSettings.security);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres de sécurité:", error);
        toast.error("Impossible de charger les paramètres de sécurité");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setIsDirty(true);
      return newSettings;
    });
  };

  const handleFileTypesChange = (value: string) => {
    const fileTypes = value.split(",").map(type => type.trim());
    handleChange("allowedFileTypes", fileTypes);
  };

  const handleSave = async () => {
    try {
      await updateSecuritySettings(settings);
      setIsDirty(false);
      toast.success("Paramètres de sécurité enregistrés avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres de sécurité:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres de sécurité");
    }
  };

  const handleReset = () => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        if (siteSettings.security) {
          setSettings(siteSettings.security);
        }
        setIsDirty(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres de sécurité:", error);
        toast.error("Impossible de réinitialiser les paramètres de sécurité");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  };

  return (
    <SettingsCard 
      title="Paramètres de Sécurité" 
      description="Configurez les paramètres de sécurité de votre site"
      onSave={handleSave}
      isLoading={isLoading}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">Longueur minimale du mot de passe</Label>
            <div className="flex items-center gap-4">
              <Slider 
                id="passwordMinLength"
                min={6}
                max={20}
                step={1}
                value={[settings.passwordMinLength]}
                onValueChange={(value) => handleChange("passwordMinLength", value[0])}
                className="flex-1"
              />
              <span className="w-8 text-center">{settings.passwordMinLength}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="requirePasswordComplexity"
              checked={settings.requirePasswordComplexity}
              onCheckedChange={(checked) => handleChange("requirePasswordComplexity", checked)}
            />
            <Label htmlFor="requirePasswordComplexity">Exiger des mots de passe complexes</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
            <Input 
              id="sessionTimeout"
              type="number"
              min={5}
              max={1440}
              value={settings.sessionTimeout}
              onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxLoginAttempts">Tentatives de connexion maximales</Label>
            <Input 
              id="maxLoginAttempts"
              type="number"
              min={3}
              max={10}
              value={settings.maxLoginAttempts}
              onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="enableTwoFactorAuth"
              checked={settings.enableTwoFactorAuth}
              onCheckedChange={(checked) => handleChange("enableTwoFactorAuth", checked)}
            />
            <Label htmlFor="enableTwoFactorAuth">Activer l'authentification à deux facteurs</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedFileTypes">Types de fichiers autorisés</Label>
            <Input 
              id="allowedFileTypes"
              value={settings.allowedFileTypes.join(", ")}
              onChange={(e) => handleFileTypesChange(e.target.value)}
              placeholder="jpg, jpeg, png, gif"
            />
            <p className="text-xs text-gray-500">Séparez les types de fichiers par des virgules</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxFileSize">Taille maximale des fichiers (MB)</Label>
            <Input 
              id="maxFileSize"
              type="number"
              min={1}
              max={50}
              value={settings.maxFileSize}
              onChange={(e) => handleChange("maxFileSize", parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}; 