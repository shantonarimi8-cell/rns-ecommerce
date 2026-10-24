import { redirect } from "next/navigation";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { getAdminUser } from "../../lib/admin";

/**
 * Layout for every admin panel page (everything under /admin except /admin/login).
 *
 * The redirect here is a convenience for direct loads; Next.js layouts do not
 * re-run on client-side navigation, so it is not the security boundary. The
 * real enforcement is `proxy.ts` (per request) and `getAdminUser()` inside
 * every /api/admin/* route handler.
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar adminName={admin.name} />
      <div className="flex-1 bg-gray-50 p-4 print:bg-white print:p-0 md:p-8">{children}</div>
    </div>
  );
}
