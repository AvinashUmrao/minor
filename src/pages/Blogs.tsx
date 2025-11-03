import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BlogsHeader } from "@/components/blogs/BlogsHeader";
import { BlogsSearchFilter } from "@/components/blogs/BlogsSearchFilter";
import { BlogGrid } from "@/components/blogs/BlogGrid";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getAllBlogs } from "@/lib/blogUtils";
import { Blog } from "@/types/blog";

export default function Blogs() {
  const navigate = useNavigate();
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  // Load all blogs on mount and when returning from create page
  useEffect(() => {
    const blogs = getAllBlogs();
    setAllBlogs(blogs);
    setFilteredBlogs(blogs);
  }, []);

  // Refresh blogs when component gains focus (after creating new blog)
  useEffect(() => {
    const handleFocus = () => {
      const blogs = getAllBlogs();
      setAllBlogs(blogs);
      setFilteredBlogs(blogs);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <BlogsHeader />
      
      {/* Create Blog Button */}
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

      <BlogsSearchFilter 
        onFilterChange={setFilteredBlogs}
        allBlogs={allBlogs}
      />
      <BlogGrid 
        blogs={filteredBlogs} 
        onReadMore={setSelectedBlogId}
        selectedBlogId={selectedBlogId}
      />
    </div>
  );
}
