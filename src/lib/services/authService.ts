import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, Timestamp, collection, getDocs, query, orderBy, deleteDoc } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: "user" | "admin" | "editor";
  createdAt: Date | Timestamp;
  lastLogin: Date | Timestamp | null;
}

const usersCollection = "users";

// Convertir un utilisateur Firebase en utilisateur d'application
const transformUserData = (user: FirebaseUser, additionalData: any = {}): User => {
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL,
    role: additionalData.role || "user",
    createdAt: additionalData.createdAt || Timestamp.now(),
    lastLogin: additionalData.lastLogin || Timestamp.now()
  };
};

// Récupérer tous les utilisateurs (pour l'administration)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, usersCollection);
    const querySnapshot = await getDocs(query(usersRef, orderBy("createdAt", "desc")));
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as User;
      return {
        ...data,
        // Convertir les Timestamps en Date si nécessaire pour l'affichage
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : data.lastLogin
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
};

// Supprimer un utilisateur
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    // Supprimer le document utilisateur de Firestore
    const userRef = doc(db, usersCollection, uid);
    await deleteDoc(userRef);
    
    // La suppression de l'utilisateur dans Firebase Auth nécessite normalement
    // une réauthentification ou doit être effectuée par l'utilisateur lui-même,
    // ou via les fonctions Firebase Cloud Functions
    // Pour une implémentation complète, voir la documentation Firebase Auth
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${uid}:`, error);
    throw error;
  }
};

// Inscription d'un nouvel utilisateur
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<User> => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(user, { displayName });
    
    // Créer un document utilisateur dans Firestore
    const userData: User = {
      uid: user.uid,
      email: user.email || "",
      displayName,
      photoURL: null,
      role: "user",
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    };
    
    await setDoc(doc(db, usersCollection, user.uid), userData);
    
    return userData;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw error;
  }
};

// Connexion d'un utilisateur
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour la dernière connexion
    const userRef = doc(db, usersCollection, user.uid);
    const lastLogin = Timestamp.now();
    await updateDoc(userRef, { lastLogin });
    
    // Récupérer les données complètes de l'utilisateur
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return {
        ...userDoc.data() as User,
        lastLogin
      };
    } else {
      // Si l'utilisateur existe dans Auth mais pas dans Firestore, créer le document
      const userData: User = transformUserData(user, { lastLogin });
      await setDoc(userRef, userData);
      return userData;
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw error;
  }
};

// Déconnexion
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    throw error;
  }
};

// Récupérer l'utilisateur actuel
export const getCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  
  if (!user) return null;
  
  try {
    const userRef = doc(db, usersCollection, user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // Si l'utilisateur existe dans Auth mais pas dans Firestore, créer le document
      const userData = transformUserData(user);
      await setDoc(userRef, userData);
      return userData;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur actuel:", error);
    return null;
  }
};

// Observer les changements d'état d'authentification
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userRef = doc(db, usersCollection, firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          const userData = transformUserData(firebaseUser);
          await setDoc(userRef, userData);
          callback(userData);
        }
      } catch (error) {
        console.error("Erreur lors de l'observation de l'état d'authentification:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Réinitialiser le mot de passe
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    throw error;
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (
  uid: string, 
  updates: { displayName?: string; photoURL?: string; role?: "user" | "admin" | "editor" }
): Promise<void> => {
  try {
    // Mettre à jour dans Firestore
    const userRef = doc(db, usersCollection, uid);
    await updateDoc(userRef, updates);
    
    // Mettre à jour dans Auth si c'est l'utilisateur actuel
    if (auth.currentUser && auth.currentUser.uid === uid) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    throw error;
  }
};

// Récupérer un utilisateur par son UID
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, usersCollection, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return {
        ...userData,
        // Convertir les Timestamps en Date si nécessaire
        createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : userData.createdAt,
        lastLogin: userData.lastLogin instanceof Timestamp ? userData.lastLogin.toDate() : userData.lastLogin
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du profil utilisateur ${uid}:`, error);
    return null;
  }
}; 