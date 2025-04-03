import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SecurityForm } from "@/components/profile/SecurityForm";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { VerificationForm } from "@/components/profile/VerificationForm";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  const { currentUser, isLoading } = useAuth();
  
  // Afficher un écran de chargement pendant le chargement des données
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Skeleton className="h-40 w-full rounded-lg mb-4" />
              <Skeleton className="h-8 w-3/4 rounded-lg mb-2" />
              <Skeleton className="h-8 w-1/2 rounded-lg" />
            </div>
            <div className="w-full md:w-2/3">
              <Skeleton className="h-12 w-3/4 rounded-lg mb-6" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Construire l'URL de l'avatar à partir du nom de l'utilisateur
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=0D8ABC&color=fff`;
  
  // Créer un objet utilisateur pour les composants du profil
  const user = {
    name: currentUser.displayName || 'Utilisateur',
    email: currentUser.email || '',
    avatar: currentUser.photoURL || avatarUrl,
    role: currentUser.role || 'user'
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
                {user.role === "admin" && (
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileForm user={user} />
              </TabsContent>
              
              <TabsContent value="security">
                <SecurityForm />
              </TabsContent>
              
              <TabsContent value="preferences">
                <PreferencesForm />
              </TabsContent>
              
              {user.role === "admin" && (
                <TabsContent value="verification">
                  <VerificationForm />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
