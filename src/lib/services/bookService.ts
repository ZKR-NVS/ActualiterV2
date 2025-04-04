import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp,
  FieldValue,
  setDoc,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

// Fonction utilitaire pour convertir les timestamps Firebase en formats utilisables par React
const parseTimestamps = (data: any) => {
  if (!data) return data;
  
  // Créer une copie pour ne pas modifier l'original
  const result = { ...data };
  
  // Convertir les timestamps courants
  if (result.createdAt && typeof result.createdAt.toDate === 'function') {
    result.createdAt = result.createdAt.toDate().toISOString();
  }
  
  if (result.updatedAt && typeof result.updatedAt.toDate === 'function') {
    result.updatedAt = result.updatedAt.toDate().toISOString();
  }
  
  return result;
};

export interface Book {
  id?: string;
  title: string;
  author: string;
  description: string;
  price: number;
  stock: number;
  coverImage: string;
  pdfUrl?: string;
  category: string;
  isbn?: string;
  publicationDate?: string;
  publisher?: string;
  pages?: number;
  language?: string;
  featured?: boolean;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

// Récupérer tous les livres
export const getAllBooks = async () => {
  try {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...parseTimestamps(doc.data())
    })) as Book[];
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    throw error;
  }
};

// Récupérer les livres par catégorie
export const getBooksByCategory = async (category: string) => {
  try {
    const booksRef = collection(db, 'books');
    const q = query(
      booksRef, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...parseTimestamps(doc.data())
    })) as Book[];
  } catch (error) {
    console.error(`Erreur lors de la récupération des livres de la catégorie ${category}:`, error);
    throw error;
  }
};

// Récupérer les livres en vedette
export const getFeaturedBooks = async () => {
  try {
    const booksRef = collection(db, 'books');
    const q = query(
      booksRef, 
      where('featured', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...parseTimestamps(doc.data())
    })) as Book[];
  } catch (error) {
    console.error('Erreur lors de la récupération des livres en vedette:', error);
    throw error;
  }
};

// Récupérer un livre par son ID
export const getBookById = async (bookId: string) => {
  try {
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (bookSnap.exists()) {
      return {
        id: bookSnap.id,
        ...parseTimestamps(bookSnap.data())
      } as Book;
    } else {
      throw new Error('Livre non trouvé');
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du livre avec l'ID ${bookId}:`, error);
    throw error;
  }
};

// Rechercher des livres
export const searchBooks = async (searchTerm: string) => {
  try {
    // Note: Firestore ne supporte pas la recherche par texte intégral
    // Ceci est une implémentation simple qui recherche dans les titres et auteurs
    const booksRef = collection(db, 'books');
    const querySnapshot = await getDocs(booksRef);
    
    const results = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...parseTimestamps(doc.data())
      }) as Book)
      .filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    return results;
  } catch (error) {
    console.error(`Erreur lors de la recherche de livres avec le terme "${searchTerm}":`, error);
    throw error;
  }
};

// Ajouter un nouveau livre
export const addBook = async (
  bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>, 
  coverImageFile?: File,
  pdfFile?: File
) => {
  try {
    // Utiliser l'image fournie par l'utilisateur ou l'image par défaut
    const bookWithTimestamp = {
      ...bookData,
      coverImage: bookData.coverImage || '/placeholder.svg',
      pdfUrl: '',  // Pas de support pour les PDF sans Storage
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'books'), bookWithTimestamp);
    
    return {
      id: docRef.id,
      ...bookWithTimestamp
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    throw error;
  }
};

// Mettre à jour un livre
export const updateBook = async (
  bookId: string, 
  bookData: Partial<Book>, 
  coverImageFile?: File,
  pdfFile?: File
) => {
  try {
    const bookRef = doc(db, 'books', bookId);
    
    // Préparer les données de mise à jour
    const updatedData = { 
      ...bookData,
      // Conserver l'image existante ou utiliser celle fournie dans bookData
      coverImage: bookData.coverImage || '/placeholder.svg',
      updatedAt: serverTimestamp() 
    };
    
    await updateDoc(bookRef, updatedData);
    
    return {
      id: bookId,
      ...updatedData
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du livre avec l'ID ${bookId}:`, error);
    throw error;
  }
};

// Supprimer un livre
export const deleteBook = async (bookId: string) => {
  try {
    // Obtenir le livre pour récupérer l'URL de l'image
    const book = await getBookById(bookId);
    
    // Supprimer l'image de couverture de Storage si elle existe
    if (book.coverImage && book.coverImage.includes('firebase')) {
      try {
        const imageRef = ref(storage, book.coverImage);
        await deleteObject(imageRef);
      } catch (e) {
        console.warn('L\'image n\'a pas pu être supprimée:', e);
      }
    }
    
    // Supprimer le document du livre de Firestore
    const bookRef = doc(db, 'books', bookId);
    await deleteDoc(bookRef);
    
    return { success: true, id: bookId };
  } catch (error) {
    console.error(`Erreur lors de la suppression du livre avec l'ID ${bookId}:`, error);
    throw error;
  }
};

// Structure pour les commandes
export interface Order {
  id?: string;
  userId: string;
  books: {
    bookId: string;
    title: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt?: any;
  updatedAt?: any;
}

// Créer une commande
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    
    // Mettre à jour le stock des livres
    for (const item of orderData.books) {
      const bookRef = doc(db, 'books', item.bookId);
      const bookDoc = await getDoc(bookRef);
      
      if (bookDoc.exists()) {
        const bookData = bookDoc.data();
        const newStock = Math.max(0, (bookData.stock || 0) - item.quantity);
        await updateDoc(bookRef, { stock: newStock });
      }
    }
    
    return {
      id: docRef.id,
      ...orderWithTimestamp
    };
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    throw error;
  }
};

// Récupérer les commandes d'un utilisateur
export const getUserOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error(`Erreur lors de la récupération des commandes de l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = { 
      status, 
      updatedAt: serverTimestamp() 
    };
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    await updateDoc(orderRef, updateData);
    
    // Obtenir les données mises à jour
    const orderDoc = await getDoc(orderRef);
    return {
      id: orderDoc.id,
      ...orderDoc.data()
    } as Order;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la commande ${orderId}:`, error);
    throw error;
  }
};

// Structure pour les catégories
export interface BookCategory {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  count?: number;
}

// Récupérer toutes les catégories
export const getAllCategories = async () => {
  try {
    const categoriesRef = collection(db, 'bookCategories');
    const querySnapshot = await getDocs(categoriesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BookCategory[];
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

// Ajouter une catégorie
export const addCategory = async (categoryData: Omit<BookCategory, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'bookCategories'), categoryData);
    
    return {
      id: docRef.id,
      ...categoryData
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la catégorie:', error);
    throw error;
  }
};

// Supprimer une catégorie
export const deleteCategory = async (categoryId: string) => {
  try {
    const categoryRef = doc(db, 'bookCategories', categoryId);
    await deleteDoc(categoryRef);
    
    return { success: true, id: categoryId };
  } catch (error) {
    console.error(`Erreur lors de la suppression de la catégorie avec l'ID ${categoryId}:`, error);
    throw error;
  }
};

// Structures pour l'interface du panier
export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverImage: string;
  updatedAt?: any;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: any;
}

// Récupérer ou créer le panier d'un utilisateur
export const getUserCart = async (userId: string) => {
  try {
    // Référence directe au document du panier de l'utilisateur
    // Nous utilisons l'ID de l'utilisateur comme ID du document pour éviter les problèmes de permission
    const cartRef = doc(db, 'carts', userId);
    const cartDoc = await getDoc(cartRef);
    
    if (cartDoc.exists()) {
      return {
        id: cartDoc.id,
        ...cartDoc.data()
      } as Cart & { id: string };
    } else {
      // Créer un nouveau panier si aucun n'existe
      const newCart: Cart = {
        userId,
        items: [],
        totalAmount: 0,
        updatedAt: serverTimestamp()
      };
      
      // Créer le document avec l'ID de l'utilisateur
      await setDoc(cartRef, newCart);
      
      return {
        id: userId,
        ...newCart
      };
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du panier de l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Ajouter un élément au panier
export const addToCart = async (userId: string, item: CartItem) => {
  try {
    // Obtenir le panier actuel
    const cart = await getUserCart(userId);
    
    // Ajouter un timestamp ISO pour l'élément au lieu d'un serverTimestamp
    const currentTime = new Date().toISOString();
    const itemWithTimestamp = {
      ...item,
      updatedAt: currentTime
    };
    
    // Vérifier si le livre est déjà dans le panier
    const existingItemIndex = cart.items.findIndex(i => i.bookId === item.bookId);
    
    let updatedItems: CartItem[];
    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité si le livre est déjà dans le panier
      updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        updatedAt: currentTime
      };
    } else {
      // Ajouter le nouvel élément
      updatedItems = [...cart.items, itemWithTimestamp];
    }
    
    // Calculer le nouveau montant total
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    // Mettre à jour le panier dans Firestore
    const cartRef = doc(db, 'carts', userId);
    const timestamp = serverTimestamp();
    
    const updatedCart = {
      items: updatedItems,
      totalAmount,
      updatedAt: timestamp
    };
    
    await updateDoc(cartRef, updatedCart);
    
    return {
      id: userId,
      userId,
      items: updatedItems,
      totalAmount,
      updatedAt: timestamp
    };
  } catch (error) {
    console.error(`Erreur lors de l'ajout au panier pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Mettre à jour la quantité d'un élément dans le panier
export const updateCartItemQuantity = async (userId: string, bookId: string, quantity: number) => {
  try {
    if (quantity < 1) {
      return removeFromCart(userId, bookId);
    }
    
    // Obtenir le panier actuel
    const cart = await getUserCart(userId);
    
    // Trouver l'élément à mettre à jour
    const itemIndex = cart.items.findIndex(item => item.bookId === bookId);
    
    if (itemIndex === -1) {
      throw new Error('Élément introuvable dans le panier');
    }
    
    // Utiliser un timestamp ISO au lieu de serverTimestamp dans le tableau
    const currentTime = new Date().toISOString();
    
    // Mettre à jour la quantité
    const updatedItems = [...cart.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: quantity,
      updatedAt: currentTime
    };
    
    // Calculer le nouveau montant total
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    // Mettre à jour le panier dans Firestore
    const cartRef = doc(db, 'carts', userId);
    const timestamp = serverTimestamp();
    
    const updatedCart = {
      items: updatedItems,
      totalAmount,
      updatedAt: timestamp
    };
    
    await updateDoc(cartRef, updatedCart);
    
    return {
      id: userId,
      userId,
      items: updatedItems,
      totalAmount,
      updatedAt: timestamp
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la quantité dans le panier pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Supprimer un élément du panier
export const removeFromCart = async (userId: string, bookId: string) => {
  try {
    // Obtenir le panier actuel
    const cart = await getUserCart(userId);
    
    // Filtrer l'élément à supprimer
    const updatedItems = cart.items.filter(item => item.bookId !== bookId);
    
    // Calculer le nouveau montant total
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    // Mettre à jour le panier dans Firestore
    const cartRef = doc(db, 'carts', userId);
    const timestamp = serverTimestamp();
    
    const updatedCart = {
      items: updatedItems,
      totalAmount,
      updatedAt: timestamp
    };
    
    await updateDoc(cartRef, updatedCart);
    
    return {
      id: userId,
      userId,
      items: updatedItems,
      totalAmount,
      updatedAt: timestamp
    };
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'élément du panier pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Vider le panier
export const clearCart = async (userId: string) => {
  try {
    // Mettre à jour le panier dans Firestore
    const cartRef = doc(db, 'carts', userId);
    const timestamp = serverTimestamp();
    
    const emptyCart = {
      items: [],
      totalAmount: 0,
      updatedAt: timestamp
    };
    
    await updateDoc(cartRef, emptyCart);
    
    return {
      id: userId,
      userId,
      items: [],
      totalAmount: 0,
      updatedAt: timestamp
    };
  } catch (error) {
    console.error(`Erreur lors du vidage du panier pour l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// Interface pour l'achat sans compte (guest)
export interface GuestCheckoutData {
  email: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  items: CartItem[];
  totalAmount: number;
  subscribeToNewsletter?: boolean;
}

// Vérifier si un email existe déjà dans la base utilisateurs
export const checkIfEmailExists = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'email ${email}:`, error);
    throw error;
  }
};

// Créer une commande pour un utilisateur invité
export const createGuestOrder = async (guestData: GuestCheckoutData) => {
  try {
    // Créer la commande dans Firestore
    const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & { guestEmail: string } = {
      guestEmail: guestData.email,
      books: guestData.items.map(item => ({
        bookId: item.bookId,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: guestData.totalAmount,
      status: 'pending',
      shippingAddress: guestData.shippingAddress,
      paymentMethod: guestData.paymentMethod,
      paymentStatus: 'pending'
    };
    
    // Ajouter à la collection guestOrders avec un ID généré automatiquement
    const guestOrdersRef = collection(db, 'guestOrders');
    const docRef = await addDoc(guestOrdersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Si l'utilisateur souhaite s'abonner à la newsletter
    if (guestData.subscribeToNewsletter) {
      // Ajouter à la collection newsletter
      const newsletterRef = collection(db, 'newsletter');
      await addDoc(newsletterRef, {
        email: guestData.email,
        subscribedAt: serverTimestamp()
      });
    }
    
    // Récupérer l'ordre créé
    const orderSnapshot = await getDoc(docRef);
    return {
      id: orderSnapshot.id,
      ...orderSnapshot.data()
    } as Order & { id: string, guestEmail: string };
  } catch (error) {
    console.error(`Erreur lors de la création de la commande invité:`, error);
    throw error;
  }
};

// Récupérer toutes les commandes pour l'administrateur
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les commandes:', error);
    throw error;
  }
}; 