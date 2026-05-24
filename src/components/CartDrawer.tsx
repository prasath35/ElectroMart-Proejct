import React, { useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  IconButton, 
  Button, 
  Divider, 
  TextField, 
  Chip, 
  Badge
} from "@mui/material";
import { 
  Trash2, 
  Minus, 
  Plus, 
  Percent, 
  ArrowRight, 
  ShoppingBag, 
  Heart,
  Undo2
} from "lucide-react";
import { CartItem, Product, Coupon } from "../types";

interface CartDrawerProps {
  cart: CartItem[];
  wishlist: Product[];
  onUpdateQty: (item: CartItem, delta: number) => void;
  onRemoveItem: (item: CartItem) => void;
  onMoveToWishlist: (item: CartItem) => void;
  onRemoveFromWishlist: (p: Product) => void;
  onAddToCartFromWishlist: (p: Product) => void;
  onCheckout: (appliedCoupon: Coupon | null, discountAmount: number) => void;
}

export default function CartDrawer({
  cart,
  wishlist,
  onUpdateQty,
  onRemoveItem,
  onMoveToWishlist,
  onRemoveFromWishlist,
  onAddToCartFromWishlist,
  onCheckout
}: CartDrawerProps) {
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);

  // Available coupons listed
  const availableCoupons = [
    { code: "SAVE50", desc: "15% off up to $50 over $100 cart" },
    { code: "WELCOME10", desc: "10% off up to $20 over $40 cart" },
    { code: "FREESHIP", desc: "Offset $10 logistics fee!" }
  ];

  // Dynamic Math calc
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalTax = parseFloat((subtotal * 0.08).toFixed(2));
  const logisticsFee = subtotal > 150 ? 0 : 15;

  const handleApplyCoupon = async (codeStr?: string) => {
    const codeToApply = codeStr || couponCode;
    if (!codeToApply.trim()) return;

    setCouponError("");
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply, cartValue: subtotal })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed loading coupon");
      }

      const data = await res.json();
      setAppliedCoupon(data.coupon);
      setDiscount(data.discount);
      if (!codeStr) setCouponCode("");
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon specification");
      setAppliedCoupon(null);
      setDiscount(0);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const finalTotal = parseFloat((subtotal + totalTax + logisticsFee - discount).toFixed(2));

  // Save for later (In-Memory Simulator)
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);

  const handleSaveForLater = (item: CartItem) => {
    setSavedForLater(prev => [...prev, item]);
    onRemoveItem(item);
  };

  const handleMoveBackToCart = (item: CartItem) => {
    setSavedForLater(prev => prev.filter(i => i.product.id !== item.product.id));
    onAddToCartFromWishlist(item.product);
  };

  return (
    <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Basket Contents & Save for later column */}
      <div className="lg:col-span-2 space-y-6">
        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white">
          <Typography variant="h6" className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            Shopping Cart ({cart.length} unique items)
          </Typography>

          {cart.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <span className="text-4xl text-slate-300">🛒</span>
              <p className="text-sm font-semibold text-slate-500">Your basket is empty. Fill it with premium electronics!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map((item, index) => (
                <div key={index} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100"
                    />
                    <div className="space-y-0.5">
                      <Typography variant="subtitle2" className="font-bold text-slate-800 leading-tight">
                        {item.product.name}
                      </Typography>
                      {Object.keys(item.selectedVariant).length > 0 && (
                        <p className="text-[10px] text-slate-400 font-semibold font-sans">
                          {Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(" | ")}
                        </p>
                      )}
                      <p className="text-sm font-bold text-slate-950">${item.product.price}</p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                      <IconButton size="small" onClick={() => onUpdateQty(item, -1)} disabled={item.quantity <= 1}>
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      </IconButton>
                      <span className="text-xs font-bold font-mono px-2">{item.quantity}</span>
                      <IconButton size="small" onClick={() => onUpdateQty(item, 1)}>
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                      </IconButton>
                    </div>

                    <div className="flex gap-1.5">
                      <Button 
                        size="small" 
                        onClick={() => handleSaveForLater(item)}
                        className="text-[10px] text-slate-500 border border-slate-200 rounded-xl px-2.5 py-1 font-semibold"
                        sx={{ textTransform: 'none' }}
                      >
                        Save for later
                      </Button>
                      <IconButton size="small" color="error" onClick={() => onRemoveItem(item)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Paper>

        {/* Save for later Panel */}
        {savedForLater.length > 0 && (
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white">
            <Typography variant="subtitle2" className="font-bold text-slate-600 mb-2 font-mono uppercase tracking-wider text-[11px]">
              Saved For Later ({savedForLater.length})
            </Typography>
            <div className="divide-y divide-slate-100">
              {savedForLater.map((item, index) => (
                <div key={index} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.product.images[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-50" />
                    <div>
                      <p className="font-bold text-slate-800">{item.product.name}</p>
                      <p className="text-indigo-600 font-bold">${item.product.price}</p>
                    </div>
                  </div>
                  <Button 
                    size="small" 
                    onClick={() => handleMoveBackToCart(item)}
                    startIcon={<Undo2 className="w-3 h-3" />}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-xl px-3 py-1"
                  >
                    Move back to cart
                  </Button>
                </div>
              ))}
            </div>
          </Paper>
        )}

        {/* Wishlist Sidebar / panel */}
        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white">
          <Typography variant="h6" className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            My Curates & Wishlist ({wishlist.length})
          </Typography>
          {wishlist.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Your wishlist is ready to be populated. Select items to curates!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              {wishlist.map((w, i) => (
                <Paper key={i} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-2 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img src={w.images[0]} alt="wl" className="w-10 h-10 rounded-lg object-cover bg-white" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{w.name}</h4>
                      <p className="text-indigo-600 font-bold text-xs">${w.price}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="small"
                      onClick={() => onAddToCartFromWishlist(w)}
                      className="bg-slate-900 hover:bg-indigo-600 text-white text-[9px] font-bold py-0.5 px-2 rounded-lg"
                    >
                      Buy Now
                    </Button>
                    <button 
                      onClick={() => onRemoveFromWishlist(w)}
                      className="text-[9px] text-red-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </Paper>
              ))}
            </div>
          )}
        </Paper>
      </div>

      {/* Pricing breakdown summary column */}
      <div className="space-y-6">
        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-4 shadow-sm h-fit">
          <Typography variant="subtitle1" className="font-bold text-slate-800 uppercase tracking-wide text-xs">
            Summary Overview
          </Typography>

          <Divider />

          {/* Pricing Math list */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Subtotal:</span>
              <span className="font-mono font-bold">${subtotal}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Coupon Discount:</span>
                <span className="font-mono">-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>Logistic Shipping Fee:</span>
              <span className="font-mono">{logisticsFee === 0 ? <span className="text-green-600">FREE</span> : `$${logisticsFee}`}</span>
            </div>

            <div className="flex justify-between text-slate-500 font-medium">
              <span>Estimated VAT/GST (8%):</span>
              <span className="font-mono">${totalTax}</span>
            </div>

            <Divider />

            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
              <span>Checkout Total:</span>
              <span className="font-mono">${finalTotal}</span>
            </div>
          </div>

          <Divider />

          {/* Coupon input */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-indigo-500" />
              Apply Promotional Coupons
            </span>
            <div className="flex gap-2">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Enter SAVE50, FREESHIP..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                slotProps={{ input: { className: "text-xs rounded-xl" } }}
              />
              <Button 
                onClick={() => handleApplyCoupon()}
                size="small"
                className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl px-4"
              >
                Apply
              </Button>
            </div>
            {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}

            {/* Quick click coupon chips */}
            <div className="space-y-1.5 pt-1">
              <Typography variant="caption" className="text-[10px] text-slate-400 block font-semibold uppercase">Click to Apply coupon instantly:</Typography>
              <div className="flex flex-col gap-1.5">
                {availableCoupons.map((c, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleApplyCoupon(c.code)}
                    className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-[10px] font-sans"
                  >
                    <span><b className="text-indigo-600">{c.code}</b> — {c.desc}</span>
                    <Percent className="w-3 h-3 text-indigo-400" />
                  </div>
                ))}
              </div>
            </div>

            {appliedCoupon && (
              <Chip
                label={`Coupon ${appliedCoupon.code} active!`}
                onDelete={handleRemoveCoupon}
                className="bg-green-50 text-green-700 border border-green-100 text-xs mt-1 w-full flex justify-between"
              />
            )}
          </div>

          <Button
            fullWidth
            onClick={() => onCheckout(appliedCoupon, discount)}
            disabled={cart.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold rounded-xl py-2.5 mt-3 flex items-center justify-center gap-2"
          >
            Streamlined Single Checkout
            <ArrowRight className="w-4 h-4" />
          </Button>

          {subtotal < 150 && (
            <p className="text-[9px] text-[11px] text-center text-amber-600 font-medium">Add ${150 - subtotal} more to unlock <b>FREE Logistics Delivery!</b></p>
          )}
        </Paper>
      </div>
    </Box>
  );
}
