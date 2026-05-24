import React, { useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  Divider, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  TextField, 
  FormControl, 
  FormLabel, 
  Tab, 
  Tabs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Chip
} from "@mui/material";
import { 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  AlertTriangle, 
  RotateCcw, 
  MapPin, 
  CalendarClock, 
  ShieldCheck, 
  Layers,
  Sparkles,
  QrCode
} from "lucide-react";
import { Address, CartItem, Coupon } from "../types";

interface CheckoutPageProps {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  savedAddresses: Address[];
  onAddAddress: (addr: any) => void;
  onOrderCompleted: (createdOrder: any) => void;
  onBackToCart: () => void;
  couponCode?: string;
}

export default function CheckoutPage({
  cart,
  subtotal,
  discount,
  deliveryFee,
  tax,
  total,
  savedAddresses,
  onAddAddress,
  onOrderCompleted,
  onBackToCart,
  couponCode
}: CheckoutPageProps) {
  // Address & slot choice
  const [selectedAddrId, setSelectedAddrId] = useState(savedAddresses[0]?.id || "");
  const [deliverySlot, setDeliverySlot] = useState("standard");
  const [paymentTab, setPaymentTab] = useState(0);

  // Address Dialog form
  const [addrOpen, setAddrOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: "", phone: "", street: "", city: "", state: "", pincode: "", type: "Home" });

  const handleCreateAddress = () => {
    if (!newAddr.name || !newAddr.phone || !newAddr.street || !newAddr.city || !newAddr.pincode) return;
    onAddAddress(newAddr);
    setAddrOpen(false);
    setNewAddr({ name: "", phone: "", street: "", city: "", state: "", pincode: "", type: "Home" });
  };

  // Payment method State
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [expiry, setExpiry] = useState("12/29");
  const [cvv, setCvv] = useState("123");
  const [upiId, setUpiId] = useState("stark@oksbi");
  const [walletProvider, setWalletProvider] = useState("amazon-pay");

  // PCI-DSS state loader
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkSimulateFail, setCheckSimulateFail] = useState(false);
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [attempts, setAttempts] = useState(1);

  // Slots mapping
  const logisticsSlots = [
    { id: "standard", label: "Standard Logistics Delivery", timing: "Within 2-3 Business Days", fee: 0 },
    { id: "express", label: "Midnight Hub Express Tracker", timing: "Next Business Day Delivery", fee: 15 },
    { id: "priority", label: "Priority Morning Slot Delivery", timing: "Guaranteed Before 10:00 AM", fee: 25 }
  ];

  const selectedSlotFee = logisticsSlots.find(s => s.id === deliverySlot)?.fee || 0;
  const finalCalculatedTotal = parseFloat((total + selectedSlotFee).toFixed(2));

  // Handle Checkout submission
  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    // Simulate standard payment delay
    setTimeout(async () => {
      if (checkSimulateFail) {
        setIsProcessing(false);
        setRetryModalOpen(true);
        return;
      }

      // Success, call API
      const chosenAddress = savedAddresses.find(a => a.id === selectedAddrId) || savedAddresses[0];
      const paymentMethodNames = ["Credit/Debit Card", "UPI Payment", "NetBanking Checkout", "Virtual Wallet Transfer", "Cash on Delivery (COD)"];
      
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart,
            subtotal,
            discount,
            deliveryFee: deliveryFee + selectedSlotFee,
            tax,
            total: finalCalculatedTotal,
            address: chosenAddress,
            paymentMethod: paymentMethodNames[paymentTab],
            couponCode
          })
        });

        if (!res.ok) {
          throw new Error("Failed placing order endpoint");
        }

        const data = await res.json();
        onOrderCompleted(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 2800);
  };

  const handleAutoRetry = () => {
    setAttempts(prev => prev + 1);
    setCheckSimulateFail(false); // Clear failure on retry
    setRetryModalOpen(false);
    handlePlaceOrder();
  };

  return (
    <Box className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
        <Typography variant="subtitle1" className="font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          PCI-DSS Tier-1 Secured Single-Screen checkout
        </Typography>
        <Button 
          size="small" 
          onClick={onBackToCart}
          className="text-white hover:text-indigo-200 text-xs font-semibold"
        >
          Modify Shopping Basket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
        {/* Addresses & Schedules & Payments Column */}
        <div className="md:col-span-8 space-y-6">
          {/* Section 1: Addresses */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <Typography variant="subtitle2" className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                1. Selected Shipping Address
              </Typography>
              <Button 
                size="small" 
                onClick={() => setAddrOpen(true)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-xl"
              >
                Add Shipping Destination
              </Button>
            </div>

            <RadioGroup value={selectedAddrId} onChange={(e) => setSelectedAddrId(e.target.value)}>
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <Paper key={addr.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <FormControlLabel
                      value={addr.id}
                      control={<Radio color="primary" />}
                      label={
                        <div className="text-xs space-y-0.5 leading-tight ml-2">
                          <p className="font-bold text-slate-800">{addr.name} — <span className="text-[10px] text-indigo-600 border border-indigo-100 px-1.5 rounded-full font-mono">{addr.type}</span></p>
                          <p className="text-slate-500">{addr.street && `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`}</p>
                          <p className="text-slate-400 font-semibold">Phone: {addr.phone}</p>
                        </div>
                      }
                    />
                  </Paper>
                ))}
              </div>
            </RadioGroup>
          </Paper>

          {/* Section 2: Delivery Schedules */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3 shadow-sm">
            <Typography variant="subtitle2" className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-indigo-600" />
              2. Delivery Slot Scheduling
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {logisticsSlots.map((slot) => {
                const active = deliverySlot === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setDeliverySlot(slot.id)}
                    className={`p-3.5 border rounded-2xl cursor-pointer text-center space-y-1.5 transition-all duration-200 ${active ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                  >
                    <p className="font-bold text-slate-800 text-xs leading-tight">{slot.label}</p>
                    <p className="text-[10px] text-slate-400">{slot.timing}</p>
                    <Chip 
                      label={slot.fee === 0 ? "FREE" : `+$${slot.fee}`} 
                      className={`h-5 text-[9px] font-bold ${slot.fee === 0 ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}`} 
                    />
                  </div>
                );
              })}
            </div>
          </Paper>

          {/* Section 3: Payments selection visual */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3 shadow-sm">
            <Typography variant="subtitle2" className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              3. Secure Checkout Gateway
            </Typography>

            <Tabs 
              value={paymentTab} 
              onChange={(_, val) => setPaymentTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              className="border-b border-slate-100"
              sx={{ minHeight: 'unset', '& .MuiTab-root': { py: 1, minHeight: 'unset', fontSize: '11px', fontWeight: 'bold' } }}
            >
              <Tab label="Credit/Debit Card" />
              <Tab label="UPI payment" />
              <Tab label="NetBanking" />
              <Tab label="Virtual Wallets" />
              <Tab label="Cash on Delivery" />
            </Tabs>

            {/* Tab 1: Cards */}
            {paymentTab === 0 && (
              <div className="space-y-4 pt-2">
                <Box className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 p-4 text-white shadow-md space-y-6 relative overflow-hidden font-mono text-xs">
                  <span className="absolute bottom-2 right-4 opacity-10 text-3xl font-extrabold uppercase">SECURE</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold">ELECTROMART PRIORITY CARD</span>
                    <CreditCard className="w-6 h-6 text-indigo-300" />
                  </div>
                  <p className="text-sm font-bold tracking-widest text-center py-2">{cardNumber || "**** **** **** ****"}</p>
                  <div className="flex justify-between text-[10px]">
                    <div>
                      <p className="opacity-60 text-[8px]">CARDHOLDER</p>
                      <p className="font-sans font-bold">TONY STARK</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-[8px]">EXPIRES</p>
                      <p className="font-sans font-bold">{expiry || "MM/YY"}</p>
                    </div>
                  </div>
                </Box>                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <TextField
                      fullWidth
                      size="small"
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      fullWidth
                      size="small"
                      label="Expiry (MM/YY)"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      fullWidth
                      size="small"
                      label="CVV Code"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: UPI */}
            {paymentTab === 1 && (
              <div className="space-y-3 pt-2 text-xs">
                <p className="text-slate-500 font-medium leading-relaxed">Enter your Virtual Payment Address (VPA) / UPI handle to receive instant collect notification on your GPay, PhonePe or Paytm Mobile App.</p>
                <div className="flex gap-2">
                  <TextField 
                    size="small" 
                    label="UPI VPA Handle" 
                    placeholder="name@upi" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <Button size="small" variant="outlined" className="rounded-xl border-slate-300 text-slate-800 flex items-center gap-1.5 font-bold"><QrCode className="w-3.5 h-3.5" /> Show QR code instead</Button>
                </div>
              </div>
            )}

            {/* Tab 3: NetBanking */}
            {paymentTab === 2 && (
              <div className="space-y-2 pt-2 text-xs">
                <span className="font-semibold block text-slate-600">Select Partner Banking Institution:</span>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  {["State Bank of India", "HDFC Private Bank", "ICICI Bank Express", "Chase Manhattan LLC"].map((bank, i) => (
                    <button key={i} className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl text-left text-[11px] font-semibold text-slate-700">{bank} 🏦</button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Wallets */}
            {paymentTab === 3 && (
              <div className="space-y-3 pt-2 text-xs">
                <span className="font-semibold block text-slate-600">Select Digital Wallet Provider:</span>
                <RadioGroup value={walletProvider} onChange={(e) => setWalletProvider(e.target.value)}>
                  <div className="flex gap-3">
                    <FormControlLabel value="amazon-pay" control={<Radio color="primary" />} label="Amazon Pay Wallet Balance" />
                    <FormControlLabel value="paypal" control={<Radio color="primary" />} label="PayPal Vault" />
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Tab 5: COD */}
            {paymentTab === 4 && (
              <p className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl leading-relaxed text-xs">
                👉 <b>Cash On Delivery (COD) processing note:</b> No payment required online. Pay securely in cash or via hand-delivered UPI reader to the logistics agent upon successful courier dropoff at Malibu Hub.
              </p>
            )}

            {/* Transaction Failure simulator toggle */}
            <div className="pt-2 border-t border-slate-100">
              <FormControlLabel
                control={
                  <Checkbox 
                    size="small" 
                    color="error" 
                    checked={checkSimulateFail} 
                    onChange={(e) => setCheckSimulateFail(e.target.checked)} 
                  />
                }
                label={
                  <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Simulate Credit-Card Transaction Failure / Decline
                  </span>
                }
              />
            </div>
          </Paper>
        </div>

        {/* Pricing calculations details column */}
        <div className="md:col-span-4">
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-4 shadow-sm sticky top-4 h-fit">
            <Typography variant="subtitle1" className="font-bold text-slate-800 uppercase tracking-wide text-xs">
              Review Final Order
            </Typography>

            <Divider />

            {/* Items review checklist */}
            <div className="max-h-40 overflow-y-auto space-y-2.5 pb-2">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-2.5 items-center text-xs">
                  <img src={item.product.images[0]} className="w-8 h-8 rounded-lg object-cover bg-slate-50 shrink-0" />
                  <div className="truncate flex-1">
                    <p className="font-bold text-slate-800 truncate leading-none">{item.product.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold font-mono">${item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <Divider />

            {/* Billing calculations */}
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
                <span>Standard Delivery Fee:</span>
                <span className="font-mono">{deliveryFee === 0 ? "FREE" : `$${deliveryFee}`}</span>
              </div>
              {selectedSlotFee > 0 && (
                <div className="flex justify-between text-indigo-600">
                  <span>Express Timing Surcharge:</span>
                  <span className="font-mono">+${selectedSlotFee}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Vat / State Tax (8%):</span>
                <span className="font-mono">${tax}</span>
              </div>
              
              <Divider />

              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
                <span>Final Settle Total:</span>
                <span className="font-mono">${finalCalculatedTotal}</span>
              </div>
            </div>

            <Button
              fullWidth
              disabled={isProcessing || !selectedAddrId}
              onClick={handlePlaceOrder}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-2.5 mt-2 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <CircularProgress size={16} className="text-white" />
                  Processing secured card transaction...
                </>
              ) : (
                <>
                  Complete Secured Checkout
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                </>
              )}
            </Button>
          </Paper>
        </div>
      </div>

      {/* Shipping Address Creation Dialog */}
      <Dialog open={addrOpen} onClose={() => setAddrOpen(false)} slotProps={{ paper: { className: "rounded-3xl max-w-md p-4" } }}>
        <DialogTitle className="font-bold">Add Delivery Destination</DialogTitle>
        <DialogContent className="space-y-3.5 pt-2">
          <TextField
            fullWidth
            size="small"
            label="Receiver Name"
            value={newAddr.name}
            onChange={(e) => setNewAddr(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth
            size="small"
            label="Mobile Number"
            value={newAddr.phone}
            onChange={(e) => setNewAddr(prev => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            fullWidth
            size="small"
            label="Destination Street/Suite"
            value={newAddr.street}
            onChange={(e) => setNewAddr(prev => ({ ...prev, street: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <TextField
                fullWidth
                size="small"
                label="City"
                value={newAddr.city}
                onChange={(e) => setNewAddr(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <TextField
                fullWidth
                size="small"
                label="Postal Zip Pincode"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr(prev => ({ ...prev, pincode: e.target.value }))}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-3">
          <Button onClick={() => setAddrOpen(false)} className="text-slate-500 font-bold">Cancel</Button>
          <Button onClick={handleCreateAddress} className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg py-1 px-4">Append Address</Button>
        </DialogActions>
      </Dialog>

      {/* PCI-DSS payment failed RETRY dialog */}
      <Dialog 
        open={retryModalOpen} 
        onClose={() => setRetryModalOpen(false)}
        slotProps={{ paper: { className: "rounded-3xl p-4 max-w-md text-center" } }}
      >
        <div className="p-3">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-bounce mb-2" />
          <Typography variant="h6" className="font-extrabold text-red-700">Transaction Declined</Typography>
          <Typography variant="body2" className="text-slate-500 mt-1 leading-relaxed text-xs">
            The processing bank responded with code <b>[DEC-049]: Insufficient Balance or Security Lockout</b>. Your order draft and billing information remain safe.
          </Typography>

          <Paper className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl my-4 text-left space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Failed attempt details:</span>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Attempt Count:</span>
              <span className="font-bold">{attempts}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Card used:</span>
              <span className="font-mono font-bold">VISA Ending 4444</span>
            </div>
          </Paper>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleAutoRetry}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Auto-Retry using alternate vault (Switch to Master Vault)
            </Button>
            <Button 
              onClick={() => setRetryModalOpen(false)}
              className="text-slate-500 font-bold hover:underline py-1 text-xs"
            >
              Switch payment mode to Cash on Delivery (COD)
            </Button>
          </div>
        </div>
      </Dialog>
    </Box>
  );
}
