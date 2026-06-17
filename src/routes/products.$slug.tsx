import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, ShoppingBag, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/shop.functions";
import { addToCart } from "@/lib/cart.functions";
import { Scoop3D } from "@/components/site/Scoop3D";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

const productQO = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProductBySlug({ data: { slug } }) });

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — FrostBite` }],
  }),
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(productQO(params.slug));
    if (!data) throw notFound();
  },
  component: ProductDetail,
  errorComponent: ({ error }) => <div className="p-8">Failed: {error.message}</div>,
  notFoundComponent: () => <div className="p-16 text-center">Flavor not found.</div>,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQO(slug));
  const [qty, setQty] = useState(1);
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const addFn = useServerFn(addToCart);

  const add = useMutation({
    mutationFn: () => addFn({ data: { productId: product!.id, quantity: qty } }),
    onSuccess: () => {
      toast.success(`Added ${qty} × ${product!.name} to cart`);
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to all flavors
      </Link>

      <div className="mt-8 grid items-start gap-16 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-cream p-8 md:p-12">
          <Scoop3D imageUrl={product.image_url} alt={product.name} />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-accent">
            {(product as any).categories?.name ?? "Flavor"}
          </span>
          <h1 className="mt-2 font-display text-6xl">{product.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.short_description}</p>
          <div className="my-6 flex items-baseline gap-3">
            <span className="font-display text-4xl text-accent">{formatPrice(product.price_cents)}</span>
            <span className="text-sm text-muted-foreground">/ pint</span>
          </div>

          <p className="leading-relaxed text-foreground/80">{product.description}</p>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Ingredients</h3>
              <p className="mt-2 capitalize text-foreground/70">{product.ingredients.join(" · ")}</p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(20, qty + 1))} className="p-3" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  toast.info("Sign in to add to cart");
                  nav({ to: "/login", search: { redirect: `/products/${slug}` } });
                  return;
                }
                add.mutate();
              }}
              disabled={add.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {add.isPending ? "Adding…" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
