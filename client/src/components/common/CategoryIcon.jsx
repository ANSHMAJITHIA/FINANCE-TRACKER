import React from 'react';
import {
  Utensils,
  Home,
  Zap,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Gift,
  PlusCircle,
  PiggyBank,
  Coins,
  Landmark,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Tag,
} from 'lucide-react';

const ICON_MAP = {
  'food & dining': Utensils,
  'housing & rent': Home,
  utilities: Zap,
  transportation: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  'health & medical': HeartPulse,
  education: GraduationCap,
  travel: Plane,
  salary: Briefcase,
  freelance: Laptop,
  investments: TrendingUp,
  stocks: TrendingUp,
  business: Building,
  gifts: Gift,
  savings: PiggyBank,
  crypto: Coins,
  'real estate': Landmark,
  retirement: ShieldCheck,
  'general expense': CreditCard,
  'emergency fund': ShieldCheck,
};

const CategoryIcon = ({ category, className = 'w-4 h-4' }) => {
  const normalized = (category || '').toLowerCase().trim();
  const IconComponent = ICON_MAP[normalized] || Tag;

  return <IconComponent className={className} />;
};

export default CategoryIcon;
