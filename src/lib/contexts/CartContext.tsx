import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Cart, CartItem, getUserCart } from '../services/bookService';

interface CartContextProps {
  cart: (Cart & { id: string }) | null;
  cartItemsCount: number;
  loading: boolean;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps>({
  cart: null,
  cartItemsCount: 0,
  loading: false,
  refetchCart: async () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<(Cart & { id: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  
  const fetchCart = async () => {
    if (!currentUser) {
      setCart(null);
      return;
    }
    
    try {
      setLoading(true);
      const fetchedCart = await getUserCart(currentUser.uid);
      
      // Sécuriser les timestamps du panier
      const safeCart = secureFetchedCart(fetchedCart);
      setCart(safeCart);
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour sécuriser les timestamps du panier
  const secureFetchedCart = (cart: (Cart & { id: string }) | null): (Cart & { id: string }) | null => {
    if (!cart) return null;
    
    // Créer une copie sécurisée
    const safeCopy = { ...cart };
    
    // Sécuriser les timestamps des articles
    if (Array.isArray(safeCopy.items)) {
      safeCopy.items = safeCopy.items.map(item => {
        const safeItem = { ...item };
        
        if (safeItem.updatedAt && typeof safeItem.updatedAt === 'object' && 'seconds' in safeItem.updatedAt) {
          try {
            // @ts-ignore - nous savons que c'est un Timestamp
            safeItem.updatedAt = new Date(safeItem.updatedAt.seconds * 1000).toISOString();
          } catch (e) {
            safeItem.updatedAt = null;
          }
        }
        
        return safeItem;
      });
    }
    
    // Sécuriser le timestamp du panier
    if (safeCopy.updatedAt && typeof safeCopy.updatedAt === 'object' && 'seconds' in safeCopy.updatedAt) {
      try {
        // @ts-ignore - nous savons que c'est un Timestamp
        safeCopy.updatedAt = new Date(safeCopy.updatedAt.seconds * 1000).toISOString();
      } catch (e) {
        safeCopy.updatedAt = null;
      }
    }
    
    return safeCopy;
  };
  
  // Calculer le nombre total d'articles dans le panier
  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  
  useEffect(() => {
    fetchCart();
  }, [currentUser]);
  
  const refetchCart = async () => {
    await fetchCart();
  };
  
  return (
    <CartContext.Provider value={{ cart, cartItemsCount, loading, refetchCart }}>
      {children}
    </CartContext.Provider>
  );
}; 