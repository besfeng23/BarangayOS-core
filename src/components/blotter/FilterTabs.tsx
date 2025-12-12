'use client';

import { Button } from '@/components/ui/button';

export default function FilterTabs() {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm">All</Button>
      <Button variant="outline" size="sm">Drafts (2)</Button>
      <Button variant="outline" size="sm">Urgent (1)</Button>
      <Button variant="outline" size="sm">My cases</Button>
    </div>
  );
}
