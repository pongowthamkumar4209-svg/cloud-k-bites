import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  const deliveryCharge = totalPrice >= 500 ? 0 : 30;
  const grandTotal = totalPrice + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6 shadow-glass">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 font-body">Add some delicious items from our menu!</p>
          <Link to="/products"
            className="inline-flex items-center gap-2 gradient-accent text-white px-8 py-3.5 rounded-2xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-elevated">
            Browse Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 pb-36 md:pb-10">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 left-0 w-72 h-72 rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-lg">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
          Your Cart
          <span className="ml-2 text-base font-body text-muted-foreground font-normal">({items.length} item{items.length > 1 ? 's' : ''})</span>
        </motion.h1>

        {/* Items */}
        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {items.map((item, i) => {
              const price = item.product.offerPrice || item.product.price;
              return (
                <motion.div key={item.product.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-3xl p-3 sm:p-4 flex gap-3 sm:gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                    <img src={item.product.image} alt={item.product.name}
                      className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm sm:text-base truncate">
                      {item.product.name}
                    </h3>
                    {item.deliveryDate && (
                      <p className="text-xs text-primary mt-0.5">📅 {item.deliveryDate} {item.deliveryTime}</p>
                    )}
                    <p className="font-bold text-foreground mt-1">₹{price * item.quantity}</p>

                    {/* Quantity + Delete */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 glass rounded-full p-1">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors tap-target">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors tap-target">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)}
                        className="ml-auto p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all tap-target">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-4 sm:p-5">
          <h3 className="font-display font-semibold text-foreground mb-3">Order Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span><span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery</span>
              <span className={deliveryCharge === 0 ? 'text-green-600 font-semibold' : ''}>
                {deliveryCharge === 0 ? '🎉 Free' : `₹${deliveryCharge}`}
              </span>
            </div>
            {deliveryCharge > 0 && (
              <p className="text-xs text-primary">Add ₹{500 - totalPrice} more for free delivery!</p>
            )}
            <div className="flex justify-between font-bold text-foreground text-lg pt-2 border-t border-white/50">
              <span>Total</span>
              <span className="text-primary">₹{grandTotal}</span>
            </div>
          </div>

          <Link to="/checkout"
            className="flex items-center justify-center gap-2 w-full gradient-accent text-white py-4 rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-elevated">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
