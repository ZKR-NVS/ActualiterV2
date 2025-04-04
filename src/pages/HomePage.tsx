import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ArticleList } from "@/components/ArticleList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllArticles, 
  getArticlesByStatus, 
  searchArticles,
  Article as FirestoreArticle 
} from "@/lib/services/articleService";
import { Article as UIArticle } from "@/components/ArticleCard";
import { SearchBar } from "@/components/SearchBar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, FileCheck, Users, Star, ArrowRight, BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<UIArticle[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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

  useEffect(() => {
    // Si en mode recherche, effectuer la recherche avec le terme en cours
    if (isSearchMode && searchTerm.trim() !== "") {
      const fetchSearchResults = async () => {
        setIsLoading(true);
        try {
          const results = await searchArticles(searchTerm);
          setArticles(transformArticlesForUI(results));
        } catch (error) {
          console.error("Erreur lors de la recherche:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les résultats de recherche",
            variant: "destructive",
          });
          setArticles([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSearchResults();
    } else {
      // Sinon, charger les articles selon l'onglet actif
      const loadArticles = async () => {
        setIsLoading(true);
        try {
          let articlesData: FirestoreArticle[] = [];
          
          if (activeTab === "all") {
            articlesData = await getAllArticles();
          } else {
            articlesData = await getArticlesByStatus(activeTab as "true" | "false" | "partial");
          }
          
          setArticles(transformArticlesForUI(articlesData));
        } catch (error) {
          console.error("Erreur lors du chargement des articles:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les articles",
            variant: "destructive",
          });
          setArticles([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadArticles();
    }
  }, [activeTab, isSearchMode, searchTerm, toast]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearchMode(!!term);
    if (!term) {
      setActiveTab("all"); // Revenir à l'affichage de tous les articles si la recherche est vide
    }
  };

  const clearSearch = () => {
    setIsSearchMode(false);
    setSearchTerm("");
  };

  return (
    <Layout>
      {/* Hero Section - amélioré avec animation et call-to-action plus visible */}
      <section className="bg-primary py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block animate-bounce-slow mb-4">
            <CheckCircle className="h-12 w-12 text-white/80" />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            La vérité au-delà des <span className="text-secondary">apparences</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Actualiter se consacre à la vérification des actualités et vous aide à identifier ce qui est vrai, ce qui est faux, et ce qui se situe entre les deux.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Comment ça marche
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white text-lg px-8 py-6">
              Rejoignez-nous
            </Button>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
                <FileCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">750+</h3>
              <p className="text-muted-foreground">Articles vérifiés</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">25K+</h3>
              <p className="text-muted-foreground">Utilisateurs actifs</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">96%</h3>
              <p className="text-muted-foreground">Taux de satisfaction</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">12</h3>
              <p className="text-muted-foreground">Sources vérifiées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
              {isSearchMode 
                ? `Résultats pour "${searchTerm}"` 
                : "Derniers articles vérifiés"}
            </h2>
            
            <SearchBar 
              onSearch={handleSearch} 
              className="w-full md:w-auto" 
            />
          </div>
          
          {!isSearchMode && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full sm:w-auto justify-start">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="true">Vrai</TabsTrigger>
                <TabsTrigger value="partial">Partiel</TabsTrigger>
                <TabsTrigger value="false">Faux</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {isSearchMode && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSearch}
                className="text-primary hover:text-primary/80"
              >
                Effacer la recherche et voir tous les articles
              </Button>
            </div>
          )}
        </div>

        {isLoading && !articles.length ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Chargement des articles..." fullScreen={false} />
          </div>
        ) : (
          <ArticleList articles={articles} isLoading={isLoading} />
        )}

        {!isLoading && articles.length > 6 && !isSearchMode && (
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" className="group">
              Charger plus d'articles
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
        
        {!isLoading && isSearchMode && articles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">Aucun résultat trouvé</h3>
            <p className="text-muted-foreground">
              Aucun article ne correspond à votre recherche. Essayez d'autres termes ou
              <Button variant="link" onClick={clearSearch} className="px-1">
                consultez tous les articles
              </Button>.
            </p>
          </div>
        )}
      </section>

      {/* Section Procédé de vérification - amélioré avec des icônes et des animations */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Notre procédé de vérification</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une approche rigoureuse et transparente pour garantir l'exactitude des informations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Collecte d'informations</h3>
              <p className="text-gray-600">Notre équipe de chercheurs rassemble méticuleusement des données provenant de sources primaires, d'experts reconnus et de publications scientifiques crédibles.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Analyse approfondie</h3>
              <p className="text-gray-600">Nous analysons rigoureusement les preuves recueillies, en vérifiant leur cohérence, leur crédibilité et leur validité selon des critères scientifiques stricts.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Vérification et publication</h3>
              <p className="text-gray-600">Notre comité éditorial examine les conclusions et attribue un statut de vérification basé sur les preuves. Le processus complet est documenté pour une transparence totale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez ce que nos utilisateurs disent de notre plateforme
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/32.jpg" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">Sarah Martin</h4>
                  <p className="text-sm text-muted-foreground">Journaliste</p>
                </div>
              </div>
              <p className="italic text-gray-700">"Actualiter est devenu un outil indispensable dans mon travail quotidien. La fiabilité des vérifications me permet de rédiger des articles avec confiance."</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/47.jpg" />
                  <AvatarFallback>TL</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">Thomas Laurent</h4>
                  <p className="text-sm text-muted-foreground">Enseignant</p>
                </div>
              </div>
              <p className="italic text-gray-700">"J'utilise Actualiter avec mes élèves pour leur apprendre l'importance de la vérification des sources. C'est un excellent outil pédagogique pour développer l'esprit critique."</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/68.jpg" />
                  <AvatarFallback>LB</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">Léa Blanchard</h4>
                  <p className="text-sm text-muted-foreground">Étudiante</p>
                </div>
              </div>
              <p className="italic text-gray-700">"Dans l'ère de la désinformation, Actualiter est une bouffée d'air frais. L'interface est intuitive et les explications qui accompagnent chaque vérification sont très claires."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Restez informé</h2>
            <p className="text-lg mb-8 text-white/90">
              Abonnez-vous à notre newsletter pour recevoir les dernières vérifications et analyses directement dans votre boîte mail
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
              />
              <Button type="submit" variant="secondary" className="shrink-0">
                S'abonner
              </Button>
            </form>
            <p className="text-sm mt-4 text-white/70">
              Nous respectons votre vie privée. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
