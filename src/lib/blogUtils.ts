import { Blog } from "@/types/blog";
import { blogData } from "@/data/sampleData";
import { getLocalBlogs } from "./localStorageUtils";

/**
 * Get all blogs (static + local)
 * This is the main function to use throughout the app
 */
export const getAllBlogs = (): Blog[] => {
  const staticBlogs = blogData.map(blog => ({
    ...blog,
    isUserCreated: false
  }));
  
  const localBlogs = getLocalBlogs().map(blog => ({
    ...blog,
    isUserCreated: true
  }));

  // Combine and sort by date (newest first)
  const allBlogs = [...localBlogs, ...staticBlogs];
  
  return allBlogs.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Newest first
  });
};

/**
 * Get blogs by category
 */
export const getBlogsByCategory = (category: string): Blog[] => {
  if (category === "All") {
    return getAllBlogs();
  }
  return getAllBlogs().filter(blog => blog.category === category);
};

/**
 * Search blogs by query
 */
export const searchBlogs = (query: string, category: string = "All"): Blog[] => {
  const blogs = category === "All" ? getAllBlogs() : getBlogsByCategory(category);
  
  if (!query.trim()) {
    return blogs;
  }

  const searchLower = query.toLowerCase().trim();
  return blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchLower) ||
    blog.excerpt.toLowerCase().includes(searchLower) ||
    blog.author.toLowerCase().includes(searchLower) ||
    blog.content.toLowerCase().includes(searchLower)
  );
};
