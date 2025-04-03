import { useState, useEffect } from "react";
import { SettingsCard } from "./SettingsCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentSettings, getSettings, updateContentSettings } from "@/lib/services/settingsService";
import { toast } from "sonner";

export const ContentSettingsForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState<ContentSettings>({
    defaultVerificationStatus: "partial",
    requireImageForArticles: true,
    maxArticleLength: 10000,
    minArticleLength: 100,
    allowedTags: ["politique", "économie", "santé", "environnement", "technologie", "société"],
    defaultTags: ["vérification"],
    featuredArticlesCount: 5
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        setSettings(siteSettings.content);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres de contenu:", error);
        toast.error("Impossible de charger les paramètres de contenu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key: keyof ContentSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setIsDirty(true);
      return newSettings;
    });
  };

  const handleTagsChange = (value: string, key: "allowedTags" | "defaultTags") => {
    const tags = value.split(",").map(tag => tag.trim());
    handleChange(key, tags);
  };

  const handleSave = async () => {
    try {
      await updateContentSettings(settings);
      setIsDirty(false);
      toast.success("Paramètres de contenu enregistrés avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres de contenu:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres de contenu");
    }
  };

  const handleReset = () => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const siteSettings = await getSettings();
        setSettings(siteSettings.content);
        setIsDirty(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres de contenu:", error);
        toast.error("Impossible de réinitialiser les paramètres de contenu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  };

  return (
    <SettingsCard 
      title="Paramètres de Contenu" 
      description="Configurez les paramètres de contenu de votre site"
      onSave={handleSave}
      isLoading={isLoading}
      isDirty={isDirty}
      onReset={handleReset}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultVerificationStatus">Statut de vérification par défaut</Label>
            <Select 
              value={settings.defaultVerificationStatus}
              onValueChange={(value) => handleChange("defaultVerificationStatus", value)}
            >
              <SelectTrigger id="defaultVerificationStatus">
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true" className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Vérifié Vrai
                </SelectItem>
                <SelectItem value="false" className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Vérifié Faux
                </SelectItem>
                <SelectItem value="partial" className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                  Partiellement Vrai
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="requireImageForArticles"
              checked={settings.requireImageForArticles}
              onCheckedChange={(checked) => handleChange("requireImageForArticles", checked)}
            />
            <Label htmlFor="requireImageForArticles">Exiger une image pour les articles</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minArticleLength">Longueur minimale des articles (caractères)</Label>
            <Input 
              id="minArticleLength"
              type="number"
              min={50}
              max={1000}
              value={settings.minArticleLength}
              onChange={(e) => handleChange("minArticleLength", parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxArticleLength">Longueur maximale des articles (caractères)</Label>
            <Input 
              id="maxArticleLength"
              type="number"
              min={500}
              max={50000}
              value={settings.maxArticleLength}
              onChange={(e) => handleChange("maxArticleLength", parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedTags">Tags autorisés</Label>
            <Input 
              id="allowedTags"
              value={settings.allowedTags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value, "allowedTags")}
              placeholder="politique, économie, santé, environnement"
            />
            <p className="text-xs text-gray-500">Séparez les tags par des virgules</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultTags">Tags par défaut</Label>
            <Input 
              id="defaultTags"
              value={settings.defaultTags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value, "defaultTags")}
              placeholder="vérification"
            />
            <p className="text-xs text-gray-500">Séparez les tags par des virgules</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredArticlesCount">Nombre d'articles en vedette</Label>
            <Input 
              id="featuredArticlesCount"
              type="number"
              min={1}
              max={10}
              value={settings.featuredArticlesCount}
              onChange={(e) => handleChange("featuredArticlesCount", parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}; 