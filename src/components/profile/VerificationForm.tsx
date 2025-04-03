import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { VerificationBadge } from "@/components/VerificationBadge";

export const VerificationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationTypes, setVerificationTypes] = useState({
    true: true,
    false: true,
    partial: true
  });
  const [autoVerification, setAutoVerification] = useState(false);
  const [verificationNotifications, setVerificationNotifications] = useState(true);
  
  const handleVerificationTypesChange = (value: "true" | "false" | "partial", checked: boolean) => {
    setVerificationTypes(prev => ({
      ...prev,
      [value]: checked
    }));
  };
  
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Préférences de vérification enregistrées");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences:", error);
      toast.error("Erreur lors de l'enregistrement des préférences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSavePreferences}>
        <CardHeader>
          <CardTitle>Paramètres de Vérification</CardTitle>
          <CardDescription>
            Personnalisez vos préférences de vérification d'articles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Types de vérification</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="trueVerification" 
                  checked={verificationTypes.true}
                  onCheckedChange={(checked) => 
                    handleVerificationTypesChange("true", checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="trueVerification" className="font-normal flex items-center gap-2">
                    <VerificationBadge status="true" showTooltip={false} />
                    Vérifié Vrai
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="falseVerification" 
                  checked={verificationTypes.false}
                  onCheckedChange={(checked) => 
                    handleVerificationTypesChange("false", checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="falseVerification" className="font-normal flex items-center gap-2">
                    <VerificationBadge status="false" showTooltip={false} />
                    Vérifié Faux
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="partialVerification" 
                  checked={verificationTypes.partial}
                  onCheckedChange={(checked) => 
                    handleVerificationTypesChange("partial", checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="partialVerification" className="font-normal flex items-center gap-2">
                    <VerificationBadge status="partial" showTooltip={false} />
                    Partiellement Vrai
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoVerification">
                Vérification automatique
                <p className="text-sm text-muted-foreground mt-1">
                  Activer la suggestion automatique de vérification
                </p>
              </Label>
              <Switch 
                id="autoVerification" 
                checked={autoVerification} 
                onCheckedChange={setAutoVerification}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="verificationNotifications">
                Notifications
                <p className="text-sm text-muted-foreground mt-1">
                  Recevoir des notifications pour les nouvelles vérifications
                </p>
              </Label>
              <Switch 
                id="verificationNotifications" 
                checked={verificationNotifications} 
                onCheckedChange={setVerificationNotifications}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer les préférences"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
