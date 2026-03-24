import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface OrderState {
  name?: string; phone?: string; totalAmount?: number;
  paymentMethod?: string; items?: { name: string; qty: number }[];
}

// Simple confetti without external library
const fireConfetti = () => {
  const colors = ['#e85d75', '#f97316', '#fbbf24', '#34d399'];
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number }[] = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      r: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
    });
  }

  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.012;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  };
  animate();
};

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const state = location.state as OrderState | null;
  const isPaid = state?.paymentMethod === 'razorpay';

  useEffect(() => {
    setTimeout(fireConfetti, 300);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 pb-28 md:pb-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-sm w-full">

        {/* Success icon */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-3xl gradient-accent flex items-center justify-center mx-auto mb-6 shadow-elevated">
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {isPaid ? 'Payment Done!' : 'Order Placed!'}
          </h1>
          <p className="text-muted-foreground mb-6 font-body">
            {isPaid ? 'Payment confirmed! We\'re preparing your order.' : 'Your order is confirmed. Preparing now! 🎉'}
          </p>
        </motion.div>

        {/* Order card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-5 mb-4 text-left shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-body">Order ID</p>
              <p className="font-display text-xl font-bold text-primary">{orderId}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isPaid ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {isPaid ? '✓ Paid' : 'COD'}
            </span>
          </div>

          {state?.name && (
            <p className="text-sm text-muted-foreground mb-3 font-body">
              Hi <span className="font-semibold text-foreground">{state.name}</span>! 👋
            </p>
          )}

          {/* Items */}
          {state?.items && state.items.length > 0 && (
            <div className="bg-white/50 rounded-2xl p-3 mb-3 space-y-1.5">
              {state.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-body">
                  <span className="text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">× {item.qty}</span>
                </div>
              ))}
            </div>
          )}

          {state?.totalAmount && (
            <div className="flex justify-between items-center pt-2 border-t border-white/50">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="font-display font-bold text-lg text-primary">₹{state.totalAmount}</span>
            </div>
          )}
        </motion.div>

        {/* ETA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Estimated Delivery</p>
            <p className="text-xs text-muted-foreground font-body">30–45 minutes from now</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-col gap-3">
          <Link to={`/track-order?orderId=${orderId}`}
            className="gradient-accent text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-elevated">
            <Package className="w-4 h-4" /> Track My Order
          </Link>
          <Link to="/products"
            className="glass-card text-foreground py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-md active:scale-95 transition-all">
            Order More 🧁
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
