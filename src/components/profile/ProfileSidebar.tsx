
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VerificationBadge } from "@/components/VerificationBadge";

interface ProfileSidebarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  return (
    <div className="w-full md:w-1/3 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm mt-2">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch id="emailNotifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <Switch id="darkMode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <Switch id="twoFactorAuth" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full">Sign Out</Button>
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
