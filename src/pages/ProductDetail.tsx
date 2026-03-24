import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import DietBadge from '@/components/DietBadge';
import { ArrowLeft, ShoppingCart, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading]     = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [quantity, setQuantity]         = useState(1);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load product');
        setProduct(data as DBProduct | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found</p>
        <button onClick={() => navigate('/products')}
          className="text-primary text-sm hover:underline">
          ← Back to Menu
        </button>
      </div>
    );
  }

  const hasOffer = product.offer_price && product.offer_price < product.price;
  const price    = hasOffer ? product.offer_price! : product.price;

  const handleAddToCart = () => {
    // Convert DB product to cart format
    const cartProduct = {
      id:             product.id,
      name:           product.name,
      description:    product.description || '',
      price:          product.price,
      offerPrice:     product.offer_price ?? undefined,
      image:          product.image || '',
      category:       product.category,
      dietType:       product.diet_type as 'veg' | 'egg' | 'non-veg',
      isAvailable:    product.is_available,
      isAdvanceOrder: product.is_advance_order,
    };
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct, deliveryDate || undefined, deliveryTime || undefined);
    }
    toast.success(`${product.name} added to cart!`);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Image */}
          <div className="rounded-2xl overflow-hidden shadow-elevated mb-6">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800&h=400&fit=crop'}
              alt={product.name}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>

          {/* Title + diet */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="font-display text-2xl font-bold text-foreground">{product.name}</h1>
            <DietBadge type={product.diet_type as 'veg' | 'egg' | 'non-veg'} />
          </div>

          {product.description && (
            <p className="text-muted-foreground mb-4">{product.description}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl font-bold text-foreground">₹{price}</span>
            {hasOffer && (
              <>
                <span className="text-lg text-muted-foreground line-through">₹{product.price}</span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(((product.price - product.offer_price!) / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Advance order date/time picker */}
          {product.is_advance_order && (
            <div className="bg-secondary rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" /> Schedule Delivery
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                  value={deliveryTime}
                  onChange={e => setDeliveryTime(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select time</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-muted-foreground">Qty</span>
            <div className="flex items-center gap-2 bg-secondary rounded-full">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors font-bold text-lg">−</button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors font-bold text-lg">+</button>
            </div>
            <span className="text-sm text-muted-foreground ml-auto font-medium">Total: ₹{price * quantity}</span>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.is_advance_order && (!deliveryDate || !deliveryTime)}
            className="w-full gradient-accent text-primary-foreground py-3.5 rounded-full font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart — ₹{price * quantity}
          </button>

          {product.is_advance_order && (!deliveryDate || !deliveryTime) && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Please select a delivery date and time to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
