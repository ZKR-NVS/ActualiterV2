
import { VerificationBadge } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const VerificationForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de Vérification</CardTitle>
        <CardDescription>
          Personnalisez vos préférences de vérification d'articles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Types de vérification</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            <VerificationBadge status="true" />
            <VerificationBadge status="false" />
            <VerificationBadge status="partial" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="autoVerification">Vérification automatique</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Activer la suggestion automatique de vérification</span>
            <Switch id="autoVerification" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notifyVerification">Notifications</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Recevoir des notifications pour les nouvelles vérifications</span>
            <Switch id="notifyVerification" defaultChecked />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => toast.success("Paramètres de vérification enregistrés")}>
          Enregistrer les préférences
        </Button>
      </CardFooter>
    </Card>
  );
};
