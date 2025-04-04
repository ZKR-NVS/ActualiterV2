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
import { CheckCircle, FileCheck, Users, Star, ArrowRight, BookOpen, Loader2, SearchX } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<UIArticle[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t, language } = useLanguage();

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
        { locale: language === 'fr' ? fr : undefined }
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
  }, [activeTab, isSearchMode, searchTerm, toast, language]);

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

  const loadMore = () => {
    // Implementation of loadMore function
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
            {(() => {
              const title = t("home.hero.title");
              const highlight = t("home.hero.titleHighlight");
              const parts = title.split(highlight);
              return (
                <>
                  {parts[0]}<span className="text-secondary">{highlight}</span>{parts[1] || ''}
                </>
              );
            })()}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10">
            {t("home.hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              {t("home.hero.howItWorks")}
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white text-lg px-8 py-6">
              {t("home.hero.joinUs")}
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
              <p className="text-muted-foreground">{t("home.stats.verifiedArticles")}</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">25K+</h3>
              <p className="text-muted-foreground">{t("home.stats.activeUsers")}</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">96%</h3>
              <p className="text-muted-foreground">{t("home.stats.satisfactionRate")}</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">12</h3>
              <p className="text-muted-foreground">{t("home.stats.verifiedSources")}</p>
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
                ? `${t("home.articles.searchResults")} "${searchTerm}"` 
                : t("home.articles.latestVerified")}
            </h2>
            
            <SearchBar 
              onSearch={handleSearch} 
              className="w-full md:w-auto" 
            />
          </div>
          
          {!isSearchMode && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full sm:w-auto justify-start">
                <TabsTrigger value="all">{t("home.articles.all")}</TabsTrigger>
                <TabsTrigger value="true">{t("home.articles.true")}</TabsTrigger>
                <TabsTrigger value="partial">{t("home.articles.partial")}</TabsTrigger>
                <TabsTrigger value="false">{t("home.articles.false")}</TabsTrigger>
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
                {t("home.articles.clearSearch")}
              </Button>
            </div>
          )}
        </div>

        {isLoading && !articles.length ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text={t("common.loading")} fullScreen={false} />
          </div>
        ) : (
          <ArticleList articles={articles} isLoading={isLoading} />
        )}

        {/* Load More Button */}
        {articles.length > 0 && !isLoading && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={loadMore}
              variant="outline"
              className="px-8 py-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2">
                    <Loader2 className="h-4 w-4" />
                  </span>
                  {t("common.loading")}
                </div>
              ) : (
                t("home.articles.loadMore")
              )}
            </Button>
          </div>
        )}
        
        {/* No Results Message */}
        {!isLoading && isSearchMode && articles.length === 0 && (
          <div className="text-center py-20">
            <SearchX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t("home.articles.noResults")}</h3>
            <p className="text-muted-foreground">
              {t("home.articles.noResultsDescription")} <Button 
                variant="link" 
                onClick={clearSearch} 
                className="p-0 h-auto text-primary"
              >
                {t("home.articles.viewAllArticles")}
              </Button>
            </p>
          </div>
        )}
      </section>

      {/* Verification Process Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("home.verification.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.verification.description")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("home.verification.step1Title")}</h3>
              <p className="text-gray-600">{t("home.verification.step1Description")}</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("home.verification.step2Title")}</h3>
              <p className="text-gray-600">{t("home.verification.step2Description")}</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("home.verification.step3Title")}</h3>
              <p className="text-gray-600">{t("home.verification.step3Description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("home.testimonials.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.testimonials.description")}
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
                  <p className="text-sm text-muted-foreground">{t("home.testimonials.journalist")}</p>
                </div>
              </div>
              <p className="italic text-gray-700">{t("home.testimonials.quote1")}</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/47.jpg" />
                  <AvatarFallback>TL</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">Thomas Laurent</h4>
                  <p className="text-sm text-muted-foreground">{t("home.testimonials.teacher")}</p>
                </div>
              </div>
              <p className="italic text-gray-700">{t("home.testimonials.quote2")}</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/68.jpg" />
                  <AvatarFallback>LB</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">Léa Blanchard</h4>
                  <p className="text-sm text-muted-foreground">{t("home.testimonials.student")}</p>
                </div>
              </div>
              <p className="italic text-gray-700">{t("home.testimonials.quote3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t("home.newsletter.title")}</h2>
            <p className="text-lg mb-8 text-white/90">
              {t("home.newsletter.description")}
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder={t("home.newsletter.placeholder")}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
              />
              <Button type="submit" variant="secondary" className="shrink-0">
                {t("home.newsletter.subscribe")}
              </Button>
            </form>
            <p className="text-sm mt-4 text-white/70">
              {t("home.newsletter.privacy")}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
