import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, Eye, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  generateBlogId,
  generateSlug,
  calculateReadTime,
  fileToBase64,
} from "@/lib/localStorageUtils";
import { BLOG_CATEGORIES } from "@/types/blog";
import { createBlog } from "@/lib/firebaseBlogService";

export default function CreateBlog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: user?.name || "",
    category: "",
    content: "",
    excerpt: "",
    readTime: "",
    imageFile: null as File | null,
  });

  // Update author name when user changes
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, author: user.name }));
    }
  }, [user]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate read time when content changes
    if (name === "content" && value.trim()) {
      const autoReadTime = calculateReadTime(value);
      setFormData((prev) => ({ ...prev, readTime: autoReadTime }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({ ...prev, imageFile: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a blog title.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.author.trim()) {
      toast({
        title: "Author Required",
        description: "Please enter the author name.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter blog content.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.excerpt.trim()) {
      toast({
        title: "Excerpt Required",
        description: "Please enter a short excerpt.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.imageFile) {
      toast({
        title: "Image Required",
        description: "Please upload a blog image.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert image to Base64
      const imageBase64 = await fileToBase64(formData.imageFile!);

      // Create blog object for Firebase
      const newBlog = {
        userId: user?.id || '',
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        category: formData.category,
        tags: [],
        imageUrl: imageBase64,
        status: 'published' as const,
      };

      // Save to Firebase
      await createBlog(user?.id || '', newBlog);

      toast({
        title: "Blog Created! 🎉",
        description: "Your blog has been published successfully.",
      });

      // Navigate to blogs page
      setTimeout(() => {
        navigate("/blogs");
      }, 1000);
    } catch (error) {
      console.error("Error creating blog:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create blog.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview component
  const BlogPreview = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        <Badge variant="secondary" className="mb-2">
          {formData.category || "Category"}
        </Badge>
        <h2 className="text-2xl font-bold mb-2">
          {formData.title || "Blog Title"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {formData.excerpt || "Blog excerpt..."}
        </p>
        <div className="text-sm text-muted-foreground mb-4">
          By {formData.author || "Author"} •{" "}
          {formData.readTime || "X min read"}
        </div>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">
            {formData.content || "Blog content..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/blogs")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blogs
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Blog Post</h1>
        <p className="text-muted-foreground">
          Share your knowledge and insights with the community
        </p>
      </div>

      {/* Authentication Check */}
      {!isAuthenticated && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to create a blog post. Please{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => navigate("/login")}
            >
              log in
            </Button>{" "}
            to continue.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter blog title..."
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">
                Author <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author"
                name="author"
                placeholder="Your name..."
                value={formData.author}
                onChange={handleInputChange}
                disabled={isAuthenticated}
                readOnly={isAuthenticated}
                required
                className={isAuthenticated ? "bg-muted cursor-not-allowed" : ""}
              />
              {isAuthenticated && (
                <p className="text-xs text-muted-foreground">
                  Author name is automatically set from your account
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">
                Excerpt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                placeholder="Write a short summary (2-3 sentences)..."
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                required
              />
              <p className="text-sm text-muted-foreground">
                {formData.excerpt.length}/200 characters
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">
                Blog Image <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                  required
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Max size: 5MB. Formats: JPG, PNG, GIF, WebP
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your blog content here..."
                value={formData.content}
                onChange={handleInputChange}
                rows={15}
                className="font-mono"
                required
              />
              <p className="text-sm text-muted-foreground">
                {formData.content.split(/\s+/).filter(Boolean).length} words •{" "}
                {formData.readTime || "0 min read"}
              </p>
            </div>

            {/* Read Time (Optional Manual Override) */}
            <div className="space-y-2">
              <Label htmlFor="readTime">
                Read Time (Optional - Auto-calculated)
              </Label>
              <Input
                id="readTime"
                name="readTime"
                placeholder="e.g., 5 min read"
                value={formData.readTime}
                onChange={handleInputChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : !isAuthenticated ? (
                  "Login Required to Publish"
                ) : (
                  "Publish Blog"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Preview Section */}
      {showPreview && <BlogPreview />}
    </div>
  );
}
