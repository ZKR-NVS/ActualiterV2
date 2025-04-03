import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UploadCloud, Trash2, RefreshCw, Search, File, Image } from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/services/imageService";
import { storage } from "@/lib/firebase";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

interface Media {
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: Date;
}

export const MediaManager = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFolder, setCurrentFolder] = useState("articles");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMedia(currentFolder);
  }, [currentFolder]);

  const fetchMedia = async (folder: string) => {
    try {
      setIsLoading(true);
      
      // Réinitialiser la liste des médias
      setMediaList([]);
      
      // Obtenir la référence du dossier
      const folderRef = ref(storage, folder);
      
      // Lister tous les fichiers du dossier
      const result = await listAll(folderRef);
      
      // Obtenir les métadonnées et URL de chaque fichier
      const mediaPromises = result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        const metadata = await getMetadata(item);
        
        return {
          name: item.name,
          url: url,
          type: metadata.contentType || "unknown",
          size: metadata.size || 0,
          createdAt: new Date(metadata.timeCreated)
        } as Media;
      });
      
      // Attendre que toutes les promesses soient résolues
      const mediaItems = await Promise.all(mediaPromises);
      
      // Trier par date de création (plus récent en premier)
      mediaItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setMediaList(mediaItems);
    } catch (error) {
      console.error("Erreur lors de la récupération des médias:", error);
      toast.error("Impossible de charger les médias. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      // Gérer chaque fichier
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = Math.round(((i + 1) / files.length) * 100);
        setUploadProgress(progress);
        
        // Vérifier le type de fichier
        if (!file.type.startsWith("image/")) {
          toast.error(`Le fichier ${file.name} n'est pas une image.`);
          continue;
        }
        
        // Vérifier la taille du fichier (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Le fichier ${file.name} dépasse la limite de 5MB.`);
          continue;
        }
        
        await uploadImage(file, currentFolder);
        toast.success(`${file.name} téléchargé avec succès.`);
      }
      
      // Rafraîchir la liste
      fetchMedia(currentFolder);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Une erreur s'est produite lors du téléchargement.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Réinitialiser l'input file
      const fileInput = document.getElementById("media-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleDeleteMedia = async (media: Media) => {
    if (!confirm(`Voulez-vous vraiment supprimer ${media.name} ?`)) return;
    
    try {
      await deleteImage(media.url);
      toast.success("Média supprimé avec succès.");
      
      // Mettre à jour la liste
      setMediaList(mediaList.filter(m => m.url !== media.url));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer le média. Veuillez réessayer.");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const filteredMedia = mediaList.filter(media => 
    media.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestionnaire de médias</h2>
            <Button 
              onClick={() => fetchMedia(currentFolder)}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rafraîchir
            </Button>
          </div>
          
          <Tabs value={currentFolder} onValueChange={setCurrentFolder}>
            <TabsList>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="avatars">Avatars</TabsTrigger>
              <TabsTrigger value="logos">Logos</TabsTrigger>
            </TabsList>
            
            <div className="my-4 flex justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher des médias..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Input 
                  id="media-upload" 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
                <Button onClick={() => document.getElementById("media-upload")?.click()}>
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
            
            {isUploading && (
              <div className="my-2">
                <p className="text-sm mb-1">Téléchargement en cours: {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <TabsContent value={currentFolder}>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-md aspect-square"></div>
                  ))}
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-10">
                  <File className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">
                    {searchTerm ? "Aucun média ne correspond à votre recherche" : "Aucun média trouvé dans ce dossier"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredMedia.map((media) => (
                    <div 
                      key={media.url} 
                      className="group relative border rounded-md overflow-hidden"
                    >
                      {media.type.startsWith("image/") ? (
                        <img 
                          src={media.url} 
                          alt={media.name} 
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                          <File className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="p-2">
                        <p className="text-sm font-medium truncate" title={media.name}>
                          {media.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(media.size)}
                        </p>
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => handleDeleteMedia(media)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}; 