import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { getArticleById, incrementArticleViewCount } from "@/lib/services/articleService";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Tag, Eye, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CommentSection } from "@/components/articles/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const ArticleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const articleData = await getArticleById(id);
        
        if (!articleData) {
          toast.error("Article introuvable");
          navigate("/");
          return;
        }
        
        setArticle(articleData);
        
        // Incrémenter le compteur de vues
        await incrementArticleViewCount(id);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'article:", error);
        toast.error("Impossible de charger l'article");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, navigate]);
  
  // Formater la date
  const formatDate = (date: Date) => {
    return format(date, "d MMMM yyyy", { locale: fr });
  };
  
  // Partager l'article
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href
        });
      } catch (error) {
        console.error("Erreur lors du partage:", error);
      }
    } else {
      // Fallback: Copier l'URL dans le presse-papier
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        {isLoading ? (
          // Skeleton loader
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : article ? (
          <article className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <VerificationBadge status={article.verificationStatus} size="lg" />
                
                <div className="flex items-center text-gray-500">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span className="text-sm">{formatDate(article.publicationDate instanceof Date ? article.publicationDate : article.publicationDate.toDate())}</span>
                </div>
                
                <div className="flex items-center text-gray-500">
                  <User className="mr-1 h-4 w-4" />
                  <span className="text-sm">{article.author}</span>
                </div>
                
                {article.viewCount !== undefined && (
                  <div className="flex items-center text-gray-500">
                    <Eye className="mr-1 h-4 w-4" />
                    <span className="text-sm">{article.viewCount} vues</span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-auto"
                  onClick={handleShare}
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>
            
            {article.imageUrl && (
              <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-6">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="prose max-w-none">
              <p className="text-lg font-medium mb-4">{article.summary}</p>
              <p>{article.content}</p>
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <Tag className="h-4 w-4 text-gray-500" />
                {article.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <Separator className="my-8" />
            
            {/* Section des commentaires */}
            <CommentSection articleId={id!} />
          </article>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Article introuvable</h2>
            <p className="text-gray-500 mt-2">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/")}
            >
              Retourner à l'accueil
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}; 