import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mb-6">
        {title}
      </h2>
      {children}
    </section>
  );
}
