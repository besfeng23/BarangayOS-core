import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrintPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Print Center</h1>
      <p className="text-muted-foreground">
        The print workflow will be integrated here. For now, you can issue
        documents from the resident&apos;s profile or the certificates page.
      </p>
      <div className="mt-4">
        <Link href="/" passHref>
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
