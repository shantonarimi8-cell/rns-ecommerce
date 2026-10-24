import Link from "next/link";
import { Container } from "../ui/Container";

export function StoreFooter() {
  return (
    <footer className="store-footer mt-16 border-t border-gray-200 bg-gray-50 print:hidden">
      <Container className="grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-[var(--brand)]">RNS Store</p>
          <p className="mt-2 text-sm text-gray-600">
            Fashion and lifestyle products with standard e-commerce features for demo and learning.
          </p>
        </div>
        <div>
          <p className="font-semibold text-black">Shop</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <Link href="/products" className="hover:text-[var(--brand)]">
                All products
              </Link>
            </li>
            <li>
              <Link href="/order-lookup" className="hover:text-[var(--brand)]">
                Track guest order
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-black">Account</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <Link href="/account/addresses" className="hover:text-[var(--brand)]">
                Saved addresses
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[var(--brand)]">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} RNS E-commerce Demo
      </div>
    </footer>
  );
}
