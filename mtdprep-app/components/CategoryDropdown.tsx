"use client";

import { Category, HMRC_CATEGORIES } from "@/lib/types";

interface CategoryDropdownProps {
  value: Category;
  onChange: (category: Category) => void;
}

export default function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Category)}
      aria-label="HMRC category"
      className="w-full min-w-[11rem] rounded-md border border-borderc bg-white px-2 py-1.5 text-sm text-body outline-none transition-colors focus:border-brand"
    >
      {HMRC_CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}
