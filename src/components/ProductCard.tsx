import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import DietBadge from './DietBadge';
import { ShoppingCart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const hasOffer = product.offerPrice && product.offerPrice < product.price;
  const discountPct = hasOffer ? Math.round(((product.price - product.offerPrice!) / product.price) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.isAdvanceOrder) return; // advance orders go through product detail
    addToCart(product);
    toast.success(`${product.name} added!`, { duration: 1500 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group glass-card rounded-3xl overflow-hidden hover:shadow-elevated transition-all duration-300">

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        {hasOffer && (
          <div className="absolute top-2.5 left-2.5">
            <span className="gradient-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md badge-float">
              {discountPct}% OFF
            </span>
          </div>
        )}
        {product.isAdvanceOrder && (
          <div className="absolute top-2.5 right-2.5">
            <span className="glass text-foreground text-[10px] font-medium px-2.5 py-1 rounded-full">
              📅 Advance
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <DietBadge type={product.dietType} />
        </div>

        {product.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 font-body leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-foreground text-base">
              ₹{hasOffer ? product.offerPrice : product.price}
            </span>
            {hasOffer && (
              <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
            )}
          </div>

          {product.isAdvanceOrder ? (
            <Link to={`/product/${product.id}`}
              className="text-[10px] text-primary font-semibold px-3 py-1.5 rounded-full glass-card hover:shadow-md transition-all tap-target flex items-center">
              Order →
            </Link>
          ) : (
            <button onClick={handleAddToCart}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl gradient-accent text-white flex items-center justify-center hover:opacity-90 active:scale-90 transition-all shadow-md tap-target"
              aria-label="Add to cart">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
