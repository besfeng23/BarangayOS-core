export type BadgeInfo = {
  visible: boolean;
  count?: number;
  label?: string;
};

export type AppCategory = 'core' | 'optional' | 'partner';

export type AppData = {
  id: string;
  name: string;
  category: AppCategory;
  icon: string; // Corresponds to a key in components/icons.ts iconMap
  isLocked?: boolean;
  status?: 'get' | 'open';
  badge: BadgeInfo;
};
