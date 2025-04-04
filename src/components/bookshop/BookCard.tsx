import { Book } from '@/lib/services/bookService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  onAddToCart: () => void;
}

export default function BookCard({ book, onAddToCart }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const hasDiscount = book.discountPercentage && book.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? book.price - (book.price * book.discountPercentage! / 100)
    : book.price;
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        {/* Image du livre */}
        <img 
          src={book.coverImage || '/placeholder.svg'} 
          alt={book.title} 
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {book.featured && (
            <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">
              En vedette
            </Badge>
          )}
          
          {hasDiscount && (
            <Badge variant="destructive">
              -{book.discountPercentage}%
            </Badge>
          )}
          
          {book.stock <= 5 && book.stock > 0 && (
            <Badge variant="outline" className="bg-orange-100">
              Plus que {book.stock} en stock
            </Badge>
          )}
          
          {book.stock === 0 && (
            <Badge variant="outline" className="bg-red-100">
              Rupture de stock
            </Badge>
          )}
        </div>
        
        {/* Bouton de détails qui apparaît au survol */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button 
            variant="secondary" 
            className="flex items-center gap-2" 
            onClick={() => navigate(`/book/${book.id}`)}
          >
            <Eye size={16} />
            Voir les détails
          </Button>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
        <p className="text-muted-foreground text-sm mb-2">par {book.author}</p>
        
        <div className="flex items-baseline mt-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-primary">{discountedPrice.toFixed(2)} €</span>
              <span className="text-sm text-muted-foreground line-through ml-2">{book.price.toFixed(2)} €</span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">{book.price.toFixed(2)} €</span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {book.description || "Aucune description disponible."}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onAddToCart} 
          className="w-full" 
          disabled={book.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {book.stock === 0 ? "Indisponible" : "Ajouter au panier"}
        </Button>
      </CardFooter>
    </Card>
  );
} 