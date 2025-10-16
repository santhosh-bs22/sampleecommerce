// src/components/AIPersonalShopperDialog.tsx
import React, { useState } from 'react';
import { Sparkles, Send, Copy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import LoadingSpinner from './LoadingSpinner';
import { Product } from '../types'; 
import { fetchProducts } from '../api/productApi';
import { formatCurrency } from '../utils/currency';

// Mock AI response function (simulating OpenAI/GPT response)
const mockAIPrompt = async (prompt: string): Promise<{ suggestedQuery: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  if (prompt.toLowerCase().includes('red dress')) {
    return {
      suggestedQuery: 'red fashion dress',
    };
  } else if (prompt.toLowerCase().includes('gaming laptop')) {
    return {
      suggestedQuery: 'high performance gaming laptop',
    };
  }
  
  return {
    suggestedQuery: 'best value electronics',
  };
};

const AIPersonalShopperDialog: React.FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [suggestedQuery, setSuggestedQuery] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setSuggestedQuery('');
    setRecommendedProducts([]);

    try {
      // 1. Get mock AI result (suggested query)
      const aiResult = await mockAIPrompt(prompt);
      
      // 2. Fetch actual products based on the AI's suggested query
      const fetchedData = await fetchProducts(0, 4, { searchTerm: aiResult.suggestedQuery });
      
      setSuggestedQuery(aiResult.suggestedQuery);
      setRecommendedProducts(fetchedData.products.slice(0, 2));

    } catch (error) {
      toast({
        title: "AI Service Error",
        description: "Could not connect to the AI service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); /* FIX: Changed from setIsSubmitting(false) to setIsLoading(false) */
    }
  };
  
  const handleCopyQuery = () => {
    navigator.clipboard.writeText(suggestedQuery);
    toast({
      title: "Query Copied!",
      description: "Paste the suggested query into the main search bar.",
    });
  };

  const handleSearchNavigation = () => {
      setIsOpen(false);
      // NOTE: In a real app, this would use useNavigate to go to the home page 
      // and update the global search state (e.g., via a search context/store).
      toast({
          title: "Search Initiated",
          description: `Navigating to Home and searching for: "${suggestedQuery}"`,
          variant: "default",
      });
      // For demonstration, we'll use a hard reload to simulate navigation and search setting
      window.location.href = `/?search=${encodeURIComponent(suggestedQuery)}`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sparkles className="h-5 w-5 fill-primary text-primary" />
          {/* New Feature indicator badge */}
          <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-yellow-400 border-yellow-500 animate-pulse" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 fill-primary text-primary" />
            AI Personal Shopper
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Describe what you're looking for (e.g., "a cozy red sweater for winter") and our AI will assist.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="E.g., A high-end gaming laptop for under ₹1,50,000"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="min-h-[80px]"
            />
            <Button 
              size="icon" 
              onClick={handleAskAI} 
              disabled={isLoading || !prompt.trim()}
              className="self-end h-10 w-10 shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {isLoading && (
            <Card className="text-center p-6">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-muted-foreground">AI is thinking...</p>
            </Card>
          )}

          {suggestedQuery && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 fill-primary text-primary" />
                    AI Suggested Query
                </h3>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-md border">
                  <span className="font-mono text-sm">{suggestedQuery}</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyQuery}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                
                <h3 className="font-semibold text-lg flex items-center gap-2 mt-4">
                    <ArrowRight className="h-4 w-4" />
                    Recommended Products
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {recommendedProducts.map(product => (
                    <div key={`${product.source}-${product.id}`} className="flex items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                        <img 
                            src={product.thumbnail} 
                            alt={product.title} 
                            className="w-12 h-12 object-cover rounded-md mr-3"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{product.title}</p>
                            <p className="text-sm text-green-600">
                                {formatCurrency(product.price * (1 - product.discountPercentage / 100))}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`/product/${product.source}-${product.id}`} onClick={() => setIsOpen(false)}>
                                View
                            </Link>
                        </Button>
                    </div>
                  ))}
                </div>
                {recommendedProducts.length === 0 && (
                    <p className="text-muted-foreground text-center">No immediate product matches found based on the suggestion.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Action to redirect/search in main view */}
        {suggestedQuery && (
            <div className='flex justify-end'>
                <Button onClick={handleSearchNavigation}>
                    Search on EcomX
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIPersonalShopperDialog;