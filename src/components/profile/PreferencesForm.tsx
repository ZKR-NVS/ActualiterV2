import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Language, availableLanguages } from "@/lib/i18n";

export const PreferencesForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simuler un appel API pour sauvegarder les préférences
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une vraie implémentation, vous feriez un appel au backend
      toast.success(t('preferences.savePreferences'));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences:", error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSavePreferences}>
        <CardHeader>
          <CardTitle>{t('preferences.title')}</CardTitle>
          <CardDescription>
            {t('preferences.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">{t('preferences.language')}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger id="language">
                <SelectValue placeholder={t('preferences.language')} />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">{t('preferences.notifications')}</Label>
              <Switch 
                id="notifications" 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoSave">{t('preferences.autoSave')}</Label>
              <Switch 
                id="autoSave" 
                checked={autoSave} 
                onCheckedChange={setAutoSave}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="compactView">{t('preferences.compactView')}</Label>
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
            {isLoading ? t('preferences.saving') : t('preferences.savePreferences')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
