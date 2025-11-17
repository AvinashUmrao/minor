import { db } from "@/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface FirebaseBlog {
  id?: string;
  userId: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  status: "draft" | "published";
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  views: number;
  likes: number;
}

/**
 * Create new blog in Firebase
 */
export const createBlog = async (userId: string, blog: Omit<FirebaseBlog, "id" | "createdAt" | "updatedAt" | "views" | "likes">): Promise<string> => {
  try {
    const blogsRef = collection(db, "blogs");
    const newBlog = {
      ...blog,
      userId,
      views: 0,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(blogsRef, newBlog);
    return docRef.id;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

/**
 * Update blog in Firebase
 */
export const updateBlog = async (blogId: string, updates: Partial<FirebaseBlog>): Promise<void> => {
  try {
    const blogRef = doc(db, "blogs", blogId);
    await updateDoc(blogRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

/**
 * Delete blog from Firebase
 */
export const deleteBlog = async (blogId: string): Promise<void> => {
  try {
    const blogRef = doc(db, "blogs", blogId);
    await deleteDoc(blogRef);
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

/**
 * Get user's blogs from Firebase
 */
export const getUserBlogs = async (userId: string): Promise<FirebaseBlog[]> => {
  try {
    const blogsRef = collection(db, "blogs");
    const q = query(blogsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FirebaseBlog));
  } catch (error) {
    console.error("Error getting user blogs:", error);
    return [];
  }
};

/**
 * Get all published blogs
 */
export const getPublishedBlogs = async (): Promise<FirebaseBlog[]> => {
  try {
    const blogsRef = collection(db, "blogs");
    const q = query(
      blogsRef,
      where("status", "==", "published")
    );
    const snapshot = await getDocs(q);
    
    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FirebaseBlog));
    
    // Sort in frontend to avoid index requirement
    return blogs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA; // Newest first
    });
  } catch (error) {
    console.error("Error getting published blogs:", error);
    return [];
  }
};

/**
 * Increment blog views
 */
export const incrementBlogViews = async (blogId: string): Promise<void> => {
  try {
    const blogRef = doc(db, "blogs", blogId);
    const snapshot = await getDoc(blogRef);
    const currentViews = (snapshot.data()?.views || 0) as number;
    
    await updateDoc(blogRef, {
      views: currentViews + 1,
    });
  } catch (error) {
    console.error("Error incrementing blog views:", error);
  }
};

/**
 * Like/unlike blog
 */
export const toggleBlogLike = async (blogId: string, liked: boolean): Promise<void> => {
  try {
    const blogRef = doc(db, "blogs", blogId);
    const blogDoc = await getDoc(blogRef);
    const currentLikes = ((blogDoc.data()?.likes || 0) as number);
    
    await updateDoc(blogRef, {
      likes: liked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
  }
};
