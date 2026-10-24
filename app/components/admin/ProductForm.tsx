"use client";

import { useCallback, useEffect, useState } from "react";
import { slugify } from "../../lib/slugify";

type Category = { id: number; name: string };

export type ProductVariantRow = {
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: string;
};

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  images: string[];
  variants: ProductVariantRow[];
};

const emptyVariant = (): ProductVariantRow => ({
  sku: "",
  size: "",
  color: "",
  price: "",
  stock: "0",
});

const defaultVariants = (): ProductVariantRow[] => [
  { sku: "SKU-001", size: "M", color: "Black", price: "850", stock: "10" },
  { sku: "SKU-002", size: "L", color: "Black", price: "850", stock: "8" },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: number;
  initial?: Partial<ProductFormValues>;
  onSaved: (productId: number) => void;
  onDelete?: () => void;
};

export function ProductForm({ mode, productId, initial, onSaved, onDelete }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugManual, setSlugManual] = useState(mode === "edit" || Boolean(initial?.slug));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<ProductVariantRow[]>(
    initial?.variants?.length ? initial.variants : defaultVariants()
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories").then(async (r) => {
      if (r.ok) setCategories(await r.json());
    });
  }, []);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setError("");
    const added: string[] = [];

    try {
      for (const file of list) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/uploads", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Upload failed");
          break;
        }
        added.push(String(data.url));
      }
      if (added.length > 0) {
        setImages((prev) => [...prev, ...added]);
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageUrlInput("");
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setCoverImage = (index: number) => {
    if (index <= 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const updateVariant = (index: number, field: keyof ProductVariantRow, value: string) => {
    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariant = (index: number) => {
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const buildPayload = () => {
    const parsedVariants = variants.map((v) => ({
      sku: v.sku.trim(),
      size: v.size.trim() || undefined,
      color: v.color.trim() || undefined,
      price: Number(v.price),
      stock: Number(v.stock),
    }));

    const imagePayload = images
      .map((url, i) => ({ url: url.trim(), sortOrder: i, isPrimary: i === 0 }))
      .filter((i) => i.url);

    return {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      categoryId: Number(categoryId),
      isActive,
      images: imagePayload,
      variants: parsedVariants,
    };
  };

  const validate = (payload: ReturnType<typeof buildPayload>) => {
    if (!payload.name) return "Product name is required";
    if (!payload.slug) return "URL slug is required";
    if (!Number.isInteger(payload.categoryId) || payload.categoryId <= 0) return "Choose a category";
    if (payload.variants.length === 0) return "Add at least one variant";
    for (const v of payload.variants) {
      if (!v.sku) return "Each variant needs a SKU";
      if (!Number.isFinite(v.price) || v.price < 0) return "Enter a valid price for every variant";
      if (!Number.isInteger(v.stock) || v.stock < 0) return "Enter valid stock for every variant";
    }
    return "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = buildPayload();
    const validationError = validate(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      onSaved(mode === "create" ? Number(data.id) : Number(productId));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Basic information</h2>
        <p className="mt-1 text-sm text-gray-500">Name, category, and how this product appears in the store.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="product-name">
              Product name
            </label>
            <input
              id="product-name"
              className={inputClass}
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                if (!slugManual) setSlug(slugify(value));
              }}
              placeholder="e.g. Classic cotton tee"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="product-slug">
              URL slug
            </label>
            <input
              id="product-slug"
              className={inputClass}
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              placeholder="classic-cotton-tee"
              required
            />
            {!slugManual && name ? (
              <p className="mt-1 text-xs text-gray-500">Generated from the product name. Edit to customize.</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="product-category">
              Category
            </label>
            <select
              id="product-category"
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="product-description">
              Description
            </label>
            <textarea
              id="product-description"
              className={`${inputClass} min-h-[100px]`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Materials, fit, care instructions…"
            />
          </div>
          {mode === "edit" ? (
            <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              Visible in storefront (active)
            </label>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Images</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload photos or paste a URL. The first image is the cover shown in listings.
        </p>

        <div
          className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
          }}
        >
          <p className="text-sm font-medium text-gray-700">Drag images here or choose files</p>
          <p className="mt-1 text-xs text-gray-500">JPEG, PNG, WebP, GIF, or SVG — up to 5 MB each</p>
          <label className="mt-4 cursor-pointer rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            {uploading ? "Uploading…" : "Browse files"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files?.length) void uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Or paste image URL (https://… or /seed/…)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImageUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={addImageUrl}
            className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Add URL
          </button>
        </div>

        {images.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((url, index) => (
              <li key={`${url}-${index}`} className="overflow-hidden rounded-lg border bg-gray-50">
                <div className="relative aspect-[4/3] bg-white">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded bg-[var(--brand)] px-2 py-0.5 text-xs font-medium text-white">
                      Cover
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1 p-2">
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs hover:bg-white disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs hover:bg-white disabled:opacity-40"
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(index, 1)}
                  >
                    →
                  </button>
                  {index !== 0 ? (
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-xs hover:bg-white"
                      onClick={() => setCoverImage(index)}
                    >
                      Set cover
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="ml-auto rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => removeImage(index)}
                  >
                    Remove
                  </button>
                </div>
                <p className="truncate px-2 pb-2 text-xs text-gray-500" title={url}>
                  {url}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-amber-700">No images yet — add at least one for a polished listing.</p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <p className="mt-1 text-sm text-gray-500">SKUs, sizes, colors, price (৳), and stock for each option.</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          >
            + Add variant
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {variants.map((row, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 md:grid-cols-6 md:items-end"
            >
              <div>
                <label className={labelClass}>SKU</label>
                <input
                  className={inputClass}
                  value={row.sku}
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  placeholder="SKU-001"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Size</label>
                <input
                  className={inputClass}
                  value={row.size}
                  onChange={(e) => updateVariant(index, "size", e.target.value)}
                  placeholder="M"
                />
              </div>
              <div>
                <label className={labelClass}>Color</label>
                <input
                  className={inputClass}
                  value={row.color}
                  onChange={(e) => updateVariant(index, "color", e.target.value)}
                  placeholder="Black"
                />
              </div>
              <div>
                <label className={labelClass}>Price (৳)</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={1}
                  value={row.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={1}
                  value={row.stock}
                  onChange={(e) => updateVariant(index, "stock", e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end pb-0.5">
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length <= 1}
                  className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        {mode === "edit" && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete product
          </button>
        ) : null}
      </div>
    </form>
  );
}
