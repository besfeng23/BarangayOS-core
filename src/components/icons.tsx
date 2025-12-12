"use client";

import {
  LucideProps,
  ClipboardList,
  Stethoscope,
  Wallet,
  Users,
  FileText,
  Building,
  Briefcase,
  MessageSquare,
  BarChart3,
  HeartPulse,
  Bus,
  BookUser,
  HelpCircle,
} from 'lucide-react';

// For performance and bundle size, we explicitly map only the icons we use.
const iconMap = {
  ClipboardList,
  Stethoscope,
  Wallet,
  Users,
  FileText,
  Building,
  Briefcase,
  MessageSquare,
  BarChart3,
  HeartPulse,
  Bus,
  BookUser,
  HelpCircle,
};

type IconName = keyof typeof iconMap;

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = iconMap[name as IconName] || HelpCircle;
  return <LucideIcon {...props} />;
}
