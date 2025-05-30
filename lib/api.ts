import { env } from "process"

// Types for WordPress API responses
export interface Category {
  id: number
  slug: string
  name: string
  description: string
  count: number
  acf?: {
    image_categorie?: string
  }
  link: string
}

// Dans l'interface Post, inclure tous les champs possibles pour les groupes locaux
export interface Post {
  id: number
  title: {
    rendered: string
  }
  date: string
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  author: number
  slug: string
  link: string
  featured_media?: number
  categories?: number[]
  acf?: {
    groupe_local?: string
    groupe_local_tax?: number // Ancien champ
    tax_groupe_local?: number // Nouveau champ
    date_de_levenement?: string // Corrigé de date_evenement à date_de_levenement
    heure_evenement?: string
    lieu_evenement?: string
    adresse_evenement?: string
    descriptif?: string
    fichier_de_la_publication?: string
    region_etats_generaux_communaux?: string
    contenu_de_larticle?: string
    adress?: string
    adresse?: string
    latitude?: string | number
    longitude?: string | number
    // Ajouter la structure imbriquée pour lieu_de_levenement avec toutes les propriétés possibles
    lieu_de_levenement?:
      | {
          adress?: string
          address?: string
          name?: string
          city?: string
          state?: string
          post_code?: string
          country?: string
          country_short?: string
          lat?: number
          lng?: number
          zoom?: number
          place_id?: string
          [key: string]: any
        }
      | string // Peut aussi être une chaîne simple
    [key: string]: any
  }
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
    }>
    "wp:term"?: Array<
      Array<{
        id: number
        name: string
        slug: string
        taxonomy: string
      }>
    >
  }
  featuredImage?: number // Add this property to match the usage in the code
}

export interface Page {
  id: number
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  slug: string
  link: string
  acf?: {
    [key: string]: any
  }
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
    }>
  }
}

// Interface pour le custom post type "groupe_local"
export interface GroupeLocalPost {
  id: number
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  slug: string
  link: string
  position?: {
    lat: number
    lng: number
  }
  acf?: {
    [key: string]: any
  }
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
    }>
  }
}

export interface GroupeLocal {
  id: number
  name: string
  slug: string
}

export interface Media {
  id: number
  title: {
    rendered: string
  }
  date: string
  link: string
  media_type: string
  mime_type: string
  source_url: string
  alt_text?: string
  caption?: {
    rendered: string
  }
}

export interface Verbatim {
  id: number;
  acf: {
    texte_du_verbatim?: string;
    date?: string;
    departement?: string;
    groupe_local?: string;
  };
}

export interface VerbatimImage {
  id: number;
  acf: {
    image_du_verbatim?: string;
  };
}

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL || "https://wp-starter.io/wp-json/wp/v2"

// Cache for categories to avoid multiple requests
let categoriesCache: Category[] | null = null
let categoriesCacheTime = 0
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

// Cache pour les groupes locaux (CPT)
let groupesLocauxCache: GroupeLocalPost[] | null = null
let groupesLocauxCacheTime = 0

// Cache pour tous les posts
let allPostsCache: Post[] | null = null
let allPostsCacheTime = 0

// Fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    // Check if we have a valid cache
    const now = Date.now()
    if (categoriesCache && categoriesCacheTime + CACHE_DURATION > now) {
      return categoriesCache.sort((a, b) => b.count - a.count)
    }

    const response = await fetch(`${API_BASE_URL}/categories?per_page=100`, {
      // Remove 'cache: "no-store"' to allow static rendering and ISR
      headers: {
        Accept: "application/json",
      },
      // Optionally, you can add: next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    const data = await response.json()

    // Update cache
    categoriesCache = data
    categoriesCacheTime = now
    // Sort categories by count in descending order
    return data.sort((a: Category, b: Category) => b.count - a.count)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

// Fetch a specific category by slug
export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories?slug=${slug}`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch category by slug: ${response.status}`)
    }

    const categories = await response.json()

    // Check if a category was found
    return categories.length > 0 ? categories[0] : null
  } catch (error) {
    console.error(`Error fetching category by slug ${slug}:`, error)
    return null
  }
}


// Fetch a specific category by ID
export async function fetchCategory(id: number): Promise<Category> {
  try {
    // First try to get from cache or fetch all categories
    const allCategories = await fetchCategories()
    const categoryFromCache = allCategories.find((cat) => cat.id === id)

    if (categoryFromCache) {
      return categoryFromCache
    }

    // If not found in cache, try direct API call
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 }, // Revalidate every minute as fallback
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${response.status}`)
      }

      return await response.json()
    } catch (fetchError) {
      console.error(`Error in direct API call for category ${id}:`, fetchError)
      throw fetchError
    }
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error)

    // If we can't get the category, return a default one
    return {
      id: id,
      name: `Catégorie ${id}`,
      description: "",
      count: 0,
      link: "",
    }
  }
}

// Fonction pour récupérer tous les posts
export async function fetchAllPosts(): Promise<Post[]> {
  try {
    // Vérifier si nous avons un cache valide
    const now = Date.now()
    if (allPostsCache && allPostsCacheTime + CACHE_DURATION > now) {
      return allPostsCache
    }

    console.log("Récupération de tous les posts depuis l'API")

    // Récupérer le nombre total de pages
    const countResponse = await fetch(`${API_BASE_URL}/posts?per_page=1`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!countResponse.ok) {
      throw new Error(`Failed to fetch posts count: ${countResponse.status}`)
    }

    const totalPosts = Number.parseInt(countResponse.headers.get("X-WP-Total") || "0", 10)
    const totalPages = Number.parseInt(countResponse.headers.get("X-WP-TotalPages") || "1", 10)

    console.log(`Total posts: ${totalPosts}, Total pages: ${totalPages}`)

    // Récupérer tous les posts avec pagination
    let allPosts: Post[] = []

    // Limiter à 5 pages maximum pour éviter de surcharger l'API
    const maxPages = Math.min(totalPages, 5)

    for (let page = 1; page <= maxPages; page++) {
      console.log(`Récupération de la page ${page}/${maxPages}`)

      const response = await fetch(`${API_BASE_URL}/posts?_embed&per_page=100&page=${page}`, {
        
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 400 && page > 1) {
          // C'est probablement la fin des pages
          break
        }
        throw new Error(`Failed to fetch posts page ${page}: ${response.status}`)
      }

      const posts = await response.json()
      allPosts = [...allPosts, ...posts]

      // Si nous avons récupéré moins de 100 posts, c'est probablement la dernière page
      if (posts.length < 100) {
        break
      }
    }

    // Mettre à jour le cache
    allPostsCache = allPosts
    allPostsCacheTime = now

    return allPosts
  } catch (error) {
    console.error("Error fetching all posts:", error)
    return []
  }
}

// Fetch last 4 posts
export async function fetchLastThreePosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?_embed&per_page=3`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Revalidate every hour (adjust as needed)
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch last three posts: ${response.status}`)
    }

    const posts = await response.json()

    // Fetch the featured media URL for each post
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
    }))
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    return [];
  }
}


// Améliorer la fonction fetchPostsByCategory pour s'assurer que les posts ont l'information de catégorie
export async function fetchPostsByCategory(categoryId: number): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?categories=${categoryId}&_embed&per_page=100`, {
      
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Revalidate every minute as fallback
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    const posts = await response.json()

    // S'assurer que tous les posts ont l'information de catégorie
    return posts.map((post) => {
      if (!post.categories || !Array.isArray(post.categories)) {
        post.categories = [categoryId]
      }
      return post
    })
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryId}:`, error)
    return []
  }
}

// Fetch a specific post by slug
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?slug=${slug}&_embed`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch post by slug: ${response.status}`)
    }

    const posts = await response.json()

    // Vérifier si un post correspondant a été trouvé
    return posts.length > 0 ? posts[0] : null
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error)
    return null
  }
}

// Fetch the 3 most recent posts for a category
export async function fetchRecentPostsByCategory(categoryId: number): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?categories=${categoryId}&_embed&per_page=4`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch recent posts: ${response.status}`)
    }

    const posts: Post[] = await response.json()

    // Fetch the featured media URL for each post
    const postsWithMedia = await Promise.all(
      posts.map(async (post) => {
        if (post.featured_media) {
          try {
            const mediaResponse = await fetch(`${API_BASE_URL}/media/${post.featured_media}`, {
              
              headers: {
                Accept: "application/json",
              },
            })

            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json()
              post._embedded = post._embedded || {}
              post._embedded["wp:featuredmedia"] = [{ source_url: mediaData.source_url }]
            }
          } catch (error) {
            console.error(`Error fetching media for post ${post.id}:`, error)
          }
        }
        return post
      }),
    )

    return postsWithMedia
  } catch (error) {
    console.error(`Error fetching recent posts for category ${categoryId}:`, error)
    return []
  }
}

// Fetch search suggestions
export async function fetchSearchSuggestions(query: string): Promise<{
  groupedArticles: { [category: string]: { id: number; title: string; slug: string }[] };
}> {
  if (!API_BASE_URL ) {
    console.warn("WORDPRESS_API_URL is not defined.");
    return { groupedArticles: {} };
  }

  try {
    console.log("Fetching search suggestions for query:", query);
    // Fetch articles matching the search query
    const articlesResponse = await fetch(
      `${API_BASE_URL}/posts?search=${encodeURIComponent(query)}&_embed&per_page=10`
    );

    if (!articlesResponse.ok) {
      throw new Error(`Failed to fetch article suggestions: ${articlesResponse.status}`);
    }

    const articles = await articlesResponse.json();
    console.log("Articles fetched:", articles);

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

// récupérer le contenu des pages
export async function fetchPageBySlug(slug: string): Promise<Page | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pages?slug=${slug}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page by slug: ${response.status}`)
    }

    const pages = await response.json()

    // Vérifier si une page correspondante a été trouvée
    return pages.length > 0 ? pages[0] : null
  } catch (error) {
    console.error(`Error fetching page by slug ${slug}:`, error)
    return null
  }
}

// récupérer les fichiers joints par des champs ACF 
export async function fetchAttachmentById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Revalidate every hour (adjust as needed)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attachment: ${response.status}`);
      console.log
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching attachment by ID ${id}:`, error);
    return null;
  }
}

// Mettre à jour la fonction fetchPostsByCategoryAndGroupeLocalCPT pour utiliser groupe_local_tax
export async function fetchPostsByCategoryAndGroupeLocalCPT(
  categoryId: number,
  groupeLocalCptId: number,
): Promise<Post[]> {
  try {
    console.log(`Fetching posts for category ${categoryId} and groupe_local CPT ${groupeLocalCptId}`)

    // Récupérer d'abord tous les posts de la catégorie
    const allPosts = await fetchPostsByCategory(categoryId)

    // Filtrer les posts qui ont le CPT groupe_local spécifié dans leur champ ACF
    const filteredPosts = allPosts.filter((post) => {
      // Vérifier si le post a un champ ACF groupe_local_tax qui correspond à l'ID du CPT
      if (post.acf?.groupe_local_tax === groupeLocalCptId) {
        return true
      }
      return false
    })

    console.log(`Found ${filteredPosts.length} posts matching groupe_local CPT ${groupeLocalCptId}`)
    return filteredPosts
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryId} and groupe_local CPT ${groupeLocalCptId}:`, error)
    return []
  }
}

// Mettre à jour la fonction fetchPostsByGroupeLocalCPT pour utiliser groupe_local_tax
export async function fetchPostsByGroupeLocalCPT(groupeLocalCptId: number): Promise<Post[]> {
  try {
    console.log(`Fetching posts for groupe_local CPT ${groupeLocalCptId}`)

    // Récupérer tous les posts (limité à 100 pour des raisons de performance)
    const response = await fetch(`${API_BASE_URL}/posts?_embed&per_page=100`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    const posts = await response.json()

    // Filtrer les posts qui ont le CPT groupe_local spécifié dans leur champ ACF
    const filteredPosts = posts.filter((post) => {
      // Vérifier si le post a un champ ACF groupe_local_tax qui correspond à l'ID du CPT
      if (post.acf?.groupe_local_tax === groupeLocalCptId) {
        return true
      }
      return false
    })

    console.log(`Found ${filteredPosts.length} posts for groupe_local CPT ${groupeLocalCptId}`)
    return filteredPosts
  } catch (error) {
    console.error(`Error fetching posts for groupe_local CPT ${groupeLocalCptId}:`, error)
    return []
  }
}

// Améliorer la fonction pour récupérer les articles liés à un CPT groupe_local via tax_groupe_local
export async function fetchCategoriesForPost(postId: number): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories?post=${postId}&per_page=100`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories for post ${postId}: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching categories for post ${postId}:`, error)
    return []
  }
}

// Modifier la fonction fetchPostsByGroupeLocalTax pour inclure les catégories
export async function fetchPostsByGroupeLocalTax(groupeLocalId: number): Promise<Post[]> {
  try {
    console.log(`Fetching posts for groupe_local CPT ${groupeLocalId} via tax_groupe_local field`)

    // Récupérer tous les posts
    const allPosts = await fetchAllPosts()
    console.log(`Nombre total de posts récupérés: ${allPosts.length}`)

    // Filtrer les posts qui ont le CPT groupe_local spécifié dans l'un des champs ACF possibles
    const filteredPosts = allPosts.filter((post) => {
      // Vérifier tous les champs possibles qui pourraient contenir l'ID du groupe local
      if (post.acf?.tax_groupe_local === groupeLocalId) {
        console.log(`Post ${post.id} a tax_groupe_local = ${groupeLocalId}`)
        return true
      }
      if (post.acf?.groupe_local_tax === groupeLocalId) {
        console.log(`Post ${post.id} a groupe_local_tax = ${groupeLocalId}`)
        return true
      }
      // Vérifier si le champ groupe_local est une chaîne qui contient l'ID
      if (post.acf?.groupe_local && typeof post.acf.groupe_local === "string") {
        const groupeLocalIds = post.acf.groupe_local.split(",").map((id) => Number.parseInt(id.trim(), 10))
        if (groupeLocalIds.includes(groupeLocalId)) {
          console.log(`Post ${post.id} a groupe_local contenant ${groupeLocalId}`)
          return true
        }
      }
      return false
    })

    // Récupérer les catégories pour chaque post si elles ne sont pas déjà incluses
    const postsWithCategories = await Promise.all(
      filteredPosts.map(async (post) => {
        // Si le post a déjà des catégories dans _embedded, les utiliser
        if (post._embedded?.["wp:term"]?.[0]) {
          return post
        }

        // Sinon, récupérer les catégories
        if (post.categories && Array.isArray(post.categories) && post.categories.length > 0) {
          // Récupérer les détails des catégories
          const categoryPromises = post.categories.map((catId) => fetchCategory(catId))
          const categories = await Promise.all(categoryPromises)

          // Ajouter les catégories au post
          if (!post._embedded) {
            post._embedded = {}
          }
          post._embedded["wp:term"] = [categories]
        }

        return post
      }),
    )

    console.log(`Found ${postsWithCategories.length} posts for groupe_local CPT ${groupeLocalId} via any field`)
    return postsWithCategories
  } catch (error) {
    console.error(`Error fetching posts for groupe_local CPT ${groupeLocalId}:`, error)
    return []
  }
}

// Récupérer tous les custom posts "groupe_local"
export async function fetchGroupesLocaux(): Promise<GroupeLocalPost[]> {
  try {
    // Vérifier si nous avons un cache valide
    const now = Date.now()
    if (groupesLocauxCache && groupesLocauxCacheTime + CACHE_DURATION > now) {
      return groupesLocauxCache
    }

    const response = await fetch(`${API_BASE_URL}/groupe_local?_embed&per_page=100`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch groupes locaux: ${response.status}`)
    }

    const data = await response.json()

    // Mettre à jour le cache
    groupesLocauxCache = data
    groupesLocauxCacheTime = now

    return data
  } catch (error) {
    console.error("Error fetching groupes locaux:", error)
    return []
  }
}

// Ajouter une fonction pour récupérer tous les groupes locaux avec pagination
export async function fetchAllGroupesLocaux(
  page = 1,
  perPage = 20,
): Promise<{
  groupesLocaux: GroupeLocalPost[]
  totalPages: number
  totalItems: number
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/groupe_local?_embed&per_page=${perPage}&page=${page}`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch groupes locaux: ${response.status}`)
    }

    const data = await response.json()

    // Récupérer le nombre total de pages et d'éléments depuis les en-têtes
    const totalPages = Number.parseInt(response.headers.get("X-WP-TotalPages") || "1", 10)
    const totalItems = Number.parseInt(response.headers.get("X-WP-Total") || "0", 10)

    return {
      groupesLocaux: data,
      totalPages,
      totalItems,
    }
  } catch (error) {
    console.error("Error fetching all groupes locaux:", error)
    return {
      groupesLocaux: [],
      totalPages: 0,
      totalItems: 0,
    }
  }
}

// Récupérer un groupe local spécifique par son slug
export async function fetchGroupeLocalBySlug(slug: string): Promise<GroupeLocalPost | null> {
  try {
    // D'abord essayer de récupérer depuis le cache
    const allGroupesLocaux = await fetchGroupesLocaux()
    const groupeFromCache = allGroupesLocaux.find((groupe) => groupe.slug === slug)

    if (groupeFromCache) {
      return groupeFromCache
    }

    // Si non trouvé dans le cache, essayer un appel API direct
    const response = await fetch(`${API_BASE_URL}/groupe_local?slug=${slug}&_embed`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch groupe local: ${response.status}`)
    }

    const data = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error(`Error fetching groupe local by slug ${slug}:`, error)
    return null
  }
}


// Améliorer la fonction fetchGroupeLocalById pour mieux gérer les erreurs et ajouter des logs
export async function fetchGroupeLocalById(id: number): Promise<GroupeLocalPost | null> {
  try {
    console.log(`Tentative de récupération du groupe local avec l'ID ${id}`)

    // D'abord essayer de récupérer depuis le cache
    const allGroupesLocaux = await fetchGroupesLocaux()
    console.log(`Nombre de groupes locaux dans le cache: ${allGroupesLocaux.length}`)

    const groupeFromCache = allGroupesLocaux.find((groupe) => groupe.id === id)
    if (groupeFromCache) {
      console.log(`Groupe local trouvé dans le cache: ${groupeFromCache.title?.rendered || "Sans titre"}`)

      // Vérifier que les propriétés nécessaires existent
      if (!groupeFromCache.title || typeof groupeFromCache.title !== "object") {
        groupeFromCache.title = { rendered: `Groupe Local ${id}` }
      }

      if (!groupeFromCache.content || typeof groupeFromCache.content !== "object") {
        groupeFromCache.content = { rendered: "" }
      }

      return groupeFromCache
    }

    // Si non trouvé dans le cache, faire un appel API direct à l'endpoint spécifique
    console.log(
      `Groupe local non trouvé dans le cache, tentative d'appel API direct à ${API_BASE_URL}/groupe_local/${id}`,
    )
    const response = await fetch(`${API_BASE_URL}/groupe_local/${id}?_embed`, {
      
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Groupe local avec l'ID ${id} non trouvé (404)`)
        return null
      }
      throw new Error(`Failed to fetch groupe local: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Données brutes du groupe local ${id}:`, data)

    // Vérifier si les données ont la structure attendue
    if (!data || typeof data !== "object") {
      console.error(`Données invalides reçues pour le groupe local ${id}:`, data)
      return {
        id: id,
        title: { rendered: `Groupe Local ${id}` },
        content: { rendered: "" },
        slug: `groupe-local-${id}`,
        link: "",
        acf: {},
      }
    }

    // Créer un objet avec des valeurs par défaut pour les propriétés manquantes
    const safeData = {
      id: data.id || id,
      title: data.title || { rendered: `Groupe Local ${id}` },
      content: data.content || { rendered: "" },
      slug: data.slug || `groupe-local-${id}`,
      link: data.link || "",
      acf: data.acf || {},
      _embedded: data._embedded || {},
    }

    // Vérifier que les propriétés nécessaires existent
    if (!safeData.title || typeof safeData.title !== "object") {
      safeData.title = { rendered: `Groupe Local ${id}` }
    }

    if (!safeData.content || typeof safeData.content !== "object") {
      safeData.content = { rendered: "" }
    }

    console.log(`Groupe local récupéré via API: ${safeData.title?.rendered || "Sans titre"}`)
    return safeData
  } catch (error) {
    console.error(`Error fetching groupe local by ID ${id}:`, error)
    // Retourner un objet avec des valeurs par défaut en cas d'erreur
    return {
      id: id,
      title: { rendered: `Groupe Local ${id}` },
      content: { rendered: "" },
      slug: `groupe-local-${id}`,
      link: "",
      acf: {},
    }
  }
}


// Mettre à jour la fonction extractGroupesLocauxCPTFromCategory pour utiliser groupe_local_tax
export async function extractGroupesLocauxCPTFromCategory(categoryId: number): Promise<GroupeLocalPost[]> {
  try {
    // Récupérer tous les articles de la catégorie
    const posts = await fetchPostsByCategory(categoryId)

    // Récupérer tous les CPT groupe_local
    const allGroupesLocaux = await fetchGroupesLocaux()

    // Extraire les IDs uniques des CPT groupe_local référencés dans les articles
    const groupeLocalCptIds = new Set<number>()

    posts.forEach((post) => {
      if (post.acf?.groupe_local_tax && typeof post.acf.groupe_local_tax === "number") {
        groupeLocalCptIds.add(post.acf.groupe_local_tax)
      }
    })

    // Filtrer les CPT groupe_local qui sont référencés dans les articles
    const filteredGroupesLocaux = allGroupesLocaux.filter((groupe) => groupeLocalCptIds.has(groupe.id))

    console.log(`Extracted ${filteredGroupesLocaux.length} groupe_local CPTs from category ${categoryId}`)
    return filteredGroupesLocaux
  } catch (error) {
    console.error(`Error extracting groupe_local CPTs from category ${categoryId}:`, error)
    return []
  }
}

export async function fetchRandomVerbatim(): Promise<Verbatim | null> {
  
  try {
    const response = await fetch(`${API_BASE_URL}/verbatim`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch verbatim: ${response.status}`);
    }

    const verbatims: Verbatim[] = await response.json();

    if (verbatims.length === 0) {
      return null;
    }

    // Sélectionner un verbatim aléatoire
    const randomIndex = Math.floor(Math.random() * verbatims.length);
    return verbatims[randomIndex];
  } catch (error) {
    console.error("Error fetching random verbatim:", error);
    return null;
  }
}

export async function fetchRandomVerbatimImage(): Promise<VerbatimImage[] | null> {
  
  try {
    const response = await fetch(`${API_BASE_URL}/image`, {
      
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch verbatim: ${response.status}`);
    }

    const verbatimImages: VerbatimImage[] = await response.json();

    if (verbatimImages.length === 0) {
      return null;
    }

    // Sélectionner un verbatim aléatoire
    return verbatimImages;
  } catch (error) {
    console.error("Error fetching random verbatim:", error);
    return null;
  }
}
