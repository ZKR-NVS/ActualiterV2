import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Eye, AlertCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { getUnapprovedComments, approveComment, deleteComment, Comment } from "@/lib/services/commentService";
import { getArticleById } from "@/lib/services/articleService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export const CommentModeration = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [articleTitles, setArticleTitles] = useState<Record<string, string>>({});
  
  // Récupérer les commentaires en attente de modération
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const commentsData = await getUnapprovedComments();
        setComments(commentsData);
        setFilteredComments(commentsData);
        
        // Récupérer les titres des articles associés
        const articleIds = [...new Set(commentsData.map(c => c.articleId))];
        const titles: Record<string, string> = {};
        
        for (const articleId of articleIds) {
          try {
            const article = await getArticleById(articleId);
            if (article) {
              titles[articleId] = article.title;
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération de l'article ${articleId}:`, error);
          }
        }
        
        setArticleTitles(titles);
      } catch (error) {
        console.error("Erreur lors de la récupération des commentaires:", error);
        toast.error("Impossible de charger les commentaires");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, []);
  
  // Filtrer les commentaires
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredComments(comments);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = comments.filter(comment => 
      comment.content.toLowerCase().includes(query) || 
      comment.userName.toLowerCase().includes(query) ||
      articleTitles[comment.articleId]?.toLowerCase().includes(query)
    );
    
    setFilteredComments(filtered);
  }, [searchQuery, comments, articleTitles]);
  
  // Approuver un commentaire
  const handleApproveComment = async (commentId: string) => {
    try {
      await approveComment(commentId);
      
      // Mettre à jour la liste des commentaires
      setComments(comments.filter(c => c.id !== commentId));
      
      toast.success("Commentaire approuvé");
    } catch (error) {
      console.error("Erreur lors de l'approbation du commentaire:", error);
      toast.error("Impossible d'approuver le commentaire");
    }
  };
  
  // Supprimer un commentaire
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      try {
        await deleteComment(commentId);
        
        // Mettre à jour la liste des commentaires
        setComments(comments.filter(c => c.id !== commentId));
        
        toast.success("Commentaire supprimé");
      } catch (error) {
        console.error("Erreur lors de la suppression du commentaire:", error);
        toast.error("Impossible de supprimer le commentaire");
      }
    }
  };
  
  // Afficher les détails du commentaire
  const showCommentDetails = (comment: Comment) => {
    setSelectedComment(comment);
    setShowCommentDialog(true);
  };
  
  // Formater la date
  const formatDate = (date: Date) => {
    return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modération des commentaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher dans les commentaires..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              En attente
              {comments.length > 0 && (
                <Badge variant="destructive" className="ml-2">{comments.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {isLoading ? (
              // Skeleton loader
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun commentaire en attente</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tous les commentaires ont été modérés
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Article</TableHead>
                      <TableHead>Commentaire</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map(comment => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="font-medium">{comment.userName}</div>
                        </TableCell>
                        <TableCell>
                          {articleTitles[comment.articleId] || "Article inconnu"}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate">
                            {comment.content.length > 50 
                              ? `${comment.content.substring(0, 50)}...` 
                              : comment.content
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(comment.createdAt instanceof Date 
                            ? comment.createdAt 
                            : comment.createdAt.toDate()
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => showCommentDetails(comment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleApproveComment(comment.id!)}
                              className="text-green-500 border-green-200 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteComment(comment.id!)}
                              className="text-red-500 border-red-200 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Dialogue pour afficher les détails d'un commentaire */}
        <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails du commentaire</DialogTitle>
              <DialogDescription>
                {selectedComment && (
                  <div className="mt-4">
                    <div className="mb-4">
                      <strong>Article:</strong> {articleTitles[selectedComment.articleId] || "Article inconnu"}
                    </div>
                    <div className="mb-4">
                      <strong>Utilisateur:</strong> {selectedComment.userName}
                    </div>
                    <div className="mb-4">
                      <strong>Date:</strong> {selectedComment.createdAt instanceof Date 
                        ? formatDate(selectedComment.createdAt) 
                        : formatDate(selectedComment.createdAt.toDate())
                      }
                    </div>
                    <div className="mb-4">
                      <strong>Commentaire:</strong>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        {selectedComment.content}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDeleteComment(selectedComment.id!);
                          setShowCommentDialog(false);
                        }}
                      >
                        Supprimer
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          handleApproveComment(selectedComment.id!);
                          setShowCommentDialog(false);
                        }}
                      >
                        Approuver
                      </Button>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}; 