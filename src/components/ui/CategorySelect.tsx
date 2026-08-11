"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CategoryDto } from "@/lib/types";

interface Props {
  module: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const SELECT_CLASS =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]";

export function CategorySelect({ module, value, onChange, placeholder = "— Select category —", required }: Props) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  useEffect(() => {
    api
      .get<CategoryDto[]>(`/api/categories?module=${encodeURIComponent(module)}`)
      .then(setCategories)
      .catch(() => {});
  }, [module]);

  if (categories.length === 0) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add categories in Master Data first, or type here"
        required={required}
        className={SELECT_CLASS}
      />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={SELECT_CLASS}
    >
      <option value="">{placeholder}</option>
      {categories.map((c) => (
        <option key={c.id} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
