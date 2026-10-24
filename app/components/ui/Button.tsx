import Link from "next/link";

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition";

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)] disabled:bg-gray-400"
      : variant === "secondary"
        ? "border border-gray-300 bg-white text-black hover:bg-gray-50"
        : "text-black underline-offset-2 hover:underline";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  className = "",
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
      : "border border-gray-300 bg-white text-black hover:bg-gray-50";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
