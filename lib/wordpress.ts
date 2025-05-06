// This file contains functions to interact with the WordPress REST API

interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  categories: string[]
  categoriesId: number[]
  tags: string[]
  featuredImage?: string
  readingTime: number
  headings: {
    id: string
    text: string
    level: number
  }[]
}

interface Page {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  featuredImage?: string
  modified: string
}

interface Category {
  id: number
  name: string
  slug: string
  count: number
  description?: string
}

interface Tag {
  id: number
  name: string
  slug: string
  count: number
}

// Use the environment variable for the WordPress API URL
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL

// Fetch featured articles for the homepage
export async function fetchFeaturedArticles(): Promise<Article[]> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockFeaturedArticles()
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch data from the WordPress API
    console.log(`Fetching posts from: ${apiUrl}/posts?_embed&per_page=3`)
    const response = await fetch(`${apiUrl}/posts?_embed&per_page=3`)

    if (!response.ok) {
      console.error(`API returned status: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`API returned non-JSON response: ${contentType}`)
      console.error(`First 100 chars of response: ${await response.text().then((text) => text.substring(0, 100))}...`)
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const posts = await response.json()

    // Transform WordPress posts to our Article format
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
    }))
  } catch (error) {
    console.error("Error fetching featured articles:", error)
    return getMockFeaturedArticles()
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
  page?: number
  perPage?: number
  categoryId?: string | string[]
  tagId?: string | string[]
  search?: string
}): Promise<{ articles: Article[]; total: number; totalPages: number }> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      const mockArticles = getMockArticles()

      // Apply filtering to mock data
      let filteredArticles = [...mockArticles]

      if (categoryId) {
        const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId]
        filteredArticles = filteredArticles.filter((article) =>
          article.categories.some((cat) => categoryIds.includes(cat.toLowerCase())),
        )
      }

      if (tagId) {
        const tagIds = Array.isArray(tagId) ? tagId : [tagId]
        filteredArticles = filteredArticles.filter((article) =>
          article.tags.some((tag) => tagIds.includes(tag.toLowerCase())),
        )
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredArticles = filteredArticles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchLower) || article.excerpt.toLowerCase().includes(searchLower),
        )
      }

      // Calculate pagination
      const total = filteredArticles.length
      const totalPages = Math.ceil(total / perPage)
      const paginatedArticles = filteredArticles.slice((page - 1) * perPage, page * perPage)

      return {
        articles: paginatedArticles,
        total,
        totalPages,
      }
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Build query parameters
    const queryParams = new URLSearchParams({
      _embed: "true",
      page: page.toString(),
      per_page: perPage.toString(),
    })

    if (categoryId) {
      if (Array.isArray(categoryId)) {
        queryParams.set("categories", categoryId.join(","))
      } else {
        queryParams.set("categories", categoryId)
      }
    }

    if (tagId) {
      if (Array.isArray(tagId)) {
        queryParams.set("tags", tagId.join(","))
      } else {
        queryParams.set("tags", tagId)
      }
    }

    if (search) {
      queryParams.set("search", search)
    }

    // Fetch data from the WordPress API
    const response = await fetch(`${apiUrl}/posts?${queryParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    // Get total posts and total pages from headers
    const total = Number(response.headers.get("X-WP-Total") || 0)
    const totalPages = Number(response.headers.get("X-WP-TotalPages") || 0)

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const posts = await response.json()

    // Transform WordPress posts to our Article format
    const articles = posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      author: post._embedded?.author?.[0]?.name || "Unknown Author",
      categories: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [],
      tags: post._embedded?.["wp:term"]?.[1]?.map((term: any) => term.name) || [],
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      readingTime: calculateReadingTime(post.content.rendered),
      headings: extractHeadings(post.content.rendered),
    }))

    return { articles, total, totalPages }
  } catch (error) {
    console.error("Error fetching articles:", error)

    // Return mock data with pagination
    const mockArticles = getMockArticles()
    const total = mockArticles.length
    const totalPages = Math.ceil(total / perPage)
    const paginatedArticles = mockArticles.slice((page - 1) * perPage, page * perPage)

    return {
      articles: paginatedArticles,
      total,
      totalPages,
    }
  }
}

// Fetch categories from WordPress
export async function fetchCategories(): Promise<Category[]> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockCategories()
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch data from the WordPress API
    const response = await fetch(`${apiUrl}/categories?per_page=100`)

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const categories = await response.json()

    // Transform WordPress categories to our Category format
    return categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category.count,
      description: category.description,
    }))
  } catch (error) {
    console.error("Error fetching categories:", error)
    return getMockCategories()
  }
}

// Fetch tags from WordPress
export async function fetchTags(): Promise<Tag[]> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockTags()
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch data from the WordPress API
    const response = await fetch(`${apiUrl}/tags?per_page=100`)

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const tags = await response.json()

    // Transform WordPress tags to our Tag format
    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: tag.count,
    }))
  } catch (error) {
    console.error("Error fetching tags:", error)
    return getMockTags()
  }
}

// Fetch a single article by slug
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockArticleBySlug(slug)
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch data from the WordPress API
    const response = await fetch(`${apiUrl}/posts?slug=${slug}&_embed`)

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const posts = await response.json()

    // If no post found with this slug
    if (posts.length === 0) {
      return null
    }

    const post = posts[0]

    // Transform WordPress post to our Article format
    return {
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      author: post._embedded?.author?.[0]?.name || "Unknown Author",
      categories: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [],
      tags: post._embedded?.["wp:term"]?.[1]?.map((term: any) => term.name) || [],
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      readingTime: calculateReadingTime(post.content.rendered),
      headings: extractHeadings(post.content.rendered),
    }
  } catch (error) {
    console.error(`Error fetching article by slug ${slug}:`, error)
    return getMockArticleBySlug(slug)
  }
}

// Fetch related articles
export async function fetchRelatedArticles(articleId: number, categories: string[]): Promise<Article[]> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockRelatedArticles()
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Create a comma-separated list of category slugs
    const categoryParam = categories.map((c) => c.toLowerCase().replace(/\s+/g, "-")).join(",")

    // Fetch data from the WordPress API
    const response = await fetch(`${apiUrl}/posts?categories=${categoryParam}&exclude=${articleId}&per_page=3&_embed`)

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const posts = await response.json()

    // Transform WordPress posts to our Article format
    return posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: post.content.rendered,
      date: post.date,
      author: post._embedded?.author?.[0]?.name || "Unknown Author",
      categories: post._embedded?.["wp:term"]?.[0]?.map((term: any) => term.name) || [],
      tags: post._embedded?.["wp:term"]?.[1]?.map((term: any) => term.name) || [],
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      readingTime: calculateReadingTime(post.content.rendered),
      headings: extractHeadings(post.content.rendered),
    }))
  } catch (error) {
    console.error("Error fetching related articles:", error)
    return getMockRelatedArticles()
  }
}

// Fetch pages from WordPress
export async function fetchPages(): Promise<Page[]> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockPages()
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch data from the WordPress API
    console.log(`Fetching pages from: ${apiUrl}/pages?_embed`)
    const response = await fetch(`${apiUrl}/pages?_embed`)

    if (!response.ok) {
      console.error(`API returned status: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch pages: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`API returned non-JSON response: ${contentType}`)
      console.error(`First 100 chars of response: ${await response.text().then((text) => text.substring(0, 100))}...`)
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const pages = await response.json()

    // Transform WordPress pages to our Page format
    return pages.map((page: any) => ({
      id: page.id,
      slug: page.slug,
      title: page.title.rendered,
      excerpt: page.excerpt.rendered,
      content: page.content.rendered,
      date: page.date,
      modified: page.modified,
      featuredImage: page._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    }))
  } catch (error) {
    console.error("Error fetching pages:", error)
    return getMockPages()
  }
}

// Fetch a single page by slug
export async function fetchPageBySlug(slug: string): Promise<Page | null> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockPageBySlug(slug)
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch data from the WordPress API
    // Add context=edit to get the raw content if possible (requires authentication)
    const response = await fetch(`${apiUrl}/pages?slug=${slug}&_embed`)

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API returned non-JSON response: ${contentType}`)
    }

    const pages = await response.json()

    // If no page found with this slug
    if (pages.length === 0) {
      return null
    }

    const page = pages[0]

    // Transform WordPress page to our Page format
    return {
      id: page.id,
      slug: page.slug,
      title: page.title.rendered,
      excerpt: page.excerpt.rendered,
      content: page.content.rendered,
      date: page.date,
      modified: page.modified,
      featuredImage: page._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    }
  } catch (error) {
    console.error(`Error fetching page by slug ${slug}:`, error)
    return getMockPageBySlug(slug)
  }
}

// Ajout de la fonction pour récupérer des suggestions de recherche
export async function fetchSearchSuggestions(query: string): Promise<{
  articles: { id: number; title: string; slug: string; type: "article" }[]
  pages: { id: number; title: string; slug: string; type: "page" }[]
}> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockSearchSuggestions(query)
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch articles that match the query
    const articlesResponse = await fetch(
      `${apiUrl}/posts?search=${encodeURIComponent(query)}&_fields=id,title,slug&per_page=5`,
    )

    if (!articlesResponse.ok) {
      throw new Error(`Failed to fetch article suggestions: ${articlesResponse.status}`)
    }

    // Fetch pages that match the query
    const pagesResponse = await fetch(
      `${apiUrl}/pages?search=${encodeURIComponent(query)}&_fields=id,title,slug&per_page=3`,
    )

    if (!pagesResponse.ok) {
      throw new Error(`Failed to fetch page suggestions: ${pagesResponse.status}`)
    }

    const articles = await articlesResponse.json()
    const pages = await pagesResponse.json()

    return {
      articles: articles.map((article: any) => ({
        id: article.id,
        title: article.title.rendered,
        slug: article.slug,
        type: "article" as const,
      })),
      pages: pages.map((page: any) => ({
        id: page.id,
        title: page.title.rendered,
        slug: page.slug,
        type: "page" as const,
      })),
    }
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return getMockSearchSuggestions(query)
  }
}

// Helper function to ensure the API URL is correctly formatted
function ensureCorrectApiUrl(url: string): string {
  // Remove trailing slash if present
  let apiUrl = url.endsWith("/") ? url.slice(0, -1) : url

  // Check if the URL already includes /wp-json/wp/v2
  if (!apiUrl.includes("/wp-json/wp/v2")) {
    // If it has /wp-json but not /wp/v2, add the latter
    if (apiUrl.includes("/wp-json")) {
      apiUrl = `${apiUrl}/wp/v2`
    }
    // If it doesn't have /wp-json, add the full path
    else {
      apiUrl = `${apiUrl}/wp-json/wp/v2`
    }
  }

  return apiUrl
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, "")
  // Calculate reading time (average reading speed: 200 words per minute)
  const words = text.split(/\s+/).length
  const readingTime = Math.ceil(words / 200)
  return readingTime < 1 ? 1 : readingTime
}

// Helper function to extract headings from content
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const headingRegex = /<h([2-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g

  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = Number.parseInt(match[1], 10)
    const id = match[2]
    // Remove any HTML tags from the heading text
    const text = match[3].replace(/<[^>]*>/g, "")

    headings.push({ id, text, level })
  }

  return headings
}

// Mock data functions for fallback
function getMockFeaturedArticles(): Article[] {
  return getMockArticles().slice(0, 3)
}

function getMockArticles(): Article[] {
  return [
    {
      id: 1,
      slug: "introduction-to-headless-wordpress",
      title: "Introduction to Headless WordPress",
      excerpt: "Learn about the benefits of using WordPress as a headless CMS with modern frontend frameworks.",
      content: "",
      date: "2023-05-15T12:00:00Z",
      author: "Jane Smith",
      categories: ["WordPress", "Headless CMS"],
      tags: ["headless", "cms", "tutorial"],
      featuredImage: "/headless-wordpress-concept.png",
      readingTime: 5,
      headings: [],
    },
    {
      id: 2,
      slug: "setting-up-nextjs-with-wordpress",
      title: "Setting Up Next.js with WordPress",
      excerpt: "A step-by-step guide to connecting your WordPress site to a Next.js frontend.",
      content: "",
      date: "2023-06-02T10:30:00Z",
      author: "John Doe",
      categories: ["Next.js", "WordPress"],
      tags: ["setup", "tutorial", "nextjs"],
      featuredImage: "/nextjs-wordpress-connection.png",
      readingTime: 8,
      headings: [],
    },
    {
      id: 3,
      slug: "optimizing-wordpress-rest-api",
      title: "Optimizing WordPress REST API Performance",
      excerpt: "Tips and tricks to improve the performance of your WordPress REST API for headless setups.",
      content: "",
      date: "2023-06-20T14:15:00Z",
      author: "Alex Johnson",
      categories: ["Performance", "REST API"],
      tags: ["optimization", "api", "performance"],
      featuredImage: "/api-flow-optimization.png",
      readingTime: 6,
      headings: [],
    },
    {
      id: 4,
      slug: "custom-post-types-in-headless-wordpress",
      title: "Working with Custom Post Types in Headless WordPress",
      excerpt: "Learn how to create and use custom post types in a headless WordPress setup.",
      content: "",
      date: "2023-07-05T09:20:00Z",
      author: "Sarah Williams",
      categories: ["WordPress", "Development"],
      tags: ["custom post types", "advanced", "tutorial"],
      featuredImage: "/placeholder.svg?key=cpt-wordpress",
      readingTime: 7,
      headings: [],
    },
    {
      id: 5,
      slug: "authentication-in-headless-wordpress",
      title: "Authentication Strategies for Headless WordPress",
      excerpt: "Explore different authentication methods for securing your headless WordPress API.",
      content: "",
      date: "2023-07-18T16:45:00Z",
      author: "Michael Brown",
      categories: ["Security", "WordPress"],
      tags: ["authentication", "security", "jwt"],
      featuredImage: "/placeholder.svg?key=auth-wordpress",
      readingTime: 9,
      headings: [],
    },
    {
      id: 6,
      slug: "seo-for-headless-wordpress",
      title: "SEO Best Practices for Headless WordPress Sites",
      excerpt: "Optimize your headless WordPress site for search engines with these proven strategies.",
      content: "",
      date: "2023-08-03T11:30:00Z",
      author: "Emily Chen",
      categories: ["SEO", "Marketing"],
      tags: ["seo", "optimization", "marketing"],
      featuredImage: "/placeholder.svg?key=seo-wordpress",
      readingTime: 6,
      headings: [],
    },
    {
      id: 7,
      slug: "wordpress-gutenberg-blocks-in-nextjs",
      title: "Rendering WordPress Gutenberg Blocks in Next.js",
      excerpt: "Learn how to parse and render Gutenberg blocks in your Next.js frontend.",
      content: "",
      date: "2023-08-22T13:15:00Z",
      author: "David Wilson",
      categories: ["Next.js", "Gutenberg"],
      tags: ["gutenberg", "blocks", "rendering"],
      featuredImage: "/placeholder.svg?key=gutenberg-nextjs",
      readingTime: 8,
      headings: [],
    },
    {
      id: 8,
      slug: "multilingual-headless-wordpress",
      title: "Building Multilingual Sites with Headless WordPress",
      excerpt: "A comprehensive guide to creating multilingual websites using headless WordPress.",
      content: "",
      date: "2023-09-10T10:00:00Z",
      author: "Sophie Martin",
      categories: ["Internationalization", "WordPress"],
      tags: ["multilingual", "i18n", "translation"],
      featuredImage: "/placeholder.svg?key=multilingual-wp",
      readingTime: 10,
      headings: [],
    },
    {
      id: 9,
      slug: "e-commerce-with-woocommerce-and-nextjs",
      title: "Building an E-commerce Site with WooCommerce and Next.js",
      excerpt: "Step-by-step guide to creating a headless e-commerce store using WooCommerce and Next.js.",
      content: "",
      date: "2023-09-28T15:30:00Z",
      author: "Robert Taylor",
      categories: ["E-commerce", "WooCommerce"],
      tags: ["woocommerce", "e-commerce", "shop"],
      featuredImage: "/placeholder.svg?key=woocommerce-nextjs",
      readingTime: 12,
      headings: [],
    },
    {
      id: 10,
      slug: "wordpress-as-a-headless-cms-for-mobile-apps",
      title: "Using WordPress as a Headless CMS for Mobile Apps",
      excerpt: "How to leverage WordPress as a content backend for your iOS and Android applications.",
      content: "",
      date: "2023-10-15T09:45:00Z",
      author: "Jessica Lee",
      categories: ["Mobile Development", "WordPress"],
      tags: ["mobile", "apps", "react native"],
      featuredImage: "/placeholder.svg?key=mobile-wordpress",
      readingTime: 7,
      headings: [],
    },
  ]
}

function getMockArticleBySlug(slug: string): Article | null {
  if (slug === "introduction-to-headless-wordpress") {
    return {
      id: 1,
      slug: "introduction-to-headless-wordpress",
      title: "Introduction to Headless WordPress",
      excerpt: "Learn about the benefits of using WordPress as a headless CMS with modern frontend frameworks.",
      content: `
        <h2 id="what-is-headless-wordpress">What is Headless WordPress?</h2>
        <p>Headless WordPress is an approach where WordPress is used solely as a content management system (CMS), while the frontend is built using a separate technology stack. In this setup, WordPress serves as the "head" for content creation and management, while a different technology, such as Next.js, React, or Vue.js, handles the presentation layer.</p>
        
        <h3 id="traditional-vs-headless">Traditional vs. Headless WordPress</h3>
        <p>In a traditional WordPress setup, both the content management and the presentation are handled by WordPress itself. The theme system is responsible for how content is displayed to users. In contrast, a headless approach separates these concerns, with WordPress handling content management and a separate frontend framework handling the presentation.</p>
        
        <h2 id="benefits-of-headless">Benefits of Headless WordPress</h2>
        <p>There are several advantages to using WordPress as a headless CMS:</p>
        
        <h3 id="performance">Performance</h3>
        <p>Modern JavaScript frameworks like Next.js can deliver better performance than traditional WordPress themes. With techniques like static site generation and incremental static regeneration, pages load faster and provide a better user experience.</p>
        
        <h3 id="flexibility">Flexibility</h3>
        <p>Developers have more freedom to choose the technologies they want to work with on the frontend. This can lead to more innovative and tailored user experiences.</p>
        
        <h3 id="security">Security</h3>
        <p>By decoupling the frontend from the backend, you reduce the attack surface for potential security vulnerabilities. The WordPress admin area can be locked down and separated from the public-facing site.</p>
        
        <h2 id="challenges">Challenges and Considerations</h2>
        <p>While headless WordPress offers many benefits, there are also challenges to consider:</p>
        
        <h3 id="complexity">Increased Complexity</h3>
        <p>Managing two separate systems (WordPress and your frontend framework) adds complexity to your development and deployment processes.</p>
        
        <h3 id="learning-curve">Learning Curve</h3>
        <p>Your team needs to be proficient in both WordPress and your chosen frontend technology, which may require additional training or hiring.</p>
        
        <h3 id="plugin-limitations">Plugin Limitations</h3>
        <p>Some WordPress plugins that affect the frontend may not work in a headless setup, requiring custom solutions.</p>
      `,
      date: "2023-05-15T12:00:00Z",
      author: "Jane Smith",
      categories: ["WordPress", "Headless CMS"],
      tags: ["headless", "cms", "tutorial"],
      featuredImage: "/headless-wordpress-architecture.png",
      readingTime: 5,
      headings: [
        { id: "what-is-headless-wordpress", text: "What is Headless WordPress?", level: 2 },
        { id: "traditional-vs-headless", text: "Traditional vs. Headless WordPress", level: 3 },
        { id: "benefits-of-headless", text: "Benefits of Headless WordPress", level: 2 },
        { id: "performance", text: "Performance", level: 3 },
        { id: "flexibility", text: "Flexibility", level: 3 },
        { id: "security", text: "Security", level: 3 },
        { id: "challenges", text: "Challenges and Considerations", level: 2 },
        { id: "complexity", text: "Increased Complexity", level: 3 },
        { id: "learning-curve", text: "Learning Curve", level: 3 },
        { id: "plugin-limitations", text: "Plugin Limitations", level: 3 },
      ],
    }
  }
  return null
}

function getMockRelatedArticles(): Article[] {
  return [
    {
      id: 2,
      slug: "setting-up-nextjs-with-wordpress",
      title: "Setting Up Next.js with WordPress",
      excerpt: "A step-by-step guide to connecting your WordPress site to a Next.js frontend.",
      content: "",
      date: "2023-06-02T10:30:00Z",
      author: "John Doe",
      categories: ["Next.js", "WordPress"],
      tags: ["setup", "tutorial", "nextjs"],
      featuredImage: "",
      readingTime: 8,
      headings: [],
    },
    {
      id: 3,
      slug: "optimizing-wordpress-rest-api",
      title: "Optimizing WordPress REST API Performance",
      excerpt: "Tips and tricks to improve the performance of your WordPress REST API for headless setups.",
      content: "",
      date: "2023-06-20T14:15:00Z",
      author: "Alex Johnson",
      categories: ["Performance", "REST API"],
      tags: ["optimization", "api", "performance"],
      featuredImage: "",
      readingTime: 6,
      headings: [],
    },
  ]
}

// Mock data for categories
function getMockCategories(): Category[] {
  return [
    { id: 1, name: "WordPress", slug: "wordpress", count: 4 },
    { id: 2, name: "Headless CMS", slug: "headless-cms", count: 1 },
    { id: 3, name: "Next.js", slug: "nextjs", count: 3 },
    { id: 4, name: "Performance", slug: "performance", count: 2 },
    { id: 5, name: "REST API", slug: "rest-api", count: 2 },
    { id: 6, name: "Development", slug: "development", count: 1 },
    { id: 7, name: "Security", slug: "security", count: 1 },
    { id: 8, name: "SEO", slug: "seo", count: 1 },
    { id: 9, name: "Marketing", slug: "marketing", count: 1 },
    { id: 10, name: "Gutenberg", slug: "gutenberg", count: 1 },
    { id: 11, name: "Internationalization", slug: "internationalization", count: 1 },
    { id: 12, name: "E-commerce", slug: "e-commerce", count: 1 },
    { id: 13, name: "WooCommerce", slug: "woocommerce", count: 1 },
    { id: 14, name: "Mobile Development", slug: "mobile-development", count: 1 },
  ]
}

// Mock data for tags
function getMockTags(): Tag[] {
  return [
    { id: 1, name: "headless", slug: "headless", count: 1 },
    { id: 2, name: "cms", slug: "cms", count: 1 },
    { id: 3, name: "tutorial", slug: "tutorial", count: 3 },
    { id: 4, name: "setup", slug: "setup", count: 1 },
    { id: 5, name: "nextjs", slug: "nextjs", count: 2 },
    { id: 6, name: "optimization", slug: "optimization", count: 2 },
    { id: 7, name: "api", slug: "api", count: 1 },
    { id: 8, name: "performance", slug: "performance", count: 1 },
    { id: 9, name: "custom post types", slug: "custom-post-types", count: 1 },
    { id: 10, name: "advanced", slug: "advanced", count: 1 },
    { id: 11, name: "authentication", slug: "authentication", count: 1 },
    { id: 12, name: "security", slug: "security", count: 1 },
    { id: 13, name: "jwt", slug: "jwt", count: 1 },
    { id: 14, name: "seo", slug: "seo", count: 1 },
    { id: 15, name: "marketing", slug: "marketing", count: 1 },
    { id: 16, name: "gutenberg", slug: "gutenberg", count: 1 },
    { id: 17, name: "blocks", slug: "blocks", count: 1 },
    { id: 18, name: "rendering", slug: "rendering", count: 1 },
    { id: 19, name: "multilingual", slug: "multilingual", count: 1 },
    { id: 20, name: "i18n", slug: "i18n", count: 1 },
    { id: 21, name: "translation", slug: "translation", count: 1 },
    { id: 22, name: "woocommerce", slug: "woocommerce", count: 1 },
    { id: 23, name: "e-commerce", slug: "e-commerce", count: 1 },
    { id: 24, name: "shop", slug: "shop", count: 1 },
    { id: 25, name: "mobile", slug: "mobile", count: 1 },
    { id: 26, name: "apps", slug: "apps", count: 1 },
    { id: 27, name: "react native", slug: "react-native", count: 1 },
  ]
}

// Mock data for pages
function getMockPages(): Page[] {
  return [
    {
      id: 101,
      slug: "presentation",
      title: "Presentation",
      excerpt:
        "Welcome to WikiPress, a comprehensive knowledge base that combines the power of WordPress content management with the speed and flexibility of Next.js.",
      content:
        "<p>Welcome to WikiPress, a comprehensive knowledge base that combines the power of WordPress content management with the speed and flexibility of Next.js. Our platform is designed to make information accessible and well-organized.</p><p>WikiPress provides a Wikipedia-like experience with the robust content management capabilities of WordPress. This allows content creators to use familiar tools while providing users with a fast, modern interface.</p>",
      date: "2023-04-10T10:00:00Z",
      modified: "2023-04-15T14:30:00Z",
      featuredImage: "/business-presentation-setup.png",
    },
    {
      id: 102,
      slug: "cartographie",
      title: "Cartographie",
      excerpt:
        "Explorez notre base de connaissances à travers des cartes interactives et des visualisations qui montrent les relations entre différents sujets.",
      content:
        "<p>Explorez notre base de connaissances à travers des cartes interactives et des visualisations qui montrent les relations entre différents sujets.</p><p>Notre système de cartographie permet de visualiser les connexions entre les articles, les catégories et les concepts, offrant une nouvelle façon de naviguer dans notre base de connaissances.</p>",
      date: "2023-04-12T11:20:00Z",
      modified: "2023-04-16T09:45:00Z",
      featuredImage: "/interconnected-learning.png",
    },
    {
      id: 103,
      slug: "consulter",
      title: "Consulter",
      excerpt:
        "Accédez à notre bibliothèque complète d'articles et de ressources organisés par thèmes, catégories et mots-clés.",
      content:
        "<p>Accédez à notre bibliothèque complète d'articles et de ressources organisés par thèmes, catégories et mots-clés.</p><p>Notre système de consultation vous permet de trouver rapidement les informations dont vous avez besoin, grâce à une organisation claire et des outils de recherche puissants.</p>",
      date: "2023-04-14T13:40:00Z",
      modified: "2023-04-17T16:20:00Z",
      featuredImage: "/interconnected-knowledge.png",
    },
    {
      id: 104,
      slug: "about",
      title: "About WikiPress",
      excerpt:
        "WikiPress combines the powerful content management capabilities of WordPress with the performance and user experience of Next.js to create a Wikipedia-style knowledge base.",
      content:
        "<p>WikiPress combines the powerful content management capabilities of WordPress with the performance and user experience of Next.js to create a Wikipedia-style knowledge base.</p><p>Our mission is to make knowledge sharing easy, fast, and accessible. By leveraging the best of both WordPress and Next.js, we've created a platform that's both powerful for content creators and delightful for readers.</p>",
      date: "2023-04-05T09:30:00Z",
      modified: "2023-04-18T11:10:00Z",
      featuredImage: "/team-brainstorm.png",
    },
    {
      id: 105,
      slug: "contribute",
      title: "Contribute",
      excerpt:
        "Help expand our knowledge base by contributing new articles or improving existing ones through our WordPress backend.",
      content:
        "<p>Help expand our knowledge base by contributing new articles or improving existing ones through our WordPress backend.</p><p>Contributing to WikiPress is easy. Simply request access to our WordPress backend, and you can start creating or editing content. Our editorial team will review submissions to ensure quality and consistency.</p>",
      date: "2023-04-08T15:50:00Z",
      modified: "2023-04-19T10:25:00Z",
      featuredImage: "/interconnected-minds.png",
    },
  ]
}

// Get mock page by slug
function getMockPageBySlug(slug: string): Page | null {
  const pages = getMockPages()
  return pages.find((page) => page.slug === slug) || null
}

// Mock data pour les suggestions de recherche
function getMockSearchSuggestions(query: string): {
  articles: { id: number; title: string; slug: string; type: "article" }[]
  pages: { id: number; title: string; slug: string; type: "page" }[]
} {
  const lowercaseQuery = query.toLowerCase()

  const mockArticles = getMockArticles()
  const mockPages = getMockPages()

  const filteredArticles = mockArticles
    .filter(
      (article) =>
        article.title.toLowerCase().includes(lowercaseQuery) || article.excerpt.toLowerCase().includes(lowercaseQuery),
    )
    .slice(0, 5)
    .map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      type: "article" as const,
    }))

  const filteredPages = mockPages
    .filter(
      (page) =>
        page.title.toLowerCase().includes(lowercaseQuery) || page.excerpt.toLowerCase().includes(lowercaseQuery),
    )
    .slice(0, 3)
    .map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      type: "page" as const,
    }))

  return {
    articles: filteredArticles,
    pages: filteredPages,
  }
}

interface GroupeLocal {
  id: number
  title: string
  slug: string
  coordinates: [number, number]
  type: string
  address: string
  phone?: string
  email?: string
  website?: string
  featuredImage?: string
}

// Récupérer les groupes locaux depuis WordPress
export async function fetchGroupesLocaux(): Promise<GroupeLocal[]> {
  try {
    // Check if we have a WordPress API URL
    if (!WORDPRESS_API_URL) {
      console.warn("WORDPRESS_API_URL is not defined. Using mock data instead.")
      return getMockGroupesLocaux()
    }

    // Ensure the API URL is properly formatted
    const apiUrl = ensureCorrectApiUrl(WORDPRESS_API_URL)

    // Fetch data from the WordPress API
    const response = await fetch(`${apiUrl}/groupe_local?_embed&per_page=100`)

    if (!response.ok) {
      throw new Error(`Failed to fetch groupes locaux: ${response.status}`)
    }

    const posts = await response.json()
    
    // Transform WordPress posts to our GroupeLocal format
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
    }))
  } catch (error) {
    console.error("Error fetching groupes locaux:", error)
    return getMockGroupesLocaux()
  }
}

// Mock data pour les groupes locaux
function getMockGroupesLocaux(): GroupeLocal[] {
  return [
    {
      id: 1,
      title: "Paris",
      slug: "paris",
      coordinates: [48.8566, 2.3522],
      type: "bureau",
      address: "12 Rue de Rivoli, 75001 Paris",
      phone: "+33 1 23 45 67 89",
      email: "paris@wikipress.fr",
      website: "https://wikipress.fr/paris",
      featuredImage: "/Parisian-Cafe-Scene.png",
    },
    {
      id: 2,
      title: "Lyon",
      slug: "lyon",
      coordinates: [45.7578, 4.832],
      type: "bureau",
      address: "45 Rue de la République, 69002 Lyon",
      phone: "+33 4 78 12 34 56",
      email: "lyon@wikipress.fr",
      featuredImage: "/confluence-lyon.png",
    },
    {
      id: 3,
      title: "Marseille",
      slug: "marseille",
      coordinates: [43.2965, 5.3698],
      type: "bureau",
      address: "123 La Canebière, 13001 Marseille",
      phone: "+33 4 91 23 45 67",
      featuredImage: "/Vieux-Port-Sunrise.png",
    },
    {
      id: 4,
      title: "Bordeaux",
      slug: "bordeaux",
      coordinates: [44.8378, -0.5792],
      type: "bureau",
      address: "56 Cours de l'Intendance, 33000 Bordeaux",
      phone: "+33 5 56 12 34 56",
      email: "bordeaux@wikipress.fr",
      featuredImage: "/bordeaux-vineyard-autumn.png",
    },
    {
      id: 5,
      title: "Lille",
      slug: "lille",
      coordinates: [50.6292, 3.0573],
      type: "bureau",
      address: "34 Rue Faidherbe, 59000 Lille",
      phone: "+33 3 20 12 34 56",
      featuredImage: "/grand-place-lille.png",
    },
  ]
}
