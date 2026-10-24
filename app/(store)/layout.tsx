import { StoreFooter } from "../components/store/StoreFooter";
import { StoreNavbar } from "../components/store/StoreNavbar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreNavbar />
      <main className="min-h-[70vh]">{children}</main>
      <StoreFooter />
    </>
  );
}
