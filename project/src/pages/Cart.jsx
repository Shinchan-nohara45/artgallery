import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, CreditCard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock cart data
const initialCartItems = [
  {
    id: 1,
    name: "Abstract Harmony",
    artist: "Maria Gonzalez",
    price: 249.99,
    image: "/placeholder.svg",
    quantity: 1,
  },
  {
    id: 2,
    name: "Sunset Reflections",
    artist: "David Chen",
    price: 179.50,
    image: "/placeholder.svg",
    quantity: 1,
  }
];

// Checkout form schema
const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  state: z.string().min(2, { message: "State must be at least 2 characters" }),
  zipCode: z.string().min(5, { message: "Zip code must be at least 5 characters" }),
  cardNumber: z.string().min(16, { message: "Card number must be at least 16 digits" }).max(19),
  cardExpiry: z.string().min(5, { message: "Enter expiry in MM/YY format" }),
  cardCvc: z.string().min(3, { message: "CVC must be at least 3 digits" }),
});

// import { useCart } from "@/contexts/CartContext"; // Moved to top

const Cart = () => {
  const { cartItems, setCartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const checkoutForm = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 15;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;



  const handleCheckout = async (values) => {
    try {
        const orderData = {
            orderItems: cartItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                image: item.image,
                price: item.price,
                artwork: item.id || '65fac...', // Need real ID here. Mock data might fail if no real IDs.
                _id: item.id // Pass ID
            })),
            shippingAddress: {
                address: values.address,
                city: values.city,
                postalCode: values.zipCode,
                country: 'USA' // Default or add to form
            },
            paymentMethod: 'Credit Card',
            itemsPrice: subtotal,
            taxPrice: tax,
            shippingPrice: shipping,
            totalPrice: total,
        };

        // Note: For mock data, IDs might be integers (1, 2). Backend expects Mongo ObjectIds. 
        // If cartItems come from initialCartItems (mock), this WILL fail on backend validation.
        // We need to assume cart is populated with REAL data from Discover page first.
        
        // For now, assuming cartItems have real structure if added via real flow. 
        // If using mock initialCartItems, we should warn or clear them.
        
        const config = {
            headers: {
                Authorization: `Bearer ${currentUser.token}`,
            },
        };

        await axios.post('/api/orders', orderData, config);
        
        toast.success("Order placed successfully!");
        clearCart();
        setCheckoutOpen(false);
        navigate('/profile'); // Redirect to profile to see orders
    } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to place order: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-artbloom-cream">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-10 text-artbloom-charcoal">
            Your Shopping Cart
          </h1>
          
          {cartItems.length > 0 ? (
            <div className="grid md:grid-cols-12 gap-8">
              {/* Cart Items List */}
              <div className="md:col-span-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">by {item.artist}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="text-right min-w-[80px]">
                            <p className="text-lg font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id || item._id)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <Separator className="my-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="md:col-span-4">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-playfair font-semibold mb-4 text-artbloom-charcoal">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    
                    <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-artbloom-peach hover:bg-artbloom-peach/80 text-white mt-4"
                          onClick={() => navigate('/checkout')}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Checkout
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Checkout</DialogTitle>
                          <DialogDescription>
                            Complete your order by providing shipping and payment details.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...checkoutForm}>
                          <form onSubmit={checkoutForm.handleSubmit(handleCheckout)} className="space-y-6 pt-4">
                            <div className="space-y-4">
                              <h3 className="text-base font-semibold">Shipping Information</h3>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={checkoutForm.control}
                                  name="fullName"
                                  render={({ field }) => (
                                    <FormItem className="col-span-2">
                                      <FormLabel>Full Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={checkoutForm.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem className="col-span-2">
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={checkoutForm.control}
                                  name="address"
                                  render={({ field }) => (
                                    <FormItem className="col-span-2">
                                      <FormLabel>Address</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={checkoutForm.control}
                                  name="city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={checkoutForm.control}
                                    name="state"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={checkoutForm.control}
                                    name="zipCode"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Zip Code</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h3 className="text-base font-semibold">Payment Information</h3>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={checkoutForm.control}
                                  name="cardNumber"
                                  render={({ field }) => (
                                    <FormItem className="col-span-2">
                                      <FormLabel>Card Number</FormLabel>
                                      <FormControl>
                                        <Input placeholder="**** **** **** ****" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={checkoutForm.control}
                                  name="cardExpiry"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Expiry Date</FormLabel>
                                      <FormControl>
                                        <Input placeholder="MM/YY" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={checkoutForm.control}
                                  name="cardCvc"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>CVC</FormLabel>
                                      <FormControl>
                                        <Input placeholder="***" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            
                            <div className="pt-2">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Total Amount:</span>
                                <span className="font-semibold">${total.toFixed(2)}</span>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                className="w-full bg-artbloom-peach hover:bg-artbloom-peach/80"
                              >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Place Order - ${total.toFixed(2)}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/discover')}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mb-6">
                <ShoppingBag className="h-20 w-20 mx-auto text-gray-300" />
              </div>
              <h2 className="text-2xl font-playfair font-medium mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added any artwork to your cart yet.</p>
              <Button 
                className="bg-artbloom-peach hover:bg-artbloom-peach/80"
                onClick={() => navigate('/discover')}
              >
                Discover Artwork
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;