import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MedicinesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Medicine Inventory</h1>
      <p className="text-muted-foreground">A list of medicines, stock counts, and dispensing tools will be here.</p>
      <div className="mt-4">
        <Link href="/city-health" passHref><Button>Back to City Health Home</Button></Link>
      </div>
    </div>
  );
}
