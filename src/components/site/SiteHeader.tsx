import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShoppingBag, User2, Truck, IceCream, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getCart } from "@/lib/cart.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const fetchCart = useServerFn(getCart);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: () => fetchCart(),
    enabled: !!user,
  });
  const cartCount = (cart ?? []).reduce((s, i) => s + i.quantity, 0);

  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    router.navigate({ to: "/" });
  }

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-primary";

  function navCls(path: string) {
    return `${base} ${pathname === path ? "text-primary" : "text-accent"}`;
  }

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else { window.location.href = `/#${id}`; }
  }

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-1 leading-none">
          <IceCream className="h-7 w-7 text-accent" strokeWidth={2.2} />
          <div className="flex flex-col">
            <span className="font-display text-2xl leading-none text-accent">FROST</span>
            <span className="font-display text-lg leading-none text-primary">—BITE</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link to="/" className={navCls("/")} activeOptions={{ exact: true }}>
            <span className="relative">
              Home
              {pathname === "/" && <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-primary" />}
            </span>
          </Link>
          <Link to="/shop" className={navCls("/shop")}>
            <span className="relative">
              Flavors
              {pathname === "/shop" && <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-primary" />}
            </span>
          </Link>
          <Link to="/about" className={navCls("/about")}>
            <span className="relative">
              Our Story
              {pathname === "/about" && <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-primary" />}
            </span>
          </Link>
          <button onClick={() => scrollTo("experience")} className={`${base} text-accent hover:text-primary`}>Experience</button>
          <button onClick={() => scrollTo("find-us")} className={`${base} text-accent hover:text-primary`}>Find Us</button>
          <button onClick={() => scrollTo("blog")} className={`${base} text-accent hover:text-primary`}>Blog</button>
          <button onClick={() => scrollTo("contact")} className={`${base} text-accent hover:text-primary`}>Contact</button>
          {user && <button onClick={() => scrollTo("your-orders")} className={`${base} text-accent hover:text-primary`}>My Orders</button>}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild className="hidden h-11 rounded-full bg-primary px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink hover:bg-primary/90 sm:inline-flex">
            <Link to="/shop"><Truck className="mr-2 h-4 w-4" /> Order Now</Link>
          </Button>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4 text-accent" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate text-xs font-semibold text-accent">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-xs text-muted-foreground hover:text-primary">
                Sign out
              </Button>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm" className="text-accent">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5 text-accent" />
          </button>
        </div>
      </div>
    </header>
  );
}
