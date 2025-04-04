import { ArticleCard, Article } from "./ArticleCard";
import { SkeletonList } from "@/components/ui/loading-spinner";

interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({ 
  articles, 
  isLoading = false 
}) => {
  if (isLoading) {
    return <SkeletonList count={6} />;
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium text-gray-600">No articles found</h3>
        <p className="text-gray-500 mt-2">Check back soon for new fact-checked content</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};
