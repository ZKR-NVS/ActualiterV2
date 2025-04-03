import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ThumbsUp, Reply, Flag, MessageSquare, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/lib/hooks/useAuth";
import { Comment, createComment, getCommentsByArticle, approveComment, likeComment, deleteComment, getUnapprovedComments } from "@/lib/services/commentService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSettings } from "@/lib/services/settingsService";

interface CommentSectionProps {
  articleId: string;
}

export const CommentSection = ({ articleId }: CommentSectionProps) => {
  const { user, isAdmin, isEditor } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [unapprovedComments, setUnapprovedComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  // Récupérer les commentaires de l'article
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier si les commentaires sont activés
        const settings = await getSettings();
        setCommentsEnabled(settings.general.enableComments);
        
        if (!settings.general.enableComments) {
          setIsLoading(false);
          return;
        }
        
        // Récupérer les commentaires (avec ou sans les non approuvés selon les droits)
        const includeUnapproved = isAdmin || isEditor;
        const commentsData = await getCommentsByArticle(articleId, includeUnapproved);
        
        // Si admin ou éditeur, récupérer les commentaires non approuvés séparément
        if (isAdmin || isEditor) {
          const allUnapproved = await getUnapprovedComments();
          const articleUnapproved = allUnapproved.filter(c => c.articleId === articleId);
          setUnapprovedComments(articleUnapproved);
        }
        
        // Filtrer les commentaires principaux et les réponses
        const mainComments = commentsData.filter(c => !c.parentId);
        const replyComments = commentsData.filter(c => !!c.parentId);
        
        // Ordonner les commentaires: d'abord les commentaires principaux
        setComments([...mainComments, ...replyComments]);
      } catch (error) {
        console.error("Erreur lors de la récupération des commentaires:", error);
        toast.error("Impossible de charger les commentaires");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [articleId, isAdmin, isEditor]);
  
  // Soumettre un nouveau commentaire
  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour commenter");
      return;
    }
    
    if (!newComment.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const commentData = {
        articleId,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL || undefined,
        content: newComment,
        // Si c'est un admin ou un éditeur, le commentaire est approuvé automatiquement
        isApproved: isAdmin || isEditor
      };
      
      await createComment(commentData);
      
      // Réinitialiser le formulaire
      setNewComment("");
      
      // Mettre à jour la liste des commentaires
      const updatedComments = await getCommentsByArticle(articleId, isAdmin || isEditor);
      setComments(updatedComments);
      
      toast.success(isAdmin || isEditor ? 
        "Commentaire publié" : 
        "Commentaire soumis et en attente d'approbation"
      );
    } catch (error) {
      console.error("Erreur lors de la publication du commentaire:", error);
      toast.error("Impossible de publier le commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Répondre à un commentaire
  const handleReply = async (parentId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour répondre");
      return;
    }
    
    if (!replyContent.trim()) {
      toast.error("La réponse ne peut pas être vide");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const replyData = {
        articleId,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL || undefined,
        content: replyContent,
        parentId,
        // Si c'est un admin ou un éditeur, la réponse est approuvée automatiquement
        isApproved: isAdmin || isEditor
      };
      
      await createComment(replyData);
      
      // Réinitialiser le formulaire
      setReplyContent("");
      setReplyTo(null);
      
      // Mettre à jour la liste des commentaires
      const updatedComments = await getCommentsByArticle(articleId, isAdmin || isEditor);
      setComments(updatedComments);
      
      toast.success(isAdmin || isEditor ? 
        "Réponse publiée" : 
        "Réponse soumise et en attente d'approbation"
      );
    } catch (error) {
      console.error("Erreur lors de la publication de la réponse:", error);
      toast.error("Impossible de publier la réponse");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Approuver un commentaire
  const handleApproveComment = async (commentId: string) => {
    try {
      await approveComment(commentId);
      
      // Mettre à jour la liste des commentaires
      const updatedComments = await getCommentsByArticle(articleId, true);
      setComments(updatedComments);
      
      // Mettre à jour la liste des commentaires non approuvés
      const allUnapproved = await getUnapprovedComments();
      const articleUnapproved = allUnapproved.filter(c => c.articleId === articleId);
      setUnapprovedComments(articleUnapproved);
      
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
        const updatedComments = await getCommentsByArticle(articleId, isAdmin || isEditor);
        setComments(updatedComments);
        
        toast.success("Commentaire supprimé");
      } catch (error) {
        console.error("Erreur lors de la suppression du commentaire:", error);
        toast.error("Impossible de supprimer le commentaire");
      }
    }
  };
  
  // Liker un commentaire
  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour aimer un commentaire");
      return;
    }
    
    try {
      await likeComment(commentId);
      
      // Mettre à jour la liste des commentaires
      const updatedComments = await getCommentsByArticle(articleId, isAdmin || isEditor);
      setComments(updatedComments);
    } catch (error) {
      console.error("Erreur lors du like du commentaire:", error);
      toast.error("Impossible d'aimer le commentaire");
    }
  };
  
  // Afficher le formulaire de réponse
  const toggleReplyForm = (commentId: string | null) => {
    setReplyTo(commentId);
    setReplyContent("");
  };
  
  // Formater la date
  const formatDate = (date: Date) => {
    return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  };
  
  if (!commentsEnabled) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Commentaires</h3>
        <Alert>
          <AlertTitle>Les commentaires sont désactivés</AlertTitle>
          <AlertDescription>
            Les commentaires ont été désactivés pour cet article par l'administrateur.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Commentaires</h3>
      
      {/* Formulaire de nouveau commentaire */}
      {user ? (
        <div className="mb-6">
          <Textarea
            placeholder="Ajouter un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] mb-2"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment} 
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? "Envoi en cours..." : "Publier"}
            </Button>
          </div>
        </div>
      ) : (
        <Alert className="mb-4">
          <AlertTitle>Connexion requise</AlertTitle>
          <AlertDescription>
            Vous devez être connecté pour publier un commentaire.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Section des commentaires non approuvés (pour modérateurs) */}
      {(isAdmin || isEditor) && unapprovedComments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-2">Commentaires en attente d'approbation ({unapprovedComments.length})</h4>
          <div className="space-y-4">
            {unapprovedComments.map(comment => (
              <Card key={comment.id} className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2 flex flex-row justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={comment.userPhotoURL} alt={comment.userName} />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{comment.userName}</p>
                      <p className="text-xs text-gray-500">{formatDate(new Date(comment.createdAt))}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleApproveComment(comment.id!)}
                      title="Approuver"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteComment(comment.id!)}
                      title="Supprimer"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="my-4" />
        </div>
      )}
      
      {/* Liste des commentaires */}
      {isLoading ? (
        // Skeleton loader pour les commentaires
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>Soyez le premier à commenter cet article</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments
            .filter(comment => !comment.parentId) // Uniquement les commentaires principaux
            .map(comment => (
              <div key={comment.id} className="space-y-3">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={comment.userPhotoURL} alt={comment.userName} />
                          <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{comment.userName}</p>
                          <p className="text-xs text-gray-500">{formatDate(new Date(comment.createdAt))}</p>
                        </div>
                      </div>
                      
                      {/* Options de modération */}
                      {(isAdmin || isEditor || user?.uid === comment.userId) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteComment(comment.id!)}
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm">{comment.content}</p>
                  </CardContent>
                  <CardFooter className="pt-1 flex justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleLikeComment(comment.id!)}
                        disabled={!user}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{comment.likes}</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2" 
                        onClick={() => toggleReplyForm(comment.id!)}
                        disabled={!user}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Répondre
                      </Button>
                    </div>
                    
                    {/* Bouton de signalement */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-red-500"
                      title="Signaler"
                      disabled={!user}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Formulaire de réponse */}
                {replyTo === comment.id && user && (
                  <Card className="ml-8">
                    <CardContent className="pt-4">
                      <Textarea
                        placeholder={`Répondre à ${comment.userName}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px] mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => toggleReplyForm(null)}
                        >
                          Annuler
                        </Button>
                        <Button 
                          onClick={() => handleReply(comment.id!)} 
                          disabled={isSubmitting || !replyContent.trim()}
                        >
                          {isSubmitting ? "Envoi..." : "Répondre"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Afficher les réponses */}
                {comments
                  .filter(reply => reply.parentId === comment.id)
                  .map(reply => (
                    <Card key={reply.id} className="ml-8">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-7 w-7 mr-2">
                              <AvatarImage src={reply.userPhotoURL} alt={reply.userName} />
                              <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{reply.userName}</p>
                              <p className="text-xs text-gray-500">{formatDate(new Date(reply.createdAt))}</p>
                            </div>
                          </div>
                          
                          {/* Options de modération */}
                          {(isAdmin || isEditor || user?.uid === reply.userId) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteComment(reply.id!)}
                              title="Supprimer"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm">{reply.content}</p>
                      </CardContent>
                      <CardFooter className="pt-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => handleLikeComment(reply.id!)}
                          disabled={!user}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          <span>{reply.likes}</span>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}; 