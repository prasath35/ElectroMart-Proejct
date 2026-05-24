export type UserRole = 'Guest' | 'Customer' | 'Seller' | 'DeliveryAgent' | 'Admin' | 'SuperAdmin';

export interface VariantOption {
  name: string; // e.g. "Color", "Size", "Storage"
  values: string[]; // e.g. ["Midnight Noir", "Titanium Silver"], ["128GB", "256GB"]
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  verified: boolean;
  helpful: number;
  photos?: string[];
  reply?: string;
}

export interface QnA {
  id: string;
  question: string;
  askedBy: string;
  askedDate: string;
  answer?: string;
  answeredBy?: string;
  answeredDate?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  category: string;
  brand: string;
  images: string[];
  video?: string;
  rating: number;
  stock: number;
  variants?: VariantOption[];
  specifications: Record<string, string>;
  reviews: Review[];
  qna: QnA[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant: Record<string, string>; // e.g. { Color: "Blue", Size: "M" }
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  address: Address;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  status: 'Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  date: string;
  trackingHistory: { status: string; date: string; description: string; currentLat?: number; currentLng?: number }[];
  couponCode?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minCartValue: number;
  description: string;
}
