import { Product, Category } from "@/types/product";

export const categories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop",
    productCount: 156,
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
    productCount: 243,
  },
  {
    id: "3",
    name: "Home & Living",
    slug: "home-living",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop",
    productCount: 189,
  },
  {
    id: "4",
    name: "Beauty",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    productCount: 98,
  },
  {
    id: "5",
    name: "Sports",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop",
    productCount: 67,
  },
  {
    id: "6",
    name: "Books",
    slug: "books",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop",
    productCount: 312,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    price: 2999,
    originalPrice: 4999,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    ],
    description: "Premium noise cancelling over-ear headphones with 30 hours battery life and crystal clear audio quality.",
    stock_quantity: 50,
    rating: 4.5,
    reviews_count: 128,
    badge: "sale",
  },
  {
    id: "2",
    name: "Premium Cotton T-Shirt",
    price: 799,
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    ],
    description: "100% organic cotton crew neck t-shirt with a relaxed fit. Perfect for everyday wear.",
    stock_quantity: 100,
    rating: 4.8,
    reviews_count: 256,
    badge: "bestseller",
  },
  {
    id: "3",
    name: "Smart Watch Pro",
    price: 8999,
    originalPrice: 12999,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    ],
    description: "Advanced smartwatch with heart rate monitoring, GPS tracking, and 7 days battery life.",
    stock_quantity: 30,
    rating: 4.6,
    reviews_count: 89,
    badge: "sale",
  },
  {
    id: "4",
    name: "Leather Crossbody Bag",
    price: 2499,
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    ],
    description: "Handcrafted genuine leather crossbody bag with adjustable strap and multiple compartments.",
    stock_quantity: 45,
    rating: 4.7,
    reviews_count: 167,
    badge: "new",
  },
  {
    id: "5",
    name: "Minimalist Desk Lamp",
    price: 1299,
    category: "Home & Living",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    ],
    description: "Modern LED desk lamp with adjustable brightness and color temperature. USB charging port included.",
    stock_quantity: 75,
    rating: 4.4,
    reviews_count: 93,
  },
  {
    id: "6",
    name: "Running Shoes Ultra",
    price: 5999,
    originalPrice: 7999,
    category: "Sports",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    ],
    description: "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
    stock_quantity: 60,
    rating: 4.9,
    reviews_count: 341,
    badge: "bestseller",
  },
  {
    id: "7",
    name: "Ceramic Plant Pot Set",
    price: 899,
    category: "Home & Living",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop",
    ],
    description: "Set of 3 handmade ceramic plant pots in different sizes. Perfect for succulents and small plants.",
    stock_quantity: 120,
    rating: 4.3,
    reviews_count: 78,
    badge: "new",
  },
  {
    id: "8",
    name: "Luxury Face Serum",
    price: 1999,
    category: "Beauty",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
    ],
    description: "Advanced anti-aging serum with vitamin C, hyaluronic acid, and natural extracts.",
    stock_quantity: 85,
    rating: 4.8,
    reviews_count: 203,
    badge: "bestseller",
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
