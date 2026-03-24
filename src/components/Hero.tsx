import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-bakery.jpg';

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-[85vh] md:min-h-[75vh] flex items-center">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-bakery-pink-light/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide">Freshly Baked Daily</span>
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-5">
              Baked with{' '}
              <span className="relative">
                <span className="relative z-10 text-primary">Love,</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/15 rounded-full -z-0" />
              </span>
              <br />
              <span className="text-foreground/80">Delivered</span>{' '}
              <span className="text-accent">Fresh</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md leading-relaxed font-body">
              Cupcakes, cakes, sandwiches & snacks — handcrafted with the finest ingredients, right to your doorstep.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/products"
                className="inline-flex items-center gap-2 gradient-accent text-white px-6 py-3.5 rounded-2xl font-semibold hover:opacity-90 transition-all active:scale-95 shadow-elevated text-sm md:text-base">
                Order Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/track-order"
                className="inline-flex items-center gap-2 glass-card text-foreground px-6 py-3.5 rounded-2xl font-semibold hover:shadow-md transition-all active:scale-95 text-sm md:text-base">
                Track Order
              </Link>
            </div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-6 mt-8">
              {[
                { value: '500+', label: 'Happy Customers' },
                { value: '20+', label: 'Menu Items' },
                { value: '4.9★', label: 'Rating' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative">

            {/* Main image with glass frame */}
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img src={heroImage} alt="Cloud K Bakery"
                className="w-full h-56 sm:h-72 md:h-80 object-cover" />
              {/* Glass overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Floating glass cards */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-3 shadow-glass">
              <p className="text-xs text-muted-foreground font-body">Today's Special</p>
              <p className="font-display font-bold text-foreground text-sm">Vanilla Dream 🧁</p>
              <p className="text-xs text-primary font-semibold">Only ₹99</p>
            </motion.div>

            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-4 -right-4 glass-card rounded-2xl px-4 py-3 shadow-glass">
              <p className="text-xs font-semibold text-green-600">🟢 Free Delivery</p>
              <p className="text-xs text-muted-foreground font-body">on orders ₹500+</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
