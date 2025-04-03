
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  description, 
  children,
  onSave
}) => {
  const handleSave = () => {
    onSave ? onSave() : toast.success("Paramètres enregistrés");
  };

  return (
    <Card className="p-6 mb-6">
      <CardHeader className="p-0 mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {children}
        <div className="mt-6">
          <Button onClick={handleSave}>Enregistrer les Paramètres</Button>
        </div>
      </CardContent>
    </Card>
  );
};
