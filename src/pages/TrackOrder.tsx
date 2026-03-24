import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, ChefHat, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  id: string;
  customer_name: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  grand_total: number;
  created_at: string;
  order_items: { name: string; quantity: number; price: number }[];
}

const trackingSteps = [
  { key: 'placed',    label: 'Order Placed',     icon: Package,      desc: 'Your order has been received!' },
  { key: 'preparing', label: 'Preparing',         icon: ChefHat,      desc: 'Our team is preparing your order.' },
  { key: 'delivery',  label: 'Out for Delivery',  icon: Truck,        desc: 'Your order is on the way!' },
  { key: 'delivered', label: 'Delivered',         icon: CheckCircle2, desc: 'Enjoy! 🎉' },
];

const statusBadge: Record<string, string> = {
  placed:    'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  delivery:  'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [order, setOrder]     = useState<OrderData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;
    setLoading(true); setError(''); setOrder(null);

    const { data, error: dbErr } = await supabase
      .from('orders')
      .select('id, customer_name, order_status, payment_method, payment_status, grand_total, created_at, order_items(name, quantity, price)')
      .eq('id', orderId.trim().toUpperCase())
      .eq('customer_phone', phone.trim())
      .maybeSingle();

    setLoading(false);
    if (dbErr) { setError('Something went wrong. Please try again.'); return; }
    if (!data)  { setError('No order found. Check your Order ID and phone number.'); return; }
    setOrder(data as OrderData);
  };

  const currentIdx = order ? trackingSteps.findIndex(s => s.key === order.order_status) : -1;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Track Your Order</h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-card rounded-xl border border-border p-6 space-y-4 mb-6">
          <input value={orderId} onChange={e => setOrderId(e.target.value)}
            placeholder="Order ID (e.g., CK-ABC123)"
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none" />
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Phone Number used at checkout"
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none" />
          <button type="submit" disabled={loading}
            className="w-full gradient-accent text-primary-foreground py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Search className="w-4 h-4" /> Track Order</>}
          </button>
        </form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 items-center mb-6">
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Summary */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-display text-lg font-bold text-primary">{order.id}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Hi {order.customer_name}! 👋</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusBadge[order.order_status] || 'bg-secondary'}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="border-t border-border pt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><p className="font-medium text-foreground">Total</p><p>₹{order.grand_total}</p></div>
                  <div>
                    <p className="font-medium text-foreground">Payment</p>
                    <p>{order.payment_method === 'cod' ? 'Cash on Delivery' : `Online (${order.payment_status})`}</p>
                  </div>
                </div>
              </div>

              {/* Tracking steps */}
              {order.order_status !== 'cancelled' && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <p className="font-semibold text-foreground text-sm mb-4">Live Tracking</p>
                  {trackingSteps.map((step, i) => {
                    const done   = i <= currentIdx;
                    const active = i === currentIdx;
                    const Icon   = step.icon;
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${done ? 'gradient-accent' : 'bg-secondary'}`}>
                            <Icon className={`w-5 h-5 ${done ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          </div>
                          {i < trackingSteps.length - 1 && <div className={`w-0.5 h-10 ${done ? 'bg-primary' : 'bg-border'}`} />}
                        </div>
                        <div className="pt-2">
                          <p className={`text-sm font-medium ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                          {active && <p className="text-xs text-primary mt-0.5">{step.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items */}
              <div className="bg-card rounded-xl border border-border p-5">
                <p className="font-semibold text-foreground text-sm mb-3">Items Ordered</p>
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{item.name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                    <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {['placed', 'preparing'].includes(order.order_status) && (
                <div className="bg-secondary rounded-xl p-4 text-center text-sm text-muted-foreground">
                  ⏱️ Estimated delivery: <span className="font-semibold text-foreground">30–45 mins</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackOrder;
