export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateDiscount = (price: number, discountPercentage: number): number => {
  return Math.round(price - (price * discountPercentage) / 100);
};

export const formatDiscountPrice = (price: number, discountPercentage: number): string => {
  const discountedPrice = calculateDiscount(price, discountPercentage);
  return formatCurrency(discountedPrice);
};

export const calculateSavings = (price: number, discountPercentage: number): number => {
  return Math.round((price * discountPercentage) / 100);
};

export const formatSavings = (price: number, discountPercentage: number): string => {
  const savings = calculateSavings(price, discountPercentage);
  return formatCurrency(savings);
};