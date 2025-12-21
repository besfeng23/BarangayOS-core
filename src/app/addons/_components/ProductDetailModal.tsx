'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { Product } from '@/app/addons/_data/products';
import { useToast } from '@/components/ui/toast';
import { writeActivity } from '@/lib/bos/activity/writeActivity';
import { useRouter } from 'next/navigation';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const { toast } = useToast();
  const router = useRouter();

  if (!product) return null;

  const handleRequestQuotation = async () => {
    await writeActivity({
        type: 'QUOTATION_REQUESTED',
        entityType: 'procurement',
        entityId: product.id,
        status: 'ok',
        title: 'Quotation Requested',
        subtitle: product.name,
    } as any);

    toast({
        title: 'Quotation Requested',
        description: `Your request for ${product.name} has been submitted.`,
    });
    
    onClose();
    router.push('/addons/requests');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={product.imageHint}
                />
            </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-emerald-400">
              {product.price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'PHP',
              })}
            </p>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>
          <div className="prose prose-sm prose-invert max-w-none text-zinc-300">
            <h4>Features:</h4>
            <ul>
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleRequestQuotation}>Request Quotation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
