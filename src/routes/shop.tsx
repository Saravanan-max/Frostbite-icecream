import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { listProducts, listCategories } from "@/lib/shop.functions";
import { ProductCard } from "@/components/site/ProductCard";

const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });
const categoriesQO = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — All flavors · FrostBite" },
      { name: "description", content: "Browse all small-batch ice cream and sorbet flavors. Shipped overnight." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQO);
    context.queryClient.ensureQueryData(categoriesQO);
  },
  component: Shop,
  errorComponent: ({ error }) => <div className="p-8">Failed: {error.message}</div>,
});

function Shop() {
  const { data: products } = useSuspenseQuery(productsQO);
  const { data: categories } = useSuspenseQuery(categoriesQO);
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => (p as any).categories?.slug === active);
  }, [products, active]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <header className="mb-12 max-w-3xl">
        <span className="text-xs uppercase tracking-widest text-accent">The freezer</span>
        <h1 className="mt-2 font-display text-6xl">Every flavor we make</h1>
        <p className="mt-4 text-muted-foreground">
          Six rotating flavors at any time. When one sells out, the next one takes its place.
        </p>
      </header>

      <div className="mb-10 flex flex-wrap gap-2">
        <FilterChip active={active === "all"} onClick={() => setActive("all")}>All</FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.id} active={active === c.slug} onClick={() => setActive(c.slug)}>
            {c.name}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">Nothing here yet.</p>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
