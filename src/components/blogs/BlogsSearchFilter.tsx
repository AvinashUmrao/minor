import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Blog } from "@/types/blog";
import { BLOG_CATEGORIES } from "@/types/blog";

interface BlogsSearchFilterProps {
  onFilterChange: (filteredBlogs: Blog[]) => void;
  allBlogs: Blog[];
}

export const BlogsSearchFilter = ({ onFilterChange, allBlogs }: BlogsSearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...BLOG_CATEGORIES];

  const filterBlogs = (query: string, category: string) => {
    let filtered = [...allBlogs];

    if (query.trim()) {
      const searchLower = query.toLowerCase().trim();
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchLower) ||
        blog.excerpt.toLowerCase().includes(searchLower) ||
        blog.author.toLowerCase().includes(searchLower)
      );
    }

    if (category !== "All") {
      filtered = filtered.filter(blog => blog.category === category);
    }

    onFilterChange(filtered);
  };

  // Re-filter when allBlogs changes (new blog added)
  useEffect(() => {
    filterBlogs(searchQuery, activeCategory);
  }, [allBlogs]);

  return (
    <div className="mb-8">
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              filterBlogs(e.target.value, activeCategory);
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === activeCategory ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveCategory(category);
              filterBlogs(searchQuery, category);
            }}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};
