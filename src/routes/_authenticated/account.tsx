import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyOrders } from "@/lib/orders.functions";
import { checkIsAdmin } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";
import { Package, ShieldCheck, IceCream, CheckCircle, Truck, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/account")({
  validateSearch: (s) => ({ ordered: (s.ordered as string) || undefined }),
  head: () => ({ meta: [{ title: "My Orders — FrostBite" }] }),
  component: Account,
});

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  paid:      { label: "Confirmed", icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50 border-green-200" },
  shipped:   { label: "Shipped",   icon: Truck,        color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  delivered: { label: "Delivered", icon: IceCream,     color: "text-primary",    bg: "bg-pink-50 border-pink-200" },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "text-red-500",    bg: "bg-red-50 border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${cfg.color} ${cfg.bg}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function Account() {
  const { user } = useAuth();
  const fetchOrders = useServerFn(listMyOrders);
  const isAdminFn = useServerFn(checkIsAdmin);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
  });
  const { data: admin } = useQuery({ queryKey: ["isAdmin"], queryFn: () => isAdminFn() });

  const activeOrders = orders.filter((o: any) => !["delivered", "cancelled"].includes(o.status));
  const pastOrders   = orders.filter((o: any) =>  ["delivered", "cancelled"].includes(o.status));

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-10">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-script text-2xl text-primary">Hey, {displayName} 👋</p>
          <h1 className="mt-1 font-display text-5xl text-accent md:text-6xl">YOUR ORDERS</h1>
        </div>
        <div className="flex items-center gap-3">
          {(admin as any)?.isAdmin && (
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink transition-transform hover:scale-[1.03]">
            <IceCream className="h-4 w-4" /> Order More
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Orders",   value: orders.length },
          { label: "Active",         value: activeOrders.length },
          { label: "Delivered",      value: orders.filter((o: any) => o.status === "delivered").length },
          { label: "Total Spent",    value: formatPrice(orders.reduce((s: number, o: any) => s + o.total_cents, 0)) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
            <div className="font-display text-3xl text-accent">{value}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <IceCream className="h-10 w-10 animate-spin text-primary" />
          <p>Loading your orders…</p>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card p-16 text-center">
          <Package className="h-14 w-14 text-muted-foreground" />
          <h2 className="mt-4 font-display text-3xl text-accent">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">Pick a flavor and treat yourself 🍦</p>
          <Link to="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-pink">
            Browse Flavors
          </Link>
        </div>
      )}

      {/* Active / current orders */}
      {!isLoading && activeOrders.length > 0 && (
        <div className="mt-12">
          <p className="font-script text-2xl text-primary">✦ In Progress ✦</p>
          <h2 className="mt-1 font-display text-4xl text-accent">CURRENT ORDERS</h2>
          <div className="mt-6 space-y-4">
            {activeOrders.map((o: any) => <OrderCard key={o.id} order={o} />)}
          </div>
        </div>
      )}

      {/* Past orders */}
      {!isLoading && pastOrders.length > 0 && (
        <div className="mt-14">
          <p className="font-script text-2xl text-primary">✦ History ✦</p>
          <h2 className="mt-1 font-display text-4xl text-accent">PAST ORDERS</h2>
          <div className="mt-6 space-y-4">
            {pastOrders.map((o: any) => <OrderCard key={o.id} order={o} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-shadow hover:shadow-pink">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h3 className="mt-1 font-display text-3xl text-accent">{formatPrice(order.total_cents)}</h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <ul className="mt-5 divide-y divide-border/40">
        {order.items?.map((it: any) => (
          <li key={it.id} className="flex items-center justify-between gap-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {it.quantity}×
              </span>
              <span className="text-sm font-medium text-accent">{it.product_name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{formatPrice(it.unit_price_cents * it.quantity)}</span>
          </li>
        ))}
      </ul>

      {/* Shipping info */}
      {order.shipping_name && (
        <div className="mt-4 rounded-xl bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-bold text-accent">Ship to:</span> {order.shipping_name}, {order.shipping_address}, {order.shipping_city} — {order.shipping_postal}, {order.shipping_country}
        </div>
      )}
    </div>
  );
}
