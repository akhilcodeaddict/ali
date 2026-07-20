"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CategoryDto, ProductDto, ProductGender, ProductType, UpsertProductDto } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableRow, TableCell, EmptyState } from "@/components/ui/Table";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ImageUrlField } from "@/components/media/MediaPicker";
import { ActiveFilter, ActiveFilterValue, filterByActive } from "@/components/ui/ActiveFilter";
import { useToast } from "@/lib/toast-context";
import { Pencil, Trash2, X } from "lucide-react";

const GENDERS: ProductGender[] = ["NotApplicable", "Male", "Female", "Unisex", "Kids"];
const TYPES: ProductType[] = ["Count", "Service"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "SAR"];

const emptyForm: UpsertProductDto = {
  name: "", slug: "", shortDescription: "", description: "",
  imageUrl: "", hoverImageUrl: "", price: 0, salePrice: null, currency: "USD",
  sku: "", stockLevel: 0, isFeatured: false, isActive: true,
  categoryId: null, subCategoryId: null,
  gender: "NotApplicable", productType: "Count", tags: [],
  allowRebooking: false,
  tagline: "", durationLabel: "", includedItems: [], benefits: [], galleryImages: [],
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Chip-input list field: press Enter/comma to add, click × to remove. */
function ChipListField({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-white p-2 focus-within:border-primary focus-within:shadow-[var(--shadow-focus)]">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-primary-dark cursor-pointer">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none text-text placeholder:text-text-helper"
      />
    </div>
  );
}

export default function ProductsPage() {
  const toast = useToast();
  const [items, setItems] = useState<ProductDto[] | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [form, setForm] = useState<UpsertProductDto>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActiveFilterValue>("active");

  async function load() {
    try {
      const [prods, cats] = await Promise.all([
        api.get<ProductDto[]>("/api/products/all"),
        api.get<CategoryDto[]>("/api/categories/all"),
      ]);
      setItems(prods);
      setCategories(cats.filter((c) => c.module === "products"));
    } catch (err) {
      toast.error("Failed to load products", err instanceof ApiError ? err.message : undefined);
    }
  }

  useEffect(() => { load(); }, []);

  const topCategories = categories.filter((c) => !c.parentId && c.isActive);
  const subCategories = categories.filter((c) => c.parentId === form.categoryId && c.isActive);

  function startEdit(p: ProductDto) {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, shortDescription: p.shortDescription, description: p.description,
      imageUrl: p.imageUrl ?? "", hoverImageUrl: p.hoverImageUrl ?? "", price: p.price, salePrice: p.salePrice ?? null,
      currency: p.currency, sku: p.sku, stockLevel: p.stockLevel,
      isFeatured: p.isFeatured, isActive: p.isActive,
      categoryId: p.categoryId ?? null, subCategoryId: p.subCategoryId ?? null,
      gender: p.gender, productType: (p.productType === "Count" || p.productType === "Service") ? p.productType : "Count",
      tags: p.tags ?? [],
      allowRebooking: p.allowRebooking ?? false,
      tagline: p.tagline ?? "", durationLabel: p.durationLabel ?? "",
      includedItems: p.includedItems ?? [], benefits: p.benefits ?? [], galleryImages: p.galleryImages ?? [],
    });
  }

  function resetForm() { setEditingId(null); setForm(emptyForm); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        imageUrl: form.imageUrl || null,
        hoverImageUrl: form.hoverImageUrl || null,
        salePrice: form.salePrice || null,
        stockLevel: form.productType === "Service" ? 0 : form.stockLevel,
        tagline: form.tagline || null,
        durationLabel: form.durationLabel || null,
      };
      if (editingId) await api.put(`/api/products/${editingId}`, payload);
      else await api.post("/api/products", payload);
      toast.success(editingId ? "Product updated" : "Product created");
      resetForm();
      load();
    } catch (err) {
      toast.error("Failed to save product", err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deactivate this product? It will be hidden from the website but can be reactivated later.")) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Product deactivated");
      load();
    } catch (err) {
      toast.error("Failed to deactivate", err instanceof ApiError ? err.message : undefined);
    }
  }

  const isService = form.productType === "Service";
  const filteredItems = items ? filterByActive(items, filter) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-heading">Products</h1>
        <p className="mt-1 text-sm text-text-muted">Manage products and services.</p>
      </div>

      <Card>
        <CardHeader
          title={editingId ? "Edit product" : "Add product"}
          action={editingId ? (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X size={14} strokeWidth={1.75} /> Cancel
            </Button>
          ) : undefined}
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Product name">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
                  required
                />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
              </Field>
              <Field label="SKU">
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </Field>
              <Field label="Product type">
                <select
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value as ProductType, allowRebooking: false })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="Count">Count — stock-based ordering</option>
                  <option value="Service">Service — calendar booking</option>
                </select>
              </Field>
            </div>

            {/* Category / gender */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Category">
                <select
                  value={form.categoryId ?? ""}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value || null, subCategoryId: null })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="">— None —</option>
                  {topCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Sub-category">
                <select
                  value={form.subCategoryId ?? ""}
                  onChange={(e) => setForm({ ...form, subCategoryId: e.target.value || null })}
                  disabled={!form.categoryId || subCategories.length === 0}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)] disabled:opacity-50"
                >
                  <option value="">— None —</option>
                  {subCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as ProductGender })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  {GENDERS.map((g) => <option key={g} value={g}>{g === "NotApplicable" ? "Not applicable" : g}</option>)}
                </select>
              </Field>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Price">
                <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
              </Field>
              <Field label="Sale price">
                <Input type="number" step="0.01" min="0" value={form.salePrice ?? ""} onChange={(e) => setForm({ ...form, salePrice: e.target.value ? Number(e.target.value) : null })} />
              </Field>
              <Field label="Currency">
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            {/* Count-specific: stock */}
            {!isService && (
              <Field label="Stock level" helper="Ordering is blocked when stock reaches 0">
                <Input type="number" min="0" value={form.stockLevel} onChange={(e) => setForm({ ...form, stockLevel: Number(e.target.value) })} />
              </Field>
            )}

            {/* Service-specific: booking options + detail page content */}
            {isService && (
              <div className="rounded-[8px] border border-border bg-section/60 p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-text">Booking options</p>
                <Toggle
                  checked={form.allowRebooking ?? false}
                  onChange={(v) => setForm({ ...form, allowRebooking: v })}
                  label="Allow re-booking when slot is already taken"
                />
                <p className="text-xs text-text-muted">When on, customers can book even if the service already has an active booking.</p>
              </div>
            )}

            <Field label="Short description">
              <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
            </Field>
            <Field label="Full description">
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>

            <Field label="Image">
              <ImageUrlField value={form.imageUrl ?? ""} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            </Field>

            <Field label="Hover image" helper="Shown when a visitor hovers over the card on the website">
              <ImageUrlField value={form.hoverImageUrl ?? ""} onChange={(url) => setForm({ ...form, hoverImageUrl: url })} />
            </Field>

            <Field label="Tags" helper="Press Enter or comma to add">
              <ChipListField values={form.tags ?? []} onChange={(v) => setForm({ ...form, tags: v })} placeholder="Add tags…" />
            </Field>

            {/* Service detail page content */}
            {isService && (
              <div className="rounded-[8px] border border-border bg-section/60 p-4 flex flex-col gap-5">
                <p className="text-sm font-semibold text-text">Service detail page content</p>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Tagline" helper="e.g. Flawless, Lightweight, Picture Perfect">
                    <Input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                  </Field>
                  <Field label="Duration" helper="e.g. 3.5 Hours">
                    <Input value={form.durationLabel ?? ""} onChange={(e) => setForm({ ...form, durationLabel: e.target.value })} />
                  </Field>
                </div>

                <Field label="What's included" helper="Press Enter or comma to add each item">
                  <ChipListField
                    values={form.includedItems ?? []}
                    onChange={(v) => setForm({ ...form, includedItems: v })}
                    placeholder="e.g. Primer & Perfect Base"
                  />
                </Field>

                <Field label="Benefits" helper="Short labels shown as icons — e.g. Long Lasting, Sweat Proof, HD Finish">
                  <ChipListField
                    values={form.benefits ?? []}
                    onChange={(v) => setForm({ ...form, benefits: v })}
                    placeholder="e.g. Long Lasting"
                  />
                </Field>

                <Field label="Extra gallery photos" helper="Additional thumbnails shown on the service detail page, besides Image/Hover image above">
                  <div className="flex flex-col gap-2">
                    {(form.galleryImages ?? []).map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <ImageUrlField
                          value={url}
                          onChange={(v) => {
                            const next = [...(form.galleryImages ?? [])];
                            next[i] = v;
                            setForm({ ...form, galleryImages: next });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setForm({ ...form, galleryImages: (form.galleryImages ?? []).filter((_, idx) => idx !== i) })}
                        >
                          <X size={14} strokeWidth={1.75} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setForm({ ...form, galleryImages: [...(form.galleryImages ?? []), ""] })}
                      className="self-start"
                    >
                      Add photo
                    </Button>
                  </div>
                </Field>
              </div>
            )}

            <div className="flex items-center gap-6">
              <Toggle checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} label="Featured" />
              <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            </div>

            <div>
              <Button type="submit">{editingId ? "Save changes" : "Add product"}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="All products"
          description={items ? `${filteredItems.length} of ${items.length}` : undefined}
          action={<ActiveFilter value={filter} onChange={setFilter} />}
        />
        {items === null && <SkeletonTable rows={5} cols={5} />}
        {items && filteredItems.length === 0 && <EmptyState label="No products in this view." />}
        {items && filteredItems.length > 0 && (
          <Table>
            <TableHead columns={["Product", "Type / Category", "Price", "Stock / Booking", "Status", ""]} />
            <tbody>
              {filteredItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-semibold text-text">{p.name}</span>
                    <span className="block text-xs text-text-helper">{p.sku || "—"}</span>
                  </TableCell>
                  <TableCell muted>
                    <Badge tone={p.productType === "Service" ? "warning" : "neutral"}>{p.productType}</Badge>
                    {p.categoryName && (
                      <span className="block text-xs text-text-helper">
                        {p.categoryName}{p.subCategoryName ? ` › ${p.subCategoryName}` : ""}
                      </span>
                    )}
                  </TableCell>
                  <TableCell muted>
                    {p.currency} {p.price.toFixed(2)}
                    {p.salePrice != null && (
                      <span className="block text-xs text-status-success-text">Sale: {p.salePrice.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell muted>
                    {p.productType === "Service" ? (
                      <span className="text-xs">{p.allowRebooking ? "Re-book allowed" : "Single booking"}</span>
                    ) : (
                      <span className={p.stockLevel === 0 ? "text-status-danger-text font-medium" : ""}>
                        {p.stockLevel === 0 ? "Out of stock" : `${p.stockLevel} in stock`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                      {p.isFeatured && <Badge tone="warning">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(p)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={14} strokeWidth={1.75} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
