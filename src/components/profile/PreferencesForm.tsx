
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const PreferencesForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Language</Label>
          <select className="w-full p-2 border rounded">
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Time Zone</Label>
          <select className="w-full p-2 border rounded">
            <option value="utc">UTC</option>
            <option value="est">Eastern Time</option>
            <option value="pst">Pacific Time</option>
            <option value="cet">Central European Time</option>
          </select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => toast.success("Preferences saved!")}>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
};
