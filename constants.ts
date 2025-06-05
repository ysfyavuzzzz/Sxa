
import { Product, ProductCategory } from './types';

export const API_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const CATEGORIES: ProductCategory[] = [
  ProductCategory.ELECTRONICS,
  ProductCategory.SOFTWARE,
  ProductCategory.HARDWARE,
  ProductCategory.SERVICES,
  ProductCategory.OFFICE_SUPPLIES,
  ProductCategory.OTOMOTIV_YEDEK_PARCA, // Yeni kategori eklendi
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Profesyonel Ofis Dizüstü Bilgisayarı X1',
    category: ProductCategory.ELECTRONICS,
    price: 1299.99,
    description: 'İş profesyonelleri için yüksek performanslı dizüstü bilgisayar. 15 inç ekran, 16GB RAM ve 512GB SSD özelliklerine sahiptir.',
    imageUrl: 'https://picsum.photos/seed/laptopx1/600/400',
    specifications: {
      'İşlemci': 'Intel Core i7 12. Nesil',
      'RAM': '16GB DDR5',
      'Depolama': '512GB NVMe SSD',
      'Ekran': '15.6" QHD (2560x1440)',
      'İşletim Sistemi': 'Windows 11 Pro'
    },
    stock: 50,
    isTrashed: false,
  },
  {
    id: '2',
    name: 'Kurumsal Bulut Paketi - Yıllık',
    category: ProductCategory.SOFTWARE,
    price: 499.00,
    description: 'Kurumsal işbirliği, proje yönetimi ve veri analitiği için kapsamlı bulut yazılım paketi.',
    imageUrl: 'https://picsum.photos/seed/cloudsuite/600/400',
    specifications: {
      'Tip': 'SaaS',
      'Kullanıcılar': '100 kullanıcıya kadar dahil',
      'Destek': '7/24 Premium Destek',
      'Özellikler': 'Belge Yönetimi, CRM, Analitik Kontrol Paneli'
    },
    stock: 1000,
    isTrashed: false,
  },
  {
    id: '3',
    name: 'Ağır Hizmet Tipi Ağ Yönlendiricisi G5',
    category: ProductCategory.HARDWARE,
    price: 349.50,
    description: 'Küçük ve orta ölçekli işletmeler için tasarlanmış sağlam ve güvenli ağ yönlendiricisi. 100 eşzamanlı cihaza kadar destekler.',
    imageUrl: 'https://picsum.photos/seed/routerg5/600/400',
    specifications: {
      'WAN Portları': '1 x 2.5 Gbps Ethernet',
      'LAN Portları': '4 x 1 Gbps Ethernet',
      'Wi-Fi Standardı': 'Wi-Fi 6 (802.11ax)',
      'Güvenlik': 'WPA3, VPN Passthrough, Güvenlik Duvarı'
    },
    stock: 75,
    isTrashed: false,
  },
  {
    id: '4',
    name: 'BT Destek & Bakım (Aylık)',
    category: ProductCategory.SERVICES,
    price: 250.00,
    description: 'Uzaktan yardım, sistem izleme ve güvenlik güncellemelerini içeren aylık BT destek paketi.',
    imageUrl: 'https://picsum.photos/seed/itsupport/600/400',
    specifications: {
      'Yanıt Süresi': '4 saat içinde',
      'Kapsam': 'Masaüstü, Sunucu, Ağ',
      'Sözleşme': 'Aylık, istenildiği zaman iptal edilebilir',
      'İçerik': 'Proaktif İzleme, Yardım Masası Erişimi'
    },
    stock: 100,
    isTrashed: false,
  },
  {
    id: '5',
    name: 'Çevre Dostu Yazıcı Kağıdı (Toplu)',
    category: ProductCategory.OFFICE_SUPPLIES,
    price: 45.99,
    description: '10 paket yüksek kaliteli, çevre dostu yazıcı kağıdı. Her pakette 500 sayfa.',
    imageUrl: 'https://picsum.photos/seed/paperbulk/600/400',
    specifications: {
      'Parlaklık': '92',
      'Boyut': '8.5" x 11"',
      'Malzeme': '%30 Geri Dönüştürülmüş İçerik',
      'Miktar': '5000 sayfa (10 paket)'
    },
    stock: 200,
    isTrashed: false,
  },
  {
    id: '6',
    name: 'Gelişmiş Ergonomik Ofis Koltuğu',
    category: ProductCategory.OFFICE_SUPPLIES,
    price: 399.00,
    description: 'Uzun çalışma saatlerinde maksimum konfor ve destek için tasarlanmış tam ayarlanabilir ergonomik koltuk.',
    imageUrl: 'https://picsum.photos/seed/officechair/600/400',
    specifications: {
      'Malzeme': 'Nefes Alabilir File, Alüminyum Taban',
      'Ayarlar': 'Bel, Kolçaklar, Yükseklik, Eğim',
      'Ağırlık Kapasitesi': '135 kg',
      'Garanti': '5 Yıl'
    },
    stock: 30,
    isTrashed: false,
  },
   {
    id: '7',
    name: 'Ultra Geniş İş Monitörü 34"',
    category: ProductCategory.ELECTRONICS,
    price: 599.00,
    description: 'Çoklu görev ve artırılmış üretkenlik için mükemmel 34 inç Ultra Geniş QHD monitör.',
    imageUrl: 'https://picsum.photos/seed/monitoruw/600/400',
    specifications: {
        'Çözünürlük': '3440x1440 (WQHD)',
        'Panel Tipi': 'IPS',
        'Yenileme Hızı': '75Hz',
        'Portlar': 'HDMI, DisplayPort, USB-C',
        'Özellikler': 'Resim içinde Resim, HDR10'
    },
    stock: 40,
    isTrashed: false,
  },
  {
    id: '8',
    name: 'Siber Güvenlik Eğitim Platformu',
    category: ProductCategory.SOFTWARE,
    price: 999.00,
    description: 'Çalışan siber güvenlik farkındalık eğitimi için çevrimiçi platform. Modüller ve oltalama simülasyonları içerir.',
    imageUrl: 'https://picsum.photos/seed/cybertrain/600/400',
    specifications: {
        'Tip': 'Abonelik (Yıllık)',
        'Kullanıcılar': '250 çalışana kadar',
        'İçerik': 'Etkileşimli Modüller, Sınavlar, Raporlama',
        'Güncellemeler': 'Aylık yeni içerik'
    },
    stock: 500,
    isTrashed: false,
  },
  {
    id: '9',
    name: 'Fren Balatası Seti - Ön (XYZ Marka)',
    category: ProductCategory.OTOMOTIV_YEDEK_PARCA,
    price: 79.90,
    description: 'XYZ Marka araçlar için yüksek kaliteli ön fren balatası seti. Mükemmel duruş gücü ve uzun ömür.',
    imageUrl: 'https://picsum.photos/seed/brakepad/600/400',
    specifications: {
      'Oem': '12345-XYZ-OEM',
      'Finish Kodu': 'FP7890',
      'Araç Markası': 'XYZ',
      'Uyumlu Modeller': 'Model A (2018-2022), Model B (2019-2023)',
      'Pozisyon': 'Ön Aks',
      'Malzeme': 'Seramik'
    },
    stock: 120,
    isTrashed: false,
  }
];