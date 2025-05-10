// This file contains functions to interact with the WordPress REST API

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  categories: string[];
  categoriesId: number[];
  categoriesSlug: string[];
  tags: string[];
  featuredImage?: string;
  readingTime: number;
  headings: {
    id: string;
    text: string;
    level: number;
  }[];
}

interface Page {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage?: string;
  modified: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface GroupeLocal {
  id: number;
  title: string;
  slug: string;
  coordinates: [number, number];
  type: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  featuredImage?: string;
}

// Use the environment variable for the WordPress API URL
const WORDPRESS_API_URL = !process.env.WORDPRESS_API_URL ? "https://palegreen-capybara-652133.hostingersite.com/wp-json/wp/v2" : process.env.WORDPRESS_API_URL;

// Helper function to ensure the API URL is correctly formatted
function ensureCorrectApiUrl(url: string): string {
  let apiUrl = url.endsWith("/") ? url.slice(0, -1) : url;

  if (!apiUrl.includes("/wp-json/wp/v2")) {
    if (apiUrl.includes("/wp-json")) {
      apiUrl = `${apiUrl}/wp/v2`;
    } else {
      apiUrl = `${apiUrl}/wp-json/wp/v2`;
    }
  }

  return apiUrl;
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  const readingTime = Math.ceil(words / 200);
  return readingTime < 1 ? 1 : readingTime;
}

// Helper function to extract headings from content
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /<h([2-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g;

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = Number.parseInt(match[1], 10);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, "");

    headings.push({ id, text, level });
  }

  return headings;
}

// Fetch featured articles for the homepage
export async function fetchFeaturedArticles(): Promise<Article[]> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return [];
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const response = await fetch(`${apiUrl}/posts?_embed&per_page=4`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const posts = await response.json();

    return posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      descriptif: post.acf?.descriptif || "",
      resume: post.acf?.resume || "",
      chapeau: post.acf?.chapeau || "",
      content: post.content.rendered,
      date: post.date,
      date_de_levenement: post.acf?.date_de_levenement || "",
      heure_de_levenement: post.acf?.heure_de_levenement || "",
      lieu_de_levenement: post.acf?.lieu_de_levenement || "",
      author: post._embedded?.author?.[0]?.name || "Unknown Author",
      categories: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [],
      categoriesId: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.id) || [],
      categoriesSlug: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.slug) || [],
      tags: post._embedded?.["wp:term"]?.[1]?.map((term: any) => term.name) || [],
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      readingTime: calculateReadingTime(post.content.rendered),
      headings: extractHeadings(post.content.rendered),
    }));
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    return [];
  }
}

// Fetch all articles with optional filtering
export async function fetchArticles({
  page = 1,
  perPage = 9,
  categoryId = "",
  tagId = "",
  search = "",
}: {
  page?: number;
  perPage?: number;
  categoryId?: string | string[];
  tagId?: string | string[];
  search?: string;
}): Promise<{ articles: Article[]; total: number; totalPages: number }> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return { articles: [], total: 0, totalPages: 0 };
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const queryParams = new URLSearchParams({
      _embed: "true",
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (categoryId) {
      queryParams.set("categories", Array.isArray(categoryId) ? categoryId.join(",") : categoryId);
    }

    if (tagId) {
      queryParams.set("tags", Array.isArray(tagId) ? tagId.join(",") : tagId);
    }

    if (search) {
      queryParams.set("search", search);
    }

    const response = await fetch(`${apiUrl}/posts?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const total = Number(response.headers.get("X-WP-Total") || 0);
    const totalPages = Number(response.headers.get("X-WP-TotalPages") || 0);
    const posts = await response.json();

    const articles = posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      author: post._embedded?.author?.[0]?.name || "Unknown Author",
      categories: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [],
      categoriesId: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.id) || [],
      tags: post._embedded?.["wp:term"]?.[1]?.map((term: any) => term.name) || [],
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      readingTime: calculateReadingTime(post.content.rendered),
      headings: extractHeadings(post.content.rendered),
    }));

    return { articles, total, totalPages };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { articles: [], total: 0, totalPages: 0 };
  }
}

// Fetch categories from WordPress
export async function fetchCategories(): Promise<Category[]> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return [];
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const response = await fetch(`${apiUrl}/categories?per_page=100`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const categories = await response.json();

    return categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category.count,
      description: category.description,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Fetch tags from WordPress
export async function fetchTags(): Promise<Tag[]> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return [];
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const response = await fetch(`${apiUrl}/tags?per_page=100`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }

    const tags = await response.json();

    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: tag.count,
    }));
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

// Fetch a single article by slug
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return null;
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const response = await fetch(`${apiUrl}/posts?slug=${slug}&_embed`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    const posts = await response.json();

    if (posts.length === 0) {
      return null;
    }

    const post = posts[0];

    return {
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      author: post._embedded?.author?.[0]?.name || "Unknown Author",
      categories: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [],
      categoriesId: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.id) || [],
      tags: post._embedded?.["wp:term"]?.[1]?.map((term: any) => term.name) || [],
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      readingTime: calculateReadingTime(post.content.rendered),
      headings: extractHeadings(post.content.rendered),
    };
  } catch (error) {
    console.error(`Error fetching article by slug ${slug}:`, error);
    return null;
  }
}

// Fetch related articles
export async function fetchRelatedArticles(articleId: number, categories: string[]): Promise<Article[]> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return [];
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const categoryParam = categories.map((c) => c.toLowerCase().replace(/\s+/g, "-")).join(",");
    const response = await fetch(`${apiUrl}/posts?categories=${categoryParam}&exclude=${articleId}&per_page=3&_embed`);

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status}`);
    }

    const posts = await response.json();

    return posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      author: post._embedded?.author?.[0]?.name || "Unknown Author",
      categories: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [],
      categoriesId: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.id) || [],
      tags: post._embedded?.["wp:term"]?.[1]?.map((term: any) => term.name) || [],
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      readingTime: calculateReadingTime(post.content.rendered),
      headings: extractHeadings(post.content.rendered),
    }));
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

// Fetch pages from WordPress
export async function fetchPages(): Promise<Page[]> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return [];
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const response = await fetch(`${apiUrl}/pages?_embed`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.status}`);
    }

    const pages = await response.json();

    return pages.map((page: any) => ({
      id: page.id,
      slug: page.slug,
      title: page.title.rendered,
      excerpt: page.excerpt.rendered,
      content: page.content.rendered,
      date: page.date,
      modified: page.modified,
      featuredImage: page._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    }));
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}

// Fetch a single page by slug
export async function fetchPageBySlug(slug: string): Promise<Page | null> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return null;
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const response = await fetch(`${apiUrl}/pages?slug=${slug}&_embed`);

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const pages = await response.json();

    if (pages.length === 0) {
      return null;
    }

    const page = pages[0];

    return {
      id: page.id,
      slug: page.slug,
      title: page.title.rendered,
      excerpt: page.excerpt.rendered,
      content: page.content.rendered,
      date: page.date,
      modified: page.modified,
      featuredImage: page._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    };
  } catch (error) {
    console.error(`Error fetching page by slug ${slug}:`, error);
    return null;
  }
}

// Fetch search suggestions
export async function fetchSearchSuggestions(query: string): Promise<{
  groupedArticles: { [category: string]: { id: number; title: string; slug: string }[] };
}> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return { groupedArticles: {} };
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);

    // Fetch articles matching the search query
    const articlesResponse = await fetch(
      `${apiUrl}/posts?search=${encodeURIComponent(query)}&_embed&per_page=10`
    );

    if (!articlesResponse.ok) {
      throw new Error(`Failed to fetch article suggestions: ${articlesResponse.status}`);
    }

    const articles = await articlesResponse.json();

    // Group articles by category
    const groupedArticles: { [category: string]: { id: number; title: string; slug: string }[] } =
      {};

    articles.forEach((article: any) => {
      const categories = article._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [
        "Uncategorized",
      ];

      categories.forEach((category: string) => {
        if (!groupedArticles[category]) {
          groupedArticles[category] = [];
        }

        groupedArticles[category].push({
          id: article.id,
          title: article.title.rendered,
          slug: article.slug,
        });
      });
    });

    return { groupedArticles };
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return { groupedArticles: {} };
  }
}

// Fetch groupes locaux
export async function fetchGroupesLocaux(): Promise<GroupeLocal[]> {
  if (!WORDPRESS_API_URL) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return [];
  }

  try {
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL);
    const response = await fetch(`${apiUrl}/groupe_local?_embed&per_page=100`);

    if (!response.ok) {
      throw new Error(`Failed to fetch groupes locaux: ${response.status}`);
    }

    const posts = await response.json();

    return posts.map((post: any) => ({
      id: post.id,
      title: post.title.rendered,
      slug: post.slug,
      coordinates: [Number.parseFloat(post.acf.localisation.lat), Number.parseFloat(post.acf.localisation.lng)],
      type: post.acf.type || "bureau",
      address: post.acf.adresse || "",
      phone: post.acf.telephone,
      email: post.acf.email,
      website: post.acf.site_web,
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    }));
  } catch (error) {
    console.error("Error fetching groupes locaux:", error);
    return [];
  }
}