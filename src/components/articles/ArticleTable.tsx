
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Edit, Trash2 } from "lucide-react";
import { ArticleFormDialog } from "./ArticleFormDialog";
import { toast } from "sonner";
import { Article } from "@/components/ArticleCard";

interface ArticleTableProps {
  articles: Article[];
  onDeleteArticle: (id: string) => void;
  onUpdateArticle: (article: Article) => void;
}

export const ArticleTable: React.FC<ArticleTableProps> = ({ 
  articles, 
  onDeleteArticle,
  onUpdateArticle
}) => {
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);

  const handleEditClick = (article: Article) => {
    setArticleToEdit(article);
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    onUpdateArticle(updatedArticle);
    setArticleToEdit(null);
    toast.success("Article mis à jour avec succès!");
  };

  return (
    <>
      {articleToEdit && (
        <ArticleFormDialog 
          onCreateArticle={handleUpdateArticle}
          isEditMode={true}
          articleToEdit={articleToEdit}
          dialogTitle="Modifier l'article"
          buttonText="Modifier"
        />
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.date}</TableCell>
                <TableCell>{article.author}</TableCell>
                <TableCell>
                  <VerificationBadge status={article.verificationStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditClick(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDeleteArticle(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
