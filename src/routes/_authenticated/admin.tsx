import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, Package, ShoppingBag, Crown } from "lucide-react";
import { toast } from "sonner";
import { checkIsAdmin, claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — FrostBite" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const loc = useLocation();
  const qc = useQueryClient();
  const isAdminFn = useServerFn(checkIsAdmin);
  const claimFn = useServerFn(claimAdmin);

  const { data, isLoading } = useQuery({ queryKey: ["isAdmin"], queryFn: () => isAdminFn() });
  const claim = useMutation({
    mutationFn: () => claimFn(),
    onSuccess: (r) => {
      if (r.granted) {
        toast.success("You're now the admin");
        qc.invalidateQueries({ queryKey: ["isAdmin"] });
      } else {
        toast.error(r.reason ?? "Already claimed");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-16 text-center text-muted-foreground">Checking…</div>;

  if (!data?.isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <Crown className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-6 font-display text-5xl">Admin only</h1>
        <p className="mt-3 text-muted-foreground">
          If no admin exists yet, you can claim the role to get this shop set up.
        </p>
        <button
          onClick={() => claim.mutate()}
          disabled={claim.isPending}
          className="mt-8 rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground disabled:opacity-50"
        >
          {claim.isPending ? "…" : "Claim admin"}
        </button>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package, exact: false },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent">Admin</span>
          <h1 className="mt-2 font-display text-5xl">Dashboard</h1>
        </div>
      </div>
      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => {
          const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors ${
                active ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}
