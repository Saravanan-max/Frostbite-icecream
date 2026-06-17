import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle, ArrowRight, IceCream } from "lucide-react";
import { getCart } from "@/lib/cart.functions";
import { placeOrder } from "@/lib/orders.functions";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — FrostBite" }] }),
  component: Checkout,
});

function Checkout() {
  const { user, loading } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const qc = useQueryClient();
  const fetchCart = useServerFn(getCart);
  const orderFn = useServerFn(placeOrder);

  const { data: items = [] } = useQuery({
    queryKey: ["cart"],
    queryFn: () => fetchCart(),
    enabled: !!user,
  });

  const [form, setForm] = useState({
    name: "", address: "", city: "", postal: "", country: "United States", notes: "",
  });

  const subtotal = items.reduce((s, i) => s + (i.product?.price_cents ?? 0) * i.quantity, 0);
  const shipping = items.length ? 1200 : 0;
  const total = subtotal + shipping;

  const place = useMutation({
    mutationFn: () => orderFn({ data: form }),
    onSuccess: ({ orderId: id }) => {
      setOrderId(id);
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;

  // ORDER SUCCESS SCREEN
  if (orderId) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        {/* Animated tick circle */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping-once" />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 animate-scale-in">
            <CheckCircle className="h-14 w-14 text-primary animate-draw-check" strokeWidth={1.5} />
          </span>
        </div>

        {/* Animated text */}
        <h1 className="mt-8 font-display text-5xl text-accent animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          ORDER PLACED!
        </h1>
        <p className="mt-4 text-base text-accent/70 animate-fade-up" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}>
          Thank you for your order 🍦<br />Your ice cream is on its way!
        </p>
        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground animate-fade-up" style={{ animationDelay: "0.55s", opacity: 0, animationFillMode: "forwards" }}>
          Order ID: {orderId}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.7s", opacity: 0, animationFillMode: "forwards" }}>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink transition-transform hover:scale-[1.03]"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/account"
            className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-7 py-3 text-xs font-bold uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-5xl">Sign in to check out</h1>
        <Link to="/login" search={{ redirect: "/checkout" }} className="mt-8 inline-block rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-5xl">Cart is empty</h1>
        <Link to="/shop" className="mt-8 inline-block rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground">
          Browse flavors
        </Link>
      </div>
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    place.mutate();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="mb-10 font-display text-5xl">Checkout</h1>
      <form onSubmit={submit} className="grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-2xl">Shipping</h2>
          {[
            ["name", "Full name"],
            ["address", "Address"],
            ["city", "City"],
            ["postal", "Postal code"],
            ["country", "Country"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
              <input
                required value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-accent"
              />
            </div>
          ))}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Order notes (optional)</label>
            <textarea
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-accent"
            />
          </div>
          <div className="rounded-xl bg-secondary/60 p-4 text-xs text-muted-foreground">
            Demo mode: orders are placed without a real card. Stripe payment can be wired in next.
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-2xl">Order</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-foreground/80">{i.quantity} × {i.product?.name}</span>
                <span>{formatPrice((i.product?.price_cents ?? 0) * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-4 h-px bg-border" />
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(shipping)}</span></div>
          <div className="mt-2 flex justify-between text-base font-medium"><span>Total</span><span className="text-accent">{formatPrice(total)}</span></div>
          <button
            disabled={place.isPending}
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-pink transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {place.isPending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <IceCream className="h-4 w-4 animate-spin" /> Placing order…
              </span>
            ) : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
