import {
  Utensils,
  Car,
  ShoppingBag,
  ReceiptText,
  Clapperboard,
  Briefcase,
  CircleDollarSign,
} from 'lucide-react';

/**
 * format.js
 *
 * Pure presentation helpers. This file holds NO business logic — only
 * display concerns: currency formatting, the category list for the
 * dropdown, and per-category icons/colors for the UI.
 */

// The list of categories shown in the dropdown. This mirrors the
// backend's valid categories but is purely a UI configuration here.
export const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Salary',
  'Miscellaneous',
];

// Visual metadata per category: icon component + tailwind color classes.
export const CATEGORY_META = {
  Food: { icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-100', bar: 'bg-orange-500' },
  Travel: { icon: Car, color: 'text-sky-600', bg: 'bg-sky-100', bar: 'bg-sky-500' },
  Shopping: { icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100', bar: 'bg-purple-500' },
  Bills: { icon: ReceiptText, color: 'text-amber-600', bg: 'bg-amber-100', bar: 'bg-amber-500' },
  Entertainment: { icon: Clapperboard, color: 'text-pink-600', bg: 'bg-pink-100', bar: 'bg-pink-500' },
  Salary: { icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100', bar: 'bg-emerald-500' },
  Miscellaneous: { icon: CircleDollarSign, color: 'text-slate-600', bg: 'bg-slate-100', bar: 'bg-slate-500' },
};

// Fallback metadata for any unknown category.
const DEFAULT_META = CATEGORY_META.Miscellaneous;

/**
 * Get the visual metadata for a category, with a safe fallback.
 * @param {string} category
 */
export function getCategoryMeta(category) {
  return CATEGORY_META[category] || DEFAULT_META;
}

/**
 * Format a number as Indian Rupees, e.g. 1234.5 -> "₹1,234.50".
 * @param {number} value
 */
export function formatCurrency(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);
}

/**
 * Format an ISO date string into a short readable form, e.g. "28 Jun 2026".
 * @param {string} dateStr
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
