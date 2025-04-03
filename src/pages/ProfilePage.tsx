import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SecurityForm } from "@/components/profile/SecurityForm";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { VerificationForm } from "@/components/profile/VerificationForm";
import { useAuth } from "@/lib/contexts/AuthContext";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  
  // S'assurer que nous avons un utilisateur (devrait être garanti par ProtectedRoute)
  if (!currentUser) {
    return <div>Chargement...</div>;
  }

  // Préparation des données pour l'affichage
  const user = {
    name: currentUser.displayName || "Utilisateur",
    email: currentUser.email,
    avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || "User")}&background=0D8ABC&color=fff`,
    role: currentUser.role
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <ProfileSidebar user={user} />
          
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileForm />
              </TabsContent>
              
              <TabsContent value="security">
                <SecurityForm />
              </TabsContent>
              
              <TabsContent value="preferences">
                <PreferencesForm />
              </TabsContent>
              
              <TabsContent value="verification">
                <VerificationForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
