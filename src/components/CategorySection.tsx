import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
  { id: 'cupcakes',    name: 'Cupcakes',    icon: '🧁', description: 'Freshly baked delights',       color: 'from-pink-100 to-rose-50' },
  { id: 'cakes',       name: 'Cakes',       icon: '🎂', description: 'Advance & anytime orders',     color: 'from-amber-100 to-orange-50' },
  { id: 'quick-bites', name: 'Quick Bites', icon: '🥪', description: 'Sandwiches, nuggets & more',   color: 'from-green-100 to-emerald-50' },
];

const CategorySection = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-5">Browse Categories</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}>
              <Link to={`/products?category=${cat.id}`}
                className="block text-center p-4 sm:p-6 rounded-3xl glass-card hover:shadow-elevated transition-all duration-300 group">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                </div>
                <h3 className="font-display font-semibold text-foreground text-xs sm:text-sm">{cat.name}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-body hidden sm:block">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
