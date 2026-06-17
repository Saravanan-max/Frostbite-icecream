import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { getCart, updateCartItem, clearCart } from "@/lib/cart.functions";
import { resolveProductImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — FrostBite" }] }),
  component: Cart,
});

function Cart() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const fetchCart = useServerFn(getCart);
  const updateFn = useServerFn(updateCartItem);
  const clearFn = useServerFn(clearCart);

  const { data: items = [] } = useQuery({
    queryKey: ["cart"],
    queryFn: () => fetchCart(),
    enabled: !!user,
  });

  const update = useMutation({
    mutationFn: (v: { id: string; quantity: number }) => updateFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const clear = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const subtotal = items.reduce((s, i) => s + (i.product?.price_cents ?? 0) * i.quantity, 0);
  const shipping = items.length ? 1200 : 0;
  const total = subtotal + shipping;

  if (loading) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-6 font-display text-5xl">Your freezer is locked</h1>
        <p className="mt-3 text-muted-foreground">Sign in to start a cart.</p>
        <Link to="/login" search={{ redirect: "/cart" }} className="mt-8 inline-block rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-6 font-display text-5xl">Empty so far</h1>
        <p className="mt-3 text-muted-foreground">Pick a flavor or three.</p>
        <Link to="/shop" className="mt-8 inline-block rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground">
          Browse flavors
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="mb-10 font-display text-5xl">Your cart</h1>
      <div className="grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4">
              <img
                src={resolveProductImage(i.product?.image_url)}
                alt={i.product?.name ?? ""}
                width={120}
                height={120}
                loading="lazy"
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl leading-tight">{i.product?.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatPrice(i.product?.price_cents ?? 0)} each</p>
                  </div>
                  <button onClick={() => update.mutate({ id: i.id, quantity: 0 })} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button onClick={() => update.mutate({ id: i.id, quantity: Math.max(0, i.quantity - 1) })} className="p-2">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button onClick={() => update.mutate({ id: i.id, quantity: i.quantity + 1 })} className="p-2">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-medium">{formatPrice((i.product?.price_cents ?? 0) * i.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => clear.mutate()} className="text-xs text-muted-foreground hover:text-destructive">
            Clear cart
          </button>
        </div>

        <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Overnight shipping (dry ice)</dt><dd>{formatPrice(shipping)}</dd></div>
            <div className="my-3 h-px bg-border" />
            <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd className="text-accent">{formatPrice(total)}</dd></div>
          </dl>
          <Link to="/checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-transform hover:scale-[1.01]">
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
