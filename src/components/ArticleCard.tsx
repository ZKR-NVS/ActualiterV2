import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { VerificationBadge } from "./VerificationBadge";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  date: string;
  author: string;
  verificationStatus: "true" | "false" | "partial";
}

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/article/${article.id}`}>
        {article.image && (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105" 
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold line-clamp-2">{article.title}</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 mb-4">{article.excerpt}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{article.author}</span>
            <span className="mx-2">•</span>
            <span>{article.date}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-4">
          <VerificationBadge status={article.verificationStatus} />
        </CardFooter>
      </Link>
    </Card>
  );
};
