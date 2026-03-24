import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, DollarSign, ShoppingBag, TrendingUp, Eye, EyeOff,
  RefreshCw, Loader2, LogOut, ChevronDown, ChevronRight,
  Plus, Pencil, Trash2, Star, StarOff, Gift, X, Check, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  id: string; customer_name: string; customer_phone: string;
  delivery_address: string; notes: string | null;
  grand_total: number; payment_method: string; payment_status: string;
  order_status: string; created_at: string;
  order_items: { name: string; quantity: number; price: number }[];
}
interface Product {
  id: string; name: string; description: string | null; price: number;
  offer_price: number | null; image: string | null; category: string;
  diet_type: string; is_available: boolean; is_advance_order: boolean; is_featured: boolean;
}
interface Offer {
  id: string; title: string; description: string | null; badge: string | null;
  discount_pct: number; is_active: boolean; sort_order: number;
}

const STATUS_STYLE: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700', preparing: 'bg-amber-100 text-amber-700',
  delivery: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
const NEXT: Record<string, string> = { placed: 'preparing', preparing: 'delivery', delivery: 'delivered' };

const DIET_OPTIONS = ['veg', 'egg', 'non-veg'];
const CAT_OPTIONS  = ['cupcakes', 'cakes', 'quick-bites'];

// ─── Blank product form ────────────────────────────────────────────────────────
const blankProduct = (): Omit<Product, 'id'> => ({
  name: '', description: '', price: 0, offer_price: null, image: '',
  category: 'cupcakes', diet_type: 'veg', is_available: true, is_advance_order: false, is_featured: false,
});

// ─── Product Modal ─────────────────────────────────────────────────────────────
const ProductModal = ({
  product, onSave, onClose,
}: { product: Omit<Product,'id'> & { id?: string }; onSave: () => void; onClose: () => void }) => {
  const [form, setForm] = useState({ ...product });
  const [saving, setSaving] = useState(false);
  const isEdit = !!product.id;

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price || form.price <= 0) { toast.error('Enter a valid price'); return; }
    setSaving(true);

    const payload = {
      name:            form.name.trim(),
      description:     form.description || null,
      price:           Number(form.price),
      offer_price:     form.offer_price ? Number(form.offer_price) : null,
      image:           form.image || null,
      category:        form.category,
      diet_type:       form.diet_type,
      is_available:    form.is_available,
      is_advance_order:form.is_advance_order,
      is_featured:     form.is_featured,
    };

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', product.id!)
      : await supabase.from('products').insert(payload);

    setSaving(false);
    if (error) { toast.error('Failed to save: ' + error.message); return; }
    toast.success(isEdit ? 'Product updated!' : 'Product added!');
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h2 className="font-display font-bold text-foreground">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image preview */}
          {form.image && (
            <div className="rounded-xl overflow-hidden h-36 bg-secondary">
              <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display='none')} />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Image URL</label>
            <div className="flex gap-2">
              <input value={form.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
              <div className="p-2.5 rounded-lg bg-secondary text-muted-foreground"><ImageIcon className="w-4 h-4" /></div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Product Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Chocolate Truffle Cupcake"
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Description</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2}
              placeholder="Short description of the product"
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} min={0} placeholder="120"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Offer Price (₹)</label>
              <input type="number" value={form.offer_price || ''} onChange={e => set('offer_price', e.target.value || null)} min={0} placeholder="99 (optional)"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring capitalize">
                {CAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Diet Type</label>
              <select value={form.diet_type} onChange={e => set('diet_type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring capitalize">
                {DIET_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'is_available',     label: 'Available',     icon: Eye },
              { key: 'is_featured',      label: 'Featured',      icon: Star },
              { key: 'is_advance_order', label: 'Advance Order', icon: Package },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} type="button"
                onClick={() => set(key, !(form as Record<string,unknown>)[key])}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all ${
                  (form as Record<string,unknown>)[key]
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
                {(form as Record<string,unknown>)[key] ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-40" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:bg-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-full gradient-accent text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Offer Modal ───────────────────────────────────────────────────────────────
const OfferModal = ({
  offer, onSave, onClose,
}: { offer: Partial<Offer> & { id?: string }; onSave: () => void; onClose: () => void }) => {
  const [form, setForm] = useState({ title: '', description: '', badge: '', discount_pct: 0, is_active: true, sort_order: 0, ...offer });
  const [saving, setSaving] = useState(false);
  const isEdit = !!offer.id;
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Offer title is required'); return; }
    setSaving(true);
    const payload = { title: form.title.trim(), description: form.description || null, badge: form.badge || null, discount_pct: Number(form.discount_pct), is_active: form.is_active, sort_order: Number(form.sort_order) };
    const { error } = isEdit
      ? await supabase.from('offers').update(payload).eq('id', offer.id!)
      : await supabase.from('offers').insert(payload);
    setSaving(false);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success(isEdit ? 'Offer updated!' : 'Offer added!');
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display font-bold text-foreground">{isEdit ? 'Edit Offer' : 'Add New Offer'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Offer Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. 20% Off Cupcakes!"
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Description</label>
            <input value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="This weekend only..."
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Badge Label</label>
              <input value={form.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="Weekend Special"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Discount %</label>
              <input type="number" value={form.discount_pct} onChange={e => set('discount_pct', e.target.value)} min={0} max={100} placeholder="20"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Active on Homepage</p>
              <p className="text-xs text-muted-foreground">Show this offer to customers</p>
            </div>
            <button type="button" onClick={() => set('is_active', !form.is_active)}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-primary' : 'bg-border'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:bg-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-full gradient-accent text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Add Offer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Admin Login ───────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (import.meta.env.VITE_ADMIN_PASSWORD || 'cloudk2026')) {
      sessionStorage.setItem('ck_admin', '1'); onLogin();
    } else { setError('Invalid password'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">☁️</span>
          <h1 className="font-display text-2xl font-bold text-foreground mt-2">Kiruba Dashboard</h1>
          <p className="text-sm text-muted-foreground">Admin access only</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <input type="password" value={password} autoFocus onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Admin Password"
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none" />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <button type="submit" className="w-full gradient-accent text-primary-foreground py-3 rounded-full font-medium hover:opacity-90 transition-opacity">Sign In</button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState<'overview'|'orders'|'products'|'offers'>('overview');
  const [orders, setOrders]               = useState<Order[]>([]);
  const [products, setProducts]           = useState<Product[]>([]);
  const [offers, setOffers]               = useState<Offer[]>([]);
  const [loading, setLoading]             = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string|null>(null);
  const [productModal, setProductModal]   = useState<(Omit<Product,'id'>&{id?:string})|null>(null);
  const [offerModal, setOfferModal]       = useState<(Partial<Offer>&{id?:string})|null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type:'product'|'offer';id:string}|null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [oRes, pRes, offRes] = await Promise.all([
      supabase.from('orders').select('*, order_items(name,quantity,price)').order('created_at',{ascending:false}).limit(100),
      supabase.from('products').select('*').order('category').order('name'),
      supabase.from('offers').select('*').order('sort_order'),
    ]);
    if (oRes.data)   setOrders(oRes.data as Order[]);
    if (pRes.data)   setProducts(pRes.data as Product[]);
    if (offRes.data) setOffers(offRes.data as Offer[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Stats
  const today        = new Date().toDateString();
  const todayOrders  = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayRev     = todayOrders.filter(o=>o.order_status!=='cancelled').reduce((s,o)=>s+o.grand_total,0);
  const totalRev     = orders.filter(o=>o.order_status!=='cancelled').reduce((s,o)=>s+o.grand_total,0);
  const activeProd   = products.filter(p=>p.is_available).length;

  // Order actions
  const advanceOrder = async (id: string, cur: string) => {
    const next = NEXT[cur]; if (!next) return;
    await supabase.from('orders').update({order_status:next}).eq('id',id);
    setOrders(prev => prev.map(o => o.id===id?{...o,order_status:next}:o));
    toast.success(`${id} → ${next}`);
  };
  const cancelOrder = async (id: string) => {
    await supabase.from('orders').update({order_status:'cancelled'}).eq('id',id);
    setOrders(prev => prev.map(o => o.id===id?{...o,order_status:'cancelled'}:o));
    toast.success('Order cancelled');
  };

  // Product actions
  const toggleProduct = async (id: string, key: 'is_available'|'is_featured', val: boolean) => {
    await supabase.from('products').update({[key]:!val}).eq('id',id);
    setProducts(prev => prev.map(p => p.id===id?{...p,[key]:!val}:p));
    toast.success(!val ? 'Enabled' : 'Disabled');
  };
  const deleteProduct = async (id: string) => {
    const {error} = await supabase.from('products').delete().eq('id',id);
    if (error) { toast.error('Cannot delete — product may be referenced in orders'); return; }
    setProducts(prev => prev.filter(p=>p.id!==id));
    toast.success('Product deleted');
    setDeleteConfirm(null);
  };

  // Offer actions
  const toggleOffer = async (id: string, cur: boolean) => {
    await supabase.from('offers').update({is_active:!cur}).eq('id',id);
    setOffers(prev => prev.map(o => o.id===id?{...o,is_active:!cur}:o));
    toast.success(!cur ? 'Offer is now live' : 'Offer hidden');
  };
  const deleteOffer = async (id: string) => {
    await supabase.from('offers').delete().eq('id',id);
    setOffers(prev => prev.filter(o=>o.id!==id));
    toast.success('Offer deleted');
    setDeleteConfirm(null);
  };

  const tabs = [
    {key:'overview' as const, label:'Overview'},
    {key:'orders'   as const, label:`Orders (${orders.length})`},
    {key:'products' as const, label:'Products'},
    {key:'offers'   as const, label:'Offers'},
  ];

  return (
    <div className="min-h-screen py-6">
      {/* Modals */}
      {productModal && <ProductModal product={productModal} onSave={() => { fetchAll(); setProductModal(null); }} onClose={() => setProductModal(null)} />}
      {offerModal   && <OfferModal   offer={offerModal}    onSave={() => { fetchAll(); setOfferModal(null); }}   onClose={() => setOfferModal(null)} />}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full text-center space-y-4">
            <p className="font-semibold text-foreground">Delete this {deleteConfirm.type}?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-secondary">Cancel</button>
              <button onClick={() => deleteConfirm.type==='product' ? deleteProduct(deleteConfirm.id) : deleteOffer(deleteConfirm.id)}
                className="flex-1 py-2.5 rounded-full bg-destructive text-white text-sm font-medium hover:opacity-90">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Kiruba Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your bakery</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 rounded-full hover:bg-secondary text-muted-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
            </button>
            <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground">← Store</button>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-secondary text-muted-foreground"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab===tab.key?'bg-card shadow-sm text-foreground':'text-muted-foreground'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="ov" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {label:"Today's Orders",  value:String(todayOrders.length),                    icon:ShoppingBag, color:'text-primary'},
                  {label:"Today's Revenue", value:`₹${todayRev.toLocaleString('en-IN')}`,        icon:DollarSign,  color:'text-bakery-gold'},
                  {label:'Active Products', value:String(activeProd),                             icon:Package,     color:'text-accent'},
                  {label:'Total Revenue',   value:`₹${totalRev.toLocaleString('en-IN')}`,        icon:TrendingUp,  color:'text-green-600'},
                ].map(s => (
                  <div key={s.label} className="bg-card rounded-xl border border-border p-4">
                    <s.icon className={`w-5 h-5 ${s.color} mb-2`}/>
                    <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-3">Recent Orders</p>
                {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/></div>
                : orders.length===0 ? <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
                : orders.slice(0,5).map(order => (
                  <div key={order.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_name} • ₹{order.grand_total}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[order.order_status]||'bg-secondary'}`}>{order.order_status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <motion.div key="or" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3">
              {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/></div>
              : orders.length===0 ? <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
              : orders.map(order => (
                <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button className="w-full p-4 text-left" onClick={() => setExpandedOrder(expandedOrder===order.id?null:order.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{order.id}</p>
                          {expandedOrder===order.id?<ChevronDown className="w-3 h-3 text-muted-foreground"/>:<ChevronRight className="w-3 h-3 text-muted-foreground"/>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{order.customer_name} • {order.customer_phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[order.order_status]||'bg-secondary'}`}>{order.order_status}</span>
                        <p className="text-sm font-semibold text-foreground mt-1">₹{order.grand_total}</p>
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedOrder===order.id && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Items</p>
                            {order.order_items.map((item,i) => (
                              <div key={i} className="flex justify-between text-sm"><span>{item.name} × {item.quantity}</span><span className="text-muted-foreground">₹{item.price*item.quantity}</span></div>
                            ))}
                          </div>
                          <div><p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">Address</p><p className="text-sm text-foreground">{order.delivery_address}</p></div>
                          {order.notes && <div><p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">Notes</p><p className="text-sm text-foreground">{order.notes}</p></div>}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>💳 {order.payment_method==='cod'?'Cash on Delivery':'Razorpay'}</span>
                            <span className={order.payment_status==='paid'?'text-green-600 font-medium':''}>
                              {order.payment_status==='paid'?'✓ Paid':`Payment: ${order.payment_status}`}
                            </span>
                          </div>
                          {NEXT[order.order_status] && (
                            <button onClick={() => advanceOrder(order.id, order.order_status)}
                              className="w-full py-2.5 rounded-lg gradient-accent text-primary-foreground text-sm font-medium hover:opacity-90">
                              Mark as → {NEXT[order.order_status]}
                            </button>
                          )}
                          {order.order_status==='placed' && (
                            <button onClick={() => cancelOrder(order.id)}
                              className="w-full py-2 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/5">
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── PRODUCTS ── */}
          {activeTab === 'products' && (
            <motion.div key="pr" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3">
              <button onClick={() => setProductModal(blankProduct())}
                className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                <Plus className="w-4 h-4"/> Add New Product
              </button>
              {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/></div>
              : products.map(p => (
                <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  {p.image && <img src={p.image} alt={p.name} className={`w-14 h-14 rounded-lg object-cover shrink-0 ${p.is_available?'opacity-100':'opacity-40'}`}/>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className={`font-semibold text-sm truncate ${p.is_available?'text-foreground':'text-muted-foreground'}`}>{p.name}</h3>
                      {p.is_featured && <Star className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500"/>}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{p.category} • {p.diet_type}</p>
                    <p className="text-xs text-foreground mt-0.5">
                      {p.offer_price ? <><span className="line-through text-muted-foreground mr-1">₹{p.price}</span>₹{p.offer_price}</> : `₹${p.price}`}
                      {p.is_advance_order && <span className="ml-2 text-primary">📅</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleProduct(p.id,'is_featured',p.is_featured)} title={p.is_featured?'Remove from featured':'Mark as featured'}
                      className={`p-2 rounded-lg transition-colors ${p.is_featured?'bg-amber-50 text-amber-600 hover:bg-amber-100':'bg-secondary text-muted-foreground hover:bg-muted'}`}>
                      {p.is_featured?<Star className="w-3.5 h-3.5 fill-current"/>:<StarOff className="w-3.5 h-3.5"/>}
                    </button>
                    <button onClick={() => toggleProduct(p.id,'is_available',p.is_available)} title={p.is_available?'Hide':'Show'}
                      className={`p-2 rounded-lg transition-colors ${p.is_available?'bg-green-50 text-green-600 hover:bg-green-100':'bg-secondary text-muted-foreground hover:bg-muted'}`}>
                      {p.is_available?<Eye className="w-3.5 h-3.5"/>:<EyeOff className="w-3.5 h-3.5"/>}
                    </button>
                    <button onClick={() => setProductModal({...p})} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-muted transition-colors">
                      <Pencil className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => setDeleteConfirm({type:'product',id:p.id})} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── OFFERS ── */}
          {activeTab === 'offers' && (
            <motion.div key="of" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3">
              <button onClick={() => setOfferModal({})}
                className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                <Plus className="w-4 h-4"/> Add New Offer
              </button>
              <p className="text-xs text-muted-foreground text-center">Active offers appear in the Today's Offers section on the homepage</p>
              {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/></div>
              : offers.map(offer => (
                <div key={offer.id} className={`bg-card rounded-xl border p-4 ${offer.is_active?'border-border':'border-border/50 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {offer.badge && <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1.5">{offer.badge}</span>}
                      <p className="font-semibold text-foreground text-sm">{offer.title}</p>
                      {offer.description && <p className="text-xs text-muted-foreground mt-0.5">{offer.description}</p>}
                      {offer.discount_pct > 0 && <p className="text-xs font-bold text-primary mt-1">{offer.discount_pct}% OFF</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleOffer(offer.id, offer.is_active)} title={offer.is_active?'Deactivate':'Activate'}
                        className={`p-2 rounded-lg transition-colors ${offer.is_active?'bg-green-50 text-green-600 hover:bg-green-100':'bg-secondary text-muted-foreground hover:bg-muted'}`}>
                        <Gift className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={() => setOfferModal({...offer})} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-muted transition-colors">
                        <Pencil className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={() => setDeleteConfirm({type:'offer',id:offer.id})} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${offer.is_active?'bg-green-500':'bg-muted-foreground'}`}/>
                    <span className="text-xs text-muted-foreground">{offer.is_active?'Live on homepage':'Hidden'}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Root ──────────────────────────────────────────────────────────────────────
const Admin = () => {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('ck_admin') === '1');
  const handleLogout = () => { sessionStorage.removeItem('ck_admin'); setLoggedIn(false); };
  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;
