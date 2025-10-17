import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, ShoppingCart, Star, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { formatCurrency, formatDiscountPrice, calculateDiscount } from '../utils/currency';
import { useToast } from '../hooks/use-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types';
import { fetchProductById, getSimilarProducts } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';
import Product3DView from '../components/Product3DView';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const fetchProduct = useCallback(async (combinedId: string) => {
    setIsLoading(true);
    setProduct(null);
    setSimilarProducts([]);
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab('description');

    const [source, productIdStr] = combinedId.split('-');
    const pid = parseInt(productIdStr || '0', 10);

    if (pid === 0 || !source) {
        setIsLoading(false);
        return;
    }

    const fetchedProduct = await fetchProductById(pid, source as Product['source']);

    if (fetchedProduct) {
      setProduct(fetchedProduct);
      const similar = await getSimilarProducts(fetchedProduct, 4);
      setSimilarProducts(similar);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
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

  const isWishlisted = isInWishlist(product.id);
  const discountedPrice = calculateDiscount(product.price, product.discountPercentage);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} ${product.title}(s) have been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.title} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.title} has been added to your wishlist.`,
      });
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const specificationsArray = Object.entries(product.specifications || {});

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/" className="hover:text-foreground capitalize">{product.category.replace('-', ' ')}</Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            {viewMode === '2d' ? (
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300"
              />
            ) : (
              <Product3DView images={product.images} />
            )}
          </div>

          <div className="flex justify-between items-center">
             <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(`aspect-square overflow-hidden rounded-lg border-2 transition-all shrink-0`,
                      selectedImage === index ? 'border-primary shadow-md' : 'border-transparent hover:border-muted'
                    )}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            <Button onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')} className="ml-4">
              {viewMode === '2d' ? '3D View' : '2D View'}
            </Button>
          </div>
        </div>

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
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {product.stock} in stock
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
                  <Badge variant="destructive" className="text-lg">
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
              <div className="flex items-center border rounded-lg">
                <Button variant="ghost" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1} className="h-10 w-10">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={increaseQuantity} disabled={quantity >= product.stock} className="h-10 w-10">
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
            <Button onClick={handleBuyNow} disabled={product.stock === 0} variant="outline" className="flex-1 h-12 text-lg" size="lg">
              Buy Now
            </Button>
            <Button variant="outline" size="icon" onClick={handleWishlistToggle} className="h-12 w-12 shrink-0">
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-green-600 flex-shrink-0" /><span>Free delivery</span></div>
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600 flex-shrink-0" /><span>1 year warranty</span></div>
                <div className="flex items-center gap-2"><svg className="h-4 w-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span>7-day returns</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid aw-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            {/* <TabsTrigger value="videos">Video Reviews</TabsTrigger>
            <TabsTrigger value="demo">Interactive Demo</TabsTrigger> */}
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card><CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Detailed Overview</h3>
                <p className="text-lg leading-relaxed">{product.description}</p>
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
            <Card><CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specificationsArray.map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <h4 className="font-semibold text-muted-foreground">{key}</h4>
                        <span className="text-lg font-medium text-foreground">{value || 'N/A'}</span>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </div>
                {specificationsArray.length === 0 && (<p className="text-muted-foreground">Detailed specifications are not available for this product.</p>)}
            </CardContent></Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card><CardContent className="p-6"><div className="space-y-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{product.rating}</div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`h-4 w-4 ${star <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{Math.floor(Math.random() * 1000) + 100} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">JD</div>
                        <div>
                          <p className="font-semibold">John Doe</p>
                          <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />))}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Excellent product! Great quality and fast delivery. Would definitely recommend to others.</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">SJ</div>
                        <div>
                          <p className="font-semibold">Sarah Johnson</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4].map((star) => (<Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />))}
                            <Star className="h-3 w-3 text-gray-300" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Good product overall. Met my expectations. The delivery was prompt and packaging was secure.</p>
                    </div>
                  </div>
            </div></CardContent></Card>
          </TabsContent>
{/* 
          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Video Reviews</h3>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Product Video Review"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                    style={{ minHeight: '350px' }}
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* <TabsContent value="demo" className="mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-4">Interactive Demo</h3>
                <p className="text-muted-foreground">An interactive demo for this product is not yet available.</p>
                <p className="text-sm text-muted-foreground mt-2">(This is where you would embed a product-specific interactive element)</p>
              </CardContent>
            </Card>
          </TabsContent> */}

        </Tabs>
      </div>

      <section className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Similar Products</h2>
        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map(similarProduct => (<ProductCard key={`${similarProduct.source}-${similarProduct.id}`} product={similarProduct} className="hover:shadow-xl"/>))}
          </div>
        ) : (<p className="text-muted-foreground">No similar products found for this item.</p>)}
      </section>
    </div>
  );
};

export default ProductDetails;