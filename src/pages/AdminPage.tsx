
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { mockArticles, mockUsers } from "@/data/mockData";
import { toast } from "sonner";
import { ArticleFormDialog } from "@/components/articles/ArticleFormDialog";
import { ArticleTable } from "@/components/articles/ArticleTable";
import { MaintenanceCard } from "@/components/admin/MaintenanceCard";
import { UserTable } from "@/components/admin/UserTable";
import { SettingsCard } from "@/components/admin/SettingsCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Article } from "@/components/ArticleCard";

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [users, setUsers] = useState(mockUsers);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleDeleteArticle = (id: string) => {
    setArticles(articles.filter(article => article.id !== id));
    toast.success("Article supprimé avec succès!");
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast.success("Utilisateur supprimé avec succès!");
  };

  const handleCreateArticle = (newArticle: Article) => {
    setArticles([newArticle, ...articles]);
    toast.success("Article créé avec succès!");
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    setArticles(articles.map(article => 
      article.id === updatedArticle.id ? updatedArticle : article
    ));
    toast.success("Article mis à jour avec succès!");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Administration</h1>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-8 flex items-start">
          <AlertTriangle className="text-amber-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Accès Administrateur Uniquement</h3>
            <p className="text-amber-700">
              Cette page est réservée aux administrateurs. Les tentatives d'accès non autorisées sont enregistrées et peuvent entraîner la suspension du compte.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <MaintenanceCard />
        </div>

        <Tabs defaultValue="articles">
          <TabsList className="mb-6">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="articles">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gérer les Articles</h2>
              <ArticleFormDialog onCreateArticle={handleCreateArticle} />
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : (
              <ArticleTable 
                articles={articles} 
                onDeleteArticle={handleDeleteArticle}
                onUpdateArticle={handleUpdateArticle}
              />
            )}
          </TabsContent>
          
          <TabsContent value="users">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gérer les Utilisateurs</h2>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvel Utilisateur
              </Button>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : (
              <UserTable users={users} onDeleteUser={handleDeleteUser} />
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <h2 className="text-xl font-semibold mb-4">Paramètres du Site</h2>
            
            <SettingsCard title="Paramètres Généraux">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du Site</Label>
                  <Input id="siteName" defaultValue="TruthBeacon" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Description du Site</Label>
                  <Input id="siteDescription" defaultValue="Vérification des faits pour l'ère numérique" />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="contactEmail">Email de Contact</Label>
                <Input id="contactEmail" type="email" defaultValue="contact@truthbeacon.com" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Switch id="enableRegistration" defaultChecked />
                <Label htmlFor="enableRegistration">Autoriser les nouvelles inscriptions d'utilisateurs</Label>
              </div>
            </SettingsCard>
            
            <SettingsCard 
              title="Paramètres Email"
              onSave={() => toast.success("Paramètres email enregistrés")}
            >
              <div className="space-y-2">
                <Label htmlFor="smtpHost">Hôte SMTP</Label>
                <Input id="smtpHost" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Nom d'utilisateur SMTP</Label>
                  <Input id="smtpUser" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                  <Input id="smtpPassword" type="password" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Switch id="enableEmailNotifications" defaultChecked />
                <Label htmlFor="enableEmailNotifications">Activer les notifications par email</Label>
              </div>
            </SettingsCard>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
