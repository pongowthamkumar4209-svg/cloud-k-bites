import { useCallback } from 'react';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayPaymentParams {
  razorpayOrderId: string;
  amount: number;
  name: string;
  email?: string;
  phone?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (reason: string) => void;
}

export const useRazorpay = () => {
  const openPayment = useCallback(async (params: RazorpayPaymentParams) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { params.onFailure('Failed to load payment gateway.'); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_REPLACE_ME',
      amount: params.amount * 100,
      currency: 'INR',
      name: 'Cloud K Bites ☁️',
      description: 'Bakery Order',
      order_id: params.razorpayOrderId,
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        params.onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      prefill: { name: params.name, email: params.email || '', contact: params.phone || '' },
      theme: { color: 'hsl(350, 70%, 65%)' },
      modal: { ondismiss: () => params.onFailure('Payment cancelled') },
    });
    rzp.open();
  }, []);

  return { openPayment };
};
