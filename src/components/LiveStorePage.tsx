import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingCart,
  Smartphone,
  X
} from 'lucide-react';
import type { PageType, SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import { formatCurrency, getCurrentStoreForUser } from '../lib/store';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';

interface LiveStorePageProps {
  navigate: (page: PageType) => void;
  currentUser: SessionUser | null;
}

type PageId = 'home' | 'shop' | 'about' | 'contact';
type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'success';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  product_images?: Array<{ public_url: string | null }>;
};

type CartItem = Product & { quantity: number };

type StorePageRow = {
  page_type: PageId;
  title: string;
  description: string | null;
  content: Record<string, string>;
  show_in_nav: boolean;
};

type AssetRow = {
  asset_type: string;
  public_url: string | null;
};

export function LiveStorePage({ navigate, currentUser }: LiveStorePageProps) {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'bank_transfer'>('mpesa');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState('');
  const [store, setStore] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);
  const [pages, setPages] = useState<StorePageRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const currentStore = currentUser ? await getCurrentStoreForUser(currentUser) : await getFirstLiveStore();

        if (!currentStore) {
          setStore(null);
          setProducts([]);
          setPages([]);
          setAssets([]);
          return;
        }

        const [themeResult, pagesResult, productsResult, assetsResult, paymentSettingsResult] = await Promise.all([
          supabase.from('store_themes').select('*').eq('store_id', currentStore.id).maybeSingle(),
          supabase
            .from('store_pages')
            .select('page_type, title, description, content, show_in_nav')
            .eq('store_id', currentStore.id)
            .order('sort_order'),
          supabase
            .from('products')
            .select('id, name, price, description, product_images(public_url)')
            .eq('store_id', currentStore.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),
          supabase
            .from('store_assets')
            .select('asset_type, public_url')
            .eq('store_id', currentStore.id)
          ,
          supabase
            .from('store_payment_settings')
            .select('mpesa_shortcode, mpesa_environment, bank_name, bank_account_name, bank_account_number, bank_branch, card_payments_enabled')
            .eq('store_id', currentStore.id)
            .maybeSingle()
        ]);

        if (themeResult.error) throw themeResult.error;
        if (pagesResult.error) throw pagesResult.error;
        if (productsResult.error) throw productsResult.error;
        if (assetsResult.error) throw assetsResult.error;
        if (paymentSettingsResult.error) throw paymentSettingsResult.error;

        setStore(currentStore);
        setTheme(themeResult.data);
        setPages((pagesResult.data ?? []) as StorePageRow[]);
        setProducts((productsResult.data ?? []) as Product[]);
        setAssets((assetsResult.data ?? []) as AssetRow[]);
        setPaymentSettings(paymentSettingsResult.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load live store.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentUser]);

  const sitePages = useMemo(() => {
    const fallback: Array<{ id: PageId; label: string }> = [
      { id: 'home', label: 'Home' },
      { id: 'shop', label: 'Shop' },
      { id: 'about', label: 'About' },
      { id: 'contact', label: 'Contact' }
    ];
    if (!pages.length) return fallback;
    return pages
      .filter((page) => page.show_in_nav)
      .map((page) => ({ id: page.page_type, label: page.title || capitalize(page.page_type) }));
  }, [pages]);

  const homePage = pages.find((page) => page.page_type === 'home');
  const aboutPage = pages.find((page) => page.page_type === 'about');
  const contactPage = pages.find((page) => page.page_type === 'contact');
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const heroImage = assets.find((asset) => asset.asset_type === 'hero')?.public_url;
  const aboutImage = assets.find((asset) => asset.asset_type === 'about')?.public_url;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutStep === 'shipping') {
      setCheckoutStep('payment');
      return;
    }

    if (checkoutStep !== 'payment' || !store) {
      return;
    }

    setIsProcessing(true);

    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          store_id: store.id,
          full_name: shipping.fullName,
          email: shipping.email,
          phone: shipping.phone
        })
        .select('id')
        .single();

      if (customerError) throw customerError;

      const { data: address, error: addressError } = await supabase
        .from('customer_addresses')
        .insert({
          customer_id: customer.id,
          label: 'Primary',
          line1: shipping.address,
          city: null,
          region: null,
          country: store.country || 'Kenya',
          is_default: true
        })
        .select('id')
        .single();

      if (addressError) throw addressError;

      const orderNumber = `FZ-${Date.now().toString().slice(-6)}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: store.id,
          customer_id: customer.id,
          shipping_address_id: address.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          fulfillment_status: 'unfulfilled',
          payment_method: paymentMethod,
          subtotal: cartTotal,
          shipping_amount: 0,
          total_amount: cartTotal,
          currency_code: store.currency_code || 'KES'
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from('order_items').insert(
        cart.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          line_total: item.price * item.quantity
        }))
      );

      if (itemsError) throw itemsError;

      const paymentPayload = getPaymentPayload({
        orderId: order.id,
        storeId: store.id,
        paymentMethod,
        cartTotal,
        currencyCode: store.currency_code || 'KES',
        paymentSettings
      });

      const { error: paymentError } = await supabase.from('payments').insert(paymentPayload);
      if (paymentError) throw paymentError;

      setSuccessOrder(order.order_number);
      setCart([]);
      setCheckoutStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading store...
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">No live store is available yet.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {error && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('store-builder')}
                className="hidden md:flex text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Builder
              </Button>
            )}
            <button type="button" className="font-bold text-xl text-primary" onClick={() => setActivePage('home')}>
              {store.name}
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            {sitePages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activePage === page.id ? 'bg-primary text-primary-foreground' : 'hover:text-primary'
                }`}
              >
                {page.label}
              </button>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              setIsCartOpen(true);
              setCheckoutStep('cart');
            }}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <section className="px-6 py-20 md:py-28 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_45%,#f0fdf4_100%)]">
              <div className="container mx-auto max-w-6xl grid items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
                <div>
                  <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {homePage?.content?.eyebrow ?? 'Live storefront'}
                  </p>
                  <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight text-foreground">
                    {homePage?.content?.title ?? homePage?.title ?? store.name}
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                    {homePage?.content?.subtitle ?? homePage?.description ?? store.description}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button size="lg" onClick={() => setActivePage('shop')}>
                      {homePage?.content?.cta ?? 'Shop Collection'}
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setActivePage('about')}>
                      Learn Our Story
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="rounded-[28px] overflow-hidden border-border/60">
                    {heroImage ? (
                      <img src={heroImage} alt={store.name} className="aspect-[4/5] w-full object-cover" />
                    ) : (
                      <div className="aspect-[4/5] bg-orange-100" />
                    )}
                  </Card>
                  <div className="grid gap-4">
                    <Card className="rounded-[28px] overflow-hidden border-border/60">
                      <div className="aspect-[4/3] bg-emerald-100" />
                    </Card>
                    <Card className="rounded-[28px] border-border/60">
                      <CardContent className="p-6">
                        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Pages</p>
                        <p className="mt-3 text-2xl font-semibold text-foreground">
                          {sitePages.map((page) => page.label).join(', ')}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Powered by your Supabase store content.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === 'shop' && (
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-primary">Shop</p>
                  <h2 className="mt-3 text-4xl font-bold text-foreground">
                    {pages.find((page) => page.page_type === 'shop')?.title ?? 'Browse the collection'}
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  {pages.find((page) => page.page_type === 'shop')?.description ?? 'Products loaded from your live catalog.'}
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden group border-border/50 hover:shadow-md transition-all rounded-[28px]">
                    {product.product_images?.[0]?.public_url ? (
                      <img
                        src={product.product_images[0].public_url ?? ''}
                        alt={product.name}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-square bg-muted relative" />
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg text-foreground mb-2">{product.name}</h3>
                      <p className="text-muted-foreground mb-2 font-medium">
                        {formatCurrency(product.price, store.currency_code)}
                      </p>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                        {product.description ?? 'No description provided.'}
                      </p>
                      <Button className="w-full" onClick={() => addToCart(product)}>
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {activePage === 'about' && (
          <section className="py-20 px-6 bg-muted/10">
            <div className="container mx-auto max-w-6xl grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <Card className="rounded-[32px] overflow-hidden border-border/60">
                {aboutImage ? (
                  <img src={aboutImage} alt={`${store.name} about`} className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/5] bg-stone-200" />
                )}
              </Card>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-primary">About</p>
                <h2 className="mt-3 text-4xl font-bold text-foreground">
                  {aboutPage?.title ?? `About ${store.name}`}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-8">
                  {aboutPage?.content?.body ?? aboutPage?.description ?? store.description ?? 'Tell your story here.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {activePage === 'contact' && (
          <section className="py-20 px-6 bg-muted/30">
            <div className="container mx-auto max-w-6xl grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <Card className="rounded-[32px] border-none bg-slate-950 text-slate-50">
                <CardContent className="p-8">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Contact</p>
                  <h2 className="mt-3 text-3xl font-bold">
                    {contactPage?.title ?? 'Reach the store team'}
                  </h2>
                  <p className="mt-4 text-slate-300 leading-7">
                    {contactPage?.description ?? contactPage?.content?.body ?? 'Use this page for support or wholesale enquiries.'}
                  </p>
                  <div className="mt-8 space-y-3 text-sm text-slate-300">
                    <p>{store.contact_email ?? 'No email set'}</p>
                    <p>{store.contact_phone ?? 'No phone set'}</p>
                    <p>{store.business_address ?? 'No address set'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-border/60 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Name">
                        <Input placeholder="Your Name" />
                      </Field>
                      <Field label="Email">
                        <Input type="email" placeholder="Your Email" />
                      </Field>
                    </div>
                    <Field label="Subject">
                      <Input placeholder="How can we help?" />
                    </Field>
                    <Field label="Message">
                      <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tell us more" />
                    </Field>
                    <Button className="w-full h-12 text-lg mt-2">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <footer className="py-12 px-6 text-center border-t border-border bg-card">
        <div className="container mx-auto">
          <div className="font-bold text-2xl text-primary mb-4">{store.name}</div>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {sitePages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setActivePage(page.id)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {page.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {store.name}. Powered by FEZZY.
          </p>
        </div>
      </footer>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

          <div className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col border-l border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {checkoutStep === 'cart' && <><ShoppingCart className="h-5 w-5" /> Your Cart</>}
                {checkoutStep === 'shipping' && 'Shipping Details'}
                {checkoutStep === 'payment' && 'Payment'}
                {checkoutStep === 'success' && 'Order Complete'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {checkoutStep === 'cart' &&
                (cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <ShoppingCart className="h-16 w-16 opacity-20" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        {item.product_images?.[0]?.public_url ? (
                          <img src={item.product_images[0].public_url ?? ''} alt={item.name} className="w-20 h-20 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-20 h-20 rounded-md bg-muted shrink-0" />
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-foreground line-clamp-2">{item.name}</h4>
                            <p className="text-muted-foreground text-sm mt-1">
                              {formatCurrency(item.price, store.currency_code)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-border rounded-md">
                              <button className="p-1 hover:bg-muted transition-colors" onClick={() => updateQuantity(item.id, -1)}>
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button className="p-1 hover:bg-muted transition-colors" onClick={() => updateQuantity(item.id, 1)}>
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

              {checkoutStep === 'shipping' && (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                  <Field label="Full Name">
                    <Input required value={shipping.fullName} onChange={(e) => setShipping((c) => ({ ...c, fullName: e.target.value }))} />
                  </Field>
                  <Field label="Email">
                    <Input required type="email" value={shipping.email} onChange={(e) => setShipping((c) => ({ ...c, email: e.target.value }))} />
                  </Field>
                  <Field label="Phone Number">
                    <Input required type="tel" value={shipping.phone} onChange={(e) => setShipping((c) => ({ ...c, phone: e.target.value }))} />
                  </Field>
                  <Field label="Delivery Address">
                    <textarea
                      required
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={shipping.address}
                      onChange={(e) => setShipping((c) => ({ ...c, address: e.target.value }))}
                    />
                  </Field>
                </form>
              )}

              {checkoutStep === 'payment' && (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'mpesa' ? 'border-emerald-500 bg-emerald-50/10' : 'border-border'}`}>
                    <input type="radio" className="sr-only" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                    <Smartphone className="h-6 w-6 mr-3 text-emerald-600" />
                    <div className="flex-1">
                      <p className="font-medium">M-Pesa</p>
                      <p className="text-xs text-muted-foreground">
                        {paymentSettings?.mpesa_shortcode ? `Shortcode ${paymentSettings.mpesa_shortcode}` : 'Configure shortcode in settings'}
                      </p>
                    </div>
                    {paymentMethod === 'mpesa' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </label>

                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50/10' : 'border-border'}`}>
                    <input type="radio" className="sr-only" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Card</p>
                      <p className="text-xs text-muted-foreground">
                        {paymentSettings?.card_payments_enabled ? 'Card payments enabled' : 'Enable card payments in settings'}
                      </p>
                    </div>
                    {paymentMethod === 'card' && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                  </label>

                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" className="sr-only" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                    <Building2 className="h-6 w-6 mr-3 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">
                        {paymentSettings?.bank_account_number ? `${paymentSettings.bank_name || 'Bank'} • ${paymentSettings.bank_account_number}` : 'Configure bank details in settings'}
                      </p>
                    </div>
                    {paymentMethod === 'bank_transfer' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </label>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Order Confirmed!</h3>
                  <p className="text-muted-foreground max-w-[250px]">
                    Thank you for your purchase. Your order {successOrder} has been received.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal, store.currency_code)}</span>
              </div>
              {checkoutStep === 'cart' && cart.length > 0 && (
                <Button className="w-full h-12" onClick={() => setCheckoutStep('shipping')}>
                  Continue to Checkout
                </Button>
              )}
              {(checkoutStep === 'shipping' || checkoutStep === 'payment') && (
                <Button className="w-full h-12" form="checkout-form" type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : checkoutStep === 'shipping' ? (
                    'Continue to Payment'
                  ) : (
                    'Place Order'
                  )}
                </Button>
              )}
              {checkoutStep === 'success' && (
                <Button
                  className="w-full h-12"
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep('cart');
                  }}
                >
                  Continue Shopping
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function getFirstLiveStore() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('status', 'live')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getPaymentPayload({
  orderId,
  storeId,
  paymentMethod,
  cartTotal,
  currencyCode,
  paymentSettings
}: {
  orderId: string;
  storeId: string;
  paymentMethod: 'mpesa' | 'card' | 'bank_transfer';
  cartTotal: number;
  currencyCode: string;
  paymentSettings: any;
}) {
  const providerReference =
    paymentMethod === 'mpesa'
      ? paymentSettings?.mpesa_shortcode || `mpesa-${orderId}`
      : paymentMethod === 'bank_transfer'
        ? paymentSettings?.bank_account_number || `bank-${orderId}`
        : `card-${orderId}`;

  return {
    order_id: orderId,
    store_id: storeId,
    provider:
      paymentMethod === 'mpesa'
        ? 'mpesa'
        : paymentMethod === 'bank_transfer'
          ? 'bank_transfer'
          : 'card',
    provider_reference: providerReference,
    method: paymentMethod,
    status: 'pending',
    amount: cartTotal,
    currency_code: currencyCode,
    raw_payload: {
      payment_method: paymentMethod,
      configured_shortcode: paymentSettings?.mpesa_shortcode ?? null,
      configured_bank_account: paymentSettings?.bank_account_number ?? null,
      card_enabled: paymentSettings?.card_payments_enabled ?? false
    }
  };
}
