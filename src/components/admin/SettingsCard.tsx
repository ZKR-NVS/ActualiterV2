import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Save } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
  onSave: () => void;
  onReset: () => void;
  isLoading: boolean;
  isDirty: boolean;
}

export const SettingsCard = ({
  title,
  description,
  children,
  onSave,
  onReset,
  isLoading,
  isDirty
}: SettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isLoading || !isDirty}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading || !isDirty}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
