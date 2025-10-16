import { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: 1,
    title: "iPhone 14 Pro Max",
    description: "Latest iPhone with Dynamic Island, Always-On display, and the most advanced Pro camera system.",
    price: 139999,
    discountPercentage: 12.5,
    rating: 4.8,
    stock: 25,
    brand: "Apple",
    category: "smartphones",
    thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop"
    ],
    tags: ["new", "premium", "5g"],
    features: ["Dynamic Island", "Always-On display", "48MP Main camera"]
  },
  {
    id: 2,
    title: "Samsung Galaxy S23 Ultra",
    description: "Powerful Android smartphone with S Pen, 200MP camera, and Snapdragon 8 Gen 2 processor.",
    price: 124999,
    discountPercentage: 15.0,
    rating: 4.7,
    stock: 45,
    brand: "Samsung",
    category: "smartphones",
    thumbnail: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1610945415294-d4b53349e0a0?w=400&h=400&fit=crop"
    ],
    tags: ["s-pen", "200mp-camera", "android"],
    features: ["S Pen included", "200MP camera", "Snapdragon 8 Gen 2"]
  },
  {
    id: 3,
    title: "MacBook Air M2",
    description: "Lightweight and powerful laptop with M2 chip, Liquid Retina display, and all-day battery life.",
    price: 114999,
    discountPercentage: 8.0,
    rating: 4.9,
    stock: 18,
    brand: "Apple",
    category: "laptops",
    thumbnail: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"
    ],
    tags: ["m2-chip", "lightweight", "premium"],
    features: ["M2 chip", "Liquid Retina display", "18-hour battery"]
  },
  {
    id: 4,
    title: "Sony WH-1000XM5",
    description: "Industry-leading noise cancellation wireless headphones with 30-hour battery life.",
    price: 29999,
    discountPercentage: 20.0,
    rating: 4.6,
    stock: 60,
    brand: "Sony",
    category: "audio",
    thumbnail: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
    ],
    tags: ["noise-cancelling", "wireless", "premium"],
    features: ["Industry-leading ANC", "30-hour battery", "Quick charge"]
  },
  {
    id: 5,
    title: "Nike Air Jordan 1 Retro",
    description: "Classic basketball sneakers with premium leather construction and iconic design.",
    price: 15999,
    discountPercentage: 25.0,
    rating: 4.5,
    stock: 3, // Low stock for testing
    brand: "Nike",
    category: "footwear",
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop"
    ],
    tags: ["basketball", "classic", "limited"],
    features: ["Premium leather", "Air cushioning", "Iconic design"]
  },
  {
    id: 6,
    title: "Canon EOS R5 Mirrorless",
    description: "Professional full-frame mirrorless camera with 45MP sensor and 8K video recording.",
    price: 389999,
    discountPercentage: 5.0,
    rating: 4.9,
    stock: 8,
    brand: "Canon",
    category: "cameras",
    thumbnail: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop"
    ],
    tags: ["professional", "mirrorless", "8k-video"],
    features: ["45MP full-frame", "8K video", "IBIS"]
  },
  {
    id: 7,
    title: "Apple Watch Series 9",
    description: "Advanced smartwatch with temperature sensing, crash detection, and always-on display.",
    price: 45999,
    discountPercentage: 10.0,
    rating: 4.7,
    stock: 35,
    brand: "Apple",
    category: "smartphones", // Keeping in smartphones for demo
    thumbnail: "https://images.unsplash.com/photo-1579586337278-3f436c8e939d?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3f436c8e939d?w=400&h=400&fit=crop"
    ],
    tags: ["smartwatch", "fitness", "premium"],
    features: ["Temperature sensing", "Crash detection", "Always-on display"]
  },
  {
    id: 8,
    title: "Samsung 4K Smart TV",
    description: "55-inch 4K UHD Smart TV with Quantum Dot technology and built-in voice assistants.",
    price: 64999,
    discountPercentage: 18.0,
    rating: 4.4,
    stock: 0, // Out of stock for testing
    brand: "Samsung",
    category: "home-decor",
    thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop"
    ],
    tags: ["4k", "smart-tv", "quantum-dot"],
    features: ["Quantum Dot", "Voice assistants", "Smart Hub"]
  }
];

export const categories = [
  "smartphones",
  "laptops",
  "audio",
  "footwear",
  "cameras",
  "home-decor"
];