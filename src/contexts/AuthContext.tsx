import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { initializeUserProfile } from "@/lib/firebaseUserService";
import { initializeUserProgress, updateActiveDays } from "@/lib/userProgressService";

// Define User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  isTeacher: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  isAuthenticated: false,
  isTeacher: false,
});

// Authorized Teachers List
const authorizedTeachers = [
  { name: "Dr. Rajesh Kumar", email: "rajesh.kumar@edusmart.edu" },
  { name: "Prof. Priya Sharma", email: "priya.sharma@edusmart.edu" },
  { name: "Dr. Amit Patel", email: "amit.patel@edusmart.edu" },
  { name: "Ms. Sneha Gupta", email: "sneha.gupta@edusmart.edu" },
  { name: "Mr. Vikram Singh", email: "vikram.singh@edusmart.edu" },
];

// Check if email belongs to an authorized teacher
const isAuthorizedTeacher = (email: string): boolean => {
  if (!email) return false;
  return authorizedTeachers.some(
    teacher => teacher.email.toLowerCase() === email.toLowerCase()
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email || "";
        const isTeacher = isAuthorizedTeacher(userEmail);
        
        // Initialize user profile in Firebase if doesn't exist
        try {
          await initializeUserProfile(
            firebaseUser.uid,
            userEmail,
            firebaseUser.displayName || firebaseUser.email || "User"
          );
          
          // Initialize/update user progress in localStorage
          const localProgress = initializeUserProgress(
            firebaseUser.uid,
            firebaseUser.displayName || firebaseUser.email || "User",
            userEmail
          );
          
          // Update active days (login tracking)
          await updateActiveDays(firebaseUser.uid);
        } catch (error) {
          console.error("Error initializing user profile:", error);
        }
        
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "User",
          email: userEmail,
          role: isTeacher ? 'teacher' : 'student',
          isTeacher: isTeacher,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ Firebase login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // ✅ Firebase signup
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name }); // store name in Firebase user profile
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // ✅ Firebase logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isTeacher: user?.isTeacher || false,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for easy use
export const useAuth = () => useContext(AuthContext);