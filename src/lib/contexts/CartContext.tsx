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
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // État pour le panier invité (localStorage)
  const [localCart, setLocalCart] = useState<{ items: any[], totalAmount: number } | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      if (!currentUser) {
        // Si aucun utilisateur n'est connecté, charger le panier depuis localStorage
        const savedCart = localStorage.getItem('guestCart');
        const guestCart = savedCart ? JSON.parse(savedCart) : { items: [], totalAmount: 0 };
        setLocalCart(guestCart);
        setCart(null);
      } else {
        // Si un utilisateur est connecté, charger son panier depuis Firestore
        const userCart = await getUserCart(currentUser.uid);
        setCart(userCart);
        setLocalCart(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Mettre à jour le panier local lorsqu'il change dans localStorage
  useEffect(() => {
    if (!currentUser) {
      const handleStorageChange = () => {
        const savedCart = localStorage.getItem('guestCart');
        if (savedCart) {
          setLocalCart(JSON.parse(savedCart));
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Charger le panier initial depuis localStorage
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        setLocalCart(JSON.parse(savedCart));
      } else {
        setLocalCart({ items: [], totalAmount: 0 });
      }
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [currentUser]);
  
  // Calculer le nombre total d'articles dans le panier (connecté ou invité)
  const cartItemsCount = currentUser 
    ? (cart?.items.reduce((total, item) => total + item.quantity, 0) || 0)
    : (localCart?.items.reduce((total: number, item: any) => total + item.quantity, 0) || 0);
  
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