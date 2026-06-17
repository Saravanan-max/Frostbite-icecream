import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListOrders } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const fn = useServerFn(adminListOrders);
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["adminOrders"], queryFn: () => fn() });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-3xl">Recent orders</h2>
      {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
      {orders.map((o: any) => (
        <div key={o.id} className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <code className="text-xs text-muted-foreground">{o.id.slice(0, 8)}</code>
              <p className="font-display text-2xl">{formatPrice(o.total_cents)}</p>
              <p className="text-sm text-muted-foreground">
                {o.shipping_name} · {o.shipping_city}, {o.shipping_country} ·{" "}
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{o.status}</span>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-foreground/70">
            {o.items?.map((it: any, idx: number) => (
              <li key={idx} className="flex justify-between">
                <span>{it.quantity} × {it.product_name}</span>
                <span>{formatPrice(it.unit_price_cents * it.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
