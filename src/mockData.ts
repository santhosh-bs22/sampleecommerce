import { Product } from './types';

// The mockProducts array is now empty. Data is fetched from external APIs.
export const mockProducts: Product[] = [];

// Utility function remains for legacy or future mock use
export const createMockImages = (base: string) => [
  base,
  base.replace('w=400&h=400', 'w=450&h=450'),
  base.replace('fit=crop', 'fit=facearea'),
  base.replace('w=400&h=400', 'w=350&h=400'),
  base.replace('crop', 'entropy'),
  base.replace('w=400&h=400', 'w=500&h=500'),
  base,
  base.replace('w=400', 'w=600'), 
];

// Categories list used for filtering UI
export const categories = [
  "smartphones",
  "laptops",
  "audio",
  "footwear",
  "cameras",
  "home-decor",
  "miscellaneous" // Added to cover generic API categories
];