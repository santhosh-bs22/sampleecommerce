// src/pages/Compare.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useComparisonStore } from '../store/useComparisonStore';
import { fetchProductById } from '../api/productApi';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { Trash2, Star, Award } from 'lucide-react'; // Removed Check
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/badge';

const Compare: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // Use comparisonProducts from store only for remove logic, not for fetching directly
    const { removeProduct, products: comparisonStoreProducts } = useComparisonStore();
    const { toast } = useToast();
    const [productsDetails, setProductsDetails] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect to fetch product details based *only* on URL parameters
    useEffect(() => {
        const fetchDetails = async () => {
             setIsLoading(true);
             setError(null);
             setProductsDetails([]); // Clear previous details

             const idsParam = searchParams.get('ids');
             if (!idsParam) {
                 // If no IDs, maybe redirect home or show message? Let's show message.
                 // setError("No products selected for comparison.");
                 setIsLoading(false);
                 navigate('/'); // Navigate home if no IDs
                 return;
             }

             const combinedIds = idsParam.split(',').filter(Boolean); // Get IDs from URL
             if (combinedIds.length < 2) {
                 // Maybe show a toast and redirect?
                 toast({ title: "Need More Products", description: "Please add at least two products to compare.", variant: "destructive"});
                 setIsLoading(false);
                 navigate('/'); // Navigate home if less than 2
                 return;
             }

             try {
                 // Fetch details for each ID in the URL
                const fetchedProductsPromises = combinedIds.map(async (combinedId) => {
                    const [source, productIdStr] = combinedId.split('-');
                    const pid = parseInt(productIdStr || '0', 10);
                    if (pid > 0 && source) {
                       const product = await fetchProductById(pid, source as Product['source']);
                       return product;
                    }
                    return undefined; // Return undefined if ID format is invalid
                });

                 const results = await Promise.all(fetchedProductsPromises);
                 const validProducts = results.filter(p => p !== undefined) as Product[]; // Filter out failed fetches

                 // Order the results according to the URL parameter order
                const orderedValidProducts = combinedIds
                    .map(id => validProducts.find(p => `${p.source}-${p.id}` === id))
                    .filter(p => p !== undefined) as Product[];

                 setProductsDetails(orderedValidProducts); // Set the ordered, valid products

                 if (orderedValidProducts.length !== combinedIds.length) {
                     // Optionally show a warning if some products couldn't be loaded
                     console.warn("Could not load details for all requested comparison products.");
                     toast({ title: "Warning", description:"Some product details could not be loaded.", variant:"default"});
                 }
                 if (orderedValidProducts.length < 2) {
                    setError("Not enough products could be loaded for comparison.");
                 }

             } catch (err) {
                 console.error("Error fetching comparison products:", err);
                 setError("Failed to load product details for comparison.");
             } finally {
                 setIsLoading(false);
             }
         };

        fetchDetails();
    // Run ONLY when searchParams changes
    }, [searchParams, navigate, toast]); // Added navigate and toast


    const handleRemove = (productId: number, source: string, title: string) => {
        removeProduct(productId); // Remove from Zustand store

        // Update URL immediately by filtering the current searchParams
        const currentIds = (searchParams.get('ids') || '').split(',').filter(Boolean);
        const updatedIds = currentIds.filter(id => id !== `${source}-${productId}`).join(',');

        if (updatedIds.split(',').filter(Boolean).length < 1) { // Navigate home if 0 or 1 left
             toast({ title: "Removed from comparison", description: `${title} removed. Not enough items left to compare.` });
             navigate('/');
        } else {
            navigate(`/compare?ids=${updatedIds}`, { replace: true }); // Update URL, useEffect will refetch
            toast({ title: "Removed from comparison", description: `${title} removed.` });
        }
    };

    // --- Memoized values for highlighting and badges ---
    const comparisonData = useMemo(() => {
        if (productsDetails.length < 2) return { specDifferences: {}, bestPriceId: null, highestRatedId: null };

        const specDifferences: { [key: string]: boolean } = {};
        let bestPrice = Infinity;
        let bestPriceId: string | null = null;
        let highestRating = -1;
        let highestRatedId: string | null = null;

        const allKeys = Array.from(new Set(productsDetails.flatMap(p => Object.keys(p.specifications))));

        allKeys.forEach(key => {
            const values = productsDetails.map(p => String(p.specifications[key] ?? '-'));
            specDifferences[key] = new Set(values).size > 1; // True if values differ
        });

        productsDetails.forEach(p => {
             const uniqueId = `${p.source}-${p.id}`;
            const discounted = calculateDiscount(p.price, p.discountPercentage);
            if (discounted < bestPrice) {
                bestPrice = discounted;
                bestPriceId = uniqueId;
            }
            if (p.rating > highestRating) {
                highestRating = p.rating;
                highestRatedId = uniqueId;
            } else if (p.rating === highestRating) {
                // If ratings are equal, optionally consider price or leave as is
                // For simplicity, we can just keep the first one found or make highestRatedId an array
            }
        });

        // Ensure only one product gets "Highest Rated" if ratings are equal (optional refinement)
        if (productsDetails.filter(p => p.rating === highestRating).length > 1) {
            // Logic to pick one if ratings tie, e.g., the one with better price or just the first one found
            // For now, let's keep it simple: multiple can show the badge if they tie.
        }

        return { specDifferences, bestPriceId, highestRatedId };
    }, [productsDetails]);

    const { specDifferences, bestPriceId, highestRatedId } = comparisonData;
    // --- End Memoized values ---


    if (isLoading) { /* ... loading state ... */
        return ( <div className="container mx-auto px-4 py-16 text-center"><LoadingSpinner size="lg" /><p className="mt-4 text-muted-foreground">Loading comparison...</p></div> );
    }

     if (error) { /* ... error state ... */
        return ( <div className="container mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold mb-4">Comparison Error</h2><p className="text-muted-foreground mb-8">{error}</p><Link to="/"><Button>Back to Shopping</Button></Link></div> );
     }

     // Added check here as well, in case useEffect redirects but component tries to render
     if (productsDetails.length < 2) {
         return ( <div className="container mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold mb-4">Not Enough Products</h2><p className="text-muted-foreground mb-8">Add at least two products to compare.</p><Link to="/"><Button>Back to Shopping</Button></Link></div> );
     }

    const allSpecKeys = Array.from(new Set(productsDetails.flatMap(p => Object.keys(p.specifications)))).filter(key => key !== undefined && key !== null && key !== '');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Compare Products ({productsDetails.length})</h1>

            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="min-w-[800px] w-full divide-y divide-border table-fixed"> {/* Use table-fixed */}
                    <colgroup>
                        <col className="w-[150px]" /> {/* Fixed width for feature column */}
                        {/* Dynamic columns - these will share remaining space */}
                        {productsDetails.map((_, index) => <col key={index} className="min-w-[200px]" />)}
                    </colgroup>
                    <thead className="bg-muted/30">
                        <tr>
                            <th className="sticky left-0 bg-muted/30 px-4 py-3 text-left text-sm font-semibold text-foreground z-10 whitespace-nowrap">Feature</th>
                            {productsDetails.map(product => {
                                const uniqueId = `${product.source}-${product.id}`;
                                return (
                                    <th key={uniqueId} className="px-4 py-3 text-sm font-semibold text-foreground">
                                        <div className="flex flex-col items-center text-center relative h-full"> {/* h-full for alignment */}
                                            <div className="absolute top-1 right-1 flex flex-col items-end gap-1 z-10">
                                                {uniqueId === bestPriceId && ( <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"> <Award className="h-3 w-3 mr-1" /> Best Value </Badge> )}
                                                {uniqueId === highestRatedId && ( <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"> <Star className="h-3 w-3 mr-1" /> Highest Rated </Badge> )}
                                             </div>
                                            <Link to={`/product/${product.source}-${product.id}`} className="block mb-auto pt-8"> {/* pt-8 to push image down */}
                                                <img src={product.thumbnail} alt={product.title} className="h-20 w-20 object-contain mb-2 rounded border hover:opacity-80 transition-opacity mx-auto" />
                                                <p className="font-semibold text-sm hover:text-primary line-clamp-2">{product.title}</p>
                                            </Link>
                                            <Button variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive text-xs h-auto py-1 px-2" onClick={() => handleRemove(product.id, product.source, product.title)}>
                                                <Trash2 className="h-3 w-3 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                        {/* --- Basic Info Rows --- */}
                        <tr className="hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-semibold text-foreground z-10">Price</td>
                            {productsDetails.map(product => {
                                const discounted = calculateDiscount(product.price, product.discountPercentage);
                                const isBest = `${product.source}-${product.id}` === bestPriceId;
                                return ( <td key={`${product.source}-${product.id}-price`} className={cn( "px-4 py-3 text-sm text-center align-top bg-inherit transition-colors", isBest && "bg-green-50 dark:bg-green-900/30 font-bold" )}> <span className={cn("text-lg block", isBest ? "text-green-700 dark:text-green-300" : "text-green-600")}> {formatCurrency(discounted)} </span> {product.discountPercentage > 0 && ( <p className="text-xs text-muted-foreground line-through mt-1">{formatCurrency(product.price)}</p> )} </td> )})}
                        </tr>
                        <tr className="hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-semibold text-foreground z-10">Rating</td>
                             {productsDetails.map(product => {
                                 const isHighest = `${product.source}-${product.id}` === highestRatedId;
                                 return ( <td key={`${product.source}-${product.id}-rating`} className={cn( "px-4 py-3 text-sm text-center align-top bg-inherit transition-colors", isHighest && "bg-yellow-50 dark:bg-yellow-900/30 font-bold text-yellow-700 dark:text-yellow-300" )}> {product.rating.toFixed(1)} <Star className="h-3 w-3 inline-block mb-0.5 fill-current" /> {/* Fill current color */} </td> );
                            })}
                        </tr>
                        <tr className="hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-semibold text-foreground z-10">Brand</td>
                            {productsDetails.map(product => ( <td key={`${product.source}-${product.id}-brand`} className="px-4 py-3 text-sm text-center align-top bg-inherit">{product.brand}</td> ))}
                        </tr>
                         <tr className="hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-semibold text-foreground z-10">Stock</td>
                            {productsDetails.map(product => ( <td key={`${product.source}-${product.id}-stock`} className={cn("px-4 py-3 text-sm text-center align-top bg-inherit", product.stock === 0 ? 'text-destructive font-semibold' : '')}> {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'} </td> ))}
                        </tr>

                       {/* --- Dynamic Specification Rows --- */}
                        {allSpecKeys.map(key => (
                            <tr key={key} className="hover:bg-muted/50 transition-colors group"> {/* Added group for potential future hover effects */}
                                <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-semibold text-foreground z-10 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                {productsDetails.map(product => {
                                    const value = product.specifications[key];
                                    const hasDifference = specDifferences[key];
                                    return ( <td key={`${product.source}-${product.id}-spec-${key}`} className={cn( "px-4 py-3 text-sm text-center align-top bg-inherit transition-colors", hasDifference && "bg-primary/5 dark:bg-primary/15 font-medium" // Highlight differing specs more subtly
                                        )}> {value !== undefined ? String(value) : '-'} </td> )})}
                            </tr>
                        ))}

                        {/* --- Add to Cart Row --- */}
                        <tr className="hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-semibold text-foreground z-10">Actions</td>
                            {productsDetails.map(product => ( <td key={`${product.source}-${product.id}-actions`} className="px-4 py-3 text-center align-top bg-inherit"> <Button size="sm" disabled={product.stock === 0} /* onClick={() => handleAddToCart(product)} */ > {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'} </Button> </td> ))}
                        </tr>
                    </tbody>
                </table>
            </div>
             <div className="mt-8 text-center">
                 <Link to="/"> <Button variant="outline">Continue Shopping</Button> </Link>
            </div>
        </div>
    );
};

export default Compare;