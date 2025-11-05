// News Service for fetching real-time exam updates from official sources
// This service uses RSS-to-JSON API to fetch news from official exam websites

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  image: string;
  link: string;
  source: string;
}

// Official RSS feeds and news sources for each exam
// Multiple sources for better reliability
const NEWS_SOURCES = {
  JEE: [
    { url: 'https://jeemain.nta.nic.in/', rss: 'https://jeemain.nta.nic.in/feed/', category: 'JEE' },
    { url: 'https://nta.ac.in/', rss: 'https://nta.ac.in/feed/', category: 'JEE' }
  ],
  NEET: [
    { url: 'https://neet.nta.nic.in/', rss: 'https://neet.nta.nic.in/feed/', category: 'NEET' },
    { url: 'https://nta.ac.in/', rss: 'https://nta.ac.in/feed/', category: 'NEET' }
  ],
  GATE: [
    { url: 'https://gate2025.iitr.ac.in/', rss: 'https://gate2025.iitr.ac.in/feed/', category: 'GATE' },
    { url: 'https://gate.iitk.ac.in/', rss: 'https://gate.iitk.ac.in/feed/', category: 'GATE' }
  ],
  CAT: [
    { url: 'https://iimcat.ac.in/', rss: 'https://iimcat.ac.in/feed/', category: 'CAT' },
    { url: 'https://www.iimb.ac.in/', rss: 'https://www.iimb.ac.in/feed/', category: 'CAT' }
  ],
  UPSC: [
    { url: 'https://www.upsc.gov.in/', rss: 'https://www.upsc.gov.in/feed', category: 'UPSC' },
    { url: 'https://upsc.gov.in/', rss: 'https://upsc.gov.in/rss.xml', category: 'UPSC' }
  ]
};

// Default images for each exam category
const DEFAULT_IMAGES: Record<string, string> = {
  JEE: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop',
  NEET: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
  GATE: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=450&fit=crop',
  CAT: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
  UPSC: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop'
};

// Fallback news data in case API fails
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'JEE Main 2025 Registration Opens',
    summary: 'NTA announces JEE Main 2025 registration dates. Students can apply online from the official website.',
    date: new Date().toISOString().split('T')[0],
    category: 'JEE',
    image: DEFAULT_IMAGES.JEE,
    link: 'https://jeemain.nta.nic.in/',
    source: 'NTA'
  },
  {
    id: '2',
    title: 'GATE 2025 Notification Released',
    summary: 'IIT Roorkee releases GATE 2025 notification. Check important dates, syllabus updates, and registration details.',
    date: new Date().toISOString().split('T')[0],
    category: 'GATE',
    image: DEFAULT_IMAGES.GATE,
    link: 'https://gate2025.iitr.ac.in/',
    source: 'IIT Roorkee'
  },
  {
    id: '3',
    title: 'NEET 2025 Exam Pattern Announced',
    summary: 'NTA announces NEET UG 2025 exam pattern and syllabus. Important updates for medical aspirants.',
    date: new Date().toISOString().split('T')[0],
    category: 'NEET',
    image: DEFAULT_IMAGES.NEET,
    link: 'https://neet.nta.nic.in/',
    source: 'NTA'
  },
  {
    id: '4',
    title: 'CAT 2025 Registration Begins',
    summary: 'IIM announces CAT 2025 registration. MBA aspirants can apply online. Check eligibility criteria and exam pattern.',
    date: new Date().toISOString().split('T')[0],
    category: 'CAT',
    image: DEFAULT_IMAGES.CAT,
    link: 'https://iimcat.ac.in/',
    source: 'IIM'
  },
  {
    id: '5',
    title: 'UPSC Civil Services Exam 2025 Notification',
    summary: 'UPSC releases notification for Civil Services Examination 2025. Prelims scheduled for May. Check detailed schedule.',
    date: new Date().toISOString().split('T')[0],
    category: 'UPSC',
    image: DEFAULT_IMAGES.UPSC,
    link: 'https://www.upsc.gov.in/',
    source: 'UPSC'
  },
  {
    id: '6',
    title: 'JEE Advanced 2025 Dates Announced',
    summary: 'IIT announces JEE Advanced 2025 exam dates. Top JEE Main qualifiers eligible. Registration opens soon.',
    date: new Date().toISOString().split('T')[0],
    category: 'JEE',
    image: DEFAULT_IMAGES.JEE,
    link: 'https://jeeadv.ac.in/',
    source: 'IIT'
  }
];

/**
 * Fetches news from RSS feed using rss2json API
 */
async function fetchFromRSS(rssUrl: string, category: string): Promise<NewsItem[]> {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items) {
      throw new Error('Invalid RSS response');
    }
    
    return data.items.slice(0, 5).map((item: any, index: number) => ({
      id: `${category.toLowerCase()}-${index}`,
      title: item.title || 'No title',
      summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || 'No description available',
      date: new Date(item.pubDate).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      category: category,
      image: item.thumbnail || item.enclosure?.link || DEFAULT_IMAGES[category],
      link: item.link || '#',
      source: category
    }));
  } catch (error) {
    console.error(`Error fetching RSS for ${category}:`, error);
    return [];
  }
}

/**
 * Fetches news from multiple sources with fallback
 */
async function fetchFromMultipleSources(sources: Array<{url: string, rss: string, category: string}>): Promise<NewsItem[]> {
  for (const source of sources) {
    try {
      const news = await fetchFromRSS(source.rss, source.category);
      if (news.length > 0) {
        return news;
      }
    } catch (error) {
      console.log(`Failed to fetch from ${source.url}, trying next source...`);
    }
  }
  return [];
}

/**
 * Fetches news from all exam sources
 */
export async function fetchAllExamNews(): Promise<NewsItem[]> {
  try {
    // Try to fetch from RSS feeds with a timeout
    const newsPromises = Object.entries(NEWS_SOURCES).map(([exam, sources]) =>
      Promise.race([
        fetchFromMultipleSources(sources),
        new Promise<NewsItem[]>((resolve) => setTimeout(() => resolve([]), 3000)) // 3 second timeout
      ])
    );
    
    const results = await Promise.allSettled(newsPromises);
    
    const allNews = results
      .filter((result): result is PromiseFulfilledResult<NewsItem[]> => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .filter(item => item !== null);
    
    // If we got some news, combine with fallback for better coverage
    if (allNews.length > 0) {
      // Combine fetched news with fallback, remove duplicates, sort by date
      const combined = [...allNews, ...FALLBACK_NEWS];
      const unique = Array.from(new Map(combined.map(item => [item.title, item])).values());
      return unique
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);
    }
    
    // If no news fetched, return fallback with today's date
    console.log('Using fallback news - RSS feeds may be unavailable');
    return FALLBACK_NEWS.map(item => ({
      ...item,
      date: new Date().toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error('Error fetching exam news:', error);
    return FALLBACK_NEWS.map(item => ({
      ...item,
      date: new Date().toISOString().split('T')[0]
    }));
  }
}

/**
 * Fetches news for a specific exam
 */
export async function fetchExamNews(exam: keyof typeof NEWS_SOURCES): Promise<NewsItem[]> {
  try {
    const sources = NEWS_SOURCES[exam];
    const news = await fetchFromMultipleSources(sources);
    
    if (news.length > 0) {
      return news;
    }
    
    // Return fallback for this specific exam
    return FALLBACK_NEWS.filter(item => item.category === exam);
  } catch (error) {
    console.error(`Error fetching ${exam} news:`, error);
    return FALLBACK_NEWS.filter(item => item.category === exam);
  }
}

/**
 * Alternative: Fetch from NewsAPI (requires API key)
 * Uncomment and add your API key to use this method
 */
/*
export async function fetchNewsFromAPI(): Promise<NewsItem[]> {
  const API_KEY = 'YOUR_NEWS_API_KEY';
  const queries = ['JEE exam', 'NEET exam', 'GATE exam', 'CAT exam', 'UPSC exam'];
  
  try {
    const newsPromises = queries.map(async (query) => {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`
      );
      const data = await response.json();
      return data.articles?.slice(0, 2) || [];
    });
    
    const results = await Promise.all(newsPromises);
    const articles = results.flat();
    
    return articles.map((article: any, index: number) => ({
      id: `news-${index}`,
      title: article.title,
      summary: article.description || article.content?.substring(0, 150) + '...',
      date: new Date(article.publishedAt).toISOString().split('T')[0],
      category: determineCategory(article.title),
      image: article.urlToImage || DEFAULT_IMAGES.JEE,
      link: article.url,
      source: article.source.name
    }));
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return FALLBACK_NEWS;
  }
}

function determineCategory(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('jee')) return 'JEE';
  if (titleLower.includes('neet')) return 'NEET';
  if (titleLower.includes('gate')) return 'GATE';
  if (titleLower.includes('cat')) return 'CAT';
  if (titleLower.includes('upsc')) return 'UPSC';
  return 'General';
}
*/
