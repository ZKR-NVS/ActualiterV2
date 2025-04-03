
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMaintenanceMode } from "@/App";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const MaintenanceCard = () => {
  const { isMaintenanceMode, setMaintenanceMode } = useMaintenanceMode();

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!isMaintenanceMode);
    toast.success(`Mode maintenance ${!isMaintenanceMode ? 'activé' : 'désactivé'}!`);
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Le mode maintenance est actuellement actif. Seuls les administrateurs peuvent accéder au site.
          </p>
        </div>
      )}
    </Card>
  );
};
