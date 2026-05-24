import React, { useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  Printer, 
  PackageMinus, 
  ShieldCheck, 
  Database,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  TrendingDown
} from "lucide-react";
import { Product, Order } from "../types";

interface SellerPortalProps {
  products: Product[];
  orders: Order[];
  onAddNewProduct: (newP: any) => void;
  onBulkUploadProducts: (csvText: string) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onAnswerQna: (productId: string, qnaId: string, answer: string) => void;
}

export default function SellerPortal({
  products,
  orders,
  onAddNewProduct,
  onBulkUploadProducts,
  onUpdateStock,
  onAnswerQna
}: SellerPortalProps) {
  // Navigation internal tabs
  const [activeSubTab, setActiveSubTab] = useState("inventory");

  // Add listing state form
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formCat, setFormCat] = useState("Electronics");
  const [formBrand, setFormBrand] = useState("");
  const [formStock, setFormStock] = useState("10");

  const [addListingOpen, setAddListingOpen] = useState(false);

  const handleCreateProduct = () => {
    if (!formName || !formPrice) return;
    onAddNewProduct({
      name: formName,
      description: formDesc,
      price: parseFloat(formPrice),
      mrp: formMrp ? parseFloat(formMrp) : parseFloat(formPrice) + 40,
      category: formCat,
      brand: formBrand || "Generic",
      stock: parseInt(formStock) || 12,
      variants: [],
      specifications: { "Seller source": "Local Vendor list" }
    });
    setAddListingOpen(false);

    // reset
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormMrp("");
    setFormCat("Electronics");
    setFormBrand("");
    setFormStock("10");
  };

  // Bulk CSV Upload
  const [csvText, setCsvText] = useState("");
  const [csvOpen, setCsvOpen] = useState(false);

  const handleBulkCsvSubmit = () => {
    if (!csvText.trim()) return;
    onBulkUploadProducts(csvText);
    setCsvOpen(false);
    setCsvText("");
  };

  const handleLoadSampleCSV = () => {
    const sample = `Name,Description,Price,MRP,Category,Brand,Stock
Mechanical Keyboard,Ergonomic blue switches,89,110,Electronics,Keychron,15
Polarized Sunglasses,UV-400 protect,45,60,Fashion,Oakley,8
Vitantonio Belgian Waffle Maker,Double nonstick cast iron,79,99,Home & Furniture,Vitantonio,4`;
    setCsvText(sample);
  };

  // Q&A reply text
  const [qnaReplyText, setQnaReplyText] = useState<Record<string, string>>({});
  const handlePostQnaReply = (prodId: string, qnaId: string) => {
    const textStr = qnaReplyText[`${prodId}-${qnaId}`];
    if (!textStr || !textStr.trim()) return;
    
    onAnswerQna(prodId, qnaId, textStr);
    
    // clear
    setQnaReplyText(prev => ({ ...prev, [`${prodId}-${qnaId}`]: "" }));
  };

  // Printing Slip states
  const [activePrintSlipOrder, setActivePrintSlipOrder] = useState<Order | null>(null);

  // Filter low stock
  const lowStockItems = products.filter(p => p.stock <= 3);

  return (
    <Box className="space-y-6">
      {/* Seller Header and KYC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Verification Status Card */}
        <Paper className="p-4 rounded-3xl border border-green-100 bg-green-50/50 flex items-center justify-between col-span-1 md:col-span-2">
          <div className="flex gap-3 items-center">
            <span className="text-3xl">🛡️</span>
            <div>
              <Typography variant="subtitle2" className="text-green-800 font-extrabold flex items-center gap-1.5 leading-none">
                KYC Verification Approved
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              </Typography>
              <Typography variant="caption" className="text-green-700 text-[11px] block mt-1 leading-normal font-medium">
                Sellers PAN, Bank Settlements, and GSTIN: <b>22AAAAA0000A1Z5</b> linked successfully. High value shipments auto audit enabled.
              </Typography>
            </div>
          </div>
          <Chip label="ACTIVE SELLER" className="bg-green-600 text-white font-bold text-[9px]" />
        </Paper>

        {/* Quick low stock notifier */}
        <Paper className="p-4 rounded-3xl border border-rose-100 bg-rose-50/40 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse shrink-0" />
          <div className="text-xs">
            <Typography variant="subtitle2" className="font-extrabold text-rose-800">Inventory Alert</Typography>
            <Typography variant="caption" className="text-rose-700 block text-[10px]">
              You have <b>{lowStockItems.length}</b> product(s) with low stock reserves level!
            </Typography>
          </div>
        </Paper>
      </div>

      {/* Seller Portal Tabs */}
      <div className="flex border-b border-slate-100 gap-4">
        {["inventory", "actions", "slips", "qna"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === tab 
                ? 'border-indigo-600 text-indigo-700' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === "inventory" ? "My Inventory listings" : tab === "actions" ? "Quick add & CSV Bulk Upload" : tab === "slips" ? "Packing & Shipping Labels" : "Pending QnA queries"}
          </button>
        ))}
      </div>

      {/* Tab Content 1: Inventory Management */}
      {activeSubTab === "inventory" && (
        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white">
          <Typography variant="subtitle1" className="font-bold text-slate-800 mb-3 text-xs uppercase font-mono tracking-wider">Store Inventory Metrics Details</Typography>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                  <th className="p-3 font-semibold">SKU / Product details</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold text-center">Unit Price</th>
                  <th className="p-3 font-semibold text-center">In Stock Levels</th>
                  <th className="p-3 font-semibold text-center">Customer Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-sans">
                {products.map((p) => {
                  const isLow = p.stock <= 3;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-3">
                        <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs leading-tight">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono italic">ID: {p.id}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium">{p.category}</td>
                      <td className="p-3 text-center font-bold font-mono text-indigo-700">${p.price}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <TextField
                            size="small"
                            type="number"
                            value={p.stock}
                            onChange={(e) => onUpdateStock(p.id, parseInt(e.target.value) || 0)}
                            className="w-14"
                            slotProps={{ input: { className: "text-xs font-mono font-bold text-center" } }}
                          />
                          {isLow && (
                            <Chip label="LOW STOCKALERT!" className="bg-rose-50 text-rose-600 font-bold text-[8px] h-4" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold">⭐ {p.rating} / 5.0</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Paper>
      )}

      {/* Tab 2: Listing creator & CSV Upload buttons */}
      {activeSubTab === "actions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Creator */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-4 shadow-sm">
            <Typography variant="subtitle2" className="text-slate-800 font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-xs">
              <Plus className="w-4 h-4 text-indigo-600" />
              1. Add Singular Product listings
            </Typography>
            <div className="space-y-3 pt-1">
              <TextField fullWidth size="small" label="Product Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
              <TextField fullWidth size="small" multiline rows={2} label="Key Description" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TextField fullWidth size="small" label="Sale Price ($)" type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
                </div>
                <div>
                  <TextField fullWidth size="small" label="Original MRP ($)" type="number" value={formMrp} onChange={(e) => setFormMrp(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select value={formCat} label="Category" onChange={(e) => setFormCat(e.target.value)}>
                      <MenuItem value="Electronics">Electronics</MenuItem>
                      <MenuItem value="Fashion">Fashion</MenuItem>
                      <MenuItem value="Home & Furniture">Home & Furniture</MenuItem>
                      <MenuItem value="Home Appliances">Home Appliances</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <TextField fullWidth size="small" label="Brand" value={formBrand} onChange={(e) => setFormBrand(e.target.value)} />
                </div>
              </div>
              <TextField fullWidth size="small" label="Initial Stock Units" type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} />

              <Button 
                onClick={handleCreateProduct}
                disabled={!formName || !formPrice}
                fullWidth
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-xl py-2"
              >
                Assemble Listing
              </Button>
            </div>
          </Paper>

          {/* Bulk CSV upload */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-4 shadow-sm">
            <Typography variant="subtitle2" className="text-slate-800 font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-xs">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              2. Excel CSV bulk Uploader
            </Typography>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Drag/drop products CSV sheets to parse and populate listings database instantly. Perfect for bulk warehouses integrations.
            </p>

            <div 
              onClick={() => setCsvOpen(true)}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-slate-50"
            >
              <Upload className="w-8 h-8 text-indigo-500 mx-auto animate-bounce" />
              <p className="text-xs font-bold font-sans text-slate-700">Select or drop CSV spreadsheets files</p>
              <span className="text-[10px] text-slate-400 block font-mono">Format: Name,Description,Price,MRP,Category,Brand,Stock</span>
            </div>
          </Paper>
        </div>
      )}

      {/* Tab 3: Slips */}
      {activeSubTab === "slips" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders pending slips */}
          <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-3">
            <Typography variant="subtitle2" className="text-slate-800 font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-xs">
              Dispatched Orders awaiting Label Printing
            </Typography>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No order logs found inside server databases.</p>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800 font-mono">ID: {ord.id}</p>
                      <p className="text-slate-400 text-[10px]">Client: {ord.address.name} | Items Count: {ord.items.length}</p>
                    </div>
                    <Button 
                      size="small" 
                      onClick={() => setActivePrintSlipOrder(ord)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg px-3"
                    >
                      Produce Label
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Paper>

          {/* Render Active Printing label slip preview visually */}
          {activePrintSlipOrder ? (
            <Paper className="p-4 rounded-3xl border-2 border-dashed border-slate-800 bg-amber-50/20 text-slate-900 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-mono font-extrabold text-xs">ELECTROMART WAREHOUSE ENVELOPE</span>
                <Printer className="w-4 h-4 text-slate-600 cursor-pointer" onClick={() => window.print()} />
              </div>

              {/* Envelope address box */}
              <div className="text-xs space-y-1 leading-tight font-sans">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">SHIP FROM SENDER:</p>
                <p className="font-extrabold text-slate-800">Warehouse Hub Delhi-Santa 42</p>
                <p className="text-slate-500">24 Stark Industrial Parkway, Sector-5B</p>
                
                <Divider className="my-2" />

                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">SHIP TO RECEIVER:</p>
                <p className="font-extrabold text-slate-800 text-sm">{activePrintSlipOrder.address.name}</p>
                <p className="text-slate-600 font-medium">{activePrintSlipOrder.address.street}</p>
                <p className="text-slate-600">{activePrintSlipOrder.address.city}, {activePrintSlipOrder.address.state} — <b>{activePrintSlipOrder.address.pincode}</b></p>
                <p className="text-slate-500 font-semibold">Contact receiver: {activePrintSlipOrder.address.phone}</p>
              </div>

              <div className="border border-slate-300 p-2 text-center rounded-lg bg-white my-3 space-y-1">
                <span className="text-[12px] block font-extrabold">DELHIVERY BARCODE: DL-{activePrintSlipOrder.id}-ST</span>
                <span className="font-mono text-xs opacity-40">||| | | |||| || | | || | | ||</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Weight: 0.8 kg</span>
                <span>Payment: <b>{activePrintSlipOrder.paymentStatus}</b> via {activePrintSlipOrder.paymentMethod}</span>
              </div>
            </Paper>
          ) : (
            <Paper className="p-6 rounded-3xl border border-slate-100 bg-slate-50 text-slate-400 text-center flex flex-col items-center justify-center min-h-[220px]">
              <Printer className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold">Select an active client order from listing list to preview packing envelope slip.</p>
            </Paper>
          )}
        </div>
      )}

      {/* Tab 4: QnA queries reviews inside products */}
      {activeSubTab === "qna" && (
        <Paper className="p-4 rounded-3xl border border-slate-100 bg-white space-y-4">
          <Typography variant="subtitle2" className="text-slate-800 font-bold text-xs uppercase tracking-wider">Awaiting Official Support Answer</Typography>
          
          <div className="divide-y divide-slate-100 space-y-4">
            {products.flatMap(p => p.qna.map(q => ({ product: p, qna: q }))).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Excellent! Zero pending customer Q&As across standard catalog.</p>
            ) : (
              products.flatMap(p => p.qna.map(q => ({ product: p, qna: q }))).map(({ product, qna }) => (
                <div key={qna.id} className="py-3 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Query on: <span className="text-indigo-600 font-bold font-sans">{product.name}</span></span>
                    <Chip label={qna.answer ? "ANSWERED" : "AWAITING REPLY"} size="small" className={`h-4 text-[8px] font-bold ${qna.answer ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700 animate-pulse'}`} />
                  </div>
                  <p className="bg-slate-50 p-2.5 rounded-lg border-l-2 border-amber-400 font-medium"><b>Question:</b> {qna.question}</p>
                  
                  {qna.answer ? (
                    <p className="text-slate-500 pl-4 font-sans"><b>Your answer:</b> {qna.answer}</p>
                  ) : (
                    <div className="flex gap-2">
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Write dynamic seller reply response..."
                        value={qnaReplyText[`${product.id}-${qna.id}`] || ""}
                        onChange={(e) => setQnaReplyText(prev => ({ ...prev, [`${product.id}-${qna.id}`]: e.target.value }))}
                        slotProps={{ input: { className: "text-xs rounded-xl" } }}
                      />
                      <Button
                        size="small"
                        onClick={() => handlePostQnaReply(product.id, qna.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-4 text-[10px]"
                      >
                        Submit Reply
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Paper>
      )}

      {/* CSV Editor popup dialogue */}
      <Dialog open={csvOpen} onClose={() => setCsvOpen(false)} slotProps={{ paper: { className: "rounded-3xl p-4 max-w-lg w-full" } }}>
        <DialogTitle className="font-bold">Excel CSV Bulk Spreadsheet Upload</DialogTitle>
        <DialogContent className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Paste raw products data comma split values down below. We will parse it and append rows into standard active storefront catalogue instantly.
          </p>

          <Button size="small" variant="outlined" onClick={handleLoadSampleCSV} className="rounded-xl border-slate-200 text-slate-700 font-bold block text-xs">Load Sample Template</Button>
          
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder="Name,Description,Price,MRP,Category,Brand,Stock"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            slotProps={{ input: { className: "font-mono text-xs rounded-xl" } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCsvOpen(false)} className="text-slate-500 font-bold">Close</Button>
          <Button 
            onClick={handleBulkCsvSubmit} 
            disabled={!csvText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold rounded-xl px-4 py-1.5"
          >
            Slices Parsing & Append
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
