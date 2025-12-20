'use client';
import { useParams } from 'next/navigation';
import { productsByCategory, ProductCategory } from '@/app/addons/_data/products';
import ProductCard from '@/app/addons/_components/ProductCard';
import { useState } from 'react';
import type { Product } from '@/app/addons/_data/products';
import ProductDetailModal from '@/app/addons/_components/ProductDetailModal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const categoryTitles: Record<ProductCategory, string> = {
  'field-gear': 'Field & Patrol Gear',
  'monitoring': 'Monitoring & Surveillance',
  'vehicle': 'Vehicle & Asset Tracking',
  'emergency': 'Emergency & Alert Systems',
  'info-systems': 'Public Information Systems',
};

export default function AddonCategoryPage() {
  const params = useParams();
  const slug = params.slug as ProductCategory;
  const products = productsByCategory[slug] || [];
  const title = categoryTitles[slug] || 'Add-ons';

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/addons" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground">Browse available hardware and services.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </div>
      <ProductDetailModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </>
  );
}
