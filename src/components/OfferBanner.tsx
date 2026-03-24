import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  discount_pct: number;
  is_active: boolean;
}

const OfferBanner = () => {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { if (data) setOffers(data as Offer[]); });
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" /> Today's Offers
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="gradient-hero rounded-xl p-5 border border-border"
            >
              {offer.badge && (
                <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                  {offer.badge}
                </span>
              )}
              <h3 className="font-display font-bold text-foreground text-lg">{offer.title}</h3>
              {offer.description && (
                <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
              )}
              {offer.discount_pct > 0 && (
                <p className="text-xs font-bold text-primary mt-2">{offer.discount_pct}% OFF</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OfferBanner;
