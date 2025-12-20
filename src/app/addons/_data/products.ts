export type ProductCategory =
  | 'field-gear'
  | 'monitoring'
  | 'vehicle'
  | 'emergency'
  | 'info-systems';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  imageUrl: string;
  imageHint: string;
  features: string[];
}

const allProducts: Product[] = [
  {
    id: 'prod_001',
    sku: 'BOS-BC-AXN5',
    name: 'Axon Body 5 Body-Worn Camera',
    description: 'Rugged, reliable body camera for patrol and evidence capture.',
    category: 'field-gear',
    price: 35000,
    imageUrl: 'https://picsum.photos/seed/bodycam/600/400',
    imageHint: 'body camera',
    features: ['1080p HD Video', '12-hour battery life', 'GPS Tagging', 'Night Vision'],
  },
  {
    id: 'prod_002',
    sku: 'BOS-RD-MTR2',
    name: 'Motorola Handheld Radio (2-pack)',
    description: 'Long-range communication for team coordination.',
    category: 'field-gear',
    price: 12500,
    imageUrl: 'https://picsum.photos/seed/radio/600/400',
    imageHint: 'handheld radio',
    features: ['5km Range', 'Water-resistant (IP67)', '18-hour battery', 'Emergency Button'],
  },
  {
    id: 'prod_003',
    sku: 'BOS-CAM-HIK8',
    name: 'Hikvision 8-Channel CCTV System',
    description: 'Comprehensive surveillance for barangay hall and key areas.',
    category: 'monitoring',
    price: 45000,
    imageUrl: 'https://picsum.photos/seed/cctv/600/400',
    imageHint: 'security cameras',
    features: ['8 x 5MP Bullet Cameras', '1TB NVR Included', 'Mobile App Access', 'Motion Detection'],
  },
  {
    id: 'prod_004',
    sku: 'BOS-GPS-TRK1',
    name: 'GPS Tracker for Patrol Vehicle',
    description: 'Real-time location tracking for barangay vehicles.',
    category: 'vehicle',
    price: 8000,
    imageUrl: 'https://picsum.photos/seed/gpstracker/600/400',
    imageHint: 'gps tracker',
    features: ['4G Connectivity', 'Geo-fencing alerts', '60-day history log', 'Mobile App'],
  },
  {
    id: 'prod_005',
    sku: 'BOS-ALRT-SIRN',
    name: 'Outdoor Emergency Siren',
    description: 'Loud, wide-area siren for disaster and emergency alerts.',
    category: 'emergency',
    price: 28000,
    imageUrl: 'https://picsum.photos/seed/siren/600/400',
    imageHint: 'emergency siren',
    features: ['125 dB Output', '3km Audible Range', 'Weatherproof', 'Remote Activation'],
  },
  {
    id: 'prod_006',
    sku: 'BOS-LED-INFO',
    name: 'Outdoor LED Information Display',
    description: 'Display announcements and alerts to the public.',
    category: 'info-systems',
    price: 75000,
    imageUrl: 'https://picsum.photos/seed/ledsign/600/400',
    imageHint: 'led sign',
    features: ['P10 Full-Color LED', 'Weatherproof Enclosure', 'Wi-Fi Content Management', '3m x 1m Size'],
  },
];

export const productsByCategory = allProducts.reduce((acc, product) => {
  if (!acc[product.category]) {
    acc[product.category] = [];
  }
  acc[product.category].push(product);
  return acc;
}, {} as Record<ProductCategory, Product[]>);