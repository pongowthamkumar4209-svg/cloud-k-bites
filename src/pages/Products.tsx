import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import DietBadge from '@/components/DietBadge';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DBProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  offer_price: number | null;
  image: string | null;
  category: string;
  diet_type: string;
  is_available: boolean;
  is_advance_order: boolean;
}

const categories = [
  { id: 'cupcakes',    name: 'Cupcakes',    icon: '🧁' },
  { id: 'cakes',       name: 'Cakes',       icon: '🎂' },
  { id: 'quick-bites', name: 'Quick Bites', icon: '🥪' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState<DBProduct[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [dietFilter, setDietFilter]         = useState('all');
  const { addToCart } = useCart();

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('category')
      .order('name')
      .then(({ data }) => {
        if (data) setProducts(data as DBProduct[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (dietFilter !== 'all' && p.diet_type !== dietFilter) return false;
      return true;
    });
  }, [products, activeCategory, dietFilter]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'all') searchParams.delete('category');
    else searchParams.set('category', cat);
    setSearchParams(searchParams);
  };

  const handleAddToCart = (e: React.MouseEvent, p: DBProduct) => {
    e.preventDefault();
    addToCart({
      id: p.id, name: p.name, description: p.description || '',
      price: p.price, offerPrice: p.offer_price ?? undefined,
      image: p.image || '', category: p.category,
      dietType: p.diet_type as 'veg' | 'egg' | 'non-veg',
      isAvailable: p.is_available, isAdvanceOrder: p.is_advance_order,
    });
    toast.success(`${p.name} added!`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-foreground mb-6">
          Our Menu
        </motion.h1>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          <button onClick={() => handleCategoryChange('all')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory==='all'?'gradient-accent text-primary-foreground':'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory===cat.id?'gradient-accent text-primary-foreground':'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Diet filter */}
        <div className="flex gap-2 mb-6">
          {['all','veg','egg','non-veg'].map(d => (
            <button key={d} onClick={() => setDietFilter(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${dietFilter===d?'border-primary bg-primary/10 text-primary':'border-border text-muted-foreground hover:border-primary/50'}`}>
              {d==='all'?'All':d==='veg'?'🟢 Veg':d==='egg'?'🟡 Egg':'🔴 Non-Veg'}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Products grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p, i) => {
                const hasOffer = p.offer_price && p.offer_price < p.price;
                const price    = hasOffer ? p.offer_price! : p.price;
                return (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="group gradient-card rounded-xl border border-border overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
                    <Link to={`/product/${p.id}`} className="block relative aspect-square overflow-hidden">
                      <img src={p.image || ''} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {hasOffer && (
                        <span className="absolute top-3 left-3 gradient-accent text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                          {Math.round(((p.price - p.offer_price!) / p.price) * 100)}% OFF
                        </span>
                      )}
                      {p.is_advance_order && (
                        <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                          Advance Order
                        </span>
                      )}
                    </Link>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-semibold text-foreground text-sm leading-tight">{p.name}</h3>
                        <DietBadge type={p.diet_type as 'veg' | 'egg' | 'non-veg'} />
                      </div>
                      {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-foreground">₹{price}</span>
                          {hasOffer && <span className="text-xs text-muted-foreground line-through">₹{p.price}</span>}
                        </div>
                        <button onClick={e => handleAddToCart(e, p)}
                          className="p-2 rounded-full gradient-accent text-primary-foreground hover:opacity-90 transition-opacity"
                          aria-label="Add to cart">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-3">🍰</p>
                <p className="font-medium">No items found in this category</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
