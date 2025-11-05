// Blog type definitions
export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId?: string; // Firebase user ID
  authorEmail?: string; // User email for verification
  date: string;
  readTime: string;
  category: string;
  image: string; // Can be URL or Base64
  slug?: string; // For future routing
  isUserCreated?: boolean; // To distinguish user-created blogs
}

export interface CreateBlogFormData {
  title: string;
  author: string;
  category: string;
  content: string;
  image: File | null;
  readTime?: string;
}

export const BLOG_CATEGORIES = [
  "Study Tips",
  "GATE",
  "Wellness",
  "Technology",
  "Success Stories",
  "Other"
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];
