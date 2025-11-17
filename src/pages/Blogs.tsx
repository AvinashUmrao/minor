import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BlogsHeader } from "@/components/blogs/BlogsHeader";
import { BlogsSearchFilter } from "@/components/blogs/BlogsSearchFilter";
import { BlogGrid } from "@/components/blogs/BlogGrid";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Blog } from "@/types/blog";
import { useAuth } from "@/contexts/AuthContext";
import { getPublishedBlogs } from "@/lib/firebaseBlogService";
import { blogData } from "@/data/sampleData";

export default function Blogs() {
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all blogs (static + Firebase) on mount
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setIsLoading(true);
    try {
      // Get Firebase blogs
      const firebaseBlogs = await getPublishedBlogs();
      
      // Convert Firebase blogs to Blog format
      const convertedFirebaseBlogs: Blog[] = firebaseBlogs.map((fb, index) => ({
        id: 1000 + index, // Start from 1000 to avoid conflicts
        title: fb.title,
        excerpt: fb.excerpt,
        content: fb.content,
        author: "Teacher", // You can enhance this with user lookup
        date: fb.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        readTime: `${Math.ceil(fb.content.split(' ').length / 200)} min read`,
        image: fb.imageUrl || '',
        category: fb.category,
        slug: fb.title.toLowerCase().replace(/\s+/g, '-'),
        isUserCreated: true,
      }));

      // Combine with static blogs
      const staticBlogs = blogData.map(blog => ({
        ...blog,
        isUserCreated: false
      }));

      const combined = [...convertedFirebaseBlogs, ...staticBlogs];
      
      // Sort by date (newest first)
      combined.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      setAllBlogs(combined);
      setFilteredBlogs(combined);
    } catch (error) {
      console.error("Error loading blogs:", error);
      // Fallback to static blogs only
      const staticBlogs = blogData.map(blog => ({
        ...blog,
        isUserCreated: false
      }));
      setAllBlogs(staticBlogs);
      setFilteredBlogs(staticBlogs);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <BlogsHeader />
      
      {/* Create Blog Button - Only for Teachers */}
      {isTeacher && (
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => navigate("/create-blog")}
            size="lg"
            className="gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Create New Blog
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading blogs...</span>
        </div>
      ) : (
        <>
          <BlogsSearchFilter 
            onFilterChange={setFilteredBlogs}
            allBlogs={allBlogs}
          />
          <BlogGrid 
            blogs={filteredBlogs} 
            onReadMore={setSelectedBlogId}
            selectedBlogId={selectedBlogId}
          />
        </>
      )}
    </div>
  );
}
