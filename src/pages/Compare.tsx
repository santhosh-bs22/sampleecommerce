// src/pages/Compare.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useComparisonStore } from '../store/useComparisonStore';
import { fetchProductById } from '../api/productApi';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
// Removed Table component imports
import { formatCurrency, calculateDiscount } from '../utils/currency'; // <-- Import calculateDiscount
import { Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils'; // Import cn if needed for table styling

const Compare: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { products: comparisonProducts, removeProduct, isInComparison } = useComparisonStore();
    const { toast } = useToast();
    const [productsDetails, setProductsDetails] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            setProductsDetails([]);

            const idsParam = searchParams.get('ids');
            if (!idsParam) {
                setError("No products selected for comparison.");
                setIsLoading(false);
                return;
            }

            const combinedIds = idsParam.split(',');
            if (combinedIds.length < 2) {
                setError("Please select at least two products to compare.");
                setIsLoading(false);
                return;
            }

            try {
                const fetchedProductsPromises = combinedIds.map(async (combinedId) => {
                    const [source, productIdStr] = combinedId.split('-');
                    const pid = parseInt(productIdStr || '0', 10);
                     // Check if product is still selected in the store before fetching
                    if (pid > 0 && source && isInComparison(pid)) {
                       const product = await fetchProductById(pid, source as Product['source']);
                       // Double check if product was found AND is still in comparison store after async fetch
                       if (product && isInComparison(product.id)) {
                         return product;
                       }
                    }
                    return null;
                });

                const results = await Promise.all(fetchedProductsPromises);
                const validProducts = results.filter(p => p !== null) as Product[];

                // Update the state only with products that were successfully fetched and are still in comparison
                setProductsDetails(validProducts);

                if (validProducts.length < 2) {
                   setError("Could not load details for enough products to compare, or some were removed.");
                }


            } catch (err) {
                console.error("Error fetching comparison products:", err);
                setError("Failed to load product details for comparison.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    // Re-run effect if search params change OR the number of comparison items changes
    }, [searchParams, comparisonProducts.length, isInComparison]);


    const handleRemove = (productId: number, title: string) => {
        removeProduct(productId);
        // Update URL immediately after removing from store
        const updatedIds = comparisonProducts // Use store data which is synchronous
            .filter(p => p.id !== productId)
            .map(p => `${p.source}-${p.id}`)
            .join(',');

        // If less than 2 products remain, navigate home or show message?
        if (updatedIds.split(',').filter(Boolean).length < 2) {
             toast({ title: "Removed from comparison", description: `${title} removed. Not enough items left to compare.` });
             navigate('/'); // Navigate home if less than 2 left
        } else {
            navigate(`/compare?ids=${updatedIds}`, { replace: true });
            toast({ title: "Removed from comparison", description: `${title} removed.` });
        }
        // No need to manually filter productsDetails state here, the useEffect will handle it
    };


    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Loading comparison...</p>
            </div>
        );
    }

     if (error || productsDetails.length < 2) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Comparison Error</h2>
                <p className="text-muted-foreground mb-8">{error || "Not enough products to compare."}</p>
                <Link to="/">
                    <Button>Back to Shopping</Button>
                </Link>
            </div>
        );
    }

    // --- Prepare data for table ---
    const allSpecKeys = Array.from(new Set(productsDetails.flatMap(p => Object.keys(p.specifications))));

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Compare Products ({productsDetails.length})</h1>

            <div className="overflow-x-auto border rounded-lg"> {/* Added border and rounded */}
                {/* Use standard table elements with Tailwind classes */}
                <table className="min-w-[800px] w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="sticky left-0 bg-muted/50 px-4 py-3 text-left text-sm font-semibold text-foreground w-[150px] z-10">Feature</th> {/* Sticky first column */}
                            {productsDetails.map(product => (
                                <th key={`${product.source}-${product.id}`} className="px-4 py-3 text-sm font-semibold text-foreground">
                                    <div className="flex flex-col items-center text-center">
                                       <Link to={`/product/${product.source}-${product.id}`}>
                                            <img src={product.thumbnail} alt={product.title} className="h-24 w-24 object-contain mb-2 rounded border" /> {/* Added border */}
                                            <p className="font-semibold text-sm hover:text-primary line-clamp-2">{product.title}</p>
                                        </Link>
                                         <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 text-destructive hover:text-destructive text-xs" // Made remove button smaller
                                            onClick={() => handleRemove(product.id, product.title)}
                                         >
                                             <Trash2 className="h-3 w-3 mr-1" /> Remove
                                         </Button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                        {/* --- Basic Info Rows --- */}
                        <tr>
                            <td className="sticky left-0 bg-background px-4 py-3 text-sm font-semibold text-foreground z-10">Price</td> {/* Sticky first column */}
                            {productsDetails.map(product => (
                                <td key={`${product.source}-${product.id}-price`} className="px-4 py-3 text-sm text-center align-top"> {/* Align top */}
                                    <span className="text-lg font-bold text-green-600 block"> {/* Block display */}
                                      {formatCurrency(calculateDiscount(product.price, product.discountPercentage))}
                                    </span>
                                    {product.discountPercentage > 0 && (
                                      <p className="text-xs text-muted-foreground line-through mt-1">{formatCurrency(product.price)}</p>
                                    )}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="sticky left-0 bg-background px-4 py-3 text-sm font-semibold text-foreground z-10">Rating</td> {/* Sticky first column */}
                            {productsDetails.map(product => (
                                <td key={`${product.source}-${product.id}-rating`} className="px-4 py-3 text-sm text-center align-top">{product.rating.toFixed(1)} ★</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="sticky left-0 bg-background px-4 py-3 text-sm font-semibold text-foreground z-10">Brand</td> {/* Sticky first column */}
                            {productsDetails.map(product => (
                                <td key={`${product.source}-${product.id}-brand`} className="px-4 py-3 text-sm text-center align-top">{product.brand}</td>
                            ))}
                        </tr>
                         <tr>
                            <td className="sticky left-0 bg-background px-4 py-3 text-sm font-semibold text-foreground z-10">Stock</td> {/* Sticky first column */}
                            {productsDetails.map(product => (
                                <td key={`${product.source}-${product.id}-stock`} className={`px-4 py-3 text-sm text-center align-top ${product.stock === 0 ? 'text-destructive' : ''}`}>
                                    {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                                </td>
                            ))}
                        </tr>

                       {/* --- Dynamic Specification Rows --- */}
                        {allSpecKeys.map(key => (
                            <tr key={key}>
                                <td className="sticky left-0 bg-background px-4 py-3 text-sm font-semibold text-foreground z-10">{key}</td> {/* Sticky first column */}
                                {productsDetails.map(product => (
                                    <td key={`${product.source}-${product.id}-spec-${key}`} className="px-4 py-3 text-sm text-center align-top">
                                        {product.specifications[key] !== undefined ? String(product.specifications[key]) : '-'} {/* Ensure value is string */}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* --- Add to Cart Row --- */}
                        <tr>
                            <td className="sticky left-0 bg-background px-4 py-3 text-sm font-semibold text-foreground z-10">Actions</td> {/* Sticky first column */}
                            {productsDetails.map(product => (
                                <td key={`${product.source}-${product.id}-actions`} className="px-4 py-3 text-center align-top">
                                     <Button
                                         size="sm"
                                         disabled={product.stock === 0}
                                         // onClick={() => handleAddToCart(product)} // Add this handler if needed
                                     >
                                         {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                     </Button>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
             <div className="mt-8 text-center">
                 <Link to="/">
                    <Button variant="outline">Continue Shopping</Button>
                 </Link>
            </div>
        </div>
    );
};

export default Compare;