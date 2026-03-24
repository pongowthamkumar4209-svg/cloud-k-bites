import Hero from '@/components/Hero';
import OfferBanner from '@/components/OfferBanner';
import CategorySection from '@/components/CategorySection';
import FeaturedProducts from '@/components/FeaturedProducts';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <OfferBanner />
      <CategorySection />
      <FeaturedProducts />
    </div>
  );
};

export default Index;
