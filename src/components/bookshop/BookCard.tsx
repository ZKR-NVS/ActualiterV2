import { Book } from '@/lib/services/bookService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface BookCardProps {
  book: Book;
  onAddToCart: () => void;
}

export default function BookCard({ book, onAddToCart }: BookCardProps) {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const hasDiscount = book.discountPercentage && book.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? book.price - (book.price * book.discountPercentage! / 100)
    : book.price;
  
  // Gérer les erreurs d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };
  
  return (
    <Card 
      className="h-full overflow-hidden transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
        <div className="aspect-[3/4] w-full overflow-hidden bg-accent/10">
          <img 
            src={book.coverImage || '/placeholder.svg'} 
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            onError={handleImageError}
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2">
          {book.featured && (
            <Badge className="bg-primary text-white">
              {t('shop.featured')}
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          {hasDiscount && (
            <Badge className="bg-destructive text-white">
              -{book.discountPercentage}%
            </Badge>
          )}
        </div>
        
        {/* Prix et ajout au panier sur hover */}
        <div className={`absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-bold text-lg">
                {hasDiscount ? (
                  <>
                    <span className="text-red-300 line-through text-sm mr-2">{book.price.toFixed(2)}€</span>
                    <span>{(book.price * (1 - book.discountPercentage! / 100)).toFixed(2)}€</span>
                  </>
                ) : (
                  <span>{book.price.toFixed(2)}€</span>
                )}
              </p>
              {book.stock > 0 ? (
                <p className="text-green-300 text-xs">{t('shop.inStock')}</p>
              ) : (
                <p className="text-red-300 text-xs">{t('shop.outOfStock')}</p>
              )}
            </div>
            <Button 
              size="icon"
              variant="secondary"
              className="rounded-full"
              disabled={book.stock <= 0}
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart();
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold line-clamp-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
      </CardContent>
    </Card>
  );
} 