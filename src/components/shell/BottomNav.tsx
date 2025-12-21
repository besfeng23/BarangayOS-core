
'use client';
import React from "react";
import { Home, List, Printer, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/history", label: "History", icon: List },
  { href: "/print", label: "Print", icon: Printer },
  { href: "/settings", label: "Settings", icon: Settings },
];

const NavButton = ({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) => (
  <Link href={href} passHref>
    <button
      className={cn(
        "flex flex-col items-center justify-center h-full w-20 transition-colors duration-200",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-1">{label}</span>
    </button>
  </Link>
);


export default function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-card/90 backdrop-blur-lg border-t z-40">
      <nav className="h-full flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <NavButton
            key={item.href}
            {...item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </footer>
  );
}
