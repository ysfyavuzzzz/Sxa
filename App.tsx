
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@google/genai';
import { Product, ProductCategory, ChatMessage, GroundingMetadata, User, PageView, CartItem, Order, OrderStatus } from './types';
import { SAMPLE_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from './constants';
import { createChatSession, sendMessageToChatStream } from './services/geminiService';
import Header from './components/Header';
import ProductFilterSidebar from './components/ProductFilterSidebar';
import ProductList from './components/ProductList';
import ChatAssistant from './components/ChatAssistant';
import LoadingSpinner from './components/LoadingSpinner';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
import TrashPage from './components/TrashPage';
import UserManagementPage from './components/UserManagementPage';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import ProductManagementPage from './components/ProductManagementPage';
import RegisterPage from './components/RegisterPage';
import OrderDetailPage from './components/OrderDetailPage';

// Başlangıç Kullanıcıları
const initialSuperAdmin: User = {
  id: 'superadmin001',
  email: "yusuf.yavuz@roxoe.com.tr",
  username: "Roxoe",
  name: "Yusuf Yavuz (Süper Admin)",
  role: 'super_admin',
  discountRate: 0.1,
  accessibleCategories: [...INITIAL_CATEGORIES],
  isActive: true,
  password: "admin123",
  canSetUserDiscounts: true,
  canCreateNewUsers: true,
  canManageAllProducts: true,
  isPendingApproval: false,
  companyName: "Roxoe B2B Solutions",
  taxId: "1234567890",
  phoneNumber: "05551234567"
};

const initialManager: User = {
  id: 'manager001',
  email: "mudur@ornek.com",
  username: "Mudur",
  name: "Ahmet Çelik (Yönetici)",
  role: 'manager',
  discountRate: 0.05,
  accessibleCategories: [...INITIAL_CATEGORIES],
  isActive: true,
  password: "mudur123",
  canSetUserDiscounts: true, 
  canCreateNewUsers: true,  
  canManageAllProducts: true, 
  isPendingApproval: false,
  companyName: "Örnek A.Ş.",
  taxId: "0987654321",
  phoneNumber: "05559876543"
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedProducts = localStorage.getItem('b2b_products');
      return savedProducts ? JSON.parse(savedProducts) : SAMPLE_PRODUCTS;
    } catch (error) {
      console.error("Error loading products from localStorage:", error);
      return SAMPLE_PRODUCTS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('b2b_users');
      if (savedUsers) return JSON.parse(savedUsers);
      return [initialSuperAdmin, initialManager];
    } catch (error) {
      console.error("Error loading users from localStorage:", error);
      return [initialSuperAdmin, initialManager];
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('b2b_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const savedOrders = localStorage.getItem('b2b_orders');
      return savedOrders ? JSON.parse(savedOrders).map((o:Order) => ({...o, orderDate: new Date(o.orderDate)})) : [];
    } catch (error) {
      console.error("Error loading orders from localStorage:", error);
      return [];
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const [currentGroundingMetadata, setCurrentGroundingMetadata] = useState<GroundingMetadata | undefined>();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false); 
  const [currentPage, setCurrentPage] = useState<PageView>('catalog');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('b2b_products', JSON.stringify(products));
    } catch (error) {
      console.error("Error saving products to localStorage:", error);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('b2b_users', JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('b2b_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  useEffect(() => {
     try {
      localStorage.setItem('b2b_orders', JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving orders to localStorage:", error);
    }
  }, [orders]);

  useEffect(() => {
    if (currentUser && !chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
        setChatMessages([{
          id: 'initial-ai-greeting',
          text: `Merhaba ${currentUser.name.split(' ')[0]}! B2B ürün kataloğumuza hoş geldiniz. Size nasıl yardımcı olabilirim?`,
          sender: 'ai',
          timestamp: new Date()
        }]);
      } catch (error: any) {
        setChatError("YZ asistanı başlatılamadı: " + error.message);
        console.error("Chat session creation error:", error);
      }
    }
  }, [currentUser]);

  const handleLogin = useCallback(async (usernameOrEmail: string, passwordInput: string) => {
    setLoginError(null);
    const user = users.find(
      (u) => (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && u.password === passwordInput
    );
    if (user) {
      if (user.isPendingApproval) {
        setLoginError("Hesabınız yönetici onayı bekliyor. Lütfen daha sonra tekrar deneyin.");
      } else if (user.isActive) {
        setCurrentUser(user);
        setCurrentPage('catalog'); 
      } else {
        setLoginError("Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin.");
      }
    } else {
      setLoginError("Geçersiz kullanıcı adı/e-posta veya şifre.");
    }
  }, [users]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCartItems([]); 
    setChatMessages([]);
    chatSessionRef.current = null;
    setSelectedOrderForDetail(null);
    setCurrentPage('catalog'); 
  };

  const navigateTo = (page: PageView, orderId?: string) => {
    if (page === 'order_detail' && orderId) {
      const orderToView = orders.find(o => o.id === orderId);
      if (orderToView) {
        setSelectedOrderForDetail(orderToView);
        setCurrentPage('order_detail');
      } else {
        alert("Sipariş detayı bulunamadı.");
        setCurrentPage('orders'); // Fallback to orders list
      }
    } else {
      setSelectedOrderForDetail(null); // Diğer sayfalara geçerken detayı temizle
      setCurrentPage(page);
    }
    window.scrollTo(0, 0);
  };
  
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleSelectCategory = (category: ProductCategory | null) => {
    setSelectedCategory(category);
  };

  const handleSoftDeleteProduct = (productId: string) => {
    setProducts(prevProducts => 
        prevProducts.map(p => p.id === productId ? { ...p, isTrashed: true } : p)
    );
  };

  const handleRestoreProduct = (productId: string) => {
    setProducts(prevProducts =>
        prevProducts.map(p => p.id === productId ? { ...p, isTrashed: false } : p)
    );
  };

  const handlePermanentDeleteProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const handleEmptyTrash = () => {
    setProducts(prevProducts => prevProducts.filter(p => !p.isTrashed));
  };

  const handleCreateUser = (newUserData: Omit<User, 'id' | 'password'> & { passwordInput: string }) => {
    const { passwordInput, ...restOfUserData } = newUserData;
    const newUser: User = {
        ...restOfUserData,
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        password: passwordInput, 
        isPendingApproval: false, // Admin tarafından oluşturulan kullanıcılar direkt onaylı
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    alert(`Kullanıcı "${newUser.name}" başarıyla oluşturuldu.`);
  };

  const handleUpdateUser = (updatedUserData: User) => {
    setUsers(prevUsers =>
        prevUsers.map(u => u.id === updatedUserData.id ? { ...u, ...updatedUserData } : u)
    );
    alert(`Kullanıcı "${updatedUserData.name}" başarıyla güncellendi.`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prevUsers =>
        prevUsers.map(u => {
            if (u.id === userId && !u.isPendingApproval) { // Sadece onaylanmış kullanıcılar aktif/pasif yapılabilir
                return { ...u, isActive: !u.isActive };
            }
            return u;
        })
    );
  };
  
  const handleApproveUser = (userId: string) => {
    setUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, isActive: true, isPendingApproval: false } : u)
    );
    alert("Kullanıcı başarıyla onaylandı ve aktif edildi.");
  };


  const handleToggleChat = () => setIsChatOpen(!isChatOpen);

  const handleSendMessageToChat = async (messageText: string) => {
    if (!chatSessionRef.current) {
        setChatError("Sohbet oturumu bulunamadı. Lütfen sayfayı yenileyin.");
        return;
    }
    const userMessage: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true);
    setChatError(null);
    setCurrentGroundingMetadata(undefined);

    const aiMessageId = `msg-ai-${Date.now()}`;
    setChatMessages(prev => [...prev, {
        id: aiMessageId,
        text: "",
        sender: 'ai',
        timestamp: new Date(),
        isLoading: true,
    }]);

    await sendMessageToChatStream(
        chatSessionRef.current,
        messageText,
        (chunkText, isFinal, groundingMeta) => {
            setChatMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: chunkText, isLoading: !isFinal, timestamp: new Date() } : msg
            ));
            if (isFinal) {
                setCurrentGroundingMetadata(groundingMeta);
            }
        },
        (error) => {
            setChatError(error.message);
            setChatMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: "Üzgünüm, bir hata oluştu: " + error.message, isLoading: false, timestamp: new Date() } : msg
            ));
        }
    );
    setIsAiTyping(false);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    if (quantity <=0 || quantity > product.stock) {
        alert("Geçersiz miktar veya yetersiz stok.");
        return;
    }
    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === product.id);
        if (existingItem) {
            const newQuantity = Math.min(product.stock, existingItem.quantity + quantity);
            return prevItems.map(item =>
                item.product.id === product.id ? { ...item, quantity: newQuantity } : item
            );
        } else {
            return [...prevItems, { product, quantity }];
        }
    });
    alert(`${product.name} (${quantity} adet) sepete eklendi.`);
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    setCartItems(prevItems => {
        const itemToUpdate = prevItems.find(item => item.product.id === productId);
        if (!itemToUpdate) return prevItems;

        if (newQuantity <= 0) {
            return prevItems.filter(item => item.product.id !== productId);
        }
        if (newQuantity > itemToUpdate.product.stock) {
            alert(`Stokta ${itemToUpdate.product.name} için yalnızca ${itemToUpdate.product.stock} adet bulunmaktadır.`);
            return prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity: itemToUpdate.product.stock } : item
            );
        }
        return prevItems.map(item =>
            item.product.id === productId ? { ...item, quantity: newQuantity } : item
        );
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };
  
  const handleCreateOrder = async (): Promise<Order | null> => {
    if (!currentUser || cartItems.length === 0) {
        alert("Sipariş oluşturmak için giriş yapmalı ve sepetinizde ürün bulunmalıdır.");
        return null;
    }
    const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        userId: currentUser.id,
        orderDate: new Date(),
        items: [...cartItems],
        subtotal: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        discountApplied: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * currentUser.discountRate,
        grandTotal: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * (1 - currentUser.discountRate),
        status: OrderStatus.ORDER_CONFIRMED,
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setCartItems([]); 
    
    const customerMessage = `Siparişiniz (#${newOrder.id}) başarıyla oluşturuldu ve "${OrderStatus.ORDER_CONFIRMED}" durumunda. Lütfen ödemenizi EFT/Havale ile belirtilen banka hesaplarına yapınız.`;
    console.log(`SİMÜLASYON: E-posta gönderildi -> Kime: ${currentUser.email}, Konu: Siparişiniz Alındı #${newOrder.id}, İçerik: ${customerMessage}`);
    if (currentUser.phoneNumber) {
      console.log(`SİMÜLASYON: SMS gönderildi -> Kime: ${currentUser.phoneNumber}, İçerik: Siparişiniz (#${newOrder.id}) onaylandı. Ödeme bekleniyor.`);
    }

    const adminNotificationMessage = `Müşteri ${currentUser.name} (${currentUser.email}) tarafından ${newOrder.orderDate.toLocaleString()} tarihinde ${newOrder.grandTotal.toFixed(2)} TL tutarında yeni bir sipariş (#${newOrder.id}) oluşturuldu ve "${OrderStatus.ORDER_CONFIRMED}" durumunda. Lütfen kontrol ediniz.`;
    users.filter(u => u.role === 'super_admin' || u.role === 'manager').forEach(admin => {
        console.log(`SİMÜLASYON: E-posta gönderildi (Yönetici Bildirimi) -> Kime: ${admin.email}, Konu: Yeni Sipariş Alındı #${newOrder.id}, İçerik: ${adminNotificationMessage}`);
    });

    alert(`Siparişiniz #${newOrder.id} başarıyla oluşturuldu ve "${OrderStatus.ORDER_CONFIRMED}" durumunda. Ödeme bilgileri için e-postanızı kontrol edin (simülasyon). Yöneticiler bilgilendirildi (simülasyon).`);
    navigateTo('orders');
    return newOrder;
  };

  const sendOrderStatusUpdateNotification = (order: Order, newStatus: OrderStatus) => {
    const customer = users.find(u => u.id === order.userId);
    if (customer) {
      const message = `Siparişinizin (#${order.id}) durumu "${newStatus}" olarak güncellendi.`;
      console.log(`SİMÜLASYON: E-posta gönderildi -> Kime: ${customer.email}, Konu: Sipariş Durum Güncellemesi #${order.id}, İçerik: ${message}`);
      if (customer.phoneNumber) {
        console.log(`SİMÜLASYON: SMS gönderildi -> Kime: ${customer.phoneNumber}, İçerik: ${message}`);
      }
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, adminNotes?: string) => {
    let updatedOrder: Order | undefined;
    setOrders(prevOrders => prevOrders.map(o => {
        if (o.id === orderId) {
            updatedOrder = { ...o, status: newStatus, adminNotes: adminNotes || o.adminNotes };
            return updatedOrder;
        }
        return o;
    }));

    if (updatedOrder) {
        sendOrderStatusUpdateNotification(updatedOrder, newStatus);
    }
  };

  const handleUploadPaymentProof = (orderId: string, fileName: string, customerNotes: string) => {
    let updatedOrder: Order | undefined;
    setOrders(prevOrders => prevOrders.map(o => {
        if (o.id === orderId) {
             updatedOrder = { ...o, paymentProofUrl: `simulated_uploads/payment/${fileName}`, customerNotes, status: OrderStatus.PAYMENT_PROOF_UPLOADED };
             return updatedOrder;
        }
        return o;
    }));
    if(updatedOrder){
        sendOrderStatusUpdateNotification(updatedOrder, OrderStatus.PAYMENT_PROOF_UPLOADED);
        const adminNotificationMessage = `Müşteri, #${orderId} numaralı sipariş için ödeme makbuzu yükledi. Lütfen kontrol ediniz.`;
        users.filter(u => u.role === 'super_admin' || u.role === 'manager').forEach(admin => {
            console.log(`SİMÜLASYON: E-posta gönderildi (Yönetici Bildirimi) -> Kime: ${admin.email}, Konu: Ödeme Makbuzu Yüklendi #${orderId}, İçerik: ${adminNotificationMessage}`);
        });
    }
  };

  const handleUploadContainerPhoto = (orderId: string, fileName: string) => {
     let updatedOrder: Order | undefined;
     setOrders(prevOrders => prevOrders.map(o => {
        if (o.id === orderId) {
            updatedOrder = { ...o, containerPhotoUrl: `simulated_uploads/containers/${fileName}` };
            return updatedOrder;
        }
        return o;
    }));
  };

  const handleCreateSingleProduct = (newProductData: Omit<Product, 'id' | 'isTrashed'>) => {
    const newProduct: Product = {
        ...newProductData,
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        isTrashed: false,
    };
    setProducts(prev => [newProduct, ...prev]);
    alert(`Ürün "${newProduct.name}" başarıyla eklendi.`);
  };

  const handleUpdateProduct = (updatedProductData: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProductData.id ? updatedProductData : p));
    alert(`Ürün "${updatedProductData.name}" başarıyla güncellendi.`);
  };

  const handleAddMultipleProducts = (newProducts: Product[]) => {
    const productsWithProperIds = newProducts.map(p => ({
        ...p,
        id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${p.name.replace(/\s+/g, '')}`,
        isTrashed: false,
    }));
    
    const updatedProductList = [...products];
    let newProductsCount = 0;
    let updatedProductsCount = 0;

    productsWithProperIds.forEach(np => {
        const existingIndex = updatedProductList.findIndex(op => op.id === np.id || op.name === np.name);
        if (existingIndex > -1) {
            updatedProductList[existingIndex] = { ...updatedProductList[existingIndex], ...np};
            updatedProductsCount++;
        } else {
            updatedProductList.unshift(np);
            newProductsCount++;
        }
    });
    setProducts(updatedProductList);
    alert(`${newProductsCount} yeni ürün eklendi, ${updatedProductsCount} ürün güncellendi.`);
  };

  const handleSelfRegisterUser = (userData: Omit<User, 'id' | 'role' | 'discountRate' | 'accessibleCategories' | 'isActive' | 'canSetUserDiscounts' | 'canCreateNewUsers' | 'canManageAllProducts' | 'isPendingApproval' | 'password'> & { passwordInput: string; name: string; email: string; username: string; companyName?: string; taxId?: string; phoneNumber?: string; }) => {
    const { passwordInput, name, email, username, companyName, taxId, phoneNumber } = userData;
    const newUser: User = {
        id: `user-pending-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        name,
        email,
        username,
        password: passwordInput,
        role: 'user',
        discountRate: 0,
        accessibleCategories: [],
        isActive: false,
        isPendingApproval: true,
        companyName,
        taxId,
        phoneNumber,
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    const userConfirmationMessage = "Kayıt talebiniz alınmıştır. Talebiniz 24 saat içinde yöneticimiz tarafından incelenip tarafınıza dönüş yapılacaktır.";
    console.log(`SİMÜLASYON: E-posta gönderildi -> Kime: ${newUser.email}, Konu: Kayıt Talebiniz Alındı, İçerik: ${userConfirmationMessage}`);
    if (newUser.phoneNumber) {
      console.log(`SİMÜLASYON: SMS gönderildi -> Kime: ${newUser.phoneNumber}, İçerik: ${userConfirmationMessage}`);
    } else {
      console.log(`SİMÜLASYON: SMS gönderilemedi (telefon numarası yok) -> Kime: ${newUser.name}`);
    }

    const adminNotificationMessage = `Yeni bir üyelik talebi alındı. Kullanıcı: ${newUser.name} (${newUser.email}). Lütfen Kullanıcı Yönetimi panelinden inceleyiniz.`;
    console.log(`SİMÜLASYON: Yeni üyelik talebi bildirimi e-postası gönderiliyor:
    Kime: Yöneticiler/Adminler
    Konu: Yeni Üyelik Talebi - Kullanıcı: ${newUser.name} (${newUser.email})
    İçerik: ${adminNotificationMessage}`);
    
    users.filter(u => u.role === 'super_admin' || u.role === 'manager').forEach(admin => {
        console.log(`SİMÜLASYON: E-posta gönderildi (Admin Bildirimi) -> Kime: ${admin.email}, Konu: Yeni Üyelik Talebi (${newUser.username})`);
    });

    alert("Kaydınız başarıyla alındı. Talebiniz incelendikten sonra bilgilendirileceksiniz. Lütfen e-postanızı kontrol ediniz.");
    navigateTo('catalog');
  };


  if (!currentUser) {
    if (currentPage === 'register') {
        return <RegisterPage onRegister={handleSelfRegisterUser} onNavigateToLogin={() => navigateTo('catalog')} />;
    }
    return <LoginPage onLogin={handleLogin} loginError={loginError} onNavigateToRegister={() => navigateTo('register')} />;
  }

  const getFilteredProducts = () => {
    let prods = products.filter(p => !p.isTrashed);
    if (currentUser.role === 'user') {
      prods = prods.filter(p => currentUser.accessibleCategories.includes(p.category));
    }
    if (selectedCategory) {
      prods = prods.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return prods;
  };
  const displayedProducts = getFilteredProducts();
  const trashedProducts = products.filter(p => p.isTrashed);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalDiscount = currentUser ? subtotal * currentUser.discountRate : 0;
  const grandTotal = subtotal - totalDiscount;
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const availableCategoriesForFilter = currentUser.role === 'super_admin' || currentUser.role === 'manager'
    ? INITIAL_CATEGORIES
    : currentUser.accessibleCategories;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
        <Header
            searchTerm={searchTerm}
            onSearchTermChange={handleSearchTermChange}
            onToggleChat={handleToggleChat}
            isChatOpen={isChatOpen}
            currentUser={currentUser}
            onLogout={handleLogout}
            currentPage={currentPage}
            navigateTo={navigateTo}
            cartItemCount={cartItemCount}
        />
        
        <div className="flex-grow w-full">
            {currentPage === 'catalog' && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 md:gap-8">
                    <ProductFilterSidebar
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleSelectCategory}
                        availableCategories={availableCategoriesForFilter}
                    />
                    <main className="flex-grow min-w-0">
                        {isLoadingProducts ? <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div> : 
                        <ProductList
                            products={displayedProducts}
                            isLoading={isLoadingProducts}
                            onSoftDeleteProduct={handleSoftDeleteProduct}
                            currentUser={currentUser}
                            onAddToCart={handleAddToCart}
                        />}
                    </main>
                </div>
            )}
            {currentPage === 'about' && <AboutPage onNavigateToCatalog={() => navigateTo('catalog')} />}
            {currentPage === 'trash' && (currentUser.role === 'super_admin') && (
                <TrashPage 
                    trashedProducts={trashedProducts}
                    onRestoreProduct={handleRestoreProduct}
                    onPermanentDeleteProduct={handlePermanentDeleteProduct}
                    onEmptyTrash={handleEmptyTrash}
                    onNavigateToCatalog={() => navigateTo('catalog')}
                />
            )}
             {currentPage === 'user_management' && (currentUser.role === 'super_admin' || (currentUser.role === 'manager' && currentUser.canCreateNewUsers)) && (
                <UserManagementPage 
                    users={users}
                    onCreateUser={handleCreateUser}
                    onUpdateUser={handleUpdateUser}
                    onToggleUserStatus={handleToggleUserStatus}
                    onApproveUser={handleApproveUser}
                    currentUser={currentUser}
                    onNavigateToCatalog={() => navigateTo('catalog')}
                />
            )}
            {currentPage === 'cart' && (
                <CartPage 
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveFromCart}
                    onClearCart={handleClearCart}
                    currentUser={currentUser}
                    onNavigateToCatalog={() => navigateTo('catalog')}
                    subtotal={subtotal}
                    totalDiscount={totalDiscount}
                    grandTotal={grandTotal}
                    onCreateOrder={handleCreateOrder}
                />
            )}
            {currentPage === 'orders' && (
                <OrdersPage 
                    orders={currentUser.role === 'user' ? orders.filter(o => o.userId === currentUser.id) : orders}
                    currentUser={currentUser}
                    onNavigateToCatalog={() => navigateTo('catalog')}
                    onNavigateToOrderDetail={(orderId) => navigateTo('order_detail', orderId)}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUploadPaymentProof={handleUploadPaymentProof}
                    onUploadContainerPhoto={handleUploadContainerPhoto}
                />
            )}
            {currentPage === 'order_detail' && selectedOrderForDetail && (
                <OrderDetailPage
                    order={selectedOrderForDetail}
                    currentUser={currentUser}
                    onNavigateBack={() => navigateTo('orders')}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUploadPaymentProof={handleUploadPaymentProof}
                    onUploadContainerPhoto={handleUploadContainerPhoto}
                />
            )}
            {currentPage === 'product_management' && (currentUser.role === 'super_admin' || (currentUser.role === 'manager' && currentUser.canManageAllProducts)) && (
                <ProductManagementPage 
                    products={products.filter(p => !p.isTrashed)} 
                    onCreateSingleProduct={handleCreateSingleProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onSoftDeleteProduct={handleSoftDeleteProduct}
                    onAddMultipleProducts={handleAddMultipleProducts}
                    allCategories={INITIAL_CATEGORIES}
                    onNavigateToCatalog={() => navigateTo('catalog')}
                    currentUser={currentUser}
                />
            )}
             {currentPage === 'register' && !currentUser && ( 
                <RegisterPage onRegister={handleSelfRegisterUser} onNavigateToLogin={() => navigateTo('catalog')} />
             )}
        </div>

        <ChatAssistant
            isOpen={isChatOpen}
            onClose={handleToggleChat}
            messages={chatMessages}
            onSendMessage={handleSendMessageToChat}
            isAiTyping={isAiTyping}
            chatError={chatError}
            currentGroundingMetadata={currentGroundingMetadata}
        />
    </div>
  );
};

export default App;
