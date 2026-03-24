// supabase/functions/create-razorpay-order/index.ts
// Deploy: supabase functions deploy create-razorpay-order
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { amount } = await req.json();
    if (!amount || amount < 1) return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount * 100, currency: 'INR', receipt: `CK-${Date.now().toString(36).toUpperCase()}` }),
    });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ error: data.error?.description || 'Razorpay error' }), { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ razorpayOrderId: data.id }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
