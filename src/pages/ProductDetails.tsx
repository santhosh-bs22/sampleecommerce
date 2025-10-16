import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, ShoppingCart, Star, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import { mockProducts } from '../mockData';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { formatCurrency, formatDiscountPrice, calculateDiscount } from '../utils/currency';
import { useToast } from '../hooks/use-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  // FIX: Destructure toast from useToast hook
  const { toast } = useToast();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const product = mockProducts.find(p => p.id === parseInt(id || '0'));

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
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
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast({
      title: "Added to cart",
      description: `${quantity} ${product.title} has been added to your cart.`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/" className="hover:text-foreground capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`aspect-square overflow-hidden rounded-lg border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
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
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({Math.floor(Math.random() * 1000) + 100} reviews)</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {product.stock} in stock
              </Badge>
            </div>
          </div>

          {/* Price */}
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
                    {product.discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
          </div>

          {/* Brand and Category */}
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Brand: </span>
              <span className="font-medium">{product.brand}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category: </span>
              <span className="font-medium capitalize">{product.category.replace('-', ' ')}</span>
            </div>
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div className="space-y-3">
            <p className="font-medium">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.stock} pieces available
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Buy Now
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
              className="h-12 w-12"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Features */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Free delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>1 year warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>7-day returns</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed">{product.description}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>High-quality materials</li>
                      <li>Excellent performance</li>
                      <li>Long-lasting durability</li>
                      <li>Customer favorite</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What's in the box</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>1 x {product.title}</li>
                      <li>User manual</li>
                      <li>Warranty card</li>
                      <li>Original accessories</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3">Product Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Brand</span>
                          <span>{product.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Model</span>
                          <span>{product.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category</span>
                          <span className="capitalize">{product.category.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Additional Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Warranty</span>
                          <span>1 Year</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Return Policy</span>
                          <span>7 Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery</span>
                          <span>2-3 Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{product.rating}</div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.floor(Math.random() * 1000) + 100} reviews
                      </p>
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          JD
                        </div>
                        <div>
                          <p className="font-semibold">John Doe</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excellent product! Great quality and fast delivery. Would definitely recommend to others.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                          SJ
                        </div>
                        <div>
                          <p className="font-semibold">Sarah Johnson</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4].map((star) => (
                              <Star
                                key={star}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            <Star className="h-3 w-3 text-gray-300" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Good product overall. Met my expectations. The delivery was prompt and packaging was secure.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetails;