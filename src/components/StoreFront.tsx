import React, { useState, useEffect } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Rating,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  CircularProgress
} from "@mui/material";
import { 
  Search, 
  Mic, 
  TrendingUp, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Volume2, 
  X, 
  ShoppingBag, 
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Product } from "../types";

interface StoreFrontProps {
  products: Product[];
  onProductClick: (id: string) => void;
  onAddToCart: (p: Product, qty: number, variant: Record<string, string>) => void;
  onAddToWishlist: (p: Product) => void;
}

export default function StoreFront({ products, onProductClick, onAddToCart, onAddToWishlist }: StoreFrontProps) {
  // Navigation sliding hero banner
  const [bannIdx, setBannIdx] = useState(0);
  const banners = [
    {
      title: "SUMMER ELECTRONICS EXTRAVAGANZA",
      subtitle: "Unmatched performance. Natural Titanium iPhone 15 Pro Max, Sony WH-1000XM5 and premium audio lists up to 30% Off.",
      badge: "Seasonal Flash Sale",
      img: "https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "PREMIUM OFFICE REHABILITATION",
      subtitle: "Curate your workstation with class Class-4 gas-lifts ergonomic recliners and Dyson clean vacuums.",
      badge: "Upgrade WorkSpace",
      img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBannIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer for Flash Sale
  const [timeRemaining, setTimeRemaining] = useState({ hours: 4, minutes: 32, seconds: 15 });
  useEffect(() => {
    const clock = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Search & Filters state
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1500]);
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products);

  // Suggestions logic
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const lowered = search.toLowerCase();
    const matches = products
      .filter(p => p.name.toLowerCase().includes(lowered) || p.brand.toLowerCase().includes(lowered))
      .map(p => p.name)
      .slice(0, 5);
    setSuggestions(matches);
  }, [search, products]);

  // Apply filters/sorting/Semantic search
  const triggerSearchAndFilter = async () => {
    if (aiSearchMode && search.trim()) {
      setAiSearching(true);
      try {
        const res = await fetch("/api/search/semantic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: search })
        });
        const data = await res.json();
        setDisplayProducts(data.results || []);
        setAiExplanation(data.explanation || "");
      } catch (err) {
        console.error(err);
      } finally {
        setAiSearching(false);
      }
    } else {
      // Standard local search
      setAiExplanation("");
      let filtered = [...products];

      if (category !== "All") {
        filtered = filtered.filter(p => p.category === category);
      }

      filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

      if (search.trim()) {
        const key = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(key) || 
          p.brand.toLowerCase().includes(key) ||
          p.category.toLowerCase().includes(key) ||
          p.description.toLowerCase().includes(key)
        );
      }

      // Sort
      if (sort === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      setDisplayProducts(filtered);
    }
  };

  useEffect(() => {
    triggerSearchAndFilter();
  }, [search, category, sort, priceRange, aiSearchMode, products]);

  // Voice Search mock
  const [isListening, setIsListening] = useState(false);
  const startVoiceListening = () => {
    setIsListening(true);
    // Use window SpeechRecognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setSearch(text);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      // Elegant mockup delay of voice
      setTimeout(() => {
        setSearch("Sony noise cancelling headphones");
        setIsListening(false);
      }, 2500);
    }
  };

  const categories = ["All", "Electronics", "Fashion", "Home & Furniture", "Home Appliances"];

  return (
    <Box className="space-y-6">
      {/* Search Bar with AI Semantic toggle */}
      <Paper className="p-4 rounded-2xl shadow-md border border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <TextField
              fullWidth
              variant="outlined"
              placeholder={aiSearchMode ? "Try semantic search: 'gift with high noise cancellation' or 'comfortable support chair'..." : "Search for gadgets, fashion, office gears..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className={`w-5 h-5 ${aiSearchMode ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={startVoiceListening} disabled={isListening}>
                        <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  className: "rounded-xl font-sans"
                }
              }}
            />
            {/* Suggestions Overlay */}
            {suggestions.length > 0 && (
              <Paper className="absolute left-4 right-4 mt-1.5 z-50 rounded-xl shadow-lg border border-slate-100 overflow-hidden divide-y divide-slate-100">
                {suggestions.map((sug, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setSearch(sug);
                      setSuggestions([]);
                    }}
                    className="p-3 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sug}</span>
                  </div>
                ))}
              </Paper>
            )}
          </div>

          <div className="shrink-0">
            <FormControlLabel
              control={
                <Switch 
                  color="primary" 
                  checked={aiSearchMode} 
                  onChange={(e) => setAiSearchMode(e.target.checked)} 
                />
              }
              label={
                <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
                  Semantic AI mode
                </span>
              }
            />
          </div>
          
          <div className="shrink-0 flex items-center">
            {aiSearching && <CircularProgress size={20} />}
          </div>
        </div>

        {aiSearchMode && aiExplanation && (
          <Box className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-2 items-start">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <Typography variant="caption" className="text-indigo-900 font-medium leading-relaxed">
              <b>AI Rationale:</b> {aiExplanation}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Hero Banner Promo Carousel */}
      <Paper 
        className="rounded-3xl overflow-hidden relative shadow-md transition-all duration-500"
        sx={{
          height: { xs: "280px", md: "380px" },
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.92) 30%, rgba(15, 23, 42, 0.3) 100%), url(${banners[bannIdx].img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          display: "flex",
          alignItems: "center"
        }}
      >
        <Box className="max-w-xl p-6 md:p-12 space-y-3">
          <Chip label={banners[bannIdx].badge} className="bg-amber-600 text-white text-[10px] font-bold" />
          <Typography variant="h3" className="font-extrabold tracking-tight text-2xl md:text-4xl leading-tight">
            {banners[bannIdx].title}
          </Typography>
          <Typography variant="body1" className="text-slate-300 text-xs md:text-sm leading-relaxed">
            {banners[bannIdx].subtitle}
          </Typography>
          <Button 
            className="bg-white hover:bg-slate-100 text-slate-900 rounded-xl px-5 py-2 font-bold text-xs"
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Explore Listings
          </Button>
        </Box>

        {/* Dots navigation */}
        <div className="absolute bottom-4 right-6 flex gap-2">
          {banners.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setBannIdx(i)}
              className={`w-2.5 h-2.5 rounded-full ${bannIdx === i ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </Paper>

      {/* Categories Spotlight */}
      <Box className="space-y-3">
        <Typography variant="h6" className="font-bold text-slate-900 flex items-center gap-1.5">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Browse Leading Categories
        </Typography>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat, i) => (
            <Chip
              key={i}
              label={cat}
              onClick={() => setCategory(cat)}
              className={`cursor-pointer px-3 py-1 font-medium transition-all ${
                category === cat 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            />
          ))}
        </div>
      </Box>

      {/* Flash Sale Banner & Interactive Timer */}
      <Paper className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <Typography variant="subtitle1" className="font-bold text-sm md:text-base leading-none">
              Super Lightning Deals
            </Typography>
            <Typography variant="caption" className="text-red-100 text-[11px]">
              Stock availability is highly localized. Grab yours before sold out!
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Typography variant="caption" className="text-[11px] uppercase font-bold text-red-100">
            Ending In:
          </Typography>
          <div className="flex gap-1 text-slate-900 font-bold font-mono">
            <span className="bg-white px-2 py-1 rounded-lg text-xs">{String(timeRemaining.hours).padStart(2, "0")}h</span>
            <span className="bg-white px-2 py-1 rounded-lg text-xs">{String(timeRemaining.minutes).padStart(2, "0")}m</span>
            <span className="bg-white px-2 py-1 rounded-lg text-xs">{String(timeRemaining.seconds).padStart(2, "0")}s</span>
          </div>
        </div>
      </Paper>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-4 md:col-span-1">
          <Paper className="p-4 rounded-2xl border border-slate-100 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                Refine Search
              </span>
              {(search || category !== "All" || priceRange[0] > 0 || priceRange[1] < 1500) && (
                <button 
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setPriceRange([0, 1500]);
                    setSort("relevance");
                  }}
                  className="text-xs text-red-500 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">Price Budget ($)</span>
              <Slider
                value={priceRange}
                onChange={(_, val) => setPriceRange(val as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={1500}
                className="text-slate-900"
                size="small"
              />
              <div className="flex justify-between text-caption text-[11px] text-slate-500">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            {/* Sort selection */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-600 block">Sort by Ordering</span>
              <FormControl fullWidth size="small">
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg text-slate-800 text-xs font-sans"
                >
                  <MenuItem value="relevance">Best Match</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Top Rated ⭐</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Paper>
        </div>

        {/* Product Cards Grid */}
        <div className="md:col-span-3">
          {displayProducts.length === 0 ? (
            <Paper className="p-10 rounded-2xl text-center text-slate-500 max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <Typography variant="subtitle1" className="font-bold text-slate-800 mb-1">
                No matching products found
              </Typography>
              <Typography variant="body2" className="text-xs">
                Modify your price sliders or toggle off AI Semantic Search to see baseline listings.
              </Typography>
            </Paper>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.map((p) => {
                const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                return (
                  <div key={p.id}>
                    <Card className="h-full rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-visible">
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                          {discount}% OFF
                        </div>
                      )}
                      
                      {/* Interaction Actions */}
                      <div className="absolute top-3 right-3 z-10">
                        <IconButton 
                          onClick={() => onAddToWishlist(p)}
                          size="small"
                          className="bg-white/80 hover:bg-white text-rose-500 shadow-sm"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </IconButton>
                      </div>

                      {/* Card Cover */}
                      <div className="overflow-hidden bg-slate-50 rounded-t-2xl aspect-square relative cursor-pointer" onClick={() => onProductClick(p.id)}>
                        <img 
                          src={p.images[0]} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{p.brand}</span>
                          <Typography 
                            variant="subtitle2" 
                            onClick={() => onProductClick(p.id)}
                            className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
                          >
                            {p.name}
                          </Typography>
                          
                          <div className="flex items-center gap-1.5">
                            <Rating value={p.rating} precision={0.1} readOnly size="small" />
                            <span className="text-[10px] text-slate-500 font-semibold">{p.rating}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-end justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-bold text-slate-900">${p.price}</span>
                              {p.mrp > p.price && (
                                <span className="text-xs text-slate-400 line-through">${p.mrp}</span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold ${p.stock <= 3 ? 'text-red-500' : 'text-green-600'}`}>
                              {p.stock <= 3 ? `Only ${p.stock} units left!` : "In Stock"}
                            </span>
                          </div>

                          <Button
                            size="small"
                            onClick={() => onAddToCart(p, 1, {})}
                            className="bg-slate-900 hover:bg-indigo-600 text-white min-w-0 p-2 rounded-xl transition-all"
                            sx={{ borderRadius: 3 }}
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Voice Search dialog listener visual */}
      <Dialog open={isListening} slotProps={{ paper: { className: "rounded-3xl p-6 max-w-sm text-center bg-slate-900 text-white" } }}>
        <Volume2 className="w-12 h-12 text-red-500 mx-auto animate-bounce mb-3" />
        <Typography variant="h6" className="font-bold">Listening for Voice Search</Typography>
        <Typography variant="body2" className="text-xs text-slate-400 mt-1 mb-4">
          Say what you are searching for, e.g. "iPhone Natural Titanium"
        </Typography>
        <div className="flex justify-center gap-1 h-6 items-center">
          <span className="bg-red-500 w-1 h-3 rounded-full animate-pulse inline-block" />
          <span className="bg-red-500 w-1 h-6 rounded-full animate-pulse inline-block" />
          <span className="bg-red-500 w-1 h-4 rounded-full animate-pulse inline-block" />
          <span className="bg-red-500 w-1 h-1 rounded-full animate-pulse inline-block" />
        </div>
      </Dialog>
    </Box>
  );
}
