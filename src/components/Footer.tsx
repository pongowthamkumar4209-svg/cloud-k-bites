import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 mb-20 md:mb-0">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-2xl gradient-accent flex items-center justify-center shadow-md">
                  <span className="text-lg">☁️</span>
                </div>
                <div>
                  <span className="font-display text-lg font-bold text-foreground">Cloud K Bites</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs font-body leading-relaxed">
                Handcrafted bakery delights delivered fresh to your doorstep. Made with love, every single day.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-3">Quick Links</h4>
                <div className="flex flex-col gap-2">
                  {[{to:'/products',label:'Menu'},{to:'/cart',label:'Cart'},{to:'/track-order',label:'Track Order'},{to:'/admin',label:'Admin'}].map(l => (
                    <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">{l.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-3">Contact</h4>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground font-body">
                  <span>📞 +91 98765 43210</span>
                  <span>📧 hello@cloudk.in</span>
                  <span>📍 Chennai, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/50 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground font-body">© 2026 Cloud K Bites. All rights reserved.</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 font-body">
              Made with <Heart className="w-3 h-3 text-primary fill-primary" /> in Chennai
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
