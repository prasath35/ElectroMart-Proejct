import React, { useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Rating, 
  Chip, 
  Divider, 
  TextField, 
  InputAdornment, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel
} from "@mui/material";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  RotateCw, 
  ShieldCheck, 
  Sparkles,
  Play,
  Heart,
  CalendarDays
} from "lucide-react";
import { Product } from "../types";

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (p: Product, qty: number, variant: Record<string, string>) => void;
  onAddToWishlist: (p: Product) => void;
}

export default function ProductDetail({ product, allProducts, onBack, onAddToCart, onAddToWishlist }: ProductDetailProps) {
  const [activeImg, setActiveImg] = useState(product.images[0]);
  const [is360Mode, setIs360Mode] = useState(false);
  const [spinIdx, setSpinIdx] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);

  // Variant choices
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach(v => {
        initial[v.name] = v.values[0];
      });
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);

  // Delivery Check
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<{ text: string; color: string } | null>(null);

  const checkPincodeDelivery = () => {
    if (!pincode || pincode.length < 5) {
      setDeliveryInfo({ text: "Please enter a valid 5 or 6-digit postal zip code.", color: "text-red-500" });
      return;
    }
    const pin = parseInt(pincode);
    if (pin % 2 === 0) {
      setDeliveryInfo({ text: "🔥 Super-Express: Free delivery by tomorrow morning!", color: "text-green-600 font-bold" });
    } else {
      setDeliveryInfo({ text: "Standard Logistics: Free delivery by Wednesday with standard parcel post.", color: "text-indigo-600" });
    }
  };

  // Frequently Bought Together Bundle checkbox
  const [bundleProductCheck, setBundleProductCheck] = useState(true);
  const similarItems = allProducts.filter(p => p.id !== product.id).slice(0, 2);
  const bundleProduct = similarItems[0];

  // Q&A posting
  const [newQuestion, setNewQuestion] = useState("");
  const [qnas, setQnas] = useState(product.qna || []);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  const handlePostQuestion = async () => {
    if (!newQuestion.trim()) return;
    setQuestionSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/qna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion,
          askedBy: "Verified Client Account"
        })
      });
      const data = await res.json();
      setQnas(prev => [...prev, data]);
      setNewQuestion("");
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const spinAngleImages = [
    product.images[0],
    product.images[1] || product.images[0],
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80"
  ];

  // Drag-to-spin simulation
  const handleSpinNext = () => {
    setSpinIdx(prev => (prev + 1) % spinAngleImages.length);
  };

  // Add bundle item combined to cart
  const handleAddToCartWithBundle = () => {
    // Add primary item
    onAddToCart(product, quantity, selectedVariants);
    // Add bundle item if checked
    if (bundleProductCheck && bundleProduct) {
      onAddToCart(bundleProduct, 1, {});
    }
  };

  return (
    <Box className="space-y-6">
      {/* Back button */}
      <Button 
        onClick={onBack}
        startIcon={<ArrowLeft className="w-4 h-4" />}
        className="text-slate-600 hover:text-slate-900 border border-slate-200 bg-white rounded-xl text-xs font-semibold px-4 py-1.5"
      >
        Back to listings
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Images & Slides column */}
        <div className="space-y-4">
          <Paper className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group min-h-[350px]">
            {is360Mode ? (
              <div className="text-center py-6 space-y-4 w-full">
                <Box className="max-w-xs mx-auto aspect-square rounded-2xl bg-white p-4 shadow-inner flex items-center justify-center relative">
                  <img 
                    src={spinAngleImages[spinIdx]} 
                    alt="360 view"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <RotateCw className="w-2.5 h-2.5 animate-spin-slow" />
                    360° ACTIVE
                  </div>
                </Box>
                <div className="flex justify-center gap-2">
                  <Button 
                    size="small"
                    onClick={handleSpinNext}
                    variant="outlined"
                    className="rounded-xl border-slate-300 text-slate-800 text-xs py-1"
                  >
                    Drag / Click to Spin
                  </Button>
                </div>
              </div>
            ) : isVideoMode ? (
              <div className="w-full relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                {product.video ? (
                  <video controls className="w-full h-full" autoPlay>
                    <source src={product.video} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <Play className="w-12 h-12 text-slate-400 mx-auto" />
                    <Typography className="text-xs text-slate-300">Feature Highlight Video placeholder loaded.</Typography>
                  </div>
                )}
              </div>
            ) : (
              <Box className="w-full max-w-sm aspect-square overflow-hidden rounded-2xl bg-white p-3 shadow-sm border border-slate-100 relative">
                <img 
                  src={activeImg} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl hover:scale-125 transition-transform duration-300 ease-out"
                />
                <span className="absolute bottom-2 text-[9px] text-slate-400 font-mono italic left-3">Hover cursor over image to active zoom lens</span>
              </Box>
            )}

            {/* Carousel controllers overlays */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button 
                onClick={() => { setIs360Mode(false); setIsVideoMode(false); }}
                className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm border ${!is360Mode && !isVideoMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Images
              </button>
              <button 
                onClick={() => { setIs360Mode(true); setIsVideoMode(false); }}
                className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm border ${is360Mode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                360° View
              </button>
              {product.video && (
                <button 
                  onClick={() => { setIsVideoMode(true); setIs360Mode(false); }}
                  className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm border ${isVideoMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                >
                  Highlights Video
                </button>
              )}
            </div>
          </Paper>

          {/* Thumbnail row */}
          {!is360Mode && !isVideoMode && (
            <div className="flex gap-2 pb-2">
              {product.images.map((img, i) => (
                <div 
                  key={i}
                  onMouseEnter={() => setActiveImg(img)}
                  onClick={() => setActiveImg(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden cursor-pointer bg-slate-50 border-2 transition-all p-1 ${img === activeImg ? 'border-slate-900 shadow-md' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img src={img} className="w-full h-full object-cover rounded-lg" alt="thumb" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configurations, Buy Box & variants column */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">{product.brand} Warranty Protected</span>
            <Typography variant="h4" className="font-extrabold text-slate-900 text-2xl tracking-tight leading-tight">
              {product.name}
            </Typography>
            
            <div className="flex items-center gap-2">
              <Rating value={product.rating} precision={0.1} readOnly size="small" />
              <Typography variant="caption" className="text-xs font-semibold text-slate-700">
                {product.rating} / 5.0 ({product.reviews.length} Verified Buyer Reviews)
              </Typography>
            </div>
          </div>

          <Divider />

          {/* Pricing box */}
          <Box className="space-y-1">
            <div className="flex items-center gap-3">
              <Typography variant="h5" className="text-2xl font-extrabold text-indigo-600">
                ${product.price}
              </Typography>
              {product.mrp > product.price && (
                <>
                  <Typography variant="body1" className="text-slate-400 line-through text-sm">
                    ${product.mrp}
                  </Typography>
                  <Chip label={`${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% Discount`} size="small" className="bg-red-50 text-red-600 text-[10px] font-bold" />
                </>
              )}
            </div>
            <Typography variant="caption" className="text-slate-500 font-medium text-[10px] block">
              Inclusive of all estimated state GST taxes and custom duty surcharges. Buy Now Pay Later installments available with No-Cost EMI configs ($32/month).
            </Typography>
          </Box>

          {/* Sizing & Color variants select */}
          {product.variants && product.variants.map((variant, index) => (
            <div key={index} className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Select {variant.name}:</span>
              <div className="flex gap-2">
                {variant.values.map((val, i) => {
                  const selected = selectedVariants[variant.name] === val;
                  return (
                    <Button
                      key={i}
                      size="small"
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: val }))}
                      className={`rounded-xl text-xs py-1 px-3 ${selected ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      sx={{ textTransform: 'none' }}
                    >
                      {val}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Qty count selector & buy action */}
          <div className="flex gap-3 pt-2">
            <FormControl size="small" className="w-20">
              <TextField
                type="number"
                label="Qty"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                slotProps={{ htmlInput: { min: 1, max: product.stock } }}
              />
            </FormControl>

            <Button
              onClick={() => onAddToCart(product, quantity, selectedVariants)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 px-6 font-bold"
              startIcon={<ShoppingBag className="w-4 h-4" />}
            >
              Add to Basket
            </Button>
          </div>

          <Divider />

          {/* Pincode Estimator checking widget */}
          <Paper className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              Check Estimated Logistic Shipping
            </span>
            <div className="flex gap-2">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Enter Pincode (e.g. 100001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="bg-white rounded-xl"
                slotProps={{ input: { className: "text-xs font-mono rounded-xl font-sans" } }}
              />
              <Button 
                size="small" 
                onClick={checkPincodeDelivery}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl px-4"
              >
                Check
              </Button>
            </div>
            {deliveryInfo && (
              <p className={`text-[11px] mt-1 ${deliveryInfo.color}`}>
                {deliveryInfo.text}
              </p>
            )}
          </Paper>

          {/* Specifications Accordion Table */}
          <Accordion className="shadow-none border border-slate-100 rounded-2xl before:hidden">
            <AccordionSummary expandIcon={<ChevronDown className="w-4 h-4" />}>
              <Typography className="font-bold text-xs text-slate-800 uppercase tracking-wider">Specifications & Warranties</Typography>
            </AccordionSummary>
            <AccordionDetails className="bg-slate-50 rounded-b-2xl p-0.5 overflow-hidden">
              <div className="divide-y divide-slate-200">
                {Object.entries(product.specifications).map(([k, v], i) => (
                  <div key={i} className="flex justify-between p-3 text-xs">
                    <span className="font-semibold text-slate-500">{k}</span>
                    <span className="text-slate-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>

      {/* Frequently Bought Together Bundle */}
      {bundleProduct && (
        <Paper className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-3">
          <Typography variant="subtitle2" className="font-bold text-indigo-900 flex items-center gap-1 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            Frequently Bought Together (Save combined delivery)
          </Typography>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src={product.images[0]} alt="p1" className="w-12 h-12 rounded-lg object-cover bg-white" />
                <span className="font-bold text-sm text-slate-400">+</span>
                <img src={bundleProduct.images[0]} alt="p2" className="w-12 h-12 rounded-lg object-cover bg-white" />
              </div>
              <div className="text-xs">
                <FormControlLabel
                  control={
                    <Checkbox 
                      size="small" 
                      color="primary" 
                      checked={bundleProductCheck} 
                      onChange={(e) => setBundleProductCheck(e.target.checked)} 
                    />
                  }
                  label={
                    <span className="text-[11px] text-slate-700">
                      Add <b>{bundleProduct.name}</b> (${bundleProduct.price}) to checkout bundle.
                    </span>
                  }
                />
              </div>
            </div>
            <Button 
              size="small"
              onClick={handleAddToCartWithBundle}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold px-4 py-1.5 whitespace-nowrap"
            >
              Add Bundle (${product.price + (bundleProductCheck ? bundleProduct.price : 0)}) to Cart
            </Button>
          </div>
        </Paper>
      )}

      {/* Customer Q&A and verified customer reviews split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Q&A Section */}
        <div className="space-y-3">
          <Typography variant="subtitle1" className="font-bold text-slate-900 uppercase tracking-wide text-xs">
            Customer Q&As ({qnas.length})
          </Typography>
          
          <Paper className="p-4 rounded-2xl border border-slate-100 bg-white space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {qnas.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No questions posted yet. Be the first to ask!</p>
              ) : (
                qnas.map((q, i) => (
                  <div key={i} className="text-xs space-y-1.5 border-b border-slate-50 pb-3">
                    <p className="font-bold text-slate-800">Q: {q.question}</p>
                    <p className="text-slate-400 text-[10px]">Asked by {q.askedBy} on {q.askedDate}</p>
                    {q.answer ? (
                      <div className="bg-slate-50 p-2.5 rounded-lg mt-1 border-l-2 border-indigo-500">
                        <p className="text-slate-700 font-medium font-sans"><b>A:</b> {q.answer}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Answered by {q.answeredBy} on {q.answeredDate}</p>
                      </div>
                    ) : (
                      <em className="text-slate-400 text-[10px] block">Awaiting official seller support reply...</em>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <TextField
                fullWidth
                size="small"
                placeholder="Ask a question about size compatibility, parts, etc..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                slotProps={{ input: { className: "text-xs rounded-xl" } }}
              />
              <Button 
                size="small" 
                onClick={handlePostQuestion}
                disabled={questionSubmitting || !newQuestion.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold px-4"
              >
                Ask
              </Button>
            </div>
          </Paper>
        </div>

        {/* Reviews Listing */}
        <div className="space-y-3">
          <Typography variant="subtitle1" className="font-bold text-slate-900 uppercase tracking-wide text-xs">
            Review Summaries
          </Typography>
          <Paper className="p-4 rounded-2xl border border-slate-100 bg-white space-y-4 max-h-72 overflow-y-auto">
            {product.reviews.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">This item has zero reviews. Place your order and be the first to post a review!</p>
            ) : (
              product.reviews.map((rev, i) => (
                <div key={i} className="text-xs space-y-1 pb-3 border-b border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{rev.user}</span>
                    <Rating value={rev.rating} readOnly size="small" />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="font-semibold text-slate-900">{rev.title}</p>
                    {rev.verified && (
                      <Chip label="Verified Buyer Check" size="small" className="bg-green-50 text-green-700 text-[8px] h-4" />
                    )}
                  </div>
                  <p className="text-slate-600 font-sans leading-relaxed mt-1">{rev.text}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{rev.date}</p>
                </div>
              ))
            )}
          </Paper>
        </div>
      </div>
    </Box>
  );
}
