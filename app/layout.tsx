import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./cart-context";

export const metadata: Metadata = {
  title: "RNS Store",
  description: "RNS fashion and lifestyle e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
