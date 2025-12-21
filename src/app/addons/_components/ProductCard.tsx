
'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/app/addons/_data/products';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer group flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          data-ai-hint={product.imageHint}
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold flex-grow">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
        <div className="flex items-baseline justify-between mt-4">
          <p className="text-xl font-bold">
            {product.price.toLocaleString('en-US', {
              style: 'currency',
              currency: 'PHP',
            })}
          </p>
          <Button variant="secondary" size="sm">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
