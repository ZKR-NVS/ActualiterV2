import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ArticleFormDialog } from "@/components/articles/ArticleFormDialog";
import { ArticleTable } from "@/components/articles/ArticleTable";
import { MaintenanceCard } from "@/components/admin/MaintenanceCard";
import { UserTable } from "@/components/admin/UserTable";
import { UserFormDialog } from "@/components/admin/UserFormDialog";
import { SettingsCard } from "@/components/admin/SettingsCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Article as UIArticle } from "@/components/ArticleCard";
import { getAllArticles, deleteArticle, updateArticle as updateFirestoreArticle, createArticle as createFirestoreArticle, Article as FirestoreArticle } from "@/lib/services/articleService";
import { User, getAllUsers, deleteUser, updateUserProfile } from "@/lib/services/authService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Interface pour les utilisateurs adaptée à l'affichage dans le tableau admin
interface AdminUIUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: string;
}

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<UIArticle[]>([]);
  const [users, setUsers] = useState<AdminUIUser[]>([]);
  const { toast: uiToast } = useToast();

  // Convertir les articles Firestore en format d'affichage UI
  const transformArticlesForUI = (firestoreArticles: FirestoreArticle[]): UIArticle[] => {
    return firestoreArticles.map(article => ({
      id: article.id || "",
      title: article.title,
      excerpt: article.summary,
      image: article.imageUrl,
      date: format(
        article.publicationDate instanceof Date 
        ? article.publicationDate 
        : article.publicationDate.toDate(), 
        "d MMMM yyyy", 
        { locale: fr }
      ),
      author: article.author,
      verificationStatus: article.verificationStatus
    }));
  };

  // Convertir les utilisateurs Firestore en format d'affichage UI
  const transformUsersForUI = (firestoreUsers: User[]): AdminUIUser[] => {
    return firestoreUsers.map(user => ({
      id: user.uid,
      name: user.displayName,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin 
        ? format(
            user.lastLogin instanceof Date 
            ? user.lastLogin 
            : user.lastLogin.toDate(), 
            "d MMMM yyyy", 
            { locale: fr }
          ) 
        : "Jamais",
      status: user.lastLogin ? "Actif" : "Inactif"
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Récupérer les articles depuis Firestore
        const articlesData = await getAllArticles();
        setArticles(transformArticlesForUI(articlesData));
        
        // Récupérer les utilisateurs depuis Firestore
        const usersData = await getAllUsers();
        setUsers(transformUsersForUI(usersData));
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        uiToast({
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [uiToast]);

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
      setArticles(articles.filter(article => article.id !== id));
      toast.success("Article supprimé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article:", error);
      uiToast({
        title: "Erreur",
        description: "Impossible de supprimer l'article. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      toast.success("Utilisateur supprimé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      uiToast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }
  };

  const handleCreateArticle = async (newUIArticle: UIArticle) => {
    try {
      // Convertir l'article UI en format Firestore
      const firestoreArticle: Omit<FirestoreArticle, "id" | "createdAt" | "updatedAt"> = {
        title: newUIArticle.title,
        summary: newUIArticle.excerpt,
        content: newUIArticle.excerpt || "",
        source: "",
        author: newUIArticle.author,
        imageUrl: newUIArticle.image || "",
        publicationDate: new Date(),
        verificationStatus: newUIArticle.verificationStatus as "true" | "false" | "partial",
        tags: []
      };
      
      // Créer l'article dans Firestore
      const newArticleId = await createFirestoreArticle(firestoreArticle);
      
      // Ajouter l'article à l'état local avec l'ID généré
      setArticles([{ ...newUIArticle, id: newArticleId }, ...articles]);
      toast.success("Article créé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la création de l'article:", error);
      uiToast({
        title: "Erreur",
        description: "Impossible de créer l'article. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateArticle = async (updatedUIArticle: UIArticle) => {
    try {
      // Récupérer l'article complet depuis Firestore
      const firestoreArticles = await getAllArticles();
      const existingArticle = firestoreArticles.find(article => article.id === updatedUIArticle.id);
      
      if (existingArticle) {
        // Mettre à jour uniquement les champs modifiés
        const updates: Partial<FirestoreArticle> = {
          title: updatedUIArticle.title,
          summary: updatedUIArticle.excerpt,
          author: updatedUIArticle.author,
          verificationStatus: updatedUIArticle.verificationStatus
        };
        
        if (updatedUIArticle.image) {
          updates.imageUrl = updatedUIArticle.image;
        }
        
        // Mettre à jour l'article dans Firestore
        await updateFirestoreArticle(updatedUIArticle.id, updates);
        
        // Mettre à jour l'état local
        setArticles(articles.map(article => 
          article.id === updatedUIArticle.id ? updatedUIArticle : article
        ));
        
        toast.success("Article mis à jour avec succès!");
      } else {
        throw new Error("Article introuvable");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article:", error);
      uiToast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = (newUser: User) => {
    try {
      // Créer un nouvel utilisateur UI à partir des données Firebase
      const newUIUser: AdminUIUser = {
        id: newUser.uid,
        name: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        lastLogin: "Jamais",
        status: "Inactif"
      };
      
      // Mettre à jour l'état des utilisateurs
      setUsers([newUIUser, ...users]);
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur à l'interface:", error);
      uiToast({
        title: "Erreur",
        description: "L'utilisateur a été créé mais n'a pas pu être ajouté à l'interface.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: "user" | "admin" | "verifier") => {
    try {
      await updateUserProfile(userId, { role: newRole });
      
      // Mettre à jour l'utilisateur dans l'interface
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      toast.success("Rôle de l'utilisateur mis à jour avec succès!");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      uiToast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle de l'utilisateur.",
        variant: "destructive"
      });
    }
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
              <UserFormDialog onUserCreated={handleCreateUser} />
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : (
              <UserTable 
                users={users} 
                onDeleteUser={handleDeleteUser} 
                onEditUser={(user) => {
                  // Pour l'instant, nous ne modifions que le rôle
                  const newRole = user.role === "admin" 
                    ? "user" 
                    : user.role === "user" 
                      ? "verifier" 
                      : "admin";
                  
                  if (window.confirm(`Changer le rôle de ${user.name} en ${newRole}?`)) {
                    handleUpdateUserRole(user.id, newRole as "user" | "admin" | "verifier");
                  }
                }} 
              />
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
