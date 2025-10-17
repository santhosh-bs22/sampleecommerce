import { Product } from '../types';
import { categories, mockProducts } from '../mockData'; // Import mockProducts

// --- API Endpoints and Configuration ---

// DummyJSON (supports limit and skip)
const DUMMY_API_BASE = 'https://dummyjson.com';
// Platzi Fake API (supports limit and offset)
const PLATZI_API_BASE = 'https://api.escuelajs.co/api/v1';
const PAGE_SIZE = 6; // Load 6 items per page (3 from each API for variety)
const FALLBACK_IMAGE = 'https://via.placeholder.com/400?text=Image+Not+Available';

// --- Utility Functions for Data Normalization ---

// Maps DummyJSON response to our Product interface
const normalizeDummyProduct = (data: any): Product => {
    // 1. Image Check: Filter out invalid/non-URL images.
    const validImages = Array.isArray(data.images)
        ? data.images.filter((img: string) => img && (img.startsWith('http') || img.startsWith('https')))
        : [];

    // Use thumbnail or fallback if validImages is empty
    const images = validImages.length > 0
        ? validImages
        : [data.thumbnail || FALLBACK_IMAGE];

    // Ensure minimum 7 images by duplicating/filling if needed
    const finalImages = images.slice(0, 7);
    while (finalImages.length < 7) {
        finalImages.push(images[finalImages.length % images.length]);
    }

    return {
      id: data.id,
      title: data.title || 'Unknown Product', // Safety check for title
      description: data.description || 'No description provided.',
      price: Math.round(data.price * 80), // Convert USD to INR approximation
      discountPercentage: data.discountPercentage || 0,
      rating: data.rating || 4.0,
      stock: data.stock || 10,
      brand: data.brand || 'Unbranded',
      category: data.category.replace(/ /g, '-').toLowerCase(),
      thumbnail: images[0] || FALLBACK_IMAGE, // Use the first validated image as thumbnail
      images: finalImages,
      features: data.tags || [],
      specifications: {
        'Weight': `${data.dimensions?.width || 'N/A'}x${data.dimensions?.height || 'N/A'}x${data.dimensions?.depth || 'N/A'} cm`,
        'SKU': data.sku || 'N/A',
        'Warranty': data.warrantyInformation || '1 Year',
        'Shipping': data.shippingInformation || '3-5 Days',
      },
      source: 'dummyjson',
    };
};

// Maps Platzi response to our Product interface
const normalizePlatziProduct = (data: any): Product => {
    // 1. Image Check: Filter out any image URLs that are empty or don't start with http
    const validImages = Array.isArray(data.images) ? data.images.filter((img: string) => img && (img.startsWith('http') || img.startsWith('https'))) : [];

    const images = validImages.length > 0
        ? validImages
        : [data.category?.image || FALLBACK_IMAGE]; // Fallback to category image or placeholder

    // Ensure minimum 7 images
    const finalImages = images.slice(0, 7);
    while (finalImages.length < 7) {
        finalImages.push(images[finalImages.length % images.length]);
    }

    return {
      id: data.id,
      title: data.title || 'Unknown Product', // Safety check for title
      description: data.description || 'No description provided.',
      price: Math.round(data.price * 80),
      discountPercentage: Math.floor(Math.random() * 20),
      rating: parseFloat(((Math.random() * 0.5) + 4.0).toFixed(1)),
      stock: Math.floor(Math.random() * 50) + 1,
      brand: data.category?.name || 'Generic',
      category: data.category?.name?.replace(/ /g, '-').toLowerCase() || 'miscellaneous',
      thumbnail: images[0] || FALLBACK_IMAGE, // Use the first validated image as thumbnail
      images: finalImages,
      features: [],
      specifications: {
        'Category': data.category?.name,
        'Creation Date': new Date(data.creationAt).toLocaleDateString(),
        'API Source': 'Platzi Fake API',
      },
      source: 'platzi',
    };
};

// --- Main API Functions ---

interface PaginatedProducts {
  products: Product[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

interface FetchFilters {
  searchTerm?: string;
  category?: string;
  priceRange?: [number, number];
  sortBy?: 'name' | 'price-low' | 'price-high' | 'rating' | 'popular';
}

/**
 * Fetches products from two external APIs, combines, normalizes, and returns a paginated result.
 */
export const fetchProducts = async (
  page: number = 0,
  limit: number = PAGE_SIZE,
  filters: FetchFilters = {}
): Promise<PaginatedProducts> => {
  // FIX: Initialize with the mockProducts array
  const allProducts: Product[] = page === 0 ? [...mockProducts] : [];
  const dummyApiLimit = Math.ceil(limit / 2);
  const platziApiLimit = limit - dummyApiLimit;
  let totalProductsEstimate = 100;

  // 1. Fetch from DummyJSON
  try {
    const dummyOffset = page * dummyApiLimit;
    const dummySearchQuery = filters.searchTerm ? `search?q=${filters.searchTerm}&` : '';
    const dummyUrl = `${DUMMY_API_BASE}/products/${dummySearchQuery}limit=${dummyApiLimit}&skip=${dummyOffset}`;
    const dummyRes = await fetch(dummyUrl);
    const dummyData = await dummyRes.json();

    if (dummyData?.products) {
        dummyData.products.forEach((p: any) => allProducts.push(normalizeDummyProduct(p)));
        totalProductsEstimate = dummyData.total;
    }
  } catch (e) {
    console.error("Error fetching from DummyJSON:", e);
  }

  // 2. Fetch from Platzi Fake API
  try {
    const platziOffset = page * platziApiLimit;
    // Note: Platzi API does not support search/filter by title in a simple query,
    // so we rely on client-side filtering below for Platzi search results.
    const platziUrl = `${PLATZI_API_BASE}/products?limit=${platziApiLimit}&offset=${platziOffset}`;
    const platziRes = await fetch(platziUrl);
    const platziData = await platziRes.json();

    if (Array.isArray(platziData)) {
      platziData.forEach((p: any) => allProducts.push(normalizePlatziProduct(p)));
    }
  } catch (e) {
    console.error("Error fetching from Platzi API:", e);
  }

  // --- Client-side Filtering, Searching & Sorting on Combined Results ---
  let finalProducts = allProducts;

  // Client-side filtering for Platzi search results and combined results
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    finalProducts = finalProducts.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term)
    );
  }

  // Filtering by Category & Price
  if (filters.category && filters.category !== 'all') {
    finalProducts = finalProducts.filter(p => p.category === filters.category);
  }

  if (filters.priceRange) {
      const [minPrice, maxPrice] = [filters.priceRange[0], filters.priceRange[1]];
      finalProducts = finalProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price-low':
      finalProducts = finalProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      finalProducts = finalProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      finalProducts = finalProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'name':
      finalProducts = finalProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'popular':
    default:
      finalProducts = finalProducts.sort((a, b) => {
        const scoreA = (a.rating || 0) * 20 + (a.discountPercentage || 0);
        const scoreB = (b.rating || 0) * 20 + (b.discountPercentage || 0);
        return scoreB - scoreA;
      });
      break;
  }

  const hasMore = allProducts.length > 0;

  return {
    products: finalProducts,
    total: totalProductsEstimate,
    limit: limit,
    skip: page * limit,
    hasMore: hasMore,
  };
};

/**
 * Fetches a single product by ID and source.
 */
export const fetchProductById = async (id: number, source: Product['source']): Promise<Product | undefined> => {
    if (source === 'mock') {
        return mockProducts.find(p => p.id === id);
    }

  let url = '';
  switch (source) {
    case 'dummyjson':
      url = `${DUMMY_API_BASE}/products/${id}`;
      break;
    case 'platzi':
      url = `${PLATZI_API_BASE}/products/${id}`;
      break;
    default:
        return undefined;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok) {
        return source === 'dummyjson'
            ? normalizeDummyProduct(data)
            : normalizePlatziProduct(data);
    }
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
    const result = await fetchProducts(0, limit + 5, {
        category: currentProduct.category,
        sortBy: 'popular'
    });

    return result.products
        .filter(p => p.id !== currentProduct.id || p.source !== currentProduct.source)
        .slice(0, limit);
  } catch (e) {
      console.error("Error fetching similar products:", e);
      return [];
  }
};