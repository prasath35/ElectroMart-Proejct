/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Divider,
  Alert
} from "@mui/material";
import { 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  Lock, 
  BellRing, 
  Truck, 
  Store, 
  Heart, 
  Database,
  SlidersHorizontal,
  ChevronDown,
  Megaphone,
  Sparkles,
  UserCheck
} from "lucide-react";

import { Product, CartItem, Order, Coupon, Address, UserRole } from "./types";
import StoreFront from "./components/StoreFront";
import ProductDetail from "./components/ProductDetail";
import CartDrawer from "./components/CartDrawer";
import CheckoutPage from "./components/CheckoutPage";
import DeliveryPortal from "./components/DeliveryPortal";
import SellerPortal from "./components/SellerPortal";
import AdminPortal from "./components/AdminPortal";
import ProfileSecurity from "./components/ProfileSecurity";
import AIWidget from "./components/AIWidget";
import LoginScreen from "./components/LoginScreen";

export default function App() {
  // Authentication states
  interface LoggedInUser {
    email: string;
    name: string;
    role: UserRole;
  }
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    const mail = params.get("email");
    if (token && mail) {
      setResetToken(token);
      setResetEmail(decodeURIComponent(mail));
      setCurrentUser(null); // Ensure login page shows reset form
    }
  }, []);

  const handleLoginSuccess = (user: { email: string; name: string; role: UserRole }) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setResetToken(null);
    setResetEmail(null);
    
    // Clear URL parameters for perfect visuals
    if (window.history.pushState) {
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newurl }, '', newurl);
    }

    // Direct user to correct view context
    if (user.role === "Seller") setActiveView("seller");
    else if (user.role === "DeliveryAgent") setActiveView("delivery");
    else if (user.role === "Admin") setActiveView("admin");
    else setActiveView("store");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRole("Guest");
    setActiveView("store");
  };

  // Roles Management state
  const [activeRole, setActiveRole] = useState<UserRole>("SuperAdmin");
  const [roleAnchorEl, setRoleAnchorEl] = useState<null | HTMLElement>(null);

  // Layout View Manager
  const [activeView, setActiveView] = useState<"store" | "product-detail" | "cart" | "checkout" | "delivery" | "seller" | "admin" | "profile">("store");

  // Global variables datasets
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  // Checkout totals applied coupon references
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // System-wide notification broadcaster alerts
  const [activeAnnouncementAlert, setActiveAnnouncementAlert] = useState<string | null>(
    "🔥 EXTREME DEAL: Get up to 15% discount instantly on orders above $100 using active coupon WELCOME10!"
  );

  // Load baseline products & orders from server APIs
  const loadPlatformData = async () => {
    try {
      // 1. Products
      const r1 = await fetch("/api/products");
      if (r1.ok) {
        const d1 = await r1.json();
        setProductsList(d1);
      }
      
      // 2. Orders
      const r2 = await fetch("/api/orders");
      if (r2.ok) {
        const d2 = await r2.json();
        setOrdersList(d2);
      }

      // 3. Addresses
      const r3 = await fetch("/api/profile/addresses");
      if (r3.ok) {
        const d3 = await r3.json();
        setSavedAddresses(d3);
      }
    } catch (err) {
      console.error("Failed synchronizing baseline database statistics", err);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // Sync back product view elements on detail clicks
  const currentSelectedProduct = productsList.find(p => p.id === selectedProductId);

  // Cart operations
  const handleAddToCart = (p: Product, qty: number, variant: Record<string, string>) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === p.id && JSON.stringify(item.selectedVariant) === JSON.stringify(variant));
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += qty;
        return next;
      }
      return [...prev, { product: p, quantity: qty, selectedVariant: variant }];
    });
  };

  const handleUpdateCartQty = (item: CartItem, delta: number) => {
    setCart(prev => prev.map(it => {
      if (it.product.id === item.product.id && JSON.stringify(it.selectedVariant) === JSON.stringify(item.selectedVariant)) {
        return { ...it, quantity: Math.max(1, it.quantity + delta) };
      }
      return it;
    }));
  };

  const handleRemoveCartItem = (item: CartItem) => {
    setCart(prev => prev.filter(it => !(it.product.id === item.product.id && JSON.stringify(it.selectedVariant) === JSON.stringify(item.selectedVariant))));
  };

  // Wishlist operations
  const handleAddToWishlist = (p: Product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === p.id)) return prev;
      return [...prev, p];
    });
  };

  const handleRemoveFromWishlist = (p: Product) => {
    setWishlist(prev => prev.filter(item => item.id !== p.id));
  };

  const handleAddToCartFromWishlist = (p: Product) => {
    handleAddToCart(p, 1, {});
    handleRemoveFromWishlist(p);
  };

  // Add Address Handler
  const handleAddAddress = async (newAddr: any) => {
    try {
      const res = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr)
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(prev => [...prev, data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  // Create Order Completed
  const handleOrderCompleted = (createdOrder: any) => {
    setOrdersList(prev => [createdOrder, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    // Directly swap to tracking view
    setActiveView("delivery");
  };

  // Update order status (Delivery Agent trigger)
  const handleUpdateOrderStatus = async (orderId: string, status: string, description: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, description })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrdersList(prev => prev.map(o => o.id === orderId ? updated : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Listing (Seller portal list addition)
  const handleAddNewProductListing = async (newP: any) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newP)
      });
      if (res.ok) {
        const created = await res.json();
        setProductsList(prev => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk uploading
  const handleBulkUploadProducts = async (csvText: string) => {
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText })
      });
      if (res.ok) {
        loadPlatformData(); // Reload all
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProductStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        const updated = await res.json();
        setProductsList(prev => prev.map(p => p.id === id ? { ...p, stock: updated.stock } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic replies on customer questions
  const handleAnswerQna = async (productId: string, qnaId: string, answer: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/qna/${qnaId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, answeredBy: "Platform Merchant" })
      });
      if (res.ok) {
        // Reload dataset
        loadPlatformData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin creations
  const handleAddCoupon = async (newCoupon: Coupon) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        loadPlatformData(); // Refresh coupons
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAnnouncement = (msg: string) => {
    setActiveAnnouncementAlert(msg);
  };

  // Pricing helper
  const subtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const deliveryFee = subtotal > 150 ? 0 : 15;
  const checkoutTotal = parseFloat((subtotal + tax + deliveryFee - discountAmount).toFixed(2));

  return (
    <Box className="min-h-screen bg-slate-50 flex flex-col font-sans" sx={{ letterSpacing: "-0.01em" }}>
      
      {/* Broadcaster Alert Banner Campaign */}
      {activeAnnouncementAlert && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 text-white text-xs font-semibold py-2 px-4 flex justify-between items-center text-center shadow-inner relative z-[1001]">
          <div className="flex items-center gap-1.5 mx-auto">
            <Megaphone className="w-3.5 h-3.5 animate-bounce" />
            <span>{activeAnnouncementAlert}</span>
          </div>
          <button 
            onClick={() => setActiveAnnouncementAlert(null)}
            className="text-white hover:text-slate-200 transition-colors opacity-90 absolute right-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Paper elevation={2} className="sticky top-0 z-[1000] border-b border-slate-100 bg-white p-3.5 flex justify-between items-center rounded-none">
        
        {/* Brand logo */}
        <div 
          onClick={() => setActiveView("store")} 
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <span className="text-xl">⚡</span>
          <Typography variant="h6" className="font-extrabold tracking-tight text-slate-900 text-base md:text-lg">
            ElectroMart <span className="text-indigo-600">eCommerce</span>
          </Typography>
        </div>

        {/* Dynamic tabs list depending on active swapper Role permissions */}
        {currentUser && (
          <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-slate-600">
            {/* Guest role tab permissions */}
            <button onClick={() => setActiveView("store")} className={`hover:text-indigo-600 transition-colors ${activeView === "store" ? "text-indigo-600 border-b-2 border-indigo-600 pb-0.5" : ""}`}>Marketplace</button>
            
            {/* Customer views */}
            {(activeRole === "Customer" || activeRole === "Admin" || activeRole === "SuperAdmin") && (
              <>
                <button onClick={() => { if (ordersList.length > 0) { setActiveView("delivery"); } else { alert("Please place an order first to experience order timeline mapping!"); } }} className={`hover:text-indigo-600 transition-colors ${activeView === "delivery" ? "text-indigo-600 border-b-2 border-indigo-600 pb-0.5" : ""}`}>Live Tracking</button>
                <button onClick={() => setActiveView("profile")} className={`hover:text-indigo-600 transition-colors ${activeView === "profile" ? "text-indigo-600 border-b-2 border-indigo-600 pb-0.5" : ""}`}>Account Center</button>
              </>
            )}

            {/* Seller view */}
            {(activeRole === "Seller" || activeRole === "Admin" || activeRole === "SuperAdmin") && (
              <button onClick={() => setActiveView("seller")} className={`hover:text-amber-600 transition-colors flex items-center gap-1 ${activeView === "seller" ? "text-amber-600 border-b-2 border-amber-600 pb-0.5" : ""}`}>
                <Store className="w-3.5 h-3.5" />
                Seller Studio
              </button>
            )}

            {/* Admin center */}
            {(activeRole === "Admin" || activeRole === "SuperAdmin") && (
              <button onClick={() => setActiveView("admin")} className={`hover:text-indigo-600 transition-colors ${activeView === "admin" ? "text-indigo-600 border-b-2 border-indigo-600 pb-0.5" : ""}`}>Administrative Hub</button>
            )}
          </div>
        )}

        {/* Right Nav Options: Role Swapper dropdown & Basket icon */}
        <div className="flex items-center gap-3">
          
          {currentUser && (
            <div className="hidden md:flex flex-col text-right text-xs shrink-0">
              <span className="font-bold text-slate-800 leading-none">{currentUser.name}</span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5">{currentUser.role} Account</span>
            </div>
          )}

          {/* Role selection Button */}
          {currentUser && (
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => setRoleAnchorEl(e.currentTarget)}
              endIcon={<ChevronDown className="w-3.5 h-3.5" />}
              className="rounded-xl border-slate-200 text-slate-800 text-[10px] md:text-xs font-bold py-1 px-2.5 h-8 whitespace-nowrap bg-slate-50 hover:bg-slate-100 flex items-center gap-1"
              sx={{ textTransform: 'none' }}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Role:</span> {activeRole}
            </Button>
          )}

          {currentUser && (
            <Menu
              anchorEl={roleAnchorEl}
              open={Boolean(roleAnchorEl)}
              onClose={() => setRoleAnchorEl(null)}
              slotProps={{ paper: { className: "rounded-xl font-sans mt-1 p-1 shadow-md w-44 border border-slate-100" } }}
            >
              {[
                { roleName: "Guest", desc: "No login, browse cards" },
                { roleName: "Customer", desc: "Buy goods, track deliveries" },
                { roleName: "Seller", desc: "Vendors upload inventory" },
                { roleName: "DeliveryAgent", desc: "Dispatch trucks coordinates" },
                { roleName: "Admin", desc: "Manage coupons & moderation" },
                { roleName: "SuperAdmin", desc: "Universal full system control" }
              ].map((v) => (
                <MenuItem
                  key={v.roleName}
                  selected={activeRole === v.roleName}
                  onClick={() => {
                    setActiveRole(v.roleName as UserRole);
                    setRoleAnchorEl(null);

                    // Auto navigate to fitting views for better UX
                    if (v.roleName === "Seller") setActiveView("seller");
                    else if (v.roleName === "DeliveryAgent") setActiveView("delivery");
                    else if (v.roleName === "Admin") setActiveView("admin");
                    else setActiveView("store");
                  }}
                  className="flex flex-col items-start p-2 rounded-lg"
                >
                  <span className="font-bold text-xs text-slate-800 leading-none">{v.roleName}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{v.desc}</span>
                </MenuItem>
              ))}
            </Menu>
          )}

          {currentUser && (
            <Button
              size="small"
              onClick={handleLogout}
              className="rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-50 border py-1 px-2.5 h-8 text-[10px] md:text-xs normal-case"
            >
              Log Out
            </Button>
          )}

          {/* Basket clicker */}
          {currentUser && (
            <IconButton onClick={() => setActiveView("cart")} className="relative bg-slate-100 text-slate-900 border border-slate-200" size="small">
              <Badge badgeContent={cart.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '9px', fontWeight: 'bold' } }}>
                <ShoppingBag className="w-4 h-4" />
              </Badge>
            </IconButton>
          )}
        </div>
      </Paper>

      {/* Main interactive application container body */}
      <Box className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
        
        {!currentUser ? (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess}
            initialResetToken={resetToken}
            initialResetEmail={resetEmail}
          />
        ) : (
          <>
            {activeView === "store" && (
              <StoreFront
                products={productsList}
                onProductClick={(id) => {
                  setSelectedProductId(id);
                  setActiveView("product-detail");
                }}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            )}

            {activeView === "product-detail" && currentSelectedProduct && (
              <ProductDetail
                product={currentSelectedProduct}
                allProducts={productsList}
                onBack={() => setActiveView("store")}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            )}

            {activeView === "cart" && (
              <CartDrawer
                cart={cart}
                wishlist={wishlist}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveCartItem}
                onMoveToWishlist={(item) => {
                  handleAddToWishlist(item.product);
                  handleRemoveCartItem(item);
                }}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                onAddToCartFromWishlist={handleAddToCartFromWishlist}
                onCheckout={(coupon, descVal) => {
                  setAppliedCoupon(coupon);
                  setDiscountAmount(descVal);
                  setActiveView("checkout");
                }}
              />
            )}

            {activeView === "checkout" && (
              <CheckoutPage
                cart={cart}
                subtotal={subtotal}
                discount={discountAmount}
                deliveryFee={deliveryFee}
                tax={tax}
                total={checkoutTotal}
                savedAddresses={savedAddresses}
                onAddAddress={handleAddAddress}
                onOrderCompleted={handleOrderCompleted}
                onBackToCart={() => setActiveView("cart")}
                couponCode={appliedCoupon?.code}
              />
            )}

            {activeView === "delivery" && (
              <DeliveryPortal
                orders={ordersList}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeView === "seller" && (
              <SellerPortal
                products={productsList}
                orders={ordersList}
                onAddNewProduct={handleAddNewProductListing}
                onBulkUploadProducts={handleBulkUploadProducts}
                onUpdateStock={handleUpdateProductStock}
                onAnswerQna={handleAnswerQna}
              />
            )}

            {activeView === "admin" && (
              <AdminPortal
                orders={ordersList}
                couponsList={[]} // Loaded statically in portal itself
                onAddCoupon={handleAddCoupon}
                onSendAnnouncement={handleSendAnnouncement}
              />
            )}

            {activeView === "profile" && (
              <ProfileSecurity
                savedAddresses={savedAddresses}
                onAddAddress={handleAddAddress}
                onDeleteAddress={handleDeleteAddress}
              />
            )}
          </>
        )}

      </Box>

      {/* Persistent floating AI Support chatbot assistant */}
      <AIWidget currentRole={activeRole} />

      {/* Fixed bottom professional footer */}
      <footer className="bg-white border-t border-slate-100 py-4 text-center text-slate-400 text-[10px] uppercase tracking-wider font-mono">
        © 2026 ElectroMart eCommerce. All Rights Reserved. PCI-DSS secure card processing. Powered by Google AI Studio Gemini Server.
      </footer>

    </Box>
  );
}
