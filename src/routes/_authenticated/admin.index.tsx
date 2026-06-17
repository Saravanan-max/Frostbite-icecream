import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { adminStats } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const fn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["adminStats"], queryFn: () => fn() });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={data.orderCount.toString()} />
        <StatCard label="Products" value={data.productCount.toString()} />
        <StatCard label="Recent revenue" value={formatPrice(data.recentRevenue)} />
      </div>
      <div className="rounded-3xl border border-border/60 bg-card p-6">
        <h3 className="font-display text-2xl">Revenue, last 30 orders</h3>
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={data.revenueSeries}>
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.18 38)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.65 0.18 38)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <Tooltip formatter={(v: number) => formatPrice(v)} />
              <Area type="monotone" dataKey="value" stroke="oklch(0.65 0.18 38)" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
    </div>
  );
}
