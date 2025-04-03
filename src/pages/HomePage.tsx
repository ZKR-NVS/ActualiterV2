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
    const fetchArticles = async () => {
      setIsLoading(true);
      
      try {
        let fetchedArticles;
        
        if (isSearchMode) {
          fetchedArticles = await searchArticles(searchTerm);
        } else if (activeTab === "all") {
          fetchedArticles = await getAllArticles();
        } else {
          fetchedArticles = await getArticlesByStatus(activeTab as "true" | "false" | "partial");
        }
        
        setArticles(transformArticlesForUI(fetchedArticles));
      } catch (error) {
        console.error("Erreur lors de la récupération des articles:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les articles. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
        
        // En cas d'erreur, utiliser les données mockées (si disponibles) ou un tableau vide
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [activeTab, toast, isSearchMode, searchTerm]);

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
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            La vérité au-delà des apparences
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            TruthBeacon se consacre à la vérification des actualités et vous aide à identifier ce qui est vrai, ce qui est faux, et ce qui se situe entre les deux.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="secondary">
              Comment ça marche
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white">
              Rejoignez-nous
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 container mx-auto px-4">
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold mb-4 md:mb-0">
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
              <TabsList>
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

        <ArticleList articles={articles} isLoading={isLoading} />

        {!isLoading && articles.length > 6 && !isSearchMode && (
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg">
              Charger plus d'articles
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

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Comment nous vérifions les faits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Recherche</h3>
              <p className="text-gray-600">Notre équipe de chercheurs rassemble des informations provenant de sources primaires, d'experts et de publications crédibles.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Analyse</h3>
              <p className="text-gray-600">Nous analysons soigneusement les preuves, en vérifiant leur cohérence, leur crédibilité et leur validité scientifique.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Vérification</h3>
              <p className="text-gray-600">Notre équipe éditoriale examine les résultats et attribue un statut de vérification basé sur les preuves recueillies.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
