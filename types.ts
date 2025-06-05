export interface Product {
  id: string;
  name:string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl: string;
  specifications: Record<string, string>;
  stock: number;
  isTrashed: boolean; // Ürünün çöpte olup olmadığını belirtir
}

export enum ProductCategory {
  ELECTRONICS = "Elektronik",
  SOFTWARE = "Yazılım",
  HARDWARE = "Donanım",
  SERVICES = "Hizmetler",
  OFFICE_SUPPLIES = "Ofis Malzemeleri",
  OTOMOTIV_YEDEK_PARCA = "Otomotiv Yedek Parça", 
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'super_admin' | 'manager' | 'user';
  discountRate: number; 
  accessibleCategories: ProductCategory[]; 
  isActive: boolean; 
  password?: string; 

  companyName?: string;
  taxId?: string;
  phoneNumber?: string;
  isPendingApproval?: boolean; // Yeni eklendi: Kullanıcı onayı bekliyor mu?

  // Yöneticiye özel yetkiler
  canSetUserDiscounts?: boolean; 
  canCreateNewUsers?: boolean;
  canManageAllProducts?: boolean; 
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export enum OrderStatus {
  ORDER_CONFIRMED = "Sepet Onaylandı", // Müşteri siparişi oluşturdu, ödeme bekleniyor.
  AWAITING_PAYMENT = "Ödeme Bekliyor", // Yönetici siparişi inceledi, müşteriden ödeme bekleniyor.
  PAYMENT_PROOF_UPLOADED = "Ödeme Makbuzu Yüklendi", 
  PAYMENT_CONFIRMED = "Ödeme Onaylandı", 
  PROCESSING = "Sipariş Hazırlanıyor", 
  SHIPPED = "Gemiye Yüklendi / Yola Çıktı", 
  IN_TRANSIT = "Yolda",
  IN_CUSTOMS = "Gümrükte", 
  NEARING_DELIVERY = "Teslimat Noktasına Yaklaştı",
  DELIVERED = "Teslim Edildi", 
  CANCELLED = "İptal Edildi", 
}

export interface Order {
  id: string; 
  userId: string; 
  orderDate: Date;
  items: CartItem[]; 
  subtotal: number; 
  discountApplied: number; 
  grandTotal: number; 
  status: OrderStatus;
  paymentProofUrl?: string; 
  customerNotes?: string; 
  containerPhotoUrl?: string; 
  adminNotes?: string; 
}

// App.tsx içinde hangi sayfanın görüntüleneceğini belirtmek için
export type PageView = 'catalog' | 'about' | 'trash' | 'user_management' | 'cart' | 'orders' | 'product_management' | 'register' | 'order_detail'; // 'order_detail' eklendi