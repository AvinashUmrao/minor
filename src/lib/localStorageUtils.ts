import { Blog } from "@/types/blog";

const LOCAL_BLOGS_KEY = "learnwise_local_blogs";

/**
 * Generate a unique ID based on timestamp
 */
export const generateBlogId = (): number => {
  return Date.now();
};

/**
 * Generate a URL-friendly slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
};

/**
 * Calculate read time based on content length
 * Average reading speed: 200 words per minute
 */
export const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

/**
 * Convert File to Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Save a new blog to localStorage
 */
export const saveBlogToLocalStorage = (blog: Blog): void => {
  try {
    const existingBlogs = getLocalBlogs();
    const updatedBlogs = [...existingBlogs, blog];
    localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(updatedBlogs));
  } catch (error) {
    console.error("Error saving blog to localStorage:", error);
    throw new Error("Failed to save blog. Storage might be full.");
  }
};

/**
 * Get all blogs from localStorage
 */
export const getLocalBlogs = (): Blog[] => {
  try {
    const blogsJson = localStorage.getItem(LOCAL_BLOGS_KEY);
    if (!blogsJson) return [];
    return JSON.parse(blogsJson);
  } catch (error) {
    console.error("Error reading blogs from localStorage:", error);
    return [];
  }
};

/**
 * Delete a blog from localStorage by ID
 */
export const deleteBlogFromLocalStorage = (blogId: number): void => {
  try {
    const existingBlogs = getLocalBlogs();
    const updatedBlogs = existingBlogs.filter((blog) => blog.id !== blogId);
    localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(updatedBlogs));
  } catch (error) {
    console.error("Error deleting blog from localStorage:", error);
    throw new Error("Failed to delete blog.");
  }
};

/**
 * Update an existing blog in localStorage
 */
export const updateBlogInLocalStorage = (updatedBlog: Blog): void => {
  try {
    const existingBlogs = getLocalBlogs();
    const updatedBlogs = existingBlogs.map((blog) =>
      blog.id === updatedBlog.id ? updatedBlog : blog
    );
    localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(updatedBlogs));
  } catch (error) {
    console.error("Error updating blog in localStorage:", error);
    throw new Error("Failed to update blog.");
  }
};

/**
 * Clear all local blogs (useful for testing)
 */
export const clearLocalBlogs = (): void => {
  try {
    localStorage.removeItem(LOCAL_BLOGS_KEY);
  } catch (error) {
    console.error("Error clearing local blogs:", error);
  }
};

/**
 * Get a single blog by ID from localStorage
 */
export const getBlogById = (blogId: number): Blog | undefined => {
  const blogs = getLocalBlogs();
  return blogs.find((blog) => blog.id === blogId);
};

/**
 * Check if localStorage is available and has space
 */
export const checkLocalStorageAvailability = (): boolean => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};
