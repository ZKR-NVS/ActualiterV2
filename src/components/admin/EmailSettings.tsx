import { useState, useEffect } from "react";
import { SettingsCard } from "./SettingsCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmailSettings, getSettings, updateEmailSettings } from "@/lib/services/settingsService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const EmailSettingsForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    enableEmailNotifications: false,
    senderName: "TruthBeacon",
    senderEmail: "noreply@truthbeacon.com",
    emailTemplates: {
      welcomeEmail: "Bienvenue sur TruthBeacon!",
      passwordReset: "Réinitialisation de votre mot de passe",
      articlePublished: "Un nouvel article a été publié"
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        setSettings(siteSettings.email);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres email:", error);
        toast.error("Impossible de charger les paramètres email");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key: keyof EmailSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setIsDirty(true);
      return newSettings;
    });
  };

  const handleTemplateChange = (templateKey: keyof EmailSettings["emailTemplates"], value: string) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        emailTemplates: {
          ...prev.emailTemplates,
          [templateKey]: value
        }
      };
      setIsDirty(true);
      return newSettings;
    });
  };

  const handleSave = async () => {
    try {
      console.log("Tentative de sauvegarde des paramètres email:", settings);
      await updateEmailSettings(settings);
      setIsDirty(false);
      toast.success("Paramètres email enregistrés avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres email:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres email: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleReset = () => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        setSettings(siteSettings.email);
        setIsDirty(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres email:", error);
        toast.error("Impossible de réinitialiser les paramètres email");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  };

  const handleTestEmail = async () => {
    try {
      // Simuler l'envoi d'un email de test
      toast.info("Envoi d'un email de test...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Email de test envoyé avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de test:", error);
      toast.error("Erreur lors de l'envoi de l'email de test");
    }
  };

  return (
    <SettingsCard 
      title="Paramètres Email" 
      description="Configurez les paramètres d'envoi d'emails de votre site"
      onSave={handleSave}
      isLoading={isLoading}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">Hôte SMTP</Label>
            <Input 
              id="smtpHost" 
              value={settings.smtpHost}
              onChange={(e) => handleChange("smtpHost", e.target.value)}
              placeholder="smtp.example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smtpPort">Port SMTP</Label>
            <Input 
              id="smtpPort" 
              type="number"
              value={settings.smtpPort}
              onChange={(e) => handleChange("smtpPort", parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smtpUser">Nom d'utilisateur SMTP</Label>
            <Input 
              id="smtpUser" 
              value={settings.smtpUser}
              onChange={(e) => handleChange("smtpUser", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
            <Input 
              id="smtpPassword" 
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => handleChange("smtpPassword", e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">Nom de l'expéditeur</Label>
            <Input 
              id="senderName" 
              value={settings.senderName}
              onChange={(e) => handleChange("senderName", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="senderEmail">Email de l'expéditeur</Label>
            <Input 
              id="senderEmail" 
              type="email"
              value={settings.senderEmail}
              onChange={(e) => handleChange("senderEmail", e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="enableEmailNotifications"
              checked={settings.enableEmailNotifications}
              onCheckedChange={(checked) => handleChange("enableEmailNotifications", checked)}
            />
            <Label htmlFor="enableEmailNotifications">Activer les notifications par email</Label>
          </div>
          
          <div className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestEmail}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Envoyer un email de test
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-4">Modèles d'emails</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcomeEmail">Email de bienvenue</Label>
            <Input 
              id="welcomeEmail" 
              value={settings.emailTemplates.welcomeEmail}
              onChange={(e) => handleTemplateChange("welcomeEmail", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passwordReset">Email de réinitialisation de mot de passe</Label>
            <Input 
              id="passwordReset" 
              value={settings.emailTemplates.passwordReset}
              onChange={(e) => handleTemplateChange("passwordReset", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="articlePublished">Email de publication d'article</Label>
            <Input 
              id="articlePublished" 
              value={settings.emailTemplates.articlePublished}
              onChange={(e) => handleTemplateChange("articlePublished", e.target.value)}
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}; 