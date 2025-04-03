import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { 
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui";
import { getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead, Notification } from "@/lib/services/notificationService";
import { useAuth } from "@/lib/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userNotifications = await getUserNotifications(user.uid);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.id) {
      await markNotificationAsRead(notification.id);
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      
      // Rediriger si un lien est spécifié
      if (notification.link) {
        navigate(notification.link);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Erreur lors du marquage des notifications comme lues:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500">
              <span className="sr-only">{unreadCount} notifications non lues</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="py-2 px-4 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`p-4 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(notification.createdAt, "dd MMM HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-6 px-4 text-center text-muted-foreground">
              Aucune notification pour le moment
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 