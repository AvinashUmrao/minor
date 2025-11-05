import { ArrowRight, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { fetchAllExamNews, type NewsItem } from "@/services/newsService";
import { toast } from "sonner";


export const NewsSection = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Fetch news on component mount
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const news = await fetchAllExamNews();
      
      if (news && news.length > 0) {
        setNewsData(news);
      } else {
        setError('Unable to fetch live news. Showing latest updates.');
      }
    } catch (err) {
      setError('Unable to fetch live news. Showing latest updates.');
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.info('Refreshing news...');
    await loadNews();
    toast.success('News updated!');
  };

  // Show single article
  if (openArticleId) {
    const article = newsData.find(item => item.id === openArticleId);
    if (article) {
      return (
        <div className="max-w-2xl mx-auto py-10 px-4">
          <Button variant="link" onClick={() => setOpenArticleId(null)} className="mb-4 p-0 h-auto">
            ← Back to News
          </Button>
          <Badge variant="secondary" className="mb-4">{article.category}</Badge>
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {article.date} • {article.source}
          </p>
          <img src={article.image} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          <div className="text-lg mb-6">{article.summary}</div>
          <Button asChild>
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              Read Full Article <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      );
    }
  }

  // Show all articles
  if (showAll) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <Button variant="link" onClick={() => setShowAll(false)} className="mb-4 p-0 h-auto">
          ← Back to News
        </Button>
        <h1 className="text-3xl font-bold mb-8">All News Articles</h1>
        <div className="space-y-8">
          {newsData.map((article) => (
            <div key={article.id} className="border rounded-lg p-6 bg-card shadow">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{article.category}</Badge>
                <span className="text-sm text-muted-foreground">{article.date}</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">{article.title}</h2>
              <div className="text-base text-muted-foreground mb-4">{article.summary}</div>
              <Button variant="link" asChild className="p-0 h-auto">
                <a href={article.link} target="_blank" rel="noopener noreferrer">
                  Read More <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: News cards grid
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <Badge variant="outline" className="mb-4">Latest Updates</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Educational News
            </h2>
            <p className="text-muted-foreground">Latest updates and notifications for JEE, NEET, GATE, CAT, and UPSC exams.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={() => setShowAll(true)}>
              View All News
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">ℹ️ {error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading latest news...</span>
          </div>
        ) : newsData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No news available at the moment.</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {newsData.slice(0, 3).map((news) => (
              <Card key={news.id} className="overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={news.image} 
                    alt={news.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=450&fit=crop';
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{news.category}</Badge>
                    <span className="text-sm text-muted-foreground">{news.date}</span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{news.summary}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => setOpenArticleId(news.id)}
                    >
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      asChild
                    >
                      <a href={news.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
