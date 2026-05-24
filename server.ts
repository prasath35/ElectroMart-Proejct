import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Product, Order, Address, Coupon, Review, QnA } from "./src/types";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// Lazy initialization of Gemini client to prevent startup failure if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-memory Database simulating PostgreSQL with Entity Framework
let products: Product[] = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro Max",
    description: "Experience the ultimate iPhone. Titanium design, game-changing A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    price: 1199,
    mrp: 1299,
    category: "Electronics",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80"
    ],
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    rating: 4.8,
    stock: 12,
    variants: [
      { name: "Color", values: ["Natural Titanium", "Midnight Noir", "Blue Silver"] },
      { name: "Storage", values: ["256GB", "512GB", "1TB"] }
    ],
    specifications: {
      "Display": "6.7-inch Super Retina XDR with ProMotion",
      "Processor": "A17 Pro chip with 6-core GPU",
      "Camera": "48MP Main | Telephoto | Ultra Wide",
      "Battery": "Up to 29 hours video playback",
      "Weight": "221 grams"
    },
    reviews: [
      {
        id: "rev-1-1",
        user: "Sarah Jenkins",
        rating: 5,
        title: "Spectacular Phone!",
        text: "The natural titanium color is absolutely stunning. It feels significantly lighter than my old iPhone 14 Pro Max. Camera zoom is insane!",
        date: "2026-04-10",
        verified: true,
        helpful: 18
      },
      {
        id: "rev-1-2",
        user: "Marcus Aurelius",
        rating: 4,
        title: "Incredible speed, pricey though",
        text: "Runs every mobile game flawlessly. Battery indeed lasts all day. High cost is my only gripe.",
        date: "2026-05-02",
        verified: true,
        helpful: 5
      }
    ],
    qna: [
      {
        id: "qna-1-1",
        question: "Does it come with a power adapter in the box?",
        askedBy: "John Miller",
        askedDate: "2026-03-15",
        answer: "No, Apple does not include a power adapter in the box anymore to reduce environmental impact. It only includes a USB-C charging cable.",
        answeredBy: "ElectroMart Official",
        answeredDate: "2026-03-16"
      }
    ]
  },
  {
    id: "prod-2",
    name: "Sony WH-1000XM5 Wireless Headphones",
    description: "The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Leading noise cancellation, pristine sound quality, and exceptionally clear hands-free calling.",
    price: 348,
    mrp: 399,
    category: "Electronics",
    brand: "Sony",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80"
    ],
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    rating: 4.6,
    stock: 25,
    variants: [
      { name: "Color", values: ["Matte Black", "Platinum Silver", "Midnight Blue"] }
    ],
    specifications: {
      "Type": "Over-Ear",
      "Battery Life": "Up to 30 hours",
      "Bluetooth Version": "5.2",
      "Drivers": "30mm customized dome driver",
      "Active Noise Cancellation": "Yes (Auto NC Optimizer)"
    },
    reviews: [
      {
        id: "rev-2-1",
        user: "David Chen",
        rating: 5,
        title: "Best ANC in the market",
        text: "I take 4-5 flights a month, and these headphones are a lifesaver. They completely block out the cabin noise, and they are incredibly comfortable.",
        date: "2026-05-01",
        verified: true,
        helpful: 24
      }
    ],
    qna: [
      {
        id: "qna-2-1",
        question: "Can these headphones connect to a laptop and a phone simultaneously?",
        askedBy: "Clara Oswald",
        askedDate: "2026-04-20",
        answer: "Yes, they support Multipart connection which allows you to pair with two Bluetooth devices at the same time and switch seamlessly.",
        answeredBy: "ElectroMart Official",
        answeredDate: "2026-04-21"
      }
    ]
  },
  {
    id: "prod-3",
    name: "Ergonomic Mesh Office Chair",
    description: "Work in ultimate comfort. Featuring fully adjustable lumbar support, 3D armrests, lockable recline, and high-elasticity breathable mesh back.",
    price: 189,
    mrp: 249,
    category: "Home & Furniture",
    brand: "ErgoComfort",
    images: [
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.5,
    stock: 4,
    variants: [
      { name: "Frame Color", values: ["Space Gray", "Obsidian Black"] }
    ],
    specifications: {
      "Backrest Height": "Adjustable (Up to 10cm)",
      "Max Weight Capacity": "300 lbs",
      "Base Material": "Reinforced aluminum alloy",
      "Gas Lift Class": "Class 4 certified"
    },
    reviews: [
      {
        id: "rev-3-1",
        user: "Robert T.",
        rating: 5,
        title: "Cured my lower back pain",
        text: "No more stiffness after 8-hour coding sessions! Highly recommend adjusting the lumbar dial to your height.",
        date: "2026-04-28",
        verified: true,
        helpful: 12
      }
    ],
    qna: []
  },
  {
    id: "prod-4",
    name: "Nike air Zoom Pegasus 40",
    description: "Everyday training shoes for runners. Engineered with Nike React foam and Zoom Air units to offer lightweight responsiveness and customized stability.",
    price: 120,
    mrp: 145,
    category: "Fashion",
    brand: "Nike",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.7,
    stock: 14,
    variants: [
      { name: "Size (US)", values: ["8", "9", "10", "11"] },
      { name: "Color", values: ["Sports Orange", "Stealth Grey", "Neon Blue"] }
    ],
    specifications: {
      "Activity": "Road Running",
      "Heel-to-Toe Drop": "10 mm",
      "Outer Material": "Breathable Flymesh",
      "Sole Type": "Waffle patterned traction rubber"
    },
    reviews: [],
    qna: []
  },
  {
    id: "prod-5",
    name: "Dyson V15 Detect Cordless Vacuum",
    description: "The most powerful, intelligent cordless vacuum. Reveals microscopic particles. Calculates and categorizes sucked-up debris in real time on the LCD screen.",
    price: 749,
    mrp: 799,
    category: "Home Appliances",
    brand: "Dyson",
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.9,
    stock: 2,
    variants: [],
    specifications: {
      "Suction Power": "230 AW",
      "Run Time": "Up to 60 minutes",
      "Bin Volume": "0.2 gallons",
      "Filtration": "Whole-machine fully sealed HEPA filtration"
    },
    reviews: [
      {
        id: "rev-5-1",
        user: "Eleanor Vance",
        rating: 5,
        title: "Simply wizardry",
        text: "The green laser is a total gamechanger. It shows dust I had no idea was even there. Pricey but totally worth it.",
        date: "2026-05-18",
        verified: true,
        helpful: 30
      }
    ],
    qna: []
  }
];

let orders: any[] = [
  {
    id: "ord-8859",
    items: [
      {
        product: products[1],
        quantity: 1,
        selectedVariant: { Color: "Matte Black" }
      }
    ],
    subtotal: 348,
    discount: 0,
    deliveryFee: 10,
    tax: 27.84,
    total: 385.84,
    address: {
      id: "addr-1",
      name: "Tony Stark",
      phone: "+1 555 982 7212",
      street: "10880 Malibu Point",
      city: "Malibu",
      state: "California",
      pincode: "90265",
      type: "Home",
      isDefault: true
    },
    paymentMethod: "Credit Card (Visa)",
    paymentStatus: "Paid",
    status: "Shipped",
    date: "2026-05-23T10:00:00Z",
    trackingHistory: [
      { status: "Placed", date: "2026-05-23T10:00:00Z", description: "Order successfully submitted by client", currentLat: 34.0194, currentLng: -118.4912 },
      { status: "Packed", date: "2026-05-23T14:30:00Z", description: "Inventory packed securely at Malibu Hub", currentLat: 34.0200, currentLng: -118.4800 },
      { status: "Shipped", date: "2026-05-24T08:00:00Z", description: "In transit with logistics center (Delhivery Express Tracker: DL-8893)", currentLat: 34.0250, currentLng: -118.4500 }
    ],
    couponCode: undefined
  }
];

let savedAddresses = [
  {
    id: "addr-1",
    name: "Tony Stark",
    phone: "+1 555 982 7212",
    street: "10880 Malibu Point",
    city: "Malibu",
    state: "California",
    pincode: "90265",
    type: "Home",
    isDefault: true
  }
];

let coupons = [
  { code: "SAVE50", discountPercent: 15, maxDiscount: 50, minCartValue: 100, description: "Get 15% discount up to $50 on orders above $100" },
  { code: "WELCOME10", discountPercent: 10, maxDiscount: 20, minCartValue: 40, description: "Get 10% discount on orders above $40" },
  { code: "FREESHIP", discountPercent: 5, maxDiscount: 10, minCartValue: 0, description: "Extra $10 off to offset shipping fees!" }
];

let sessionData = {
  twoFA: false,
  devices: [
    { id: "dev-1", name: "Chrome on macOS Catalina (Current IP: 192.168.1.1)", active: true, loginTime: "2026-05-24T13:39:57Z" },
    { id: "dev-2", name: "Safari on Apple iPhone 15 Pro", active: false, loginTime: "2026-05-22T08:42:00Z" }
  ]
};

// Users Database with credentials for each testing role
let users = [
  { email: "guest@electromart.com", name: "Guest User", password: "guestpassword", role: "Guest" },
  { email: "tonystark074310@gmail.com", name: "Tony Stark", password: "tony123", role: "Customer" },
  { email: "customer@electromart.com", name: "Sarah Jenkins", password: "customer123", role: "Customer" },
  { email: "seller@electromart.com", name: "Tech Seller Pro", password: "seller123", role: "Seller" },
  { email: "delivery@electromart.com", name: "Courier Agent", password: "delivery123", role: "DeliveryAgent" },
  { email: "admin@electromart.com", name: "Platform Admin", password: "admin123", role: "Admin" },
  { email: "superadmin@electromart.com", name: "Chief Officer", password: "super123", role: "SuperAdmin" }
];

// --- AUTHENTICATION API ROUTES ---

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required credentials" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password credentials provided." });
  }

  res.json({
    email: user.email,
    name: user.name,
    role: user.role,
    token: `session_token_${Date.now()}`
  });
});

// POST /api/auth/forgot-password - SMTP recovery dispatcher
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Receiver email address is required" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "No registered user account found with this email" });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "no-reply@electromart.com";

  let transporter;
  let isEthereal = false;
  let etherealUrl = "";

  try {
    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    } else {
      console.log("No custom SMTP configured. Bootstrapping dynamic test Ethereal SMTP...");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      isEthereal = true;
    }

    const resetToken = `reset_${Math.random().toString(36).substr(2, 9)}`;
    const resetLink = req.headers.referer 
      ? `${req.headers.referer.split('?')[0]}?reset_token=${resetToken}&email=${encodeURIComponent(user.email)}`
      : `http://localhost:3000?reset_token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    const info = await transporter.sendMail({
      from: isEthereal ? `"ElectroMart Support" <${transporter.options.auth?.user}>` : `"ElectroMart Support" <${smtpFrom}>`,
      to: user.email,
      subject: "🔑 ElectroMart Account Password Reset Instructions Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #4f46e5; text-align: center; margin-top: 0;">🔑 ElectroMart Password Recovery</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;"/>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to recover the password connected to your <strong>${user.role}</strong> account (${user.email}).</p>
          <p>To set up a fresh password, clear authentication blockages, and safeguard your account credentials, please click the secure link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">Reset Password Now</a>
          </div>
          <p style="font-size: 11px; color: #64748b; margin-top: 20px;">If this was not requested by you, please safely ignore this email. The request will expire inside 2 hours. Do not share this URL with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin-bottom: 0;">⚡ PCI-DSS compliant Secure ElectroMart App Environment</p>
        </div>
      `
    });

    if (isEthereal) {
      etherealUrl = nodemailer.getTestMessageUrl(info) || "";
      console.log(`Ethereal Test Mail Sent successfully! Preview message at: ${etherealUrl}`);
    }

    res.json({ 
      success: true, 
      message: "Security verification email dispatched successfully using SMTP.", 
      info: {
        to: user.email,
        messageId: info.messageId,
        isEthereal,
        previewUrl: etherealUrl
      }
    });

  } catch (error: any) {
    console.error("SMTP Mail dispatcher failed with error:", error);
    res.status(500).json({ error: "Failed sending SMTP recovery email: " + error.message });
  }
});

// POST /api/auth/reset-password
app.post("/api/auth/reset-password", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and new password are required" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.password = password;
  res.json({ success: true, message: "Your account password has been reset successfully. Please use your new password to log in!" });
});

// --- REST API ENDPOINTS ---

// Endpoints: Products
app.get("/api/products", (req, res) => {
  const { search, category, brand, minPrice, maxPrice, sort } = req.query;
  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (brand) {
    filtered = filtered.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(minPrice as string));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(maxPrice as string));
  }
  if (search) {
    const term = (search as string).toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  // Sorting
  if (sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === "newest") {
    // Reverse simulated order of insertion
    filtered.reverse();
  }

  res.json(filtered);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// Create/Edit listing (Seller portal)
app.post("/api/products", (req, res) => {
  const { name, description, price, mrp, category, brand, images, stock, variants, specifications } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Name, price and category are required attributes" });
  }

  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    description: description || "",
    price: parseFloat(price),
    mrp: mrp ? parseFloat(mrp) : parseFloat(price) + 50,
    category,
    brand: brand || "Generic",
    images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"],
    rating: 5.0,
    stock: parseInt(stock) || 10,
    variants: variants || [],
    specifications: specifications || {},
    reviews: [],
    qna: []
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Bulk upload CSV endpoint (simulated parsing)
app.post("/api/products/bulk", (req, res) => {
  const { csvText } = req.body;
  if (!csvText) {
    return res.status(400).json({ error: "No CSV content uploaded" });
  }

  const lines = csvText.split("\n");
  let addedCount = 0;
  
  // Headers: Name,Description,Price,MRP,Category,Brand,Stock
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple split supporting basic escape
    const parts = line.split(",").map((s: string) => s.replace(/(^["']|["']$)/g, "").trim());
    if (parts.length >= 3) {
      const name = parts[0];
      const desc = parts[1] || "";
      const price = parseFloat(parts[2]) || 99;
      const mrp = parseFloat(parts[3]) || price + 20;
      const category = parts[4] || "Uncategorized";
      const brand = parts[5] || "Generic";
      const stock = parseInt(parts[6]) || 15;

      products.push({
        id: `prod-${Date.now()}-${i}`,
        name,
        description: desc,
        price,
        mrp,
        category,
        brand,
        images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80"],
        rating: 4.5,
        stock,
        variants: [],
        specifications: { "Uploaded via": "Bulk Seller Portal" },
        reviews: [],
        qna: []
      });
      addedCount++;
    }
  }

  res.json({ message: `Successfully parsed CSV & added ${addedCount} products.`, count: addedCount });
});

// Update stock
app.patch("/api/products/:id/stock", (req, res) => {
  const { stock } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  product.stock = parseInt(stock);
  res.json(product);
});

// Add Review
app.post("/api/products/:id/reviews", (req, res) => {
  const { user, rating, title, text, photos } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const newReview = {
    id: `rev-${Date.now()}`,
    user: user || "Verified Shopper",
    rating: parseInt(rating) || 5,
    title: title || "",
    text: text || "",
    date: new Date().toISOString().split('T')[0],
    verified: true,
    helpful: 0,
    photos: photos || []
  };

  product.reviews.unshift(newReview);
  
  // Recalculate average rating
  const totalStars = product.reviews.reduce((acc: number, r: Review) => acc + r.rating, 0);
  product.rating = parseFloat((totalStars / product.reviews.length).toFixed(1));

  res.status(201).json(newReview);
});

// Answer Q&A
app.post("/api/products/:id/qna/:qnaId/answer", (req, res) => {
  const { answer, answeredBy } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const qnaItem = product.qna.find(q => q.id === req.params.qnaId);
  if (!qnaItem) return res.status(404).json({ error: "Question not found" });

  qnaItem.answer = answer || "Yes, this matches the standard product specifications.";
  qnaItem.answeredBy = answeredBy || "Official Seller Platform Support";
  qnaItem.answeredDate = new Date().toISOString().split('T')[0];

  res.json(qnaItem);
});

// Submit Q&A
app.post("/api/products/:id/qna", (req, res) => {
  const { question, askedBy } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const newQna: QnA = {
    id: `qna-${Date.now()}`,
    question: question || "",
    askedBy: askedBy || "Client Customer",
    askedDate: new Date().toISOString().split('T')[0]
  };

  product.qna.push(newQna);
  res.status(201).json(newQna);
});

// Endpoints: Coupons
app.post("/api/coupons/apply", (req, res) => {
  const { code, cartValue } = req.body;
  const coupon = coupons.find(c => c.code.toUpperCase() === (code || "").toUpperCase());
  
  if (!coupon) {
    return res.status(400).json({ error: "Invalid coupon code." });
  }
  if (cartValue < coupon.minCartValue) {
    return res.status(400).json({ error: `Coupon requires minimum order value of $${coupon.minCartValue}` });
  }

  const calculatedDiscount = Math.min((cartValue * coupon.discountPercent) / 100, coupon.maxDiscount);
  res.json({ coupon, discount: calculatedDiscount });
});

// Create coupon (Admin panel)
app.post("/api/coupons", (req, res) => {
  const { code, discountPercent, maxDiscount, minCartValue, description } = req.body;
  if (!code || !discountPercent) {
    return res.status(400).json({ error: "Code and discount percentage are required" });
  }

  const newCoupon = {
    code: code.toUpperCase(),
    discountPercent: parseFloat(discountPercent),
    maxDiscount: maxDiscount ? parseFloat(maxDiscount) : 100,
    minCartValue: minCartValue ? parseFloat(minCartValue) : 0,
    description: description || `Save ${discountPercent}% on your checkout total`
  };

  coupons.push(newCoupon);
  res.status(201).json(newCoupon);
});

// Endpoints: Profiles & Addresses
app.get("/api/profile/addresses", (req, res) => {
  res.json(savedAddresses);
});

app.post("/api/profile/addresses", (req, res) => {
  const { name, phone, street, city, state, pincode, type } = req.body;
  if (!name || !phone || !street || !city || !pincode) {
    return res.status(400).json({ error: "All vital address attributes are required" });
  }

  const newAddr = {
    id: `addr-${Date.now()}`,
    name,
    phone,
    street,
    city,
    state: state || "",
    pincode,
    type: type || "Home",
    isDefault: savedAddresses.length === 0
  };

  savedAddresses.push(newAddr);
  res.status(201).json(newAddr);
});

app.post("/api/profile/session/2fa", (req, res) => {
  const { twoFA } = req.body;
  sessionData.twoFA = !!twoFA;
  res.json({ message: `Two-Factor Authorization toggled to: ${sessionData.twoFA}`, twoFA: sessionData.twoFA });
});

app.post("/api/profile/session/logout-others", (req, res) => {
  sessionData.devices = sessionData.devices.filter(d => d.active);
  res.json({ message: "Successfully logged out of all secondary devices.", devices: sessionData.devices });
});

// Endpoints: Orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { items, subtotal, discount, deliveryFee, tax, total, address, paymentMethod, couponCode } = req.body;
  if (!items || items.length === 0 || !total) {
    return res.status(400).json({ error: "Cannot create an empty order." });
  }

  // Create order
  const newOrder = {
    id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
    items,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    address: address || savedAddresses[0] || { name: "Guest User", phone: "", street: "Enter delivery details", city: "Generic", state: "State", pincode: "000000", type: "Home" },
    paymentMethod: paymentMethod || "Cash on Delivery",
    paymentStatus: paymentMethod === "COD" || paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
    status: "Placed",
    date: new Date().toISOString(),
    trackingHistory: [
      { status: "Placed", date: new Date().toISOString(), description: "Order received and being processed", currentLat: 34.0522, currentLng: -118.2437 }
    ],
    couponCode
  };

  // Dedux stock for bought products
  items.forEach((item: any) => {
    const prodRef = products.find(p => p.id === item.product.id);
    if (prodRef) {
      prodRef.stock = Math.max(0, prodRef.stock - item.quantity);
    }
  });

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// Update order status (Delivery Agent)
app.patch("/api/orders/:id/status", (req, res) => {
  const { status, description, lat, lng } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = status;
  order.trackingHistory.push({
    status,
    date: new Date().toISOString(),
    description: description || `Status updated to ${status} by field operations team`,
    currentLat: lat || 34.0522,
    currentLng: lng || -118.2437
  });

  res.json(order);
});

// E-invoice Download (E-bill generator)
app.get("/api/orders/:id/invoice", (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).send("Order Invoice unavailable - Order not found");

  const itemsHtml = order.items.map((it: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${it.product.name} (Variant: ${Object.entries(it.selectedVariant).map(([k, v]) => `${k}:${v}`).join(', ')})</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${it.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${it.product.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(it.product.price * it.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  const invoiceHtml = `
    <html>
    <head>
      <title>Invoice - ${order.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0052cc; padding-bottom: 20px; }
        .invoice-title { font-size: 28px; font-weight: bold; color: #0052cc; }
        .details { display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 30px; }
        .sec { width: 45%; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f4F5F7; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
        .totals { margin-top: 30px; text-align: right; }
        .totals p { margin: 5px 0; font-size: 14px; }
        .grand { font-size: 18px; font-weight: bold; color: #0052cc; border-top: 2px solid #ddd; padding-top: 10px; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body onload="window.print()">
      <div class="header">
        <div>
          <h1 style="margin:0; font-size:24px;">ELECTROMART eCOMMERCE LTD</h1>
          <p style="margin:5px 0 0 0; color:#555;">AI Powered Smart Store & Logistics Marketplace</p>
        </div>
        <div style="text-align: right;">
          <div class="invoice-title">INVOICE</div>
          <p style="margin:5px 0 0 0;">ID: <b>${order.id}</b></p>
          <p style="margin:5px 0 0 0;">Issued: ${new Date(order.date).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div class="details">
        <div class="sec">
          <h3>Billed To:</h3>
          <p><b>${order.address.name}</b><br/>
          ${order.address.street}<br/>
          ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br/>
          Phone: ${order.address.phone}</p>
        </div>
        <div class="sec" style="text-align: right;">
          <h3>Payment Information:</h3>
          <p>Method: ${order.paymentMethod}<br/>
          Status: <b>${order.paymentStatus}</b><br/>
          Shipment Mode: Flat Rate Courier</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product Specification / Variants</th>
            <th style="text-align: center; width: 80px;">Qty</th>
            <th style="text-align: right; width: 100px;">Unit Price</th>
            <th style="text-align: right; width: 120px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
        ${order.discount > 0 ? `<p style="color: green;">Discount Recouped: -$${order.discount.toFixed(2)}</p>` : ""}
        <p>Delivery logistics surcharge: $${order.deliveryFee.toFixed(2)}</p>
        <p>Estimated GST/Vat (8%): $${order.tax.toFixed(2)}</p>
        <p class="grand">Grand Absolute Total: $${order.total.toFixed(2)}</p>
      </div>

      <div class="footer">
        <p>Thank you for choosing ElectroMart! This invoice is digitally generated under secure encryption.</p>
        <p>For support, returns or refunds, please access our 24/7 AI chatbot assistant or file a ticket in customer center.</p>
      </div>
    </body>
    </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(invoiceHtml);
});

// Admin metrics
app.get("/api/admin/metrics", (req, res) => {
  const totalGMV = orders.reduce((sum, ord) => sum + ord.total, 0);
  const unitsSold = orders.reduce((sum, ord) => sum + ord.items.reduce((acc: number, it: any) => acc + it.quantity, 0), 0);
  const productsStock = products.reduce((sum, p) => sum + p.stock, 0);

  res.json({
    gmv: totalGMV,
    orderCount: orders.length,
    unitsSold,
    inventoryCount: products.length,
    totalStockCount: productsStock,
    activeCoupons: coupons.length,
    usersCount: 154,
    recentKYC: [
      { id: "kyc-1", sellerName: "Global Tech Inc", documentType: "GSTIN", documentCode: "22AAAAA0000A1Z5", status: "Approved" },
      { id: "kyc-2", sellerName: "Urban Threads Store", documentType: "PAN & GST", documentCode: "DL99182C", status: "Pending" }
    ]
  });
});

// --- ADVANCED & AI FEATURES (SERVER-SIDE GEMINI API INTENT) ---

// Semantic Search Endpoint (NLP-powered query parsing from products list)
app.post("/api/search/semantic", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Search query is required for AI vector matching." });

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant system fallback if API key is not active
    const lower = query.toLowerCase();
    const fallbackResults = products.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.description.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
    );
    return res.json({
      results: fallbackResults,
      explanation: "Local database match (AI Gemini Key not set in Secrets).",
      groundingUrls: []
    });
  }

  try {
    // Generate structured query response matching standard schema
    const promptMessage = `Given the search query: "${query}", match the most relevant items from the catalog below. Match semantic matching (e.g. if looking for "phone", offer iPhone; if looking for "gift for coder", offer mesh ergonomic chair or Sony headphones). 
Catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, desc: p.description, category: p.category, brand: p.brand, price: p.price })))}
Return JSON with list of relevant matching product IDs and a 1-sentence friendly explanation of why these match.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchingIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of custom product id string keys that align with intent"
            },
            explanation: {
              type: Type.STRING,
              description: "Short friendly explanation of matching choice"
            }
          },
          required: ["matchingIds", "explanation"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const matchedProducts = products.filter(p => (parsed.matchingIds || []).includes(p.id));
    
    // If empty result, fallback to standard matching
    const finalResults = matchedProducts.length > 0 ? matchedProducts : products.slice(0, 3);
    const finalExplanation = parsed.explanation || "Selected based on matching departments.";

    res.json({
      results: finalResults,
      explanation: finalExplanation,
      aiActive: true
    });
  } catch (error: any) {
    console.error("Semantic search failed:", error);
    res.status(500).json({ error: "Gemini server-side search parsing exception occured." });
  }
});

// Chatbot assistant supporting order tracking & catalog recommendation
app.post("/api/chat", async (req, res) => {
  const { messages, currentRole } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required for chatbot streaming state." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant fallback simulation
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    let reply = "Hello! I am your ElectroMart assistant. How can I help you? (Set your GEMINI_API_KEY in Secrets for full intelligent answers)";
    if (lastMsg.includes("iphone") || lastMsg.includes("phone")) {
      reply = "I highly recommend the iPhone 15 Pro Max! It contains natural titanium casing, 256GB storage and costs $1199 (Original list MRP $1299). Would you like to buy now?";
    } else if (lastMsg.includes("chair") || lastMsg.includes("sit")) {
      reply = "Our Ergonomic Mesh Office Chair with fully adjustable lumbar dial is available for $189 to keep your posture excellent during coding.";
    } else if (lastMsg.includes("track") || lastMsg.includes("order")) {
      reply = `Active Order tracking details: Order ID ord-8859 containing Sony WH-1000XM5 headphones is currently SHIPPED. Truck is in California Malibu Hub.`;
    }
    return res.json({ text: reply });
  }

  try {
    const formattedChat = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Add comprehensive eCommerce system context as custom models chat starter
    const systemRule = `You are Chloe, the official AI Customer Advocate for ElectroMart. You are friendly, concise, and professional. 
Your ultimate goal is to assist users based on their active role (Active testing role: ${currentRole || 'Customer'}).
You have live absolute databases access to our product catalog and active orders:
- Catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category, stock: p.stock })))}
- Active Orders DB: ${JSON.stringify(orders.map(o => ({ id: o.id, itemsSummary: o.items.map((i: any) => i.product.name).join(', '), status: o.status, tracking: o.trackingHistory })))}
- Coupons available: ${JSON.stringify(coupons)}

Answer any user query. If they ask to buy or recommend, look up exact product names from our inventory and suggest them. If they ask about orders, provide the real-time tracking points status described! Help with shipping policies (Free delivery on orders above $100) or size guides. Limit responses to 3-4 professional human-like sentences. Bold crucial details.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      // Map history safely
      contents: [
        { role: 'user', parts: [{ text: `SYSTEM_INSTRUCTIONS: ${systemRule}` }] },
        { role: 'model', parts: [{ text: "Understood. I will act as ElectroMart Chloe Customer assistance under secure full database context." }] },
        ...formattedChat
      ]
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI assistant chat error:", error);
    res.status(500).json({ error: "Gemini server-side assistance exception occured." });
  }
});

// Configure Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ElectroMart server running on port ${PORT}`);
  });
}

startServer();
