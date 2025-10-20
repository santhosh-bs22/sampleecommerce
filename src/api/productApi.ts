import { Product } from '../types';
import { mockProducts } from '../mockData'; // Import mockProducts

// --- API Endpoints and Configuration ---
const DUMMY_API_BASE = 'https://dummyjson.com';
const PAGE_SIZE = 12; // Increased page size slightly for better initial load feel
const FALLBACK_IMAGE = 'https://via.placeholder.com/400?text=Image+Not+Available';

// --- Utility Functions for Data Normalization ---
const normalizeDummyProduct = (data: any): Product => {
    // 1. Image Check
    const validImages = Array.isArray(data.images)
        ? data.images.filter((img: string) => img && (img.startsWith('http') || img.startsWith('https')))
        : [];
    const images = validImages.length > 0 ? validImages : [data.thumbnail || FALLBACK_IMAGE];

    // Ensure minimum 7 images
    const finalImages = images.slice(0, 7);
    while (finalImages.length < 7) {
        finalImages.push(images[finalImages.length % images.length] || FALLBACK_IMAGE); // Add fallback in loop too
    }

    return {
      id: data.id,
      title: data.title || 'Unknown Product',
      description: data.description || 'No description provided.',
      price: Math.round(data.price * 80), // INR approx
      discountPercentage: data.discountPercentage || 0,
      rating: data.rating || 4.0,
      stock: data.stock === 0 ? 0 : data.stock || 10, // Handle stock 0 explicitly
      brand: data.brand || 'Unbranded',
      category: data.category?.replace(/ /g, '-')?.toLowerCase() || 'uncategorized', // Safer category handling
      thumbnail: images[0] || FALLBACK_IMAGE,
      images: finalImages,
      // Use tags or provide default empty array
      features: Array.isArray(data.tags) ? data.tags : [],
      specifications: {
        'Dimensions': `${data.dimensions?.width ?? 'N/A'}x${data.dimensions?.height ?? 'N/A'}x${data.dimensions?.depth ?? 'N/A'} cm`,
        'Weight': data.weight ? `${data.weight} kg` : 'N/A', // Add weight if available
        'SKU': data.sku || 'N/A',
        'Warranty': data.warrantyInformation || 'Standard Warranty',
        'Shipping': data.shippingInformation || 'Standard Shipping',
        'Return Policy': data.returnPolicy || 'Standard Returns', // Add return policy
        'Min Order': data.minimumOrderQuantity || 1, // Add min order qty
      },
      source: 'dummyjson',
    };
};


// --- Main API Functions ---
interface PaginatedProducts {
  products: Product[];
  total: number; // Total available *after* filtering
  limit: number;
  skip: number;
  hasMore: boolean; // Indicates if *more* items matching filter exist beyond current page
}

interface FetchFilters {
  searchTerm?: string;
  category?: string;
  priceRange?: [number, number];
  sortBy?: 'name' | 'price-low' | 'price-high' | 'rating' | 'popular';
}

/**
 * Fetches products, combines with mock data, filters, sorts, and paginates.
 */
export const fetchProducts = async (
  page: number = 0,
  limit: number = PAGE_SIZE,
  filters: FetchFilters = {}
): Promise<PaginatedProducts> => {

  // --- Step 1: Combine Data Sources ---
  // Always start with mock products for consistent base
  let combinedProducts: Product[] = [...mockProducts];
  let apiTotal = 0;
  let apiLimitReached = false;

  // Fetch from DummyJSON - Fetch more initially to allow for filtering
  try {
    const dummySearchQuery = filters.searchTerm ? `search?q=${encodeURIComponent(filters.searchTerm)}&` : '';
    const dummyUrl = `${DUMMY_API_BASE}/products/${dummySearchQuery}limit=100&skip=0`; // Fetch up to 100 relevant items

    const dummyRes = await fetch(dummyUrl);
    const dummyData = await dummyRes.json();

    if (dummyData?.products) {
        const normalizedApiProducts: Product[] = dummyData.products.map(normalizeDummyProduct); // Ensure this maps to Product[]
        const mockIds = new Set(mockProducts.map(p => `${p.source}-${p.id}`));
        // Now 'apiProd' is correctly typed as 'Product'
        normalizedApiProducts.forEach((apiProd: Product) => {
            if (!mockIds.has(`${apiProd.source}-${apiProd.id}`)) {
                combinedProducts.push(apiProd);
            }
        });
        apiTotal = dummyData.total;
        apiLimitReached = dummyData.products.length < 100;
    } else {
        apiLimitReached = true;
    }
  } catch (e) {
    console.error("Error fetching from DummyJSON:", e);
    apiLimitReached = true;
  }

  // --- Step 2: Filter Combined Data ---
  let filteredProducts = combinedProducts;

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  if (filters.category && filters.category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === filters.category);
  }

  if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (minPrice > 0 || maxPrice < 300000) {
        filteredProducts = filteredProducts.filter(p => {
           const discountedPrice = calculateDiscount(p.price, p.discountPercentage);
           return discountedPrice >= minPrice && discountedPrice <= maxPrice;
        });
      }
  }

  // --- Step 3: Sort Filtered Data ---
  switch (filters.sortBy) {
    case 'price-low':
      filteredProducts.sort((a, b) => calculateDiscount(a.price, a.discountPercentage) - calculateDiscount(b.price, b.discountPercentage));
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => calculateDiscount(b.price, b.discountPercentage) - calculateDiscount(a.price, a.discountPercentage));
      break;
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'popular':
    default:
      filteredProducts.sort((a, b) => {
        const scoreA = (a.rating || 0) * 10 + (a.discountPercentage || 0);
        const scoreB = (b.rating || 0) * 10 + (b.discountPercentage || 0);
        return scoreB - scoreA;
      });
      break;
  }

  // --- Step 4: Paginate Sorted & Filtered Data ---
  const totalFiltered = filteredProducts.length;
  const skip = page * limit;
  const paginatedProducts = filteredProducts.slice(skip, skip + limit);
  const hasMore = skip + limit < totalFiltered;

  return {
    products: paginatedProducts,
    total: totalFiltered,
    limit: limit,
    skip: skip,
    hasMore: hasMore,
  };
};

/**
 * Fetches a single product by ID and source.
 */
export const fetchProductById = async (id: number, source: Product['source']): Promise<Product | undefined> => {
    const mockMatch = mockProducts.find(p => p.id === id && p.source === source);
    if (mockMatch) return mockMatch;

    let url = '';
    let normalizeFn = normalizeDummyProduct;

    switch (source) {
        case 'dummyjson':
          url = `${DUMMY_API_BASE}/products/${id}`;
          normalizeFn = normalizeDummyProduct;
          break;
        default:
            console.warn(`Unknown product source for ID ${id}: ${source}`);
            return undefined;
    }
    try {
        const res = await fetch(url);
        if (!res.ok) {
            if (res.status === 404) { console.warn(`Product ${id} not found at ${source} API.`); return undefined; }
            throw new Error(`Failed to fetch product ${id} from ${source}. Status: ${res.status}`);
        }
        const data = await res.json();
        return normalizeFn(data);
    } catch (e) {
        console.error(`Error fetching product ${id} from ${source}:`, e);
    }
    return undefined;
};

/**
 * Gets similar products based on category.
 */
export const getSimilarProducts = async (currentProduct: Product, limit: number = 4): Promise<Product[]> => {
  try {
    const result = await fetchProducts(0, 20, {
        category: currentProduct.category,
        sortBy: 'popular'
    });
    return result.products
        .filter(p => !(p.id === currentProduct.id && p.source === currentProduct.source))
        .slice(0, limit);
  } catch (e) {
      console.error("Error fetching similar products:", e);
      return [];
  }
};

// --- Function to Fetch Search Suggestions ---
interface Suggestion {
  id: string; // Combined source-id
  title: string;
}

// Define a simpler type for the raw API suggestion data
interface RawApiSuggestion {
    id: number;
    title?: string;
    brand?: string;
    category?: string;
    // Add other potential fields if needed, marked as optional
}


/**
 * Fetches search suggestions based on a query term from combined data.
 */
export const fetchSearchSuggestions = async (query: string, suggestionLimit: number = 5): Promise<Suggestion[]> => {
  if (!query.trim() || query.trim().length < 2) {
    return [];
  }
  const lowerCaseQuery = query.toLowerCase();

  let potentialSuggestions: Product[] = [...mockProducts];
  try {
    const dummyUrl = `${DUMMY_API_BASE}/products/search?q=${encodeURIComponent(query)}&limit=15&select=id,title,category,brand`;
    const dummyRes = await fetch(dummyUrl);
    const dummyData = await dummyRes.json();
    if (dummyData?.products) {
        // Explicitly type the mapped product 'p' as RawApiSuggestion
        const normalizedApiProducts: Product[] = dummyData.products.map((p: RawApiSuggestion): Product => ({ // Added return type Product
            id: p.id,
            title: p.title || 'Unknown',
            brand: p.brand || 'Unbranded',
            category: p.category?.replace(/ /g, '-')?.toLowerCase() || 'uncategorized',
            description: '',
            price: 0,
            discountPercentage: 0,
            rating: 0,
            stock: 0,
            thumbnail: '',
            images: [],
            features: [],
            specifications: {},
            source: 'dummyjson' as Product['source']
        }));
        const mockIds = new Set(mockProducts.map(p => `${p.source}-${p.id}`));
        // Now 'apiProd' is correctly typed as 'Product'
        normalizedApiProducts.forEach((apiProd: Product) => {
            if (!mockIds.has(`${apiProd.source}-${apiProd.id}`)) {
                potentialSuggestions.push(apiProd);
            }
        });
    }
  } catch (e) {
    console.error("Error fetching suggestions from DummyJSON:", e);
  }

  const filtered = potentialSuggestions.filter(p =>
    p.title.toLowerCase().includes(lowerCaseQuery) ||
    p.brand.toLowerCase().includes(lowerCaseQuery) ||
    p.category.toLowerCase().includes(lowerCaseQuery)
  );

   const uniqueSuggestionsMap = new Map<string, Product>();
   filtered.forEach(p => {
       const key = `${p.source}-${p.id}`;
       if (!uniqueSuggestionsMap.has(key) || p.source === 'mock') {
           uniqueSuggestionsMap.set(key, p);
       }
   });
   const uniqueSuggestions = Array.from(uniqueSuggestionsMap.values());

   uniqueSuggestions.sort((a, b) => {
       const aTitleMatch = a.title.toLowerCase().startsWith(lowerCaseQuery);
       const bTitleMatch = b.title.toLowerCase().startsWith(lowerCaseQuery);
       if (aTitleMatch && !bTitleMatch) return -1;
       if (!aTitleMatch && bTitleMatch) return 1;
       const aBrandMatch = a.brand.toLowerCase().startsWith(lowerCaseQuery);
       const bBrandMatch = b.brand.toLowerCase().startsWith(lowerCaseQuery);
       if (aBrandMatch && !bBrandMatch) return -1;
       if (!aBrandMatch && bBrandMatch) return 1;
       return a.title.localeCompare(b.title);
   });

  return uniqueSuggestions
    .slice(0, suggestionLimit)
    .map(p => ({
      id: `${p.source}-${p.id}`,
      title: p.title,
    }));
};

// --- Utility Functions ---
export const calculateDiscount = (price: number, discountPercentage: number): number => {
  // Ensure discountPercentage is a number and within a reasonable range (e.g., 0-100)
  const validDiscount = typeof discountPercentage === 'number' && discountPercentage >= 0 && discountPercentage <= 100
                        ? discountPercentage
                        : 0;
  // Ensure price is a positive number
  const validPrice = typeof price === 'number' && price > 0 ? price : 0;
  return Math.round(validPrice - (validPrice * validDiscount) / 100);
};