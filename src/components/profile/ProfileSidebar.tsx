import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface ProfileSidebarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Synchroniser l'état du mode sombre avec le thème réel
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);
  
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="w-full md:w-1/3 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm mt-2">
              {capitalizeFirstLetter(user.role)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch 
                id="emailNotifications" 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <Switch 
                id="darkMode" 
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <Switch 
                id="twoFactorAuth" 
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Badges de Vérification</CardTitle>
          <CardDescription>Exemples de badges de vérification des articles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <VerificationBadge status="true" showTooltip={true} />
            <VerificationBadge status="false" showTooltip={true} />
            <VerificationBadge status="partial" showTooltip={true} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fonction utilitaire pour obtenir les initiales à partir du nom
const getInitials = (name: string): string => {
  if (!name) return "??";
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// Fonction utilitaire pour mettre en majuscule la première lettre
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};
