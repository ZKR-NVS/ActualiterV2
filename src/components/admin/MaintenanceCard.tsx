import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMaintenanceMode } from "@/App";
import { AlertTriangle, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { synchronizeMaintenanceMode } from "@/lib/services/settingsService";
import { useState } from "react";

export const MaintenanceCard = () => {
  const { isMaintenanceMode, setMaintenanceMode } = useMaintenanceMode();
  const [isSynchronizing, setIsSynchronizing] = useState(false);

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!isMaintenanceMode);
    toast.success(`Mode maintenance ${!isMaintenanceMode ? 'activé' : 'désactivé'}!`);
  };

  const handleSynchronize = async () => {
    try {
      setIsSynchronizing(true);
      await synchronizeMaintenanceMode();
      toast.success("L'état du mode maintenance a été synchronisé entre tous les documents");
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast.error("Une erreur s'est produite lors de la synchronisation");
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
            checked={isMaintenanceMode}
            onCheckedChange={toggleMaintenanceMode}
            id="maintenance-mode"
          />
          <Label htmlFor="maintenance-mode" className="font-medium">
            {isMaintenanceMode ? 'Activé' : 'Désactivé'}
          </Label>
        </div>
      </div>
      
      {isMaintenanceMode && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Le mode maintenance est actuellement actif. Seuls les administrateurs peuvent accéder au site.
          </p>
        </div>
      )}
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSynchronize}
          disabled={isSynchronizing}
          className="flex items-center"
        >
          <RotateCw className="mr-2 h-4 w-4" />
          {isSynchronizing ? 'Synchronisation...' : 'Synchroniser l\'état entre tous les documents'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Utilisez ce bouton si vous constatez des incohérences entre les différents documents de configuration.
        </p>
      </div>
    </Card>
  );
};
