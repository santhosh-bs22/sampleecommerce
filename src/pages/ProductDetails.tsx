// src/pages/ProductDetails.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Heart, ShoppingCart, Star, Truck, Shield, ArrowLeft, Minus, Plus, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useUserStore } from '../store/useUserStore';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { useToast } from '../hooks/use-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types';
import { fetchProductById, getSimilarProducts } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion'; // <-- Import AnimatePresence

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { user, isAuthenticated } = useUserStore(); // <-- Destructure user here
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [userRating, setUserRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [submittedReviews, setSubmittedReviews] = useState<any[]>([]);

  // State for image zoom
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const fetchProduct = useCallback(async (combinedId: string) => {
    setIsLoading(true);
    // Reset state
    setProduct(null);
    setSimilarProducts([]);
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab('description');
    setSelectedSize(undefined);
    setUserRating(0);
    setReviewText('');
    setSubmittedReviews([]);
    setIsZooming(false); // Reset zoom state

    // Basic validation for combined ID format
    if (!combinedId || !combinedId.includes('-')) {
        console.error("Invalid product ID format:", combinedId);
        setIsLoading(false);
        // Maybe navigate to a not found page or show an error
        return;
    }


    const [source, productIdStr] = combinedId.split('-');
    const pid = parseInt(productIdStr || '0', 10);

    if (pid === 0 || !source) {
      console.error("Invalid product ID or source:", pid, source);
      setIsLoading(false);
      return;
    }

    try {
        const fetchedProduct = await fetchProductById(pid, source as Product['source']);

        if (fetchedProduct) {
          setProduct(fetchedProduct);
          if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
            setSelectedSize(fetchedProduct.sizes[0]);
          }
          const similar = await getSimilarProducts(fetchedProduct, 4);
          setSimilarProducts(similar);
        } else {
             // Handle product not found from API
             console.warn(`Product not found: ${combinedId}`);
             // Optionally navigate to a 404 page or show a specific message
        }
    } catch (error) {
         console.error("Error fetching product details:", error);
         // Optionally show a generic error message to the user
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    } else {
         // Handle case where ID is missing in URL
         setIsLoading(false);
         // Optionally navigate or show error
    }
  }, [id, fetchProduct]);

   useEffect(() => {
    if (product) {
        setQuantity(1); // Reset quantity when product changes
    }
   }, [product?.id, product?.source]); // Depend on specific product identifiers


  const handleRating = (rating: number) => {
    setUserRating(rating);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { // Check if user is logged in
        toast({ title: "Login Required", description: "Please log in to submit a review.", variant: "destructive" });
        navigate('/login', { state: { from: location } });
        return;
    }
    if (!userRating || !reviewText.trim()) {
      toast({
        title: "Incomplete Review",
        description: "Please select a rating and write your review.",
        variant: "destructive",
      });
      return;
    }

    const newReview = {
      id: Date.now(),
      // Use user details from the store
      author: user ? `${user.firstName} ${user.lastName}` : "Anonymous User", // <-- Use destructured user
      rating: userRating,
      text: reviewText,
      date: new Date().toLocaleDateString('en-IN'), // Or format as needed
    };

    // Prepend new review
    setSubmittedReviews(prev => [newReview, ...prev]);
    setUserRating(0); // Reset form
    setReviewText('');

    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback.",
    });
    // In real app: Send the review to the backend API here
  };

  // Image Navigation Handlers
  const handlePrevImage = () => {
    if (product) {
      setSelectedImage((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product) {
      setSelectedImage((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // --- Image Zoom Handlers ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      // Clamp values between 0 and 100
      setMousePosition({
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
      });
    }
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);
  // --- End Image Zoom Handlers ---


  // --- Loading and Not Found States ---
  if (isLoading) {
     return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or could not be fetched.</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  // --- Derived State ---
  const isWishlisted = isInWishlist(product.id);
  const discountedPrice = calculateDiscount(product.price, product.discountPercentage);

  // --- Action Handlers ---
  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
     if (product.stock === 0) {
       toast({ title: "Out of Stock", description: "This item is currently unavailable.", variant: "destructive" });
       return;
     }
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} ${product.title}(s) added.`,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "Please log in.", variant: "destructive" });
      navigate('/login', { state: { from: location } });
      return;
    }
     if (product.stock === 0) {
        toast({ title: "Out of Stock", variant: "destructive" });
        return;
      }
     if (product.sizes && product.sizes.length > 0 && !selectedSize) {
       toast({ title: "Please select a size", variant: "destructive" });
       return;
     }
    addItem(product, quantity); // Add to cart first
    navigate('/cart'); // Then navigate to cart
  };


  const handleWishlistToggle = () => {
     if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from wishlist" });
    } else {
      addToWishlist(product);
      toast({ title: "Added to wishlist" });
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
        toast({ title: "Maximum stock reached", variant: "destructive", description: `Only ${product.stock} available.`});
    }
  };

  const decreaseQuantity = () => {
     if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const specificationsArray = Object.entries(product.specifications || {}).filter(([key, value]) => value); // Filter out empty specs

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
       <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to={`/?category=${product.category}`} className="hover:text-foreground capitalize">{product.category.replace('-', ' ')}</Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* --- ENHANCED Image Gallery --- */}
        <div className="space-y-4 sticky top-20 self-start">
          {/* Main Image Display with Arrows & Zoom */}
          <motion.div
            layout // Animate layout changes smoothly
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted/20 group cursor-zoom-in" // Added cursor
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.img
              key={selectedImage} // Add key for smooth transition
              ref={imageRef}
              src={product.images[selectedImage]}
              alt={product.title}
              className="absolute top-0 left-0 h-full w-full object-contain transition-transform duration-300" // Use contain
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`, // Set transform origin
              }}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{
                opacity: 1,
                scale: isZooming ? 2 : 1, // Apply zoom scale
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }} // Smooth transition
            />

             {/* Navigation Buttons (Appear on Hover) */}
              <AnimatePresence> {/* <-- Corrected */}
                 {!isZooming && ( // Hide arrows when zooming
                    <>
                       {/* Previous Image Button */}
                       <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePrevImage}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/60 hover:bg-background/90 backdrop-blur-sm rounded-full h-10 w-10 z-10" // Ensure button is above image
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </motion.div>
                        {/* Next Image Button */}
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNextImage}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/60 hover:bg-background/90 backdrop-blur-sm rounded-full h-10 w-10 z-10" // Ensure button is above image
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                     </>
                 )}
               </AnimatePresence> {/* <-- Corrected */}
                {/* Zoom Indicator (Optional) */}
                {isZooming && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1 rounded-full pointer-events-none z-10">
                      <ZoomIn className="h-4 w-4" />
                  </div>
                )}
          </motion.div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted"> {/* More thumbnails */}
            {product.images.map((image, index) => (
              <button
                key={index}
                className={cn(`aspect-square overflow-hidden rounded-lg border-2 transition-all shrink-0 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`, // Added focus styles
                  selectedImage === index ? 'border-primary shadow-md scale-105' : 'border-muted' // Scale up selected
                )}
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${product.title} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover" // Cover for thumbnails
                />
              </button>
            ))}
          </div>
        </div>
        {/* --- END ENHANCED Image Gallery --- */}


        {/* Product Details */}
        <div className="space-y-6">
           <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
            <p className="text-lg text-muted-foreground">{product.description}</p>
            <div className="flex items-center gap-4 my-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({Math.floor(Math.random() * 1000) + 100} ratings)</span>
              </div>
              <Badge variant="secondary" className={cn(product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-600">
                {formatCurrency(discountedPrice)}
              </span>
              {product.discountPercentage > 0 && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <Badge variant="destructive" className="text-base px-2 py-0.5"> {/* Slightly larger badge */}
                    {Math.round(product.discountPercentage)}% OFF
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Brand: </span>
              <span className="font-medium text-foreground">{product.brand}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category: </span>
              <span className="font-medium capitalize text-foreground">{product.category.replace('-', ' ')}</span>
            </div>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    onClick={() => setSelectedSize(size)}
                    className={cn(selectedSize === size && "ring-2 ring-primary ring-offset-2")} // Highlight selected
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Key Features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0 text-sm">
              {product.features && product.features.length > 0 ? product.features.map((feature, index) => (
                <li key={index} className="flex items-center text-muted-foreground">
                  <svg className="h-4 w-4 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              )) : (
                <li className="text-muted-foreground">No specific features listed. Check specifications.</li>
              )}
            </ul>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="font-medium">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden"> {/* Added overflow hidden */}
                <Button variant="ghost" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1} className="h-10 w-10 rounded-none border-r"> {/* Adjust style */}
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium bg-background">{quantity}</span> {/* Added bg */}
                <Button variant="ghost" size="icon" onClick={increaseQuantity} disabled={quantity >= product.stock} className="h-10 w-10 rounded-none border-l"> {/* Adjust style */}
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{product.stock} pieces available</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 h-12 text-lg" size="lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} disabled={product.stock === 0} variant="secondary" className="flex-1 h-12 text-lg" size="lg"> {/* Changed variant */}
              Buy Now
            </Button>
            <Button variant="outline" size="icon" onClick={handleWishlistToggle} className="h-12 w-12 shrink-0 border-2" title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}> {/* Added title */}
              <Heart className={`h-5 w-5 transition-colors duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} /> {/* Smoother transition */}
            </Button>
          </div>

          <Card className="border-dashed"> {/* Dashed border */}
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-green-600 flex-shrink-0" /><span>Free delivery</span></div>
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600 flex-shrink-0" /><span>{product.specifications.Warranty || 'Standard warranty'}</span></div>
                <div className="flex items-center gap-2"><svg className="h-4 w-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span>Easy returns</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       {/* Tabs Section */}
       <div className="mt-16"> {/* Increased margin */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 border-b rounded-none p-0 bg-transparent mb-6 justify-start"> {/* Underline style tabs */}
            <TabsTrigger value="description" className="rounded-none pb-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent data-[state=active]:bg-transparent text-lg font-semibold justify-start px-0 mr-6">Description</TabsTrigger>
            <TabsTrigger value="specifications" className="rounded-none pb-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent data-[state=active]:bg-transparent text-lg font-semibold justify-start px-0 mr-6">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none pb-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent data-[state=active]:bg-transparent text-lg font-semibold justify-start px-0">Reviews</TabsTrigger>
          </TabsList>

          {/* Tab Content with Animation */}
           <motion.div
             key={activeTab} // Change key to trigger animation
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
           >
              <TabsContent value="description" className="mt-6">
                <Card className="border-none shadow-none"><CardContent className="p-0"> {/* Remove card styles */}
                  <h3 className="text-xl font-bold mb-4">Detailed Overview</h3>
                  <p className="text-base leading-relaxed text-foreground/80">{product.description}</p> {/* Use base font size */}
                   {/* ... (rest of description content) */}
                   <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                        <h4 className="font-semibold mb-2 text-primary">Key Selling Points</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Free & Fast Delivery</li>
                            <li>Secure Payment Methods</li>
                            <li>Verified Customer Ratings</li>
                            <li>Easy Returns & Exchanges</li>
                        </ul>
                        </div>
                        <div>
                        <h4 className="font-semibold mb-2 text-primary">What's in the box</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>1 x {product.title}</li>
                            <li>Necessary accessories (cables/manual)</li>
                            <li>{product.specifications.Warranty || 'Standard Warranty'}</li>
                            <li>Quick Start Guide</li>
                        </ul>
                        </div>
                    </div>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                 <Card className="border-none shadow-none"><CardContent className="p-0"> {/* Remove card styles */}
                   <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
                   {specificationsArray.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"> {/* Adjusted grid/gap */}
                          {specificationsArray.map(([key, value]) => (
                            <div key={key} className="border-b pb-2"> {/* Simple border style */}
                              <h4 className="font-medium text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4> {/* Add space before caps */}
                              <span className="text-base text-foreground">{value || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Detailed specifications are not available for this product.</p>
                    )}
                 </CardContent></Card>
               </TabsContent>

               <TabsContent value="reviews" className="mt-6">
                 <Card className="border-none shadow-none"><CardContent className="p-0"> {/* Remove card styles */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Overall Rating Summary */}
                      <div className="md:col-span-1 border-b md:border-b-0 md:border-r md:pr-8 pb-8 md:pb-0">
                          <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                           <div className="flex items-center gap-4 mb-4">
                             <div className="text-5xl font-bold">{product.rating.toFixed(1)}</div>
                             <div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`h-5 w-5 ${star <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{Math.floor(Math.random() * 1000) + 100} reviews</p>
                             </div>
                           </div>
                           {/* Add Rating breakdown bars here if needed */}
                       </div>

                      {/* Reviews List & Form */}
                       <div className="md:col-span-2 space-y-6">
                         {/* Submitted Reviews */}
                         {submittedReviews.map((review) => (
                           <div key={review.id} className="border-b pb-4">
                             {/* ... (review rendering, same as before) */}
                              <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-semibold">
                                    {review.author.substring(0, 1)}
                                </div>
                                <div>
                                    <p className="font-semibold">{review.author}</p>
                                    <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                    </div>
                                </div>
                                <span className="ml-auto text-xs text-muted-foreground">{review.date}</span>
                                </div>
                                <p className="text-sm">{review.text}</p>
                           </div>
                         ))}

                         {/* Existing Mock Reviews */}
                         <div className="border-b pb-4"> {/* Added border */}
                           {/* ... (John Doe review, same as before) */}
                           <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">JD</div>
                                <div>
                                <p className="font-semibold">John Doe</p>
                                <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />))}</div>
                                </div>
                                <span className="ml-auto text-xs text-muted-foreground">10/10/2025</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Excellent product! Great quality and fast delivery. Would definitely recommend to others.</p>
                         </div>
                         <div className="border-b pb-4"> {/* Added border */}
                           {/* ... (Sarah Johnson review, same as before) */}
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-700 font-semibold">SJ</div>
                                <div>
                                <p className="font-semibold">Sarah Johnson</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4].map((star) => (<Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />))}
                                    <Star className="h-3 w-3 text-gray-300" />
                                </div>
                                </div>
                                <span className="ml-auto text-xs text-muted-foreground">05/10/2025</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Good product overall. Met my expectations. The delivery was prompt and packaging was secure.</p>
                         </div>

                         {/* Write Review Form */}
                         <div>
                            <h3 className="text-lg font-semibold mb-4 pt-4 border-t">Write Your Review</h3> {/* Separated form */}
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                             {/* ... (form content, same as before) */}
                              <div className="space-y-2">
                                <Label>Your Rating</Label>
                                <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Button
                                    key={star}
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRating(star)}
                                    className="p-1 text-gray-300 hover:text-yellow-400 focus-visible:text-yellow-400 focus:outline-none focus:ring-0" // Removed default focus ring
                                    aria-label={`Rate ${star} star`}
                                    >
                                    <Star
                                        className={`h-6 w-6 transition-colors ${
                                        star <= userRating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : ''
                                        }`}
                                    />
                                    </Button>
                                ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reviewText">Your Review</Label>
                                <Textarea
                                id="reviewText"
                                placeholder="Share your thoughts about the product..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={4}
                                required
                                className="resize-none"
                                />
                            </div>

                            <Button type="submit">
                                Submit Review
                            </Button>
                            </form>
                          </div>
                        </div>
                     </div>
                 </CardContent></Card>
               </TabsContent>
            </motion.div>
         </Tabs>
       </div>


      {/* Similar Products Section */}
       <section className="mt-16 pt-10 border-t"> {/* Increased margin and added border */}
        <h2 className="text-3xl font-bold mb-8 text-center">You Might Also Like</h2> {/* Centered title */}
        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Animate similar products */}
             {similarProducts.map((similarProduct, i) => (
                <ProductCard
                   key={`${similarProduct.source}-${similarProduct.id}`}
                   product={similarProduct}
                   className="hover:shadow-xl"
                   index={i} // Pass index for stagger animation
                 />
             ))}
          </div>
        ) : (<p className="text-muted-foreground text-center">No similar products found for this item.</p>)}
      </section>
    </div>
  );
};

export default ProductDetails;