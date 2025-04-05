import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/lib/contexts/AuthContext';
import { 
  getAllOrders,
  Order, 
  updateOrderStatus 
} from '@/lib/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Search, 
  ShoppingBag, 
  Calendar, 
  Clock,
  TruckIcon,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrderManagementPage() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<Order['paymentStatus'] | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    fetchOrders();
  }, [isAdmin, navigate]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      
      // Mettre à jour la liste des commandes
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status } 
          : order
      ));
      
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const handlePaymentStatusChange = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      await updateOrderStatus(orderId, undefined, paymentStatus);
      
      // Mettre à jour la liste des commandes
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, paymentStatus } 
          : order
      ));
      
      toast({
        title: "Statut de paiement mis à jour",
        description: "Le statut de paiement a été mis à jour avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de paiement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de paiement. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">En traitement</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">Expédiée</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Annulée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Payée</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Échouée</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Remboursée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      // Si c'est un timestamp Firestore
      if (timestamp.toDate) {
        return format(timestamp.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr });
      }
      
      // Sinon, essayons de le considérer comme une date
      return format(new Date(timestamp), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };
  
  const filteredOrders = orders.filter(order => {
    // Filtrage par recherche
    const searchMatch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrage par statut
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    
    // Filtrage par statut de paiement
    const paymentStatusMatch = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
    
    return searchMatch && statusMatch && paymentStatusMatch;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 min-h-screen flex justify-center items-center">
          <LoadingSpinner size="lg" text="Chargement des commandes..." />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <ShoppingBag className="mr-2 h-6 w-6" />
          Gestion des Commandes
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Commandes en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Revenus totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders
                  .filter(o => o.paymentStatus === 'paid')
                  .reduce((total, order) => total + order.totalAmount, 0)
                  .toFixed(2)} €
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une commande..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex gap-2 flex-col md:flex-row md:items-center">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrer:</span>
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentStatusFilter} onValueChange={(value) => setPaymentStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="failed">Échouée</SelectItem>
                <SelectItem value="refunded">Remboursée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Aucune commande trouvée</h2>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all' 
                    ? "Aucune commande ne correspond à vos critères de recherche."
                    : "Aucune commande n'a encore été passée dans la boutique."}
                </p>
                {(searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPaymentStatusFilter('all');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id?.substring(0, 8)}...</TableCell>
                      <TableCell>{order.shippingAddress.fullName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.totalAmount.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={order.status} 
                          onValueChange={(value) => handleStatusChange(order.id!, value as Order['status'])}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder={getStatusBadge(order.status)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="processing">En traitement</SelectItem>
                            <SelectItem value="shipped">Expédiée</SelectItem>
                            <SelectItem value="delivered">Livrée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={order.paymentStatus} 
                          onValueChange={(value) => handlePaymentStatusChange(order.id!, value as Order['paymentStatus'])}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder={getPaymentStatusBadge(order.paymentStatus)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="paid">Payée</SelectItem>
                            <SelectItem value="failed">Échouée</SelectItem>
                            <SelectItem value="refunded">Remboursée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      
                      // Afficher seulement certaines pages pour éviter l'encombrement
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Afficher des points de suspension pour les pages intermédiaires
                      if (
                        (page === 2 && currentPage > 3) || 
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de détails de commande */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.id?.substring(0, 8)}</DialogTitle>
            <DialogDescription>
              Commande passée le {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Informations client</h3>
                  <Card>
                    <CardContent className="p-4">
                      <p><span className="font-medium">Nom :</span> {selectedOrder.shippingAddress.fullName}</p>
                      <p><span className="font-medium">Adresse :</span> {selectedOrder.shippingAddress.address}</p>
                      <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      {selectedOrder.shippingAddress.phone && (
                        <p><span className="font-medium">Téléphone :</span> {selectedOrder.shippingAddress.phone}</p>
                      )}
                      <p className="mt-2"><span className="font-medium">ID Client :</span> {selectedOrder.userId}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Informations commande</h3>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Statut :</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Paiement :</span>
                        {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Mode de paiement :</span>
                        <span>{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total :</span>
                        <span className="font-semibold">{selectedOrder.totalAmount.toFixed(2)} €</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <h3 className="text-sm font-medium mb-2">Articles commandés</h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Livre</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.books.map((book) => (
                      <TableRow key={book.bookId}>
                        <TableCell>{book.title}</TableCell>
                        <TableCell className="text-right">{book.price.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{book.quantity}</TableCell>
                        <TableCell className="text-right">{(book.price * book.quantity).toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
} 