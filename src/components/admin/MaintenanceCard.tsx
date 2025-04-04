import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMaintenanceMode } from "@/App";
import { AlertTriangle, RotateCw, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { synchronizeMaintenanceMode, getGlobalSettings, updateMaintenanceMode } from "@/lib/services/settingsService";
import { useState, useEffect } from "react";

export const MaintenanceCard = () => {
  const { isMaintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [localState, setLocalState] = useState(isMaintenanceMode);

  // S'assurer que l'état local est synchronisé avec le contexte
  useEffect(() => {
    setLocalState(isMaintenanceMode);
  }, [isMaintenanceMode]);

  const toggleMaintenanceMode = async () => {
    try {
      // Démarrer avec optimistic UI update
      setLocalState(!localState);
      
      // Mettre à jour dans Firebase
      await updateMaintenanceMode(!localState);
      
      // Mettre à jour l'état global une fois la mise à jour réussie
      setMaintenanceMode(!localState);
      
      toast.success(`Mode maintenance ${!localState ? 'activé' : 'désactivé'}!`);
    } catch (error) {
      console.error("Erreur lors de la modification du mode maintenance:", error);
      
      // Revenir à l'état précédent en cas d'erreur
      setLocalState(localState);
      
      toast.error("Erreur lors de la modification du mode maintenance");
    }
  };

  // Synchroniser en utilisant le plus récent
  const handleSynchronize = async () => {
    try {
      setIsSynchronizing(true);
      
      // Exécuter la synchronisation (sans forcer de source)
      await synchronizeMaintenanceMode();
      
      // Récupérer l'état actuel après la synchronisation
      const settings = await getGlobalSettings();
      
      // Mettre à jour l'état local et global
      setLocalState(settings.maintenanceMode);
      setMaintenanceMode(settings.maintenanceMode);
      
      toast.success(`Synchronisation automatique terminée (${settings.maintenanceMode ? 'Activé' : 'Désactivé'})`);
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast.error("Une erreur s'est produite lors de la synchronisation");
    } finally {
      setIsSynchronizing(false);
    }
  };

  // Synchroniser en utilisant le document global comme source
  const syncFromGlobal = async () => {
    try {
      setIsSynchronizing(true);
      
      // Forcer la synchronisation depuis le document global
      await synchronizeMaintenanceMode('global');
      
      // Récupérer l'état actuel après la synchronisation
      const settings = await getGlobalSettings();
      
      // Mettre à jour l'état local et global
      setLocalState(settings.maintenanceMode);
      setMaintenanceMode(settings.maintenanceMode);
      
      toast.success(`Synchronisé depuis GLOBAL (${settings.maintenanceMode ? 'Activé' : 'Désactivé'})`);
    } catch (error) {
      console.error("Erreur lors de la synchronisation depuis global:", error);
      toast.error("Une erreur s'est produite lors de la synchronisation");
    } finally {
      setIsSynchronizing(false);
    }
  };

  // Synchroniser en utilisant le document site comme source
  const syncFromSite = async () => {
    try {
      setIsSynchronizing(true);
      
      // Forcer la synchronisation depuis le document site
      await synchronizeMaintenanceMode('site');
      
      // Récupérer l'état actuel après la synchronisation
      const settings = await getGlobalSettings();
      
      // Mettre à jour l'état local et global
      setLocalState(settings.maintenanceMode);
      setMaintenanceMode(settings.maintenanceMode);
      
      toast.success(`Synchronisé depuis SITE (${settings.maintenanceMode ? 'Activé' : 'Désactivé'})`);
    } catch (error) {
      console.error("Erreur lors de la synchronisation depuis site:", error);
      toast.error("Une erreur s'est produite lors de la synchronisation");
    } finally {
      setIsSynchronizing(false);
    }
  };

  // Forcer l'activation du mode maintenance
  const forceEnable = async () => {
    try {
      setIsSynchronizing(true);
      
      // Forcer l'activation du mode maintenance
      await updateMaintenanceMode(true);
      
      // Mettre à jour l'état local et global
      setLocalState(true);
      setMaintenanceMode(true);
      
      toast.success("Mode maintenance forcé à ACTIVÉ");
    } catch (error) {
      console.error("Erreur lors de l'activation forcée:", error);
      toast.error("Erreur lors de l'activation forcée du mode maintenance");
    } finally {
      setIsSynchronizing(false);
    }
  };

  // Forcer la désactivation du mode maintenance
  const forceDisable = async () => {
    try {
      setIsSynchronizing(true);
      
      // Forcer la désactivation du mode maintenance
      await updateMaintenanceMode(false);
      
      // Mettre à jour l'état local et global
      setLocalState(false);
      setMaintenanceMode(false);
      
      toast.success("Mode maintenance forcé à DÉSACTIVÉ");
    } catch (error) {
      console.error("Erreur lors de la désactivation forcée:", error);
      toast.error("Erreur lors de la désactivation forcée du mode maintenance");
    } finally {
      setIsSynchronizing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Mode Maintenance</h2>
          <p className="text-gray-500">Lorsqu'il est activé, les utilisateurs verront une page de maintenance</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            checked={localState}
            onCheckedChange={toggleMaintenanceMode}
            id="maintenance-mode"
            disabled={isSynchronizing}
          />
          <Label htmlFor="maintenance-mode" className="font-medium">
            {localState ? 'Activé' : 'Désactivé'}
          </Label>
        </div>
      </div>
      
      {localState && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Le mode maintenance est actuellement actif. Seuls les administrateurs peuvent accéder au site.
          </p>
        </div>
      )}
      
      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSynchronize}
          disabled={isSynchronizing}
            className="flex items-center flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isSynchronizing ? 'Synchronisation...' : 'Sync Auto'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncFromGlobal}
            disabled={isSynchronizing}
            className="flex items-center flex-1 bg-blue-50 hover:bg-blue-100"
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Depuis Global
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncFromSite}
            disabled={isSynchronizing}
            className="flex items-center flex-1 bg-green-50 hover:bg-green-100"
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Depuis Site
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={forceEnable}
            disabled={isSynchronizing || localState}
            className="flex items-center flex-1 text-red-600 bg-red-50 hover:bg-red-100"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Forcer Activation
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={forceDisable}
            disabled={isSynchronizing || !localState}
            className="flex items-center flex-1 text-green-600 bg-green-50 hover:bg-green-100"
        >
          <RotateCw className="mr-2 h-4 w-4" />
            Forcer Désactivation
        </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          En cas de problème: utilisez "Depuis Global" ou "Depuis Site" pour spécifier quelle configuration utiliser comme source de vérité.
          Les boutons "Forcer" mettent à jour directement les deux documents.
        </p>
      </div>
    </Card>
  );
};
