import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, Banknote, Loader2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRazorpay } from '@/hooks/useRazorpay';
import { toast } from 'sonner';

type PaymentMethod = 'cod' | 'razorpay';

const generateOrderId = () => `CK-${Date.now().toString(36).toUpperCase()}`;

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { openPayment } = useRazorpay();

  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes]     = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const deliveryCharge = totalPrice >= 500 ? 0 : 30;
  const grandTotal     = totalPrice + deliveryCharge;

  const inputClass = "w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-white/80 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none backdrop-blur-sm transition-all font-body";

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setAddress(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`),
        () => toast.error('Unable to get location')
      );
    }
  };

  const saveOrder = async (orderId: string, paymentStatus: 'pending' | 'paid', razorpayPaymentId?: string, razorpayOrderId?: string) => {
    const { error: orderErr } = await supabase.from('orders').insert({
      id: orderId,
      customer_name:       name.trim(),
      customer_phone:      phone.trim(),
      customer_email:      email.trim() || null,
      delivery_address:    address.trim(),
      notes:               notes.trim() || null,
      subtotal:            totalPrice,
      delivery_charge:     deliveryCharge,
      grand_total:         grandTotal,
      payment_method:      payment,
      payment_status:      paymentStatus,
      razorpay_order_id:   razorpayOrderId || null,
      razorpay_payment_id: razorpayPaymentId || null,
      order_status:        'placed',
    });
    if (orderErr) throw orderErr;

    const { error: itemsErr } = await supabase.from('order_items').insert(
      items.map(item => ({
        order_id:      orderId,
        product_id:    item.product.id,
        name:          item.product.name,
        price:         item.product.offerPrice ?? item.product.price,
        quantity:      item.quantity,
        delivery_date: item.deliveryDate || null,
        delivery_time: item.deliveryTime || null,
      }))
    );
    if (itemsErr) throw itemsErr;
  };

  const goSuccess = (orderId: string) => {
    clearCart();
    navigate(`/order-success/${orderId}`, {
      state: { orderId, name, phone, totalAmount: grandTotal, paymentMethod: payment, items: items.map(i => ({ name: i.product.name, qty: i.quantity })) },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) { toast.error('Enter a valid 10-digit phone number'); return; }
    setLoading(true);
    const orderId = generateOrderId();

    try {
      if (payment === 'cod') {
        await saveOrder(orderId, 'pending');
        goSuccess(orderId);
        return;
      }

      // Try edge function first, fallback to key-only
      const { data: fnData } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: grandTotal },
      });

      openPayment({
        razorpayOrderId: fnData?.razorpayOrderId || `order_${orderId}`,
        amount: grandTotal, name, email, phone,
        onSuccess: async (paymentId, rzpOrderId) => {
          try { await saveOrder(orderId, 'paid', paymentId, rzpOrderId); goSuccess(orderId); }
          catch { toast.error('Payment received! Note your ID: ' + orderId); }
        },
        onFailure: (reason) => {
          if (reason !== 'Payment cancelled') toast.error(reason);
          setLoading(false);
        },
      });
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="min-h-screen py-6 pb-28 md:pb-10">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-lg">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Order summary collapsible */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-card rounded-3xl overflow-hidden">
            <button type="button" onClick={() => setShowItems(!showItems)}
              className="w-full flex items-center justify-between p-4 sm:p-5">
              <div>
                <p className="font-semibold text-foreground text-sm">{items.length} item{items.length > 1 ? 's' : ''} in your order</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tap to {showItems ? 'hide' : 'review'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-lg text-primary">₹{grandTotal}</span>
                {showItems ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {showItems && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 sm:px-5 pb-4 border-t border-white/50 pt-3 space-y-2">
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.product.name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                        <span className="font-medium">₹{(item.product.offerPrice ?? item.product.price) * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/50 pt-2 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtotal</span><span>₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Delivery</span>
                        <span className={deliveryCharge === 0 ? 'text-green-600 font-semibold' : ''}>
                          {deliveryCharge === 0 ? '🎉 Free' : `₹${deliveryCharge}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-foreground pt-1">
                        <span>Total</span><span className="text-primary">₹{grandTotal}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Delivery Details */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-4 sm:p-5 space-y-3">
            <h2 className="font-display font-semibold text-foreground text-lg">Delivery Details</h2>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *" required maxLength={100} className={inputClass} />
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone Number *" required className={inputClass} />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (for receipt — optional)" type="email" maxLength={255} className={inputClass} />
            <div className="relative">
              <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery Address *" required maxLength={500} rows={3}
                className={`${inputClass} resize-none`} />
              <button type="button" onClick={handleGetLocation}
                className="absolute right-3 bottom-3 flex items-center gap-1 text-xs text-primary font-medium glass px-2.5 py-1.5 rounded-full hover:shadow-sm transition-all">
                <MapPin className="w-3 h-3" /> GPS
              </button>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Order notes — allergies, special requests (optional)" maxLength={500} rows={2}
              className={`${inputClass} resize-none`} />
          </motion.div>

          {/* Payment Method */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card rounded-3xl p-4 sm:p-5 space-y-3">
            <h2 className="font-display font-semibold text-foreground text-lg">Payment</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* COD */}
              <button type="button" onClick={() => setPayment('cod')}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                  payment === 'cod'
                    ? 'border-primary bg-primary/8 shadow-sm'
                    : 'border-white/60 bg-white/30 hover:bg-white/50'
                }`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${payment === 'cod' ? 'gradient-accent' : 'bg-secondary'}`}>
                  <Banknote className={`w-5 h-5 ${payment === 'cod' ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${payment === 'cod' ? 'text-primary' : 'text-foreground'}`}>Cash on Delivery</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pay when delivered</p>
                </div>
                {payment === 'cod' && <div className="w-2 h-2 rounded-full gradient-accent" />}
              </button>

              {/* Razorpay */}
              <button type="button" onClick={() => setPayment('razorpay')}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                  payment === 'razorpay'
                    ? 'border-primary bg-primary/8 shadow-sm'
                    : 'border-white/60 bg-white/30 hover:bg-white/50'
                }`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${payment === 'razorpay' ? 'gradient-accent' : 'bg-secondary'}`}>
                  <CreditCard className={`w-5 h-5 ${payment === 'razorpay' ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${payment === 'razorpay' ? 'text-primary' : 'text-foreground'}`}>Pay Online</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">UPI, Cards, NB</p>
                </div>
                {payment === 'razorpay' && <div className="w-2 h-2 rounded-full gradient-accent" />}
              </button>
            </div>

            {/* Razorpay info */}
            <AnimatePresence>
              {payment === 'razorpay' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden">
                  <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-green-700">100% Secure via Razorpay</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['✅ UPI — GPay, PhonePe', '✅ Credit / Debit Cards', '✅ Net Banking', '✅ Pay Later / EMI'].map(m => (
                        <p key={m} className="text-[11px] text-green-700">{m}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Place order button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <button type="submit" disabled={loading}
              className="w-full gradient-accent text-white py-4 rounded-2xl font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-elevated">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                : <>{payment === 'razorpay' ? '🔒 Pay' : '✅ Place Order'} — ₹{grandTotal}</>}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              {payment === 'cod' ? 'No payment needed now' : 'You\'ll be redirected to secure payment'}
            </p>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
