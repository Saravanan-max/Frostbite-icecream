import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { resolveProductImage } from "@/lib/product-images";
import { addToCart } from "@/lib/cart.functions";
import { useAuth } from "@/hooks/use-auth";

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price_cents: number;
  image_url: string | null;
  tags: string[];
};

// Rotating color tokens for the script subtitle (matches reference visual variety)
const accentColors = ["text-[oklch(0.55_0.20_30)]", "text-pink", "text-mango", "text-mint", "text-[oklch(0.55_0.18_280)]"];

export function ProductCard({ product, eager = false, index = 0 }: { product: Product; eager?: boolean; index?: number }) {
  const img = resolveProductImage(product.image_url);
  const parts = product.name.split(" ");
  const title = parts[0];
  const subtitle = parts.slice(1).join(" ") || "Scoop";
  const accent = accentColors[index % accentColors.length];
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const addFn = useServerFn(addToCart);

  const add = useMutation({
    mutationFn: () => addFn({ data: { productId: product.id, quantity: 1 } }),
    onSuccess: () => {
      toast.success(`${product.name} added to cart 🍦`);
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      toast.info("Sign in to add to cart");
      nav({ to: "/login", search: { redirect: `/products/${product.slug}` } });
      return;
    }
    add.mutate();
  }

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-pink"
    >
      <div className="relative aspect-square overflow-hidden bg-blush">
        <img
          src={img}
          alt={product.name}
          width={800}
          height={800}
          loading={eager ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5 pb-7">
        <h3 className="font-display text-2xl leading-none tracking-tight text-accent">{title}</h3>
        <span className={`font-script text-3xl leading-none ${accent}`}>{subtitle}</span>
        <p className="mt-3 text-sm leading-snug text-muted-foreground">{product.short_description}</p>
      </div>
      <span
        onClick={handleAdd}
        className={`absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pink transition-transform group-hover:scale-110 ${add.isPending ? "opacity-60" : "cursor-pointer"}`}
      >
        <Plus className={`h-5 w-5 ${add.isPending ? "animate-spin" : ""}`} strokeWidth={3} />
      </span>
    </Link>
  );
}
