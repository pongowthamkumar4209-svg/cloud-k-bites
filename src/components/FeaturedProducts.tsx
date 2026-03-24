import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  offer_price: number | null;
  image: string | null;
  category: string;
  diet_type: string;
  is_available: boolean;
  is_advance_order: boolean;
  is_featured: boolean;
}

// Convert DB product → format ProductCard expects
const toCardProduct = (p: Product) => ({
  id: p.id,
  name: p.name,
  description: p.description || '',
  price: p.price,
  offerPrice: p.offer_price ?? undefined,
  image: p.image || '',
  category: p.category,
  dietType: p.diet_type as 'veg' | 'egg' | 'non-veg',
  isAvailable: p.is_available,
  isAdvanceOrder: p.is_advance_order,
});

import ProductCard from './ProductCard';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_available', true)
      .order('created_at')
      .limit(4)
      .then(({ data }) => {
        if (data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Featured Items</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-secondary animate-pulse aspect-square" />
          ))}
        </div>
      </div>
    </section>
  );

  if (products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Featured Items</h2>
          <Link to="/products" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <ProductCard product={toCardProduct(product)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
