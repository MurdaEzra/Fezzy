import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Building2,
  Star } from
'lucide-react';
import type { PageType } from '../App';
interface LiveStorePageProps {
  navigate: (page: PageType) => void;
}
interface Product {
  id: number;
  name: string;
  price: number;
  color: string;
}
interface CartItem extends Product {
  quantity: number;
}
const storeProducts: Product[] = [
{
  id: 1,
  name: 'Premium Kikoy Fabric',
  price: 1500,
  color: 'bg-orange-200'
},
{
  id: 2,
  name: 'Handmade Maasai Necklace',
  price: 2200,
  color: 'bg-red-200'
},
{
  id: 3,
  name: 'Kenyan AA Coffee Beans (500g)',
  price: 1800,
  color: 'bg-amber-800'
},
{
  id: 4,
  name: 'Carved Wooden Elephant',
  price: 4500,
  color: 'bg-stone-300'
},
{
  id: 5,
  name: 'Kitenge Print Dress',
  price: 3500,
  color: 'bg-purple-300'
},
{
  id: 6,
  name: 'Leather Sandals (Akala)',
  price: 1200,
  color: 'bg-amber-600'
}];

export function LiveStorePage({ navigate }: LiveStorePageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    'cart' | 'shipping' | 'payment' | 'success'>(
    'cart');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'bank'>(
    'mpesa'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
        item.id === product.id ?
        {
          ...item,
          quantity: item.quantity + 1
        } :
        item
        );
      }
      return [
      ...prev,
      {
        ...product,
        quantity: 1
      }];

    });
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };
  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
    prev.
    map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return {
          ...item,
          quantity: newQuantity
        };
      }
      return item;
    }).
    filter((item) => item.quantity > 0)
    );
  };
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === 'shipping') {
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCheckoutStep('success');
        setCart([]);
      }, 2000);
    }
  };
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('store-builder')}
              className="hidden md:flex text-muted-foreground">

              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Builder
            </Button>
            <div
              className="font-bold text-xl text-primary cursor-pointer"
              onClick={() => scrollToSection('home')}>

              Mama Mboga
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('home')}
              className="text-sm font-medium hover:text-primary transition-colors">

              Home
            </button>
            <button
              onClick={() => scrollToSection('shop')}
              className="text-sm font-medium hover:text-primary transition-colors">

              Shop
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm font-medium hover:text-primary transition-colors">

              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium hover:text-primary transition-colors">

              Contact
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => {
                setIsCartOpen(true);
                setCheckoutStep('cart');
              }}>

              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 &&
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {cartItemCount}
                </span>
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section
          id="home"
          className="relative py-24 md:py-32 px-6 text-center border-b border-border bg-muted/30">

          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
              Fresh Groceries Delivered
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Get the freshest farm produce delivered straight to your doorstep
              in Nairobi. Quality guaranteed.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 h-14"
              onClick={() => scrollToSection('shop')}>

              Shop Now
            </Button>
          </div>
        </section>

        {/* Products Section */}
        <section id="shop" className="py-20 px-6 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {storeProducts.map((product) =>
              <Card
                key={product.id}
                className="overflow-hidden group border-border/50 hover:shadow-md transition-all">

                  <div className={`aspect-square ${product.color} relative`}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground mb-6 font-medium">
                      KES {product.price.toLocaleString()}
                    </p>
                    <Button
                    className="w-full"
                    onClick={() => addToCart(product)}>

                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="py-20 px-6 text-center border-b border-border bg-muted/10">

          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Our Story
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We started Mama Mboga to connect local farmers directly with urban
              consumers, ensuring fair prices and fresh produce every single
              day. By cutting out the middlemen, we guarantee that farmers get
              what they deserve while you get the best quality groceries.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-background border-border/50">
                <CardContent className="pt-8">
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      className="h-5 w-5 fill-amber-400 text-amber-400" />

                    )}
                  </div>
                  <p className="text-lg text-muted-foreground italic mb-8">
                    "The freshest produce I've ever bought online. Delivery was
                    fast and the quality is unmatched."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      J
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Jane Doe</p>
                      <p className="text-sm text-muted-foreground">Nairobi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background border-border/50">
                <CardContent className="pt-8">
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      className="h-5 w-5 fill-amber-400 text-amber-400" />

                    )}
                  </div>
                  <p className="text-lg text-muted-foreground italic mb-8">
                    "Mama Mboga has completely changed how I shop for groceries.
                    Highly recommended!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      K
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Kevin M.</p>
                      <p className="text-sm text-muted-foreground">Westlands</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto max-w-xl">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
              Get in Touch
            </h2>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <form
                  className="space-y-4"
                  onSubmit={(e) => e.preventDefault()}>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="Your Email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="How can we help you?">
                    </textarea>
                  </div>
                  <Button className="w-full h-12 text-lg mt-2">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-border bg-card">
        <div className="container mx-auto">
          <div className="font-bold text-2xl text-primary mb-4">Mama Mboga</div>
          <p className="text-muted-foreground mb-8">
            Fresh farm produce delivered to your doorstep.
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mama Mboga. Powered by FEZZY.
          </p>
        </div>
      </footer>

      {/* Cart Drawer Overlay */}
      {isCartOpen &&
      <div className="fixed inset-0 z-50 flex justify-end">
          <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)} />


          <div className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-border">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {checkoutStep === 'cart' &&
              <>
                    <ShoppingCart className="h-5 w-5" /> Your Cart
                  </>
              }
                {checkoutStep === 'shipping' && 'Shipping Details'}
                {checkoutStep === 'payment' && 'Payment'}
                {checkoutStep === 'success' && 'Order Complete'}
              </h2>
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}>

                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {checkoutStep === 'cart' && (
            cart.length === 0 ?
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <ShoppingCart className="h-16 w-16 opacity-20" />
                    <p>Your cart is empty</p>
                    <Button
                variant="outline"
                onClick={() => {
                  setIsCartOpen(false);
                  scrollToSection('shop');
                }}>

                      Continue Shopping
                    </Button>
                  </div> :

            <div className="space-y-6">
                    {cart.map((item) =>
              <div key={item.id} className="flex gap-4">
                        <div
                  className={`w-20 h-20 rounded-md ${item.color} shrink-0`} />

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-foreground line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="text-muted-foreground text-sm mt-1">
                              KES {item.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-border rounded-md">
                              <button
                        className="p-1 hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(item.id, -1)}>

                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                        className="p-1 hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(item.id, 1)}>

                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                      className="text-xs text-destructive hover:underline"
                      onClick={() =>
                      updateQuantity(item.id, -item.quantity)
                      }>

                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
              )}
                  </div>)
            }

              {checkoutStep === 'shipping' &&
            <form
              id="checkout-form"
              onSubmit={handleCheckout}
              className="space-y-4">

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input required placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                  required
                  type="email"
                  placeholder="john@example.com" />

                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input required type="tel" placeholder="+254 700 000000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Delivery Address
                    </label>
                    <textarea
                  required
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Street, Building, Apartment...">
                </textarea>
                  </div>
                </form>
            }

              {checkoutStep === 'payment' &&
            <form
              id="checkout-form"
              onSubmit={handleCheckout}
              className="space-y-6">

                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Select Payment Method
                    </label>

                    <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'mpesa' ? 'border-emerald-500 bg-emerald-50/10' : 'border-border hover:bg-muted/50'}`}>

                      <input
                    type="radio"
                    name="payment"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={() => setPaymentMethod('mpesa')}
                    className="sr-only" />

                      <Smartphone
                    className={`h-6 w-6 mr-3 ${paymentMethod === 'mpesa' ? 'text-emerald-600' : 'text-muted-foreground'}`} />

                      <div className="flex-1">
                        <p className="font-medium">M-Pesa</p>
                        <p className="text-xs text-muted-foreground">
                          Pay instantly via STK Push
                        </p>
                      </div>
                      {paymentMethod === 'mpesa' &&
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  }
                    </label>

                    <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50/10' : 'border-border hover:bg-muted/50'}`}>

                      <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only" />

                      <CreditCard
                    className={`h-6 w-6 mr-3 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-muted-foreground'}`} />

                      <div className="flex-1">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-muted-foreground">
                          Visa, Mastercard
                        </p>
                      </div>
                      {paymentMethod === 'card' &&
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  }
                    </label>

                    <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>

                      <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="sr-only" />

                      <Building2
                    className={`h-6 w-6 mr-3 ${paymentMethod === 'bank' ? 'text-primary' : 'text-muted-foreground'}`} />

                      <div className="flex-1">
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">
                          Manual transfer
                        </p>
                      </div>
                      {paymentMethod === 'bank' &&
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  }
                    </label>
                  </div>

                  {paymentMethod === 'mpesa' &&
              <div className="p-4 bg-muted/30 rounded-lg space-y-3 animate-in fade-in">
                      <label className="text-sm font-medium">
                        M-Pesa Phone Number
                      </label>
                      <Input
                  placeholder="07XX XXX XXX"
                  defaultValue="0712345678" />

                      <p className="text-xs text-muted-foreground">
                        A prompt will be sent to this number to enter your PIN.
                      </p>
                    </div>
              }
                </form>
            }

              {checkoutStep === 'success' &&
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Order Confirmed!
                  </h3>
                  <p className="text-muted-foreground max-w-[250px]">
                    Thank you for your purchase. Your order #FZ-
                    {Math.floor(Math.random() * 10000)} has been received.
                  </p>
                  <Button
                className="mt-8 w-full"
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutStep('cart');
                }}>

                    Continue Shopping
                  </Button>
                </div>
            }
            </div>

            {/* Drawer Footer */}
            {checkoutStep !== 'success' && cart.length > 0 &&
          <div className="p-4 border-t border-border bg-muted/10">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>KES {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>KES 300</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>KES {(cartTotal + 300).toLocaleString()}</span>
                  </div>
                </div>

                {checkoutStep === 'cart' &&
            <Button
              className="w-full h-12 text-lg"
              onClick={() => setCheckoutStep('shipping')}>

                    Checkout
                  </Button>
            }
                {checkoutStep === 'shipping' &&
            <div className="flex gap-2">
                    <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutStep('cart')}>

                      Back
                    </Button>
                    <Button
                className="flex-[2]"
                form="checkout-form"
                type="submit">

                      Continue to Payment
                    </Button>
                  </div>
            }
                {checkoutStep === 'payment' &&
            <div className="flex gap-2">
                    <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutStep('shipping')}
                disabled={isProcessing}>

                      Back
                    </Button>
                    <Button
                className="flex-[2]"
                form="checkout-form"
                type="submit"
                disabled={isProcessing}>

                      {isProcessing ?
                'Processing...' :
                `Pay KES ${(cartTotal + 300).toLocaleString()}`}
                    </Button>
                  </div>
            }
              </div>
          }
          </div>
        </div>
      }
    </div>);

}