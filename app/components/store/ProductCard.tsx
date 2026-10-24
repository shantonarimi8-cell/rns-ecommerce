import Link from "next/link";

type Props = {
  id: number;
  name: string;
  imageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
};

export function ProductCard({ id, name, imageUrl, minPrice, maxPrice, inStock }: Props) {
  const priceLabel =
    minPrice === maxPrice
      ? `৳${minPrice}`
      : `৳${minPrice} – ৳${maxPrice}`;

  return (
    <Link
      href={`/products/${id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/5] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-medium text-black">{name}</h3>
        <p className="mt-1 font-bold text-black">{priceLabel}</p>
        <p className={`mt-1 text-xs ${inStock ? "text-green-600" : "text-red-600"}`}>
          {inStock ? "In stock" : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}
