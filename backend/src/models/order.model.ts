export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  
  // Shipping information
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  
  // Payment information
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: Date;
}

export interface CreateOrderDTO {
  items: {
    productId: string;
    productName: string;
    productImage: string;
    productCategory: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentInfo: {
    method: string;
  };
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
